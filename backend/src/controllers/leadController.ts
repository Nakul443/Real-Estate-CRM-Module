// logic to create and retrive leads
// should be linked to the agent who created the lead

import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { LeadStatus } from '../../generated/prisma/index.js';

type AuthedRequest = Request & {
  user?: {
    userId: string;
    role: string;
  };
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, status, budget, preference, source, followUpDate } = req.body ?? {};
    const userId = (req as AuthedRequest).user?.userId; // Taken from JWT via authenticate middleware

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (typeof phone !== 'string' || phone.trim().length === 0) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    const normalizedBudget =
      budget === undefined || budget === null ? undefined : Number.isFinite(Number(budget)) ? Number(budget) : NaN;
    if (Number.isNaN(normalizedBudget)) {
      return res.status(400).json({ message: 'Budget must be a number' });
    }

    const normalizedStatus = status === undefined || status === null ? undefined : String(status);
    if (normalizedStatus && !(normalizedStatus in LeadStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const normalizedFollowUpDate =
      followUpDate === undefined || followUpDate === null ? null : new Date(String(followUpDate));
    if (normalizedFollowUpDate && Number.isNaN(normalizedFollowUpDate.getTime())) {
      return res.status(400).json({ message: 'Invalid followUpDate' });
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: typeof email === 'string' && email.trim().length > 0 ? email.trim() : null,
        phone: phone.trim(),
        budget: normalizedBudget ?? null,
        preference: typeof preference === 'string' && preference.trim().length > 0 ? preference.trim() : null,
        source: typeof source === 'string' && source.trim().length > 0 ? source.trim() : null,
        followUpDate: normalizedFollowUpDate,
        status: (normalizedStatus as (typeof LeadStatus)[keyof typeof LeadStatus]) ?? LeadStatus.NEW,
        agentId: userId,
      },
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create lead' });
  }
};

export const getLeads = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthedRequest).user?.userId;
    const role = (req as AuthedRequest).user?.role;

    if (!userId || !role) return res.status(401).json({ message: 'Unauthorized' });

    // Logic: ADMIN sees all leads, AGENT only sees their own assigned leads
    const leads = await prisma.lead.findMany({
      where: role === 'ADMIN' ? {} : { agentId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};
    const userId = (req as AuthedRequest).user?.userId;
    const role = (req as AuthedRequest).user?.role;

    if (!userId || !role) return res.status(401).json({ message: 'Unauthorized' });
    if (typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid lead id' });
    }

    const normalizedStatus = status === undefined || status === null ? '' : String(status);
    if (!normalizedStatus || !(normalizedStatus in LeadStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // First, verify ownership unless the user is an ADMIN
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    if (role !== 'ADMIN' && lead.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status: normalizedStatus as (typeof LeadStatus)[keyof typeof LeadStatus] },
    });

    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update lead' });
  }
};
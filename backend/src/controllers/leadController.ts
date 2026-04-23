// logic to create and retrive leads
// should be linked to the agent who created the lead
// also needs to trigger the n8n webhook for automated follow-ups and reminders

import type { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { LeadStatus } from '../../generated/prisma/index.js';
import { triggerLeadWebhook } from '../utils/webhook.js'; // Import the n8n utility
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, status, budget, preference, source, followUpDate } = req.body ?? {};
    const userId = req.user?.userId; // Taken from JWT via authenticate middleware

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    // Basic validation
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (typeof phone !== 'string' || phone.trim().length === 0) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    // Data normalization
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
        status: (normalizedStatus as LeadStatus) ?? LeadStatus.NEW,
        agentId: userId,
      },
    });

    // TRIGGER AUTOMATION: Notify n8n for automated follow-up emails/reminders
    // We wrap this in a non-blocking call so the user gets a response even if n8n is slow
    triggerLeadWebhook(lead).catch(err => console.error("Webhook Background Error:", err));

    res.status(201).json(lead);
  } catch (error) {
    console.error("Create Lead Error:", error);
    res.status(500).json({ message: 'Failed to create lead' });
  }
};

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) return res.status(401).json({ message: 'Unauthorized' });

    // Logic: ADMIN sees all leads, AGENT only sees their own assigned leads
    const leads = await prisma.lead.findMany({
      where: role === 'ADMIN' ? {} : { agentId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: { name: true }
        }
      }
    });

    res.status(200).json(leads);
  } catch (error) {
    console.error("Fetch Leads Error:", error);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

export const updateLeadStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) return res.status(401).json({ message: 'Unauthorized' });
    
    if (typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid lead id' });
    }

    const normalizedStatus = status === undefined || status === null ? '' : String(status);
    if (!normalizedStatus || !(normalizedStatus in LeadStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // First, verify existence and ownership unless the user is an ADMIN
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    if (role !== 'ADMIN' && lead.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status: normalizedStatus as LeadStatus },
    });

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error("Update Lead Status Error:", error);
    res.status(500).json({ message: 'Failed to update lead' });
  }
};
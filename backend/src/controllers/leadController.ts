// logic to create and retrive leads
// should be linked to the agent who created the lead
// also needs to trigger the n8n webhook for automated follow-ups and reminders

import type { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { LeadStatus } from '../generated/prisma/index.js';
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

// --- FIXED: Full Lead Update Logic with Null handling ---
export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { name, email, phone, status, budget, preference } = req.body ?? {};
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) return res.status(401).json({ message: 'Unauthorized' });
    if (!id) return res.status(400).json({ message: 'Invalid lead id' });

    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    if (role !== 'ADMIN' && lead.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        // Use ?? to fallback to current lead value if field is missing/undefined
        // Use || null for optional strings to satisfy Prisma's null requirement
        name: typeof name === 'string' ? name.trim() : lead.name,
        email: email !== undefined ? (email?.trim() || null) : lead.email,
        phone: typeof phone === 'string' ? phone.trim() : lead.phone,
        status: (status in LeadStatus) ? (status as LeadStatus) : lead.status,
        // Budget fix: Prisma needs null, not undefined, for empty float fields
        budget: budget !== undefined 
          ? (budget === null || budget === '' ? null : parseFloat(budget)) 
          : lead.budget,
        preference: preference !== undefined ? (preference?.trim() || null) : lead.preference,
      },
    });

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({ message: 'Failed to update lead' });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role || !id) return res.status(401).json({ message: 'Unauthorized or missing ID' });

    const lead = await prisma.lead.findUnique({ 
      where: { id },
      include: { clients: true } 
    });

    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    if (role !== 'ADMIN' && lead.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this lead' });
    }

    // --- THE "NUCLEAR" TRANSACTION ---
    await prisma.$transaction(async (tx) => {
      // 1. Get all client IDs linked to this lead
      const clientIds = lead.clients.map(c => c.id);

      if (clientIds.length > 0) {
        // 2. Disconnect or delete interactions/deals linked to those clients
        // Depending on your business logic, you might want to delete them 
        // or just set leadId to null. Let's try setting leadId to null first 
        // so you don't lose Deal history accidentally.
        await tx.client.updateMany({
          where: { leadId: id },
          data: { leadId: null }
        });
      }

      // 3. Now the Lead has no more "children" pointing to it. Delete it.
      await tx.lead.delete({
        where: { id }
      });
    });

    res.status(200).json({ message: 'Lead unlinked and deleted successfully' });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    res.status(500).json({ message: 'Failed to delete lead. It may be strictly required by an active Deal.' });
  }
};
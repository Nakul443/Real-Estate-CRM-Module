// logic for tracking the history of communication (sms, calls, emails)
// between agents and clients

import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const logInteraction = async (req: Request, res: Response) => {
  try {
    const { type, notes, clientId } = req.body;
    const agentId = (req as any).user.userId;

    // Verify the client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const interaction = await prisma.interaction.create({
      data: {
        type, // e.g., "Call", "Email", "Meeting"
        notes,
        clientId,
        agentId,
      },
    });

    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ message: 'Error logging interaction' });
  }
};

export const getClientInteractions = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    // Type Guard: Ensure clientId is a valid string
    if (typeof clientId !== 'string') {
      return res.status(400).json({ message: 'Invalid Client ID' });
    }

    const interactions = await prisma.interaction.findMany({
      where: { clientId },
      include: {
        agent: { select: { name: true } }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interaction history' });
  }
};
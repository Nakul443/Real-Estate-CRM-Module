import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createDeal = async (req: Request, res: Response) => {
  try {
    const { clientId, propertyId, stage, commissionAmount, closingDate } = req.body;
    const agentId = (req as any).user.userId;

    const deal = await prisma.deal.create({
      data: {
        stage: stage || 'NEGOTIATION',
        // Use null instead of undefined for Prisma optional fields
        commissionAmount: commissionAmount ? parseFloat(commissionAmount) : null,
        closingDate: closingDate ? new Date(closingDate) : null,
        clientId,
        propertyId,
        agentId,
      },
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating deal' });
  }
};

export const updateDealStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, closingDate } = req.body;

    // Type Guard for the ID to fix ts(2412)
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid Deal ID' });
    }

    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: { 
        stage: stage !== undefined ? stage : undefined,
        // Convert undefined to null to satisfy exactOptionalPropertyTypes
        closingDate: closingDate ? new Date(closingDate) : null 
      },
    });

    res.status(200).json(updatedDeal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating deal stage' });
  }
};
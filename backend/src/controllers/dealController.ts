// deal management for tracking sales progress and commissions
// handles file uploads like property images 

import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createDeal = async (req: Request, res: Response) => {
  try {
    const { clientId, propertyId, stage, commissionAmount, closingDate } = req.body;
    const agentId = (req as any).user.userId;

    // Handle Cloudinary file uploads for documents 
    const files = req.files as Express.Multer.File[];
    const documentUrls = files ? files.map(file => file.path) : [];

    const deal = await prisma.deal.create({
      data: {
        stage: stage || 'NEGOTIATION',
        // Use null instead of undefined for Prisma optional fields
        commissionAmount: commissionAmount ? parseFloat(commissionAmount) : null,
        closingDate: closingDate ? new Date(closingDate) : null,
        documents: documentUrls, // Storing the array of file URLs 
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

    // Handle new document uploads during update if provided 
    const files = req.files as Express.Multer.File[];
    const newDocs = files ? files.map(file => file.path) : [];

    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: {
        stage: stage !== undefined ? stage : undefined,
        // If moving to CLOSED, we set a closing date if not provided
        closingDate: stage === 'CLOSED' ? (closingDate ? new Date(closingDate) : new Date()) : (closingDate ? new Date(closingDate) : null),
        // Append new documents to the existing array 
        ...(newDocs.length > 0 && {
          documents: {
            push: newDocs 
          }
        })
      },
    });

    res.status(200).json(updatedDeal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating deal stage' });
  }
};

// ... keep existing createDeal and updateDealStage logic

export const getDeals = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user.userId;

    const deals = await prisma.deal.findMany({
      where: { agentId },
      include: {
        client: {
          select: { name: true }
        },
        property: {
          select: { title: true, price: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(deals);
  } catch (error) {
    console.error("Fetch deals error:", error);
    res.status(500).json({ message: 'Error fetching deals' });
  }
};
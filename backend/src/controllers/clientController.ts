import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, type, leadId } = req.body;

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        type, // "Buyer" or "Seller" [cite: 30]
        leadId: leadId || null, // Link to the original lead [cite: 36]
      },
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error creating client profile' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        lead: true,
        interactions: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      }
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients' });
  }
};
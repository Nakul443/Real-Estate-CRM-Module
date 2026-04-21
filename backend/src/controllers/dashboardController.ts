// will provide performance calcuclations for admin and agent panels

import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // 1. Revenue Tracking: Sum of all closed deal commissions 
    const totalRevenue = await prisma.deal.aggregate({
      where: { stage: 'CLOSED' },
      _sum: { commissionAmount: true }
    });

    // 2. Lead Conversion Rate: (Closed Leads / Total Leads) * 100
    const totalLeads = await prisma.lead.count();
    const closedLeads = await prisma.lead.count({
      where: { status: 'CLOSED' }
    });
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    // 3. Inventory Status: Total available properties
    const activeProperties = await prisma.property.count({
      where: { status: 'AVAILABLE' }
    });

    // 4. Monthly Sales Data for Charts 
    const salesData = await prisma.deal.findMany({
      where: { stage: 'CLOSED' },
      select: {
        createdAt: true,
        commissionAmount: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      summary: {
        totalRevenue: totalRevenue._sum.commissionAmount || 0,
        conversionRate: `${conversionRate.toFixed(2)}%`,
        activeProperties,
        totalLeads
      },
      salesData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating analytics report' });
  }
};
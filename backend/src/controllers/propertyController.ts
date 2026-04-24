import type { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import type { Prisma } from '../generated/prisma/index.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, 
      description,
      location, 
      price, 
      size, 
      type, 
      amenities,
      latitude,
      longitude,
    } = req.body;

    const agentId = req.user?.userId;
    if (!agentId) return res.status(401).json({ message: 'Unauthorized' });

    const files = req.files as Express.Multer.File[];
    const imageUrls = files ? files.map(file => file.path) : [];

    const parsedPrice = Number.parseFloat(String(price));
    if (!Number.isFinite(parsedPrice)) {
      return res.status(400).json({ message: 'Price must be a number' });
    }

    const normalizedSize = typeof size === 'string' ? size.trim() : String(size ?? '').trim();
    if (!normalizedSize) {
      return res.status(400).json({ message: 'Size is required' });
    }
    const parsedSize = Number.parseFloat(normalizedSize);
    if (!Number.isFinite(parsedSize)) {
      return res.status(400).json({ message: 'Size must be a number' });
    }

    const parsedLatitude =
      latitude === undefined || latitude === null || latitude === ''
        ? null
        : Number.parseFloat(String(latitude));
    const parsedLongitude =
      longitude === undefined || longitude === null || longitude === ''
        ? null
        : Number.parseFloat(String(longitude));

    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        price: parsedPrice,
        size: parsedSize,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        type, 
        amenities,
        images: imageUrls, 
        agentId,
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating property listing' });
  }
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { type, minPrice, maxPrice, location, lat, lng, radius } = req.query;

    const where: Prisma.PropertyWhereInput = {};

    if (typeof type === 'string' && type.length > 0) where.type = type;
    
    if (typeof location === 'string' && location.length > 0) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const min = minPrice === undefined ? undefined : Number.parseFloat(String(minPrice));
    const max = maxPrice === undefined ? undefined : Number.parseFloat(String(maxPrice));

    if (min !== undefined || max !== undefined) {
      where.price = {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {}),
      };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        agent: {
          select: { name: true, email: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    // FIX: Extract ID safely from params
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) return res.status(400).json({ message: 'Property ID is required' });
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    if (role !== 'ADMIN' && property.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      updateData.images = files.map(file => file.path);
    }

    // Data Normalization
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.size) updateData.size = parseFloat(updateData.size);
    updateData.latitude = updateData.latitude ? parseFloat(updateData.latitude) : null;
    updateData.longitude = updateData.longitude ? parseFloat(updateData.longitude) : null;

    const updated = await prisma.property.update({
      where: { id }, // This will now correctly be type 'string'
      data: updateData,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ message: 'Error updating property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    // FIX: Extract ID safely from params
    const { id: rawId } = req.params;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) return res.status(400).json({ message: 'Property ID is required' });
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (role !== 'ADMIN' && property.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // --- THE NUCLEAR TRANSACTION ---
    await prisma.$transaction(async (tx) => {
      // 1. Unlink any Deals (set propertyId to null)
      await tx.deal.updateMany({
        where: { propertyId: id },
        data: { propertyId: null }
      });

      // 2. Delete the property
      await tx.property.delete({ where: { id } });
    });

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error("Delete Property Error:", error);
    res.status(500).json({ message: 'Error deleting property' });
  }
};
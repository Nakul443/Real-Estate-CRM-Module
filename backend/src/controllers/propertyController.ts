import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import type { Prisma } from '../../generated/prisma/index.js';
import { string } from 'zod';

export const createProperty = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, // Added to match your schema update
      location, 
      price, 
      size, 
      type, 
      amenities,
      latitude,
      longitude
    } = req.body;

    const agentId = (req as any).user.userId;

    // Extract Cloudinary URLs from the uploaded files 
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

    const property = await prisma.property.create({
      data: {
        title,
        description, // Included from schema
        location,
        price: parsedPrice,
        size: normalizedSize,
        latitude: latitude ? parseFloat(latitude) : null, // Added coordinate handling
        longitude: longitude ? parseFloat(longitude) : null, // Added coordinate handling
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

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { type, minPrice, maxPrice, location } = req.query;

    const where: Prisma.PropertyWhereInput = {};
    if (typeof type === 'string' && type.length > 0) where.type = type;
    if (typeof location === 'string' && location.length > 0) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const min = minPrice === undefined ? undefined : Number.parseFloat(String(minPrice));
    const max = maxPrice === undefined ? undefined : Number.parseFloat(String(maxPrice));
    
    if (minPrice !== undefined && !Number.isFinite(min)) {
      return res.status(400).json({ message: 'minPrice must be a number' });
    }
    if (maxPrice !== undefined && !Number.isFinite(max)) {
      return res.status(400).json({ message: 'maxPrice must be a number' });
    }

    if (min !== undefined || max !== undefined) {
      const price: Prisma.FloatFilter<'Property'> = {};
      if (min !== undefined) price.gte = min;
      if (max !== undefined) price.lte = max;
      where.price = price;
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

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const idParam = (req.params as { id?: unknown }).id;
    if (typeof idParam !== 'string' || idParam.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid property id' });
    }
    const id = idParam;
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    if (role !== 'ADMIN' && property.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updateData = { ...req.body };
    
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      updateData.images = files.map(file => file.path);
    }

    // Ensure all numeric/float values are parsed correctly
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.size) updateData.size = parseFloat(updateData.size);
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude); // Added
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude); // Added

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating property' });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const idParam = (req.params as { id?: unknown }).id;
    if (typeof idParam !== 'string' || idParam.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid property id' });
    }
    const id = idParam;
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (role !== 'ADMIN' && property.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({ where: { id } });
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property' });
  }
};
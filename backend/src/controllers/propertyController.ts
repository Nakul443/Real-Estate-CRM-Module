import type { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import type { Prisma } from '../../generated/prisma/index.js';
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

    // Handling images uploaded via Multer
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
    if (parsedLatitude !== null && !Number.isFinite(parsedLatitude)) {
      return res.status(400).json({ message: 'Latitude must be a number' });
    }
    if (parsedLongitude !== null && !Number.isFinite(parsedLongitude)) {
      return res.status(400).json({ message: 'Longitude must be a number' });
    }

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

    // Initialize where object without strict 0 coordinate filters
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
      where.price = {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {}),
      };
    }

    // Radius Search logic (nautical/geospatial approximation)
    if (lat && lng && radius) {
      const centerLat = Number.parseFloat(String(lat));
      const centerLng = Number.parseFloat(String(lng));
      const radKm = Number.parseFloat(String(radius));

      if (Number.isFinite(centerLat) && Number.isFinite(centerLng) && Number.isFinite(radKm)) {
        // Approximate conversion: 1 degree latitude is ~111km
        const degreeOffset = radKm / 111;

        where.latitude = {
          gte: centerLat - degreeOffset,
          lte: centerLat + degreeOffset,
        };
        where.longitude = {
          gte: centerLng - degreeOffset,
          lte: centerLng + degreeOffset,
        };
      }
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
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) return res.status(400).json({ message: 'Property id is required' });
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    // RBAC: Only admin or the listing agent can update
    if (role !== 'ADMIN' && property.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updateData = { ...req.body };
    
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      updateData.images = files.map(file => file.path);
    }

    // Ensure all numeric/float values are parsed correctly from strings (if sent via FormData)
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.size) updateData.size = parseFloat(updateData.size);
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) return res.status(400).json({ message: 'Property id is required' });
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (role !== 'ADMIN' && property.agentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({ where: { id } });
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting property' });
  }
};
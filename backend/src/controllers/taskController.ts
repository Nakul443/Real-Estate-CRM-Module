// handles follow up reminders and tasks assignment

import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, dueDate, agentId } = req.body;
    
    // If an agentId isn't provided, assign it to the person creating it
    const assignedTo = agentId || (req as any).user.userId;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        agentId: assignedTo,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const tasks = await prisma.task.findMany({
      where: { agentId: userId },
      orderBy: { dueDate: 'asc' },
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const toggleTaskStatus = async (req: Request, res: Response) => {
  try {
    // FIXED: Normalize ID to avoid type mismatches
    const rawId = (req.params as any).id as string | string[] | undefined;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    
    if (!id) return res.status(400).json({ message: 'Task id is required' });
    
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { isCompleted: !task.isCompleted },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
};

// NEW: Added updateTask to handle editing
export const updateTask = async (req: Request, res: Response) => {
  try {
    // FIXED: Normalize ID logic here as well
    const rawId = (req.params as any).id as string | string[] | undefined;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) return res.status(400).json({ message: 'Task id is required' });

    const { title, description, dueDate } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
      },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Task update error:", error);
    res.status(500).json({ message: 'Error updating task details' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const rawId = (req.params as any).id as string | string[] | undefined;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) return res.status(400).json({ message: 'Task id is required' });

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};
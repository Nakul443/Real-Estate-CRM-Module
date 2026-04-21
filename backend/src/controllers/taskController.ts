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
    const { id } = req.params;
    
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
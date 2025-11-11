import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../server.js';
import fs from 'fs/promises';
import path from 'path';

export const uploadContent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, startDate, endDate } = req.body;
    const file = req.file;

    if (!file || !name) {
      return res.status(400).json({ error: 'File and name are required' });
    }

    // Determine content type
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];

    let type: string;
    if (imageExtensions.includes(fileExtension)) {
      type = 'image';
    } else if (videoExtensions.includes(fileExtension)) {
      type = 'video';
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Create content record
    const content = await prisma.content.create({
      data: {
        name,
        description,
        type,
        filePath: file.path,
        fileSize: file.size,
        duration: duration ? parseInt(duration) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: req.userId!,
      },
    });

    res.status(201).json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload content' });
  }
};

export const getAllContent = async (req: AuthRequest, res: Response) => {
  try {
    const contents = await prisma.content.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(contents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

export const getContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findFirst({
      where: { id, userId: req.userId },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, duration, startDate, endDate } = req.body;

    // Check if content exists and belongs to user
    const existingContent = await prisma.content.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Update content
    const content = await prisma.content.update({
      where: { id },
      data: {
        name: name ?? existingContent.name,
        description,
        duration: duration ? parseInt(duration) : existingContent.duration,
        startDate: startDate ? new Date(startDate) : existingContent.startDate,
        endDate: endDate ? new Date(endDate) : existingContent.endDate,
      },
    });

    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update content' });
  }
};

export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if content exists and belongs to user
    const content = await prisma.content.findFirst({
      where: { id, userId: req.userId },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Delete file
    try {
      await fs.unlink(content.filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    // Delete content record (cascades to playlist associations)
    await prisma.content.delete({ where: { id } });

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

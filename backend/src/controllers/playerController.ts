import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../server.js';

export const createPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const player = await prisma.player.create({
      data: {
        name,
        description,
        userId: req.userId!,
      },
    });

    res.status(201).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create player' });
  }
};

export const getAllPlayers = async (req: AuthRequest, res: Response) => {
  try {
    const players = await prisma.player.findMany({
      where: { userId: req.userId },
      include: {
        playlist: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};

export const getPlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const player = await prisma.player.findFirst({
      where: { id, userId: req.userId },
      include: {
        playlist: {
          include: {
            playlistContents: {
              include: {
                content: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, playlistId } = req.body;

    // Check if player exists and belongs to user
    const existingPlayer = await prisma.player.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // If playlistId is provided, verify it belongs to the user
    if (playlistId) {
      const playlist = await prisma.playlist.findFirst({
        where: { id: playlistId, userId: req.userId },
      });

      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
    }

    // Update player
    const player = await prisma.player.update({
      where: { id },
      data: {
        name: name ?? existingPlayer.name,
        description,
        playlistId: playlistId !== undefined ? playlistId : existingPlayer.playlistId,
      },
      include: {
        playlist: true,
      },
    });

    res.json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update player' });
  }
};

export const deletePlayer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if player exists and belongs to user
    const player = await prisma.player.findFirst({
      where: { id, userId: req.userId },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Delete player
    await prisma.player.delete({ where: { id } });

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
};

export const updatePlayerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if player exists and belongs to user
    const player = await prisma.player.findFirst({
      where: { id, userId: req.userId },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update player status and last seen
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        status,
        lastSeen: new Date(),
      },
    });

    res.json(updatedPlayer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update player status' });
  }
};

export const uploadScreenshot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Screenshot file is required' });
    }

    // Check if player exists and belongs to user
    const player = await prisma.player.findFirst({
      where: { id, userId: req.userId },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update player with screenshot path
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        screenshot: file.path,
        lastSeen: new Date(),
      },
    });

    res.json(updatedPlayer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload screenshot' });
  }
};

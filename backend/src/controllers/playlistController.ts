import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../server.js';

export const createPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        userId: req.userId!,
      },
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

export const getAllPlaylists = async (req: AuthRequest, res: Response) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.userId },
      include: {
        playlistContents: {
          include: {
            content: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total duration and size for each playlist
    const playlistsWithMeta = playlists.map((playlist) => {
      const totalDuration = playlist.playlistContents.reduce(
        (sum, pc) => sum + (pc.content.duration || 0),
        0
      );
      const totalSize = playlist.playlistContents.reduce(
        (sum, pc) => sum + pc.content.fileSize,
        0
      );

      return {
        ...playlist,
        totalDuration,
        totalSize,
      };
    });

    res.json(playlistsWithMeta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

export const getPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: req.userId },
      include: {
        playlistContents: {
          include: {
            content: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const totalDuration = playlist.playlistContents.reduce(
      (sum, pc) => sum + (pc.content.duration || 0),
      0
    );
    const totalSize = playlist.playlistContents.reduce(
      (sum, pc) => sum + pc.content.fileSize,
      0
    );

    res.json({
      ...playlist,
      totalDuration,
      totalSize,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
};

export const updatePlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contentIds } = req.body;

    // Check if playlist exists and belongs to user
    const existingPlaylist = await prisma.playlist.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingPlaylist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Update playlist name if provided
    if (name) {
      await prisma.playlist.update({
        where: { id },
        data: { name },
      });
    }

    // Update playlist contents if provided
    if (contentIds && Array.isArray(contentIds)) {
      // Delete existing associations
      await prisma.playlistContent.deleteMany({
        where: { playlistId: id },
      });

      // Create new associations with order
      const playlistContents = contentIds.map((contentId, index) => ({
        playlistId: id,
        contentId,
        order: index,
      }));

      await prisma.playlistContent.createMany({
        data: playlistContents,
      });
    }

    // Fetch updated playlist
    const playlist = await prisma.playlist.findFirst({
      where: { id },
      include: {
        playlistContents: {
          include: {
            content: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
};

export const deletePlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if playlist exists and belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: req.userId },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Delete playlist (cascades to playlist contents)
    await prisma.playlist.delete({ where: { id } });

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
};

export const addContentToPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { contentId } = req.body;

    // Check if playlist exists and belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: req.userId },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Get current max order
    const maxOrder = await prisma.playlistContent.findFirst({
      where: { playlistId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (maxOrder?.order ?? -1) + 1;

    // Add content to playlist
    const playlistContent = await prisma.playlistContent.create({
      data: {
        playlistId: id,
        contentId,
        order: newOrder,
      },
      include: {
        content: true,
      },
    });

    res.status(201).json(playlistContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add content to playlist' });
  }
};

export const removeContentFromPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { id, contentId } = req.params;

    // Check if playlist exists and belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: req.userId },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Remove content from playlist
    await prisma.playlistContent.deleteMany({
      where: {
        playlistId: id,
        contentId,
      },
    });

    res.json({ message: 'Content removed from playlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove content from playlist' });
  }
};

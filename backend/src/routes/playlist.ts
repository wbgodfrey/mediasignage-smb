import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addContentToPlaylist,
  removeContentFromPlaylist,
} from '../controllers/playlistController.js';

const router = express.Router();

router.post('/', authenticate, createPlaylist);
router.get('/', authenticate, getAllPlaylists);
router.get('/:id', authenticate, getPlaylist);
router.put('/:id', authenticate, updatePlaylist);
router.delete('/:id', authenticate, deletePlaylist);
router.post('/:id/content', authenticate, addContentToPlaylist);
router.delete('/:id/content/:contentId', authenticate, removeContentFromPlaylist);

export default router;

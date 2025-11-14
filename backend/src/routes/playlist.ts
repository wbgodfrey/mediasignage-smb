import express from 'express';
import { mockAuthenticate } from '../middleware/mockAuth.js';
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

router.post('/', mockAuthenticate, createPlaylist);
router.get('/', mockAuthenticate, getAllPlaylists);
router.get('/:id', mockAuthenticate, getPlaylist);
router.put('/:id', mockAuthenticate, updatePlaylist);
router.delete('/:id', mockAuthenticate, deletePlaylist);
router.post('/:id/content', mockAuthenticate, addContentToPlaylist);
router.delete('/:id/content/:contentId', mockAuthenticate, removeContentFromPlaylist);

export default router;

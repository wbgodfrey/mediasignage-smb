import express from 'express';
import multer from 'multer';
import path from 'path';
import { mockAuthenticate } from '../middleware/mockAuth.js';
import {
  createPlayer,
  getAllPlayers,
  getPlayer,
  updatePlayer,
  deletePlayer,
  updatePlayerStatus,
  uploadScreenshot,
} from '../controllers/playerController.js';

const router = express.Router();

// Configure multer for screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/screenshots/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'screenshot-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.post('/', mockAuthenticate, createPlayer);
router.get('/', mockAuthenticate, getAllPlayers);
router.get('/:id', mockAuthenticate, getPlayer);
router.put('/:id', mockAuthenticate, updatePlayer);
router.delete('/:id', mockAuthenticate, deletePlayer);
router.post('/:id/status', mockAuthenticate, updatePlayerStatus);
router.post('/:id/screenshot', mockAuthenticate, upload.single('screenshot'), uploadScreenshot);

export default router;

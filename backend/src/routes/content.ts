import express from 'express';
import multer from 'multer';
import path from 'path';
import { mockAuthenticate } from '../middleware/mockAuth.js';
import {
  uploadContent,
  getAllContent,
  getContent,
  updateContent,
  deleteContent,
} from '../controllers/contentController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.post('/', mockAuthenticate, upload.single('file'), uploadContent);
router.get('/', mockAuthenticate, getAllContent);
router.get('/:id', mockAuthenticate, getContent);
router.put('/:id', mockAuthenticate, updateContent);
router.delete('/:id', mockAuthenticate, deleteContent);

export default router;

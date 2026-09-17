import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware.js';
import { PublicController } from '../modules/public/public.controller.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image uploads are accepted.'));
      return;
    }
    callback(null, true);
  },
});
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', PublicController.list);
router.post('/', authenticate, reportLimiter, upload.single('image'), PublicController.create);
router.post('/:id/reactions', authenticate, PublicController.react);
router.post('/:id/likes', authenticate, PublicController.likeHealthPost);

export default router;

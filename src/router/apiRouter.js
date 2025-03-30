import { Router } from 'express';
import { self, health } from '../controller/apiController.js';
import rateLimit from '../middleware/rateLimit.js';

const router = Router();
router.route('/self').get(rateLimit, self);
router.route('/health').get(rateLimit, health);

export default router;

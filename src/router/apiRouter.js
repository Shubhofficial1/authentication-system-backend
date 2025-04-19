import { Router } from 'express';
import {
    self,
    health,
    register,
    confirmation,
    login,
    selfIdentification,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword
} from '../controller/apiController.js';
import rateLimit from '../middleware/rateLimit.js';
import protect from '../middleware/protect.js';

const router = Router();
router.route('/self').get(rateLimit, self);
router.route('/health').get(rateLimit, health);
router.route('/register').post(rateLimit, register);
router.route('/confirmation/:token').put(rateLimit, confirmation);
router.route('/login').post(rateLimit, login);
router.route('/self-identification').get(protect, rateLimit, selfIdentification);
router.route('/logout').post(rateLimit, logout);
router.route('/refresh-token').post(rateLimit, refreshToken);
router.route('/forgot-password').put(rateLimit, forgotPassword);
router.route('/reset-password/:token').put(rateLimit, resetPassword);
router.route('/change-password').put(rateLimit, changePassword);

export default router;

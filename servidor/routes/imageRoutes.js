import express from 'express';
import { proxyImage } from '../controller/imageProxyController.js';

const router = express.Router();

router.get('/proxy', proxyImage);

export default router; 
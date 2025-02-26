import express from 'express';
import { sendPropertyNotification } from '../controller/propertyNotificationController.js';

const router = express.Router();

router.post('/', sendPropertyNotification);

export default router; 
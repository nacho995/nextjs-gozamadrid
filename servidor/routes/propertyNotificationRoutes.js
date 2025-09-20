import express from 'express';
import { sendPropertyNotification } from '../controller/propertyNotificationController.js';
import { sendPropertyOfferNotification } from '../controller/propertyOfferController.js';

const router = express.Router();

router.post('/visit', sendPropertyNotification);
router.post('/offer', sendPropertyOfferNotification);

export default router; 
import express from 'express';
import { getCountryPrefix } from '../controller/prefixController.js';
import propertyNotificationRoutes from './propertyNotificationRoutes.js';

const prefixRouter = express.Router();

// prefix

prefixRouter.get('/', getCountryPrefix);

prefixRouter.use('/api/property-notification', propertyNotificationRoutes);

export default prefixRouter;
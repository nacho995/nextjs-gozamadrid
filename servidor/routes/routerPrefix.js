import express from 'express';
import { getCountryPrefix } from '../controller/prefixController.js';

const prefixRouter = express.Router();

// prefix

prefixRouter.get('/', getCountryPrefix);

export default prefixRouter;
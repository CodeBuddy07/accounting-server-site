import express from 'express';
import { getTemplates, updateTemplate } from '../controllers/template.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();


router.put('/:id', authMiddleware, updateTemplate);
router.get('/', authMiddleware, getTemplates);


export default router;
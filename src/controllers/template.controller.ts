import { Request, Response, NextFunction } from 'express';
import templateModel from '../models/template.model';



// Update and Create a template
export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, content } = req.body;

        const template = await templateModel.findByIdAndUpdate(
            id,
            { name, content },
            { new: true }
        );

        if (!template) {
            res.status(404).json({ message: 'Template not found' });
            return 
        }

        res.status(200).json(template);
    } catch (error) {
        next(error);
    }
};

// Get all templates
export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const templates = await templateModel.find().sort({ name: 1 });
        res.status(200).json(templates);
    } catch (error) {
        next(error);
    }
};


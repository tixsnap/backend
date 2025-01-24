// src/middlewares/validateForms.ts
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateForms = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: error.errors.map((e) => ({
                        fields: e.path.join("."),
                        message: e.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
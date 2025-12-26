import { z } from 'zod';
export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (error) {
    res.status(400).json({ error: 'Validation failed', details: error.errors });
  }
};
export const schemas = {
  createRoom: z.object({ body: z.object({ language: z.enum(['javascript', 'python', 'java']).optional() }) }),
  joinRoom: z.object({ params: z.object({ roomId: z.string().length(6) }) }),
  executeCode: z.object({ body: z.object({ code: z.string().min(1).max(50000), language: z.enum(['javascript', 'python', 'java']) }) }),
};

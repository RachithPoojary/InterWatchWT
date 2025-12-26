import rateLimit from 'express-rate-limit';
export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10000 });
export const executionLimiter = rateLimit({ windowMs: 60 * 1000, max: 10000 });

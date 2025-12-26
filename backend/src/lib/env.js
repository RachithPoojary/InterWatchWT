import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  STREAM_API_KEY: z.string().min(1),
  STREAM_API_SECRET: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});
export default envSchema.parse(process.env);

import express from 'express';
import { requireAuth, validateClerkUser } from '../middleware/auth.js';
import { executionLimiter } from '../middleware/rateLimiter.js';
import axios from 'axios';
const router = express.Router();
router.post('/', requireAuth(), validateClerkUser, executionLimiter, async (req, res) => {
  const { code, language } = req.body;
  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version: '*',
      files: [{ name: `main.${language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}`, content: code }],
    }, { timeout: 10000 });
    res.json({ success: true, output: { stdout: response.data.run?.stdout || '', stderr: response.data.run?.stderr || '' } });
  } catch (error) {
    res.status(500).json({ error: 'Execution failed', output: { stderr: error.message } });
  }
});
export default router;

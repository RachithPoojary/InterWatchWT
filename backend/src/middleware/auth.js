import { clerkMiddleware, requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';
export const clerkAuth = clerkMiddleware();
export const requireAuth = (options = {}) => clerkRequireAuth(options);
export const validateClerkUser = async (req, res, next) => {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = auth.userId;
  req.userEmail = auth.sessionClaims?.email;
  req.userName = auth.sessionClaims?.name;
  next();
};

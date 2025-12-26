import { StreamChat } from 'stream-chat';
import { StreamClient } from '@stream-io/node-sdk';
import env from './env.js';
let streamChatInstance = null;
export const getStreamChat = () => {
  if (!streamChatInstance) {
    streamChatInstance = StreamChat.getInstance(env.STREAM_API_KEY, env.STREAM_API_SECRET);
  }
  return streamChatInstance;
};
export const generateStreamToken = (userId) => getStreamChat().createToken(userId);
export const upsertStreamUser = async (userId, userData) => {
  await getStreamChat().upsertUser({
    id: userId,
    name: userData.name || 'User',
    image:
      userData.image ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    // add role for video layout
    role: 'user',
    custom: {
      role: userData.role, // 'applicant' or 'interviewer'
    },
  });
};


import { io } from 'socket.io-client';

// In dev: Vite proxies /socket.io → localhost:3001 via vite.config.js proxy
// In prod: server serves built client on same origin
export const socket = io('/', {
  transports: ['websocket', 'polling']
});

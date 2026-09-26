// test/backend.test.js
// Simple integration test for AURA backend (register, login, chat flow)
import fetch from 'node-fetch';
import { createServer } from 'http';
import app from '../dist/server.js'; // Express app

const PORT = 0; // let OS assign free port

async function startServer() {
  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(PORT, () => {
      const address = server.address();
      const port = typeof address === 'string' ? parseInt(address) : address?.port;
      resolve({ server, port });
    });
  });
}

async function main() {
  const { server, port } = await startServer();
  const base = `http://localhost:${port}`;
  try {
    // 1. Register user
    const regRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'secret123' }),
    });
    if (!regRes.ok) throw new Error('Register failed');
    const regData = await regRes.json();
    const token = regData.token;

    // 2. Create conversation (using chat endpoint – it creates if missing)
    const convRes = await fetch(`${base}/api/chat/conversations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!convRes.ok) throw new Error('Create conversation failed');
    const { conversationId } = await convRes.json();

    // 3. Post a chat message
    const chatRes = await fetch(`${base}/api/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId, text: 'Hello, AI!' }),
    });
    if (!chatRes.ok) throw new Error('Chat message failed');
    const chatData = await chatRes.json();
    const aiMessage = chatData.find((m) => m.sender === 'assistant');
    if (!aiMessage || !aiMessage.text) throw new Error('AI did not return a reply');
    console.log('✅ Integration test passed');
  } catch (err) {
    console.error('❌ Integration test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

main();

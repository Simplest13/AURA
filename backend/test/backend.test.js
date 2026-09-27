// test/backend.test.js
// Integration test for AURA backend (register, conversation, AI chat flow).
// Requires the dev server to be running: npm start (listens on PORT from .env).
import fetch from 'node-fetch';

const base = process.env.API_BASE_URL ?? 'http://localhost:4000';

async function main() {
  try {
    // 1. Register user (unique email so repeated runs succeed)
    const regRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: `test-${Date.now()}@example.com`, password: 'secret123' }),
    });
    if (!regRes.ok) throw new Error('Register failed');
    const regData = await regRes.json();
    const token = regData.token;

    // 2. Create conversation
    const convRes = await fetch(`${base}/api/chat/conversations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Integration Test' }),
    });
    if (!convRes.ok) throw new Error('Create conversation failed');
    const convData = await convRes.json();
    const conversationId = convData.conversationId ?? convData.id;
    if (!conversationId) throw new Error('No conversation id returned');

    // 3. Post a chat message
    const chatRes = await fetch(`${base}/api/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId, text: 'Hello, AI!' }),
    });
    if (!chatRes.ok) throw new Error('Chat message failed');
    const chatData = await chatRes.json();
    const aiMessage = chatData?.aiMessage ?? chatData.find?.((m) => m.sender === 'assistant');
    if (!aiMessage || !aiMessage.text) throw new Error('AI did not return a reply');
    console.log('✅ Integration test passed');
  } catch (err) {
    console.error('❌ Integration test failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

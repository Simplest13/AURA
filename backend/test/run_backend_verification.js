// test/run_backend_verification.js
// Simple verification script for AURA backend endpoints
import fetch from 'node-fetch';

const base = 'http://localhost:4000';

async function main() {
  try {
    // 1️⃣ Health check
    const healthRes = await fetch(`${base}/health`);
    console.log('Health status:', healthRes.status);
    const healthJson = await healthRes.json();
    console.log('Health body:', healthJson);

    // 2️⃣ Register a test user
    const registerRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123' }),
    });
    console.log('Register status:', registerRes.status);
    const registerData = await registerRes.json();
    console.log('Register body:', registerData);

    // 3️⃣ Login to obtain JWT
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login body:', loginData);
    const token = loginData.token;
    if (!token) throw new Error('No JWT token returned');

    // 4️⃣ Transcription (no auth required)
    const dummyAudio = Buffer.from('test').toString('base64');
    const transRes = await fetch(`${base}/api/transcription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: dummyAudio }),
    });
    console.log('Transcription status:', transRes.status);
    const transData = await transRes.json();
    console.log('Transcription body:', transData);

    // 5️⃣ TTS (protected)
    const ttsRes = await fetch(`${base}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: 'Hello from AURA' }),
    });
    console.log('TTS status:', ttsRes.status);
    const ttsData = await ttsRes.json();
    console.log('TTS body:', ttsData);

    console.log('✅ All endpoint checks completed');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

main();

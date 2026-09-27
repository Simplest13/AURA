// test/auth-flow.test.mjs
// End-to-end authentication + user-isolation test suite for the AURA backend.
// Requires the dev server to be running: npm start (listens on PORT from .env).
//
// Covers: register, duplicate-register, invalid login, /auth/me, logout,
// user-scoped data (reminders/tasks/conversations), cross-user access denial.
import fetch from 'node-fetch';

const base = process.env.API_BASE_URL ?? 'http://localhost:4000';
let passed = 0;
let failed = 0;

function ok(name, cond, extra = '') {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`);
  }
}

const api = (method, path, { token, body } = {}) =>
  fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

async function main() {
  console.log('\n=== AURA Auth Flow & User Isolation Tests ===\n');

  const stamp = Date.now();
  const userA = { name: 'Alice Test', email: `alice-${stamp}@example.com`, password: 'password123' };
  const userB = { name: 'Bob Test', email: `bob-${stamp}@example.com`, password: 'password456' };

  // ── Test 1: Register User A ──────────────────────────────────────────────
  console.log('Test 1 — Register new user');
  const regA = await api('POST', '/api/auth/register', { body: userA });
  const regAData = await regA.json();
  ok('register returns 201', regA.status === 201);
  ok('returns a token', Boolean(regAData.token));
  ok('returns safe user', Boolean(regAData.user?.id && regAData.user?.email));
  ok('no password hash leaked', !JSON.stringify(regAData).toLowerCase().includes('password_hash'));
  ok('user id is unique (not email-based)', regAData.user?.id && !regAData.user.id.includes('@'));

  // ── Test 2: Duplicate registration rejected ─────────────────────────────
  console.log('Test 2 — Duplicate registration');
  const dupA = await api('POST', '/api/auth/register', { body: userA });
  const dupAData = await dupA.json();
  ok('duplicate register rejected', dupA.status === 409 || dupA.status === 400, `got ${dupA.status}`);
  ok('clear duplicate error message', /already exists/i.test(dupAData.error ?? ''));

  // ── Test 3: Invalid login rejected ──────────────────────────────────────
  console.log('Test 3 — Invalid login');
  const badPw = await api('POST', '/api/auth/login', {
    body: { email: userA.email, password: 'wrong-password' },
  });
  ok('wrong password rejected', badPw.status === 401 || badPw.status === 400);
  const badEmail = await api('POST', '/api/auth/login', {
    body: { email: `nobody-${stamp}@example.com`, password: 'whatever123' },
  });
  ok('unknown email rejected', badEmail.status === 401 || badEmail.status === 400);

  // ── Test 4: Correct login works ─────────────────────────────────────────
  console.log('Test 4 — Valid login');
  const loginA = await api('POST', '/api/auth/login', {
    body: { email: userA.email, password: userA.password },
  });
  const loginAData = await loginA.json();
  ok('login succeeds', loginA.status === 200 && Boolean(loginAData.token));
  const tokenA = loginAData.token;

  // ── Test 5: /auth/me restores the session ───────────────────────────────
  console.log('Test 5 — Session restore via /auth/me');
  const meA = await api('GET', '/api/auth/me', { token: tokenA });
  const meAData = await meA.json();
  ok('me returns 200', meA.status === 200);
  ok('me returns the logged-in user', meAData.user?.email === userA.email);

  // ── Test 6: Unauthenticated access denied on data routes ───────────────
  console.log('Test 6 — Data routes require authentication');
  const noAuth = await api('GET', '/api/reminders');
  ok('GET /reminders without token → 401', noAuth.status === 401);
  const badToken = await api('GET', '/api/reminders', { token: 'invalid.jwt.token' });
  ok('GET /reminders with garbage token → 401', badToken.status === 401);

  // ── Test 7: User A creates data ─────────────────────────────────────────
  console.log('Test 7 — User A creates private data');
  const remA = await api('POST', '/api/reminders', {
    token: tokenA,
    body: { title: 'ALICE-PRIVATE-REMINDER', dueTime: 'Tomorrow', tag: 'Test' },
  });
  const remAData = await remA.json();
  ok('reminder created', remA.status === 201 && Boolean(remAData.id));
  const taskId = remAData.id;

  const taskA = await api('POST', '/api/study/tasks', {
    token: tokenA,
    body: { title: 'ALICE-PRIVATE-TASK', subjectName: 'Testing' },
  });
  const taskAData = await taskA.json();
  ok('task created', taskA.status === 201 && Boolean(taskAData.id));
  const taskIdA = taskAData.id;

  const convA = await api('POST', '/api/chat/conversations', {
    token: tokenA,
    body: { title: 'ALICE-PRIVATE-CONV' },
  });
  const convAData = await convA.json();
  ok('conversation created', convA.status === 201 && Boolean(convAData.id));
  const convIdA = convAData.id;

  // ── Test 8: User B cannot see or touch A's data ─────────────────────────
  console.log('Test 8 — User isolation (cross-user access denied)');
  const regB = await api('POST', '/api/auth/register', { body: userB });
  const regBData = await regB.json();
  const tokenB = regBData.token;
  ok('user B registered', regB.status === 201 && Boolean(tokenB));

  const bReminders = await (await api('GET', '/api/reminders', { token: tokenB })).json();
  ok("B's reminder list does NOT contain A's reminder",
    Array.isArray(bReminders) && !bReminders.some((r) => r.id === remAData.id));

  const bStealRem = await api('PUT', `/api/reminders/${taskId}`, {
    token: tokenB,
    body: { completed: true },
  });
  ok("B cannot UPDATE A's reminder", bStealRem.status === 404, `got ${bStealRem.status}`);
  const bDelRem = await api('DELETE', `/api/reminders/${taskId}`, { token: tokenB });
  ok("B cannot DELETE A's reminder", bDelRem.status === 404, `got ${bDelRem.status}`);

  const bStealTask = await api('PUT', `/api/study/tasks/${taskIdA}`, {
    token: tokenB,
    body: { completed: true },
  });
  ok("B cannot UPDATE A's task", bStealTask.status === 404, `got ${bStealTask.status}`);

  const bConvMsgs = await api('GET', `/api/chat/conversations/${convIdA}/messages`, { token: tokenB });
  ok("B cannot read A's conversation", bConvMsgs.status === 404, `got ${bConvMsgs.status}`);
  const bDelConv = await api('DELETE', `/api/chat/conversations/${convIdA}`, { token: tokenB });
  ok("B cannot delete A's conversation", bDelConv.status === 404, `got ${bDelConv.status}`);

  // ── Test 9: Owner can still update/delete their own data ────────────────
  console.log('Test 9 — Owner retains full access');
  const ownRem = await api('PUT', `/api/reminders/${taskId}`, {
    token: tokenA,
    body: { completed: true },
  });
  ok('A can update own reminder', ownRem.status === 200);
  const ownConv = await api('GET', `/api/chat/conversations/${convIdA}/messages`, { token: tokenA });
  ok('A can read own conversation', ownConv.status === 200);

  // ── Test 10: Expired/invalid token → 401 (app must land on Login) ───────
  console.log('Test 10 — Invalid/expired token handling');
  const expired = await api('GET', '/api/auth/me', { token: `${tokenA.slice(0, -3)}xyz` });
  ok('tampered token → 401', expired.status === 401);

  // ── Test 11: Logout endpoint ─────────────────────────────────────────────
  console.log('Test 11 — Logout endpoint');
  const out = await api('POST', '/api/auth/logout', { token: tokenA });
  const outData = await out.json();
  ok('logout returns ok', out.status === 200 && outData.ok === true);

  console.log('\n=========================================');
  console.log(`   RESULT: ${passed} passed, ${failed} failed`);
  console.log('=========================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('❌ Test suite crashed:', err);
  process.exit(1);
});

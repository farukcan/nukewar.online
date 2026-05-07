const net = require('net');
const { spawn } = require('child_process');

const LISTEN_PORT  = +(process.env.LISTEN_PORT  || 3000);
const GAME_PORT    = +(process.env.GAME_PORT    || 3001);
const GAME_CMD     =   process.env.GAME_CMD     || 'node';
const GAME_ARGS    =  (process.env.GAME_ARGS    || 'app.js').split(' ');
const IDLE_MS      = +(process.env.IDLE_MS      || 300_000);
const BOOT_TIMEOUT = +(process.env.BOOT_TIMEOUT || 30_000);

let gameProc = null;
let bootPromise = null;
let active = 0;
let idleTimer = null;

const probe = () => new Promise((res, rej) => {
  const s = net.connect(GAME_PORT, '127.0.0.1');
  s.once('connect', () => { s.destroy(); res(); });
  s.once('error', rej);
});

async function ensureGame() {
  if (gameProc) return;
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    console.log('[wrapper] spawning game');
    gameProc = spawn(GAME_CMD, GAME_ARGS, {
      stdio: 'inherit',
      env: { ...process.env, PORT: String(GAME_PORT) }
    });
    gameProc.once('exit', (code) => {
      console.log(`[wrapper] game exited (${code})`);
      gameProc = null;
    });
    const start = Date.now();
    while (Date.now() - start < BOOT_TIMEOUT) {
      try { await probe(); return; } catch { await new Promise(r => setTimeout(r, 200)); }
    }
    throw new Error('boot timeout');
  })().finally(() => { bootPromise = null; });
  return bootPromise;
}

function resetIdle() {
  clearTimeout(idleTimer);
  if (active === 0) {
    idleTimer = setTimeout(() => {
      if (gameProc && active === 0) {
        console.log('[wrapper] idle, killing game');
        gameProc.kill('SIGTERM');
      }
    }, IDLE_MS);
  }
}

net.createServer(async (client) => {
  active++;
  clearTimeout(idleTimer);
  idleTimer = null;

  try {
    await ensureGame();
  } catch (e) {
    console.error('[wrapper]', e.message);
    client.destroy();
    if (--active === 0) resetIdle();
    return;
  }

  const upstream = net.connect(GAME_PORT, '127.0.0.1');
  client.pipe(upstream);
  upstream.pipe(client);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    client.destroy();
    upstream.destroy();
    if (--active === 0) resetIdle();
    console.log('[wrapper] active connections:', active);
  };

  client.on('close', close);
  client.on('error', close);
  upstream.on('close', close);
  upstream.on('error', close);
}).listen(LISTEN_PORT, () => console.log(`[wrapper] listening :${LISTEN_PORT}`));

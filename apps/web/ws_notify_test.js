const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');

async function main() {
  const prisma = new PrismaClient();
  try {
    let driver = await prisma.user.findFirst({ where: { role: 'DRIVER' } });
    if (!driver) {
      driver = await prisma.user.create({ data: { name: 'AutoDriver', email: `autodriver-${Date.now()}@example.com`, role: 'DRIVER' } });
      console.log('Created driver', driver.id);
    } else {
      console.log('Using driver', driver.id);
    }

    const note = await prisma.driverNotification.create({ data: { driverId: driver.id, rideId: `test-ride-${Date.now()}`, message: 'Test ping - please deliver', delivered: false } });
    console.log('Created DriverNotification', note.id);

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      console.error('JWT_ACCESS_SECRET not set in environment. Cannot sign token.');
      process.exit(1);
    }

    const token = jwt.sign({ sub: driver.id }, secret, { expiresIn: '15m' });
    const candidates = [
      `ws://localhost:${process.env.WS_PORT || 4001}/?token=${encodeURIComponent(token)}`,
      `ws://localhost:3000/ws?token=${encodeURIComponent(token)}`,
      `ws://localhost:3000/?token=${encodeURIComponent(token)}`,
    ];
    console.log('Trying WS endpoints in order:', candidates);
    let ws;
    for (const u of candidates) {
      try {
        ws = new WebSocket(u);
        console.log('Attempting', u);
        // wait briefly for open or error
        await new Promise((res, rej) => {
          const onOpen = () => { ws.off('error', onErr); res(true); };
          const onErr = (e) => { ws.off('open', onOpen); rej(e); };
          ws.once('open', onOpen);
          ws.once('error', onErr);
          setTimeout(() => { rej(new Error('timeout')); }, 1200);
        });
        console.log('Connected to', u);
        break;
      } catch (e) {
        try { ws && ws.terminate(); } catch {}
        console.log('Failed to connect to', u, e && e.message);
        ws = null;
      }
    }
    if (!ws) {
      console.error('All WS connection attempts failed');
      process.exit(2);
    }

    ws.on('open', () => {
      console.log('WS open');
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('WS message:', msg);
      } catch (e) {
        console.log('WS raw:', data.toString());
      }
    });

    ws.on('close', (code, reason) => {
      console.log('WS closed', code, reason && reason.toString());
      process.exit(0);
    });

    ws.on('error', (err) => {
      console.error('WS error', err.message || err);
      process.exit(2);
    });

    setTimeout(async () => {
      console.log('Test timeout, closing');
      ws.close();
      await prisma.$disconnect();
    }, 6000);
  } catch (e) {
    console.error('Error', e);
    process.exit(3);
  }
}

main();

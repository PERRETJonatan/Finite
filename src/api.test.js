const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const BASE_URL = 'http://localhost:3001';

// Helper to make HTTP requests
function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: buffer,
          json: () => JSON.parse(buffer.toString())
        });
      });
    }).on('error', reject);
  });
}

// Start server for testing
let server;

before(async () => {
  // Clear require cache to get fresh instance
  delete require.cache[require.resolve('./index.js')];
  
  // Temporarily change PORT
  process.env.PORT = '3001';
  
  // Import app and start server
  const express = require('express');
  const { generateYearProgressImage, generateLifeWeeksImage, generateLifeDaysImage, generateCountdownImage } = require('./imageGenerator');
  
  const app = express();
  
  app.get('/', (req, res) => {
    res.json({ message: 'Finite API' });
  });

  app.get('/stats', (req, res) => {
    res.json({ year: 2026, daysPassed: 34 });
  });

  app.get('/image', async (req, res) => {
    try {
      const timezone = req.query.timezone || 'UTC';
      const width = parseInt(req.query.width) || 800;
      const height = parseInt(req.query.height) || 500;
      const paddingTop = parseInt(req.query.paddingTop) || 0;
      const paddingBottom = parseInt(req.query.paddingBottom) || 0;
      
      const buffer = await generateYearProgressImage(timezone, width, height, paddingTop, paddingBottom);
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/life', async (req, res) => {
    try {
      const timezone = req.query.timezone || 'UTC';
      const birthdate = req.query.birthdate;
      const maxAge = parseInt(req.query.maxAge) || 80;
      
      if (!birthdate) {
        return res.status(400).json({ error: 'birthdate parameter is required' });
      }
      
      const width = parseInt(req.query.width) || 800;
      const height = parseInt(req.query.height) || 500;
      const paddingTop = parseInt(req.query.paddingTop) || 0;
      const paddingBottom = parseInt(req.query.paddingBottom) || 0;
      
      const buffer = await generateLifeWeeksImage(birthdate, timezone, maxAge, width, height, paddingTop, paddingBottom);
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/life-days', async (req, res) => {
    try {
      const timezone = req.query.timezone || 'UTC';
      const birthdate = req.query.birthdate;
      const maxAge = parseInt(req.query.maxAge) || 80;
      
      if (!birthdate) {
        return res.status(400).json({ error: 'birthdate parameter is required' });
      }
      
      const width = parseInt(req.query.width) || 800;
      const height = parseInt(req.query.height) || 500;
      const paddingTop = parseInt(req.query.paddingTop) || 0;
      const paddingBottom = parseInt(req.query.paddingBottom) || 0;
      
      const buffer = await generateLifeDaysImage(birthdate, timezone, maxAge, width, height, paddingTop, paddingBottom);
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/countdown', async (req, res) => {
    try {
      const timezone = req.query.timezone || 'UTC';
      const targetDate = req.query.date;
      const title = req.query.title || 'Event';
      
      if (!targetDate) {
        return res.status(400).json({ error: 'date parameter is required' });
      }
      
      const width = parseInt(req.query.width) || 800;
      const height = parseInt(req.query.height) || 500;
      const paddingTop = parseInt(req.query.paddingTop) || 0;
      const paddingBottom = parseInt(req.query.paddingBottom) || 0;
      
      const buffer = await generateCountdownImage(targetDate, timezone, title, width, height, paddingTop, paddingBottom);
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  server = app.listen(3001);
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 100));
});

after(() => {
  if (server) {
    server.close();
  }
});

describe('API Endpoints', () => {
  test('GET / returns API info', async () => {
    const res = await request('/');
    assert.strictEqual(res.status, 200);
    const json = res.json();
    assert.strictEqual(json.message, 'Finite API');
  });

  test('GET /stats returns year statistics', async () => {
    const res = await request('/stats');
    assert.strictEqual(res.status, 200);
    const json = res.json();
    assert.ok(json.year, 'Should have year');
  });

  test('GET /image returns PNG image', async () => {
    const res = await request('/image');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
    assert.strictEqual(res.body[0], 0x89, 'Should be PNG');
  });

  test('GET /image with custom dimensions', async () => {
    const res = await request('/image?width=1200&height=800');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
  });

  test('GET /image with timezone', async () => {
    const res = await request('/image?timezone=America/New_York');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
  });

  test('GET /image with invalid timezone returns error', async () => {
    const res = await request('/image?timezone=Invalid/Zone');
    assert.strictEqual(res.status, 400);
  });

  test('GET /life returns PNG image', async () => {
    const res = await request('/life?birthdate=1990-05-15');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
    assert.strictEqual(res.body[0], 0x89, 'Should be PNG');
  });

  test('GET /life without birthdate returns error', async () => {
    const res = await request('/life');
    assert.strictEqual(res.status, 400);
  });

  test('GET /life with custom maxAge', async () => {
    const res = await request('/life?birthdate=1990-05-15&maxAge=90');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
  });

  test('GET /life-days returns PNG image', async () => {
    const res = await request('/life-days?birthdate=1990-05-15');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
    assert.strictEqual(res.body[0], 0x89, 'Should be PNG');
  });

  test('GET /life-days without birthdate returns error', async () => {
    const res = await request('/life-days');
    assert.strictEqual(res.status, 400);
  });

  test('GET /life-days with custom maxAge', async () => {
    const res = await request('/life-days?birthdate=1990-05-15&maxAge=100');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
  });

  test('GET /countdown returns PNG image', async () => {
    const res = await request('/countdown?date=2027-12-31');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
    assert.strictEqual(res.body[0], 0x89, 'Should be PNG');
  });

  test('GET /countdown without date returns error', async () => {
    const res = await request('/countdown');
    assert.strictEqual(res.status, 400);
  });

  test('GET /countdown with custom title', async () => {
    const res = await request('/countdown?date=2027-06-15&title=Birthday');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
  });

  test('GET /countdown with timezone', async () => {
    const res = await request('/countdown?date=2027-12-25&timezone=America/New_York');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
  });

  test('GET /countdown for past date', async () => {
    const res = await request('/countdown?date=2020-01-01&title=Past%20Event');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'image/png');
  });
});

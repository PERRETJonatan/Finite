const { test, describe } = require('node:test');
const assert = require('node:assert');
const { generateYearProgressImage, generateLifeWeeksImage, generateLifeDaysImage, generateCountdownImage } = require('./imageGenerator');

describe('Year Progress Image', () => {
  test('generates a valid PNG buffer', async () => {
    const buffer = await generateYearProgressImage('UTC', 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
    assert.ok(buffer.length > 0, 'Buffer should not be empty');
    // PNG magic bytes
    assert.strictEqual(buffer[0], 0x89, 'Should start with PNG magic byte');
    assert.strictEqual(buffer[1], 0x50, 'Should have P');
    assert.strictEqual(buffer[2], 0x4E, 'Should have N');
    assert.strictEqual(buffer[3], 0x47, 'Should have G');
  });

  test('generates image with custom dimensions', async () => {
    const buffer = await generateYearProgressImage('UTC', 1200, 800, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
    assert.ok(buffer.length > 0, 'Buffer should not be empty');
  });

  test('generates image with padding', async () => {
    const buffer = await generateYearProgressImage('UTC', 1170, 2532, 200, 300);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
    assert.ok(buffer.length > 0, 'Buffer should not be empty');
  });

  test('works with different timezones', async () => {
    const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
    for (const tz of timezones) {
      const buffer = await generateYearProgressImage(tz, 800, 500, 0, 0);
      assert.ok(buffer instanceof Buffer, `Should work with ${tz}`);
    }
  });

  test('throws error for invalid timezone', async () => {
    await assert.rejects(
      async () => generateYearProgressImage('Invalid/Timezone', 800, 500, 0, 0),
      { message: 'Invalid timezone' }
    );
  });
});

describe('Life Weeks Image', () => {
  test('generates a valid PNG buffer', async () => {
    const buffer = await generateLifeWeeksImage('1990-05-15', 'UTC', 80, 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
    assert.ok(buffer.length > 0, 'Buffer should not be empty');
    // PNG magic bytes
    assert.strictEqual(buffer[0], 0x89, 'Should start with PNG magic byte');
  });

  test('generates image with custom max age', async () => {
    const buffer = await generateLifeWeeksImage('1990-05-15', 'UTC', 90, 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
  });

  test('generates image with iPhone preset dimensions', async () => {
    const buffer = await generateLifeWeeksImage('1990-05-15', 'UTC', 80, 1290, 2796, 220, 340);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
  });

  test('works with different timezones', async () => {
    const buffer = await generateLifeWeeksImage('1990-05-15', 'America/New_York', 80, 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should work with timezone');
  });

  test('throws error for invalid timezone', async () => {
    await assert.rejects(
      async () => generateLifeWeeksImage('1990-05-15', 'Invalid/Timezone', 80, 800, 500, 0, 0),
      { message: 'Invalid timezone' }
    );
  });

  test('throws error for invalid birthdate', async () => {
    await assert.rejects(
      async () => generateLifeWeeksImage('invalid-date', 'UTC', 80, 800, 500, 0, 0),
      { message: 'Invalid birthdate' }
    );
  });
});

describe('Life Days Image', () => {
  test('generates a valid PNG buffer', async () => {
    const buffer = await generateLifeDaysImage('1990-05-15', 'UTC', 80, 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
    assert.ok(buffer.length > 0, 'Buffer should not be empty');
    // PNG magic bytes
    assert.strictEqual(buffer[0], 0x89, 'Should start with PNG magic byte');
  });

  test('generates image with custom max age', async () => {
    const buffer = await generateLifeDaysImage('1990-05-15', 'UTC', 100, 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
  });

  test('generates image with iPhone preset dimensions', async () => {
    const buffer = await generateLifeDaysImage('1990-05-15', 'UTC', 80, 1290, 2796, 220, 340);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
  });

  test('works with different birthdates', async () => {
    const dates = ['2000-01-01', '1985-12-25', '1970-06-15'];
    for (const date of dates) {
      const buffer = await generateLifeDaysImage(date, 'UTC', 80, 800, 500, 0, 0);
      assert.ok(buffer instanceof Buffer, `Should work with birthdate ${date}`);
    }
  });

  test('throws error for invalid timezone', async () => {
    await assert.rejects(
      async () => generateLifeDaysImage('1990-05-15', 'Invalid/Timezone', 80, 800, 500, 0, 0),
      { message: 'Invalid timezone' }
    );
  });

  test('throws error for invalid birthdate', async () => {
    await assert.rejects(
      async () => generateLifeDaysImage('not-a-date', 'UTC', 80, 800, 500, 0, 0),
      { message: 'Invalid birthdate' }
    );
  });
});

describe('Countdown Image', () => {
  test('generates a valid PNG buffer for future date', async () => {
    const buffer = await generateCountdownImage('2027-12-31', 'UTC', 'New Year', 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
    assert.ok(buffer.length > 0, 'Buffer should not be empty');
    // PNG magic bytes
    assert.strictEqual(buffer[0], 0x89, 'Should start with PNG magic byte');
    assert.strictEqual(buffer[1], 0x50, 'Should have P');
    assert.strictEqual(buffer[2], 0x4E, 'Should have N');
    assert.strictEqual(buffer[3], 0x47, 'Should have G');
  });

  test('generates image for past date', async () => {
    const buffer = await generateCountdownImage('2020-01-01', 'UTC', 'Past Event', 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
  });

  test('generates image with custom title', async () => {
    const buffer = await generateCountdownImage('2027-06-15', 'UTC', 'My Birthday 🎂', 800, 500, 0, 0);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
  });

  test('generates image with iPhone preset dimensions', async () => {
    const buffer = await generateCountdownImage('2027-12-25', 'UTC', 'Christmas', 1290, 2796, 220, 340);
    assert.ok(buffer instanceof Buffer, 'Should return a Buffer');
  });

  test('works with different timezones', async () => {
    const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
    for (const tz of timezones) {
      const buffer = await generateCountdownImage('2027-07-04', tz, 'Event', 800, 500, 0, 0);
      assert.ok(buffer instanceof Buffer, `Should work with ${tz}`);
    }
  });

  test('throws error for invalid timezone', async () => {
    await assert.rejects(
      async () => generateCountdownImage('2027-12-31', 'Invalid/Timezone', 'Event', 800, 500, 0, 0),
      { message: 'Invalid timezone' }
    );
  });

  test('throws error for invalid target date', async () => {
    await assert.rejects(
      async () => generateCountdownImage('not-a-date', 'UTC', 'Event', 800, 500, 0, 0),
      { message: 'Invalid target date' }
    );
  });
});

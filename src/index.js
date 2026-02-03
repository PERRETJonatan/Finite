const express = require('express');
const { generateYearProgressImage, generateLifeWeeksImage, generateLifeDaysImage, generateCountdownImage } = require('./imageGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Finite API',
    endpoints: {
      '/image': 'Generate year progress image (PNG)',
      '/life': 'Generate life weeks image (PNG) - shows weeks lived vs remaining until max age',
      '/life-days': 'Generate life days image (PNG) - shows days lived vs remaining until max age',
      '/countdown': 'Generate countdown image (PNG) - shows days remaining until a target date',
      '/stats': 'Get year progress statistics as JSON'
    },
    parameters: {
      common: {
        timezone: 'Optional timezone (e.g., America/New_York, Europe/London, Asia/Tokyo). Defaults to UTC.',
        width: 'Optional image width in pixels. Defaults to 800.',
        height: 'Optional image height in pixels. Defaults to 500.',
        paddingTop: 'Optional top padding in pixels for clock/status bar area. Defaults to 0.',
        paddingBottom: 'Optional bottom padding in pixels for widgets/dock area. Defaults to 0.',
        preset: 'Optional device preset: iphone-standard, iphone-pro, iphone-pro-max'
      },
      life: {
        birthdate: 'Required. Date of birth in YYYY-MM-DD format.',
        maxAge: 'Optional. Maximum age in years (default: 80).'
      },
      countdown: {
        date: 'Required. Target date in YYYY-MM-DD format.',
        title: 'Optional. Event title to display (default: Event).'
      }
    },
    presets: {
      'iphone-standard': { width: 1170, height: 2532, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro': { width: 1179, height: 2556, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro-max': { width: 1290, height: 2796, paddingTop: 220, paddingBottom: 340 }
    }
  });
});

app.get('/life', async (req, res) => {
  try {
    const timezone = req.query.timezone || 'UTC';
    const birthdate = req.query.birthdate;
    const maxAge = parseInt(req.query.maxAge) || 80;
    
    if (!birthdate) {
      return res.status(400).json({ error: 'birthdate parameter is required (YYYY-MM-DD format)' });
    }
    
    // Validate birthdate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return res.status(400).json({ error: 'Invalid birthdate format. Use YYYY-MM-DD' });
    }
    
    // Validate maxAge
    if (maxAge < 1 || maxAge > 150) {
      return res.status(400).json({ error: 'maxAge must be between 1 and 150' });
    }
    
    // Device presets for iPhone wallpapers
    const presets = {
      'iphone-standard': { width: 1170, height: 2532, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro': { width: 1179, height: 2556, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro-max': { width: 1290, height: 2796, paddingTop: 540, paddingBottom: 560 }
    };
    
    let width, height, paddingTop, paddingBottom;
    
    if (req.query.preset && presets[req.query.preset]) {
      const preset = presets[req.query.preset];
      width = preset.width;
      height = preset.height;
      paddingTop = preset.paddingTop;
      paddingBottom = preset.paddingBottom;
    } else {
      width = parseInt(req.query.width) || 800;
      height = parseInt(req.query.height) || 500;
      paddingTop = parseInt(req.query.paddingTop) || 0;
      paddingBottom = parseInt(req.query.paddingBottom) || 0;
    }
    
    // Validate dimensions
    if (width < 400 || width > 3000 || height < 300 || height > 4000) {
      return res.status(400).json({ error: 'Invalid dimensions. Width: 400-3000, Height: 300-4000' });
    }
    
    const buffer = await generateLifeWeeksImage(birthdate, timezone, maxAge, width, height, paddingTop, paddingBottom);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating life image:', error);
    if (error.message === 'Invalid timezone') {
      res.status(400).json({ error: 'Invalid timezone' });
    } else if (error.message === 'Invalid birthdate') {
      res.status(400).json({ error: 'Invalid birthdate' });
    } else {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  }
});

app.get('/life-days', async (req, res) => {
  try {
    const timezone = req.query.timezone || 'UTC';
    const birthdate = req.query.birthdate;
    const maxAge = parseInt(req.query.maxAge) || 80;
    
    if (!birthdate) {
      return res.status(400).json({ error: 'birthdate parameter is required (YYYY-MM-DD format)' });
    }
    
    // Validate birthdate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return res.status(400).json({ error: 'Invalid birthdate format. Use YYYY-MM-DD' });
    }
    
    // Validate maxAge
    if (maxAge < 1 || maxAge > 150) {
      return res.status(400).json({ error: 'maxAge must be between 1 and 150' });
    }
    
    // Device presets for iPhone wallpapers
    const presets = {
      'iphone-standard': { width: 1170, height: 2532, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro': { width: 1179, height: 2556, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro-max': { width: 1290, height: 2796, paddingTop: 540, paddingBottom: 560 }
    };
    
    let width, height, paddingTop, paddingBottom;
    
    if (req.query.preset && presets[req.query.preset]) {
      const preset = presets[req.query.preset];
      width = preset.width;
      height = preset.height;
      paddingTop = preset.paddingTop;
      paddingBottom = preset.paddingBottom;
    } else {
      width = parseInt(req.query.width) || 800;
      height = parseInt(req.query.height) || 500;
      paddingTop = parseInt(req.query.paddingTop) || 0;
      paddingBottom = parseInt(req.query.paddingBottom) || 0;
    }
    
    // Validate dimensions
    if (width < 400 || width > 3000 || height < 300 || height > 4000) {
      return res.status(400).json({ error: 'Invalid dimensions. Width: 400-3000, Height: 300-4000' });
    }
    
    const buffer = await generateLifeDaysImage(birthdate, timezone, maxAge, width, height, paddingTop, paddingBottom);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating life days image:', error);
    if (error.message === 'Invalid timezone') {
      res.status(400).json({ error: 'Invalid timezone' });
    } else if (error.message === 'Invalid birthdate') {
      res.status(400).json({ error: 'Invalid birthdate' });
    } else {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  }
});

app.get('/countdown', async (req, res) => {
  try {
    const timezone = req.query.timezone || 'UTC';
    const targetDate = req.query.date;
    const rawTitle = req.query.title;
    const title = rawTitle === undefined ? 'Event' : rawTitle;

    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Title must be a single string value' });
    }
    
    if (!targetDate) {
      return res.status(400).json({ error: 'date parameter is required (YYYY-MM-DD format)' });
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Validate title length
    if (title.length > 50) {
      return res.status(400).json({ error: 'Title must be 50 characters or less' });
    }
    
    // Device presets for iPhone wallpapers
    const presets = {
      'iphone-standard': { width: 1170, height: 2532, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro': { width: 1179, height: 2556, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro-max': { width: 1290, height: 2796, paddingTop: 540, paddingBottom: 560 }
    };
    
    let width, height, paddingTop, paddingBottom;
    
    if (req.query.preset && presets[req.query.preset]) {
      const preset = presets[req.query.preset];
      width = preset.width;
      height = preset.height;
      paddingTop = preset.paddingTop;
      paddingBottom = preset.paddingBottom;
    } else {
      width = parseInt(req.query.width) || 800;
      height = parseInt(req.query.height) || 500;
      paddingTop = parseInt(req.query.paddingTop) || 0;
      paddingBottom = parseInt(req.query.paddingBottom) || 0;
    }
    
    // Validate dimensions
    if (width < 400 || width > 3000 || height < 300 || height > 4000) {
      return res.status(400).json({ error: 'Invalid dimensions. Width: 400-3000, Height: 300-4000' });
    }
    
    const buffer = await generateCountdownImage(targetDate, timezone, title, width, height, paddingTop, paddingBottom);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating countdown image:', error);
    if (error.message === 'Invalid timezone') {
      res.status(400).json({ error: 'Invalid timezone' });
    } else if (error.message === 'Invalid target date') {
      res.status(400).json({ error: 'Invalid target date' });
    } else {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  }
});

app.get('/stats', (req, res) => {
  const timezone = req.query.timezone || 'UTC';
  try {
    const stats = getYearStats(timezone);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: 'Invalid timezone' });
  }
});

app.get('/image', async (req, res) => {
  try {
    const timezone = req.query.timezone || 'UTC';
    
    // Device presets for iPhone wallpapers
    const presets = {
      'iphone-standard': { width: 1170, height: 2532, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro': { width: 1179, height: 2556, paddingTop: 200, paddingBottom: 300 },
      'iphone-pro-max': { width: 1290, height: 2796, paddingTop: 540, paddingBottom: 560 }
    };
    
    let width, height, paddingTop, paddingBottom;
    
    if (req.query.preset && presets[req.query.preset]) {
      const preset = presets[req.query.preset];
      width = preset.width;
      height = preset.height;
      paddingTop = preset.paddingTop;
      paddingBottom = preset.paddingBottom;
    } else {
      width = parseInt(req.query.width) || 800;
      height = parseInt(req.query.height) || 500;
      paddingTop = parseInt(req.query.paddingTop) || 0;
      paddingBottom = parseInt(req.query.paddingBottom) || 0;
    }
    
    // Validate dimensions
    if (width < 400 || width > 3000 || height < 300 || height > 4000) {
      return res.status(400).json({ error: 'Invalid dimensions. Width: 400-3000, Height: 300-4000' });
    }
    
    const buffer = await generateYearProgressImage(timezone, width, height, paddingTop, paddingBottom);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating image:', error);
    if (error.message === 'Invalid timezone') {
      res.status(400).json({ error: 'Invalid timezone' });
    } else {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  }
});

function getYearStats(timezone = 'UTC') {
  // Validate timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch (e) {
    throw new Error('Invalid timezone');
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const [yearStr, monthStr, dayStr] = formatter.format(now).split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeapYear ? 366 : 365;
  
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let daysPassed = day;
  for (let i = 0; i < month - 1; i++) {
    daysPassed += daysInMonth[i];
  }
  
  const daysRemaining = totalDays - daysPassed;
  const percentagePassed = ((daysPassed / totalDays) * 100).toFixed(2);
  const percentageRemaining = ((daysRemaining / totalDays) * 100).toFixed(2);

  return {
    year,
    timezone,
    totalDays,
    daysPassed,
    daysRemaining,
    percentagePassed: parseFloat(percentagePassed),
    percentageRemaining: parseFloat(percentageRemaining)
  };
}

app.listen(PORT, () => {
  console.log(`🚀 Finite API running on http://localhost:${PORT}`);
});

module.exports = { getYearStats };

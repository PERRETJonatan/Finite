const { createCanvas } = require('@napi-rs/canvas');

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
  const percentagePassed = ((daysPassed / totalDays) * 100).toFixed(1);
  const percentageRemaining = ((daysRemaining / totalDays) * 100).toFixed(1);

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

async function generateYearProgressImage(timezone = 'UTC', width = 800, height = 500, paddingTop = 0, paddingBottom = 0) {
  const stats = getYearStats(timezone);
  
  const canvas = createCanvas(width, height);
  
  // Calculate content area (excluding padding for clock/widgets)
  const contentTop = paddingTop;
  const contentBottom = height - paddingBottom;
  const contentHeight = contentBottom - contentTop;
  
  // Scale based on content area
  const scaleX = width / 800;
  const scaleY = contentHeight / 500;
  const scale = Math.min(scaleX, scaleY);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(48 * scale)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(`Year ${stats.year} Progress`, width / 2, contentTop + 70 * scaleY);

  // Progress bar background
  const barX = 50 * scaleX;
  const barY = contentTop + 100 * scaleY;
  const barWidth = width - 100 * scaleX;
  const barHeight = 50 * scale;
  const borderRadius = 25 * scale;

  ctx.fillStyle = '#2d3748';
  roundRect(ctx, barX, barY, barWidth, barHeight, borderRadius);
  ctx.fill();

  // Progress bar fill
  const progressWidth = (stats.daysPassed / stats.totalDays) * barWidth;
  const progressGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
  progressGradient.addColorStop(0, '#667eea');
  progressGradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = progressGradient;
  roundRect(ctx, barX, barY, progressWidth, barHeight, borderRadius);
  ctx.fill();

  // Progress percentage on bar
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(24 * scale)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(`${stats.percentagePassed}%`, width / 2, barY + barHeight * 0.7);

  // Stats cards
  const cardY = barY + barHeight + 20 * scale;
  const cardHeight = 120 * scale;
  const cardWidth = 220 * scale;
  const cardGap = 30 * scale;
  const startX = (width - (3 * cardWidth + 2 * cardGap)) / 2;

  // Days Passed Card
  drawCard(ctx, startX, cardY, cardWidth, cardHeight, '#667eea', 'Days Passed', stats.daysPassed.toString(), scale);

  // Days Remaining Card
  drawCard(ctx, startX + cardWidth + cardGap, cardY, cardWidth, cardHeight, '#f093fb', 'Days Remaining', stats.daysRemaining.toString(), scale);

  // Percentage Remaining Card
  drawCard(ctx, startX + 2 * (cardWidth + cardGap), cardY, cardWidth, cardHeight, '#4fd1c5', 'Remaining', `${stats.percentageRemaining}%`, scale);

  // Days dots visualization
  const dotsStartY = cardY + cardHeight + 40 * scale;
  const dotsAreaWidth = width - 80 * scaleX;
  const dotsAreaHeight = contentBottom - dotsStartY - 20 * scale;
  const dotsStartX = 40 * scaleX;
  
  // Calculate optimal grid layout for dots
  const totalDots = stats.totalDays;
  const aspectRatio = dotsAreaWidth / dotsAreaHeight;
  
  // Find the best number of columns to fill the area nicely
  let cols = Math.ceil(Math.sqrt(totalDots * aspectRatio));
  let rows = Math.ceil(totalDots / cols);
  
  // Adjust to fit better
  while (cols * rows < totalDots) {
    rows++;
  }
  
  // Calculate dot size and spacing
  const dotSpacingX = dotsAreaWidth / cols;
  const dotSpacingY = dotsAreaHeight / rows;
  const dotRadius = Math.min(dotSpacingX, dotSpacingY) * 0.35;
  
  // Draw all dots
  for (let i = 0; i < totalDots; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    const dotX = dotsStartX + col * dotSpacingX + dotSpacingX / 2;
    const dotY = dotsStartY + row * dotSpacingY + dotSpacingY / 2;
    
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    
    if (i < stats.daysPassed) {
      // Passed days - gradient color
      const gradientProgress = i / totalDots;
      const r = Math.round(102 + (118 - 102) * gradientProgress);
      const g = Math.round(126 + (75 - 126) * gradientProgress);
      const b = Math.round(234 + (162 - 234) * gradientProgress);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    } else {
      // Remaining days - grey
      ctx.fillStyle = '#3d4555';
    }
    
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCard(ctx, x, y, width, height, color, label, value, scale = 1) {
  // Card background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, x, y, width, height, 15 * scale);
  ctx.fill();

  // Card border
  ctx.strokeStyle = color;
  ctx.lineWidth = 3 * scale;
  roundRect(ctx, x, y, width, height, 15 * scale);
  ctx.stroke();

  // Value
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(42 * scale)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(value, x + width / 2, y + height * 0.5);

  // Label
  ctx.fillStyle = color;
  ctx.font = `${Math.round(18 * scale)}px Arial`;
  ctx.fillText(label, x + width / 2, y + height * 0.8);
}

function getLifeStats(birthdate, timezone = 'UTC', maxAge = 80) {
  // Validate timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch (e) {
    throw new Error('Invalid timezone');
  }

  // Parse birthdate
  const [birthYear, birthMonth, birthDay] = birthdate.split('-').map(Number);
  if (!birthYear || !birthMonth || !birthDay) {
    throw new Error('Invalid birthdate');
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const [nowYearStr, nowMonthStr, nowDayStr] = formatter.format(now).split('-');
  const nowYear = parseInt(nowYearStr);
  const nowMonth = parseInt(nowMonthStr);
  const nowDay = parseInt(nowDayStr);

  // Calculate weeks
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const currentDate = new Date(nowYear, nowMonth - 1, nowDay);
  
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksLived = Math.floor((currentDate - birthDate) / msPerWeek);
  const totalWeeks = maxAge * 52;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  
  const currentAge = (currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
  const percentageLived = ((weeksLived / totalWeeks) * 100).toFixed(1);

  return {
    birthdate,
    timezone,
    maxAge,
    currentAge: parseFloat(currentAge.toFixed(1)),
    totalWeeks,
    weeksLived,
    weeksRemaining,
    percentageLived: parseFloat(percentageLived)
  };
}

async function generateLifeWeeksImage(birthdate, timezone = 'UTC', maxAge = 80, width = 800, height = 500, paddingTop = 0, paddingBottom = 0) {
  const stats = getLifeStats(birthdate, timezone, maxAge);
  
  const canvas = createCanvas(width, height);
  
  // Calculate content area (excluding padding for clock/widgets)
  const contentTop = paddingTop;
  const contentBottom = height - paddingBottom;
  const contentHeight = contentBottom - contentTop;
  
  // Scale based on content area
  const scaleX = width / 800;
  const scaleY = contentHeight / 500;
  const scale = Math.min(scaleX, scaleY);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(44 * scale)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(`Life in Weeks`, width / 2, contentTop + 60 * scaleY);
  
  // Subtitle with age
  ctx.fillStyle = '#a0aec0';
  ctx.font = `${Math.round(22 * scale)}px Arial`;
  ctx.fillText(`${stats.currentAge} years old • ${stats.maxAge} year lifespan`, width / 2, contentTop + 95 * scaleY);

  // Stats cards
  const cardY = contentTop + 120 * scaleY;
  const cardHeight = 90 * scale;
  const cardWidth = 200 * scale;
  const cardGap = 25 * scale;
  const startX = (width - (3 * cardWidth + 2 * cardGap)) / 2;

  // Weeks Lived Card
  drawCard(ctx, startX, cardY, cardWidth, cardHeight, '#667eea', 'Weeks Lived', stats.weeksLived.toLocaleString(), scale * 0.85);

  // Weeks Remaining Card
  drawCard(ctx, startX + cardWidth + cardGap, cardY, cardWidth, cardHeight, '#f093fb', 'Weeks Left', stats.weeksRemaining.toLocaleString(), scale * 0.85);

  // Percentage Card
  drawCard(ctx, startX + 2 * (cardWidth + cardGap), cardY, cardWidth, cardHeight, '#4fd1c5', 'Life Lived', `${stats.percentageLived}%`, scale * 0.85);

  // Weeks dots visualization
  const dotsStartY = cardY + cardHeight + 30 * scale;
  const dotsAreaWidth = width - 60 * scaleX;
  const dotsAreaHeight = contentBottom - dotsStartY - 10 * scale;
  const dotsStartX = 30 * scaleX;
  
  // Calculate optimal grid layout - 52 columns (weeks per year) x maxAge rows
  const cols = 52; // weeks per year
  const rows = stats.maxAge;
  
  // Calculate dot size and spacing
  const dotSpacingX = dotsAreaWidth / cols;
  const dotSpacingY = dotsAreaHeight / rows;
  const dotRadius = Math.min(dotSpacingX, dotSpacingY) * 0.4;
  
  // Draw all weeks as dots
  for (let year = 0; year < rows; year++) {
    for (let week = 0; week < cols; week++) {
      const weekIndex = year * 52 + week;
      if (weekIndex >= stats.totalWeeks) continue;
      
      const dotX = dotsStartX + week * dotSpacingX + dotSpacingX / 2;
      const dotY = dotsStartY + year * dotSpacingY + dotSpacingY / 2;
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      
      if (weekIndex < stats.weeksLived) {
        // Lived weeks - gradient from blue to purple
        const gradientProgress = weekIndex / stats.totalWeeks;
        const r = Math.round(102 + (240 - 102) * gradientProgress);
        const g = Math.round(126 + (147 - 126) * gradientProgress);
        const b = Math.round(234 + (251 - 234) * gradientProgress);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      } else {
        // Remaining weeks - grey
        ctx.fillStyle = '#3d4555';
      }
      
      ctx.fill();
    }
  }

  return canvas.toBuffer('image/png');
}

function getLifeDaysStats(birthdate, timezone = 'UTC', maxAge = 80) {
  // Validate timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch (e) {
    throw new Error('Invalid timezone');
  }

  // Parse birthdate
  const [birthYear, birthMonth, birthDay] = birthdate.split('-').map(Number);
  if (!birthYear || !birthMonth || !birthDay) {
    throw new Error('Invalid birthdate');
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const [nowYearStr, nowMonthStr, nowDayStr] = formatter.format(now).split('-');
  const nowYear = parseInt(nowYearStr);
  const nowMonth = parseInt(nowMonthStr);
  const nowDay = parseInt(nowDayStr);

  // Calculate days
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const currentDate = new Date(nowYear, nowMonth - 1, nowDay);
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLived = Math.floor((currentDate - birthDate) / msPerDay);
  const totalDays = Math.round(maxAge * 365.25);
  const daysRemaining = Math.max(0, totalDays - daysLived);
  
  const currentAge = (currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
  const percentageLived = ((daysLived / totalDays) * 100).toFixed(1);

  return {
    birthdate,
    timezone,
    maxAge,
    currentAge: parseFloat(currentAge.toFixed(1)),
    totalDays,
    daysLived,
    daysRemaining,
    percentageLived: parseFloat(percentageLived)
  };
}

async function generateLifeDaysImage(birthdate, timezone = 'UTC', maxAge = 80, width = 800, height = 500, paddingTop = 0, paddingBottom = 0) {
  const stats = getLifeDaysStats(birthdate, timezone, maxAge);
  
  const canvas = createCanvas(width, height);
  
  // Calculate content area (excluding padding for clock/widgets)
  const contentTop = paddingTop;
  const contentBottom = height - paddingBottom;
  const contentHeight = contentBottom - contentTop;
  
  // Scale based on content area
  const scaleX = width / 800;
  const scaleY = contentHeight / 500;
  const scale = Math.min(scaleX, scaleY);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(44 * scale)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(`Life in Days`, width / 2, contentTop + 60 * scaleY);
  
  // Subtitle with age
  ctx.fillStyle = '#a0aec0';
  ctx.font = `${Math.round(22 * scale)}px Arial`;
  ctx.fillText(`${stats.currentAge} years old • ${stats.maxAge} year lifespan`, width / 2, contentTop + 95 * scaleY);

  // Stats cards
  const cardY = contentTop + 120 * scaleY;
  const cardHeight = 90 * scale;
  const cardWidth = 200 * scale;
  const cardGap = 25 * scale;
  const startX = (width - (3 * cardWidth + 2 * cardGap)) / 2;

  // Days Lived Card
  drawCard(ctx, startX, cardY, cardWidth, cardHeight, '#667eea', 'Days Lived', stats.daysLived.toLocaleString(), scale * 0.85);

  // Days Remaining Card
  drawCard(ctx, startX + cardWidth + cardGap, cardY, cardWidth, cardHeight, '#f093fb', 'Days Left', stats.daysRemaining.toLocaleString(), scale * 0.85);

  // Percentage Card
  drawCard(ctx, startX + 2 * (cardWidth + cardGap), cardY, cardWidth, cardHeight, '#4fd1c5', 'Life Lived', `${stats.percentageLived}%`, scale * 0.85);

  // Days dots visualization
  const dotsStartY = cardY + cardHeight + 30 * scale;
  const dotsAreaWidth = width - 60 * scaleX;
  const dotsAreaHeight = contentBottom - dotsStartY - 10 * scale;
  const dotsStartX = 30 * scaleX;
  
  // Calculate optimal grid layout for days
  // Use 365 columns (days per year) x maxAge rows
  const cols = 365;
  const rows = stats.maxAge;
  
  // Calculate dot size and spacing
  const dotSpacingX = dotsAreaWidth / cols;
  const dotSpacingY = dotsAreaHeight / rows;
  const dotRadius = Math.min(dotSpacingX, dotSpacingY) * 0.4;
  
  // Draw all days as dots
  for (let year = 0; year < rows; year++) {
    for (let day = 0; day < cols; day++) {
      const dayIndex = year * 365 + day;
      if (dayIndex >= stats.totalDays) continue;
      
      const dotX = dotsStartX + day * dotSpacingX + dotSpacingX / 2;
      const dotY = dotsStartY + year * dotSpacingY + dotSpacingY / 2;
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      
      if (dayIndex < stats.daysLived) {
        // Lived days - gradient from blue to pink
        const gradientProgress = dayIndex / stats.totalDays;
        const r = Math.round(102 + (240 - 102) * gradientProgress);
        const g = Math.round(126 + (147 - 126) * gradientProgress);
        const b = Math.round(234 + (251 - 234) * gradientProgress);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      } else {
        // Remaining days - grey
        ctx.fillStyle = '#3d4555';
      }
      
      ctx.fill();
    }
  }

  return canvas.toBuffer('image/png');
}

function getCountdownStats(targetDate, timezone = 'UTC', title = 'Event') {
  // Validate timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch (e) {
    throw new Error('Invalid timezone');
  }

  // Parse target date
  const [targetYear, targetMonth, targetDay] = targetDate.split('-').map(Number);
  if (!targetYear || !targetMonth || !targetDay) {
    throw new Error('Invalid target date');
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const [nowYearStr, nowMonthStr, nowDayStr] = formatter.format(now).split('-');
  const nowYear = parseInt(nowYearStr);
  const nowMonth = parseInt(nowMonthStr);
  const nowDay = parseInt(nowDayStr);

  const currentDate = new Date(nowYear, nowMonth - 1, nowDay);
  const target = new Date(targetYear, targetMonth - 1, targetDay);
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffMs = target - currentDate;
  const daysRemaining = Math.ceil(diffMs / msPerDay);
  
  const weeksRemaining = Math.floor(daysRemaining / 7);
  const monthsRemaining = Math.floor(daysRemaining / 30.44);
  
  const isPast = daysRemaining < 0;
  const isToday = daysRemaining === 0;

  return {
    title,
    targetDate,
    timezone,
    daysRemaining: Math.abs(daysRemaining),
    weeksRemaining: Math.abs(weeksRemaining),
    monthsRemaining: Math.abs(monthsRemaining),
    isPast,
    isToday
  };
}

async function generateCountdownImage(targetDate, timezone = 'UTC', title = 'Event', width = 800, height = 500, paddingTop = 0, paddingBottom = 0) {
  const stats = getCountdownStats(targetDate, timezone, title);
  
  const canvas = createCanvas(width, height);
  
  // Calculate content area (excluding padding for clock/widgets)
  const contentTop = paddingTop;
  const contentBottom = height - paddingBottom;
  const contentHeight = contentBottom - contentTop;
  
  // Scale based on content area
  const scaleX = width / 800;
  const scaleY = contentHeight / 500;
  const scale = Math.min(scaleX, scaleY);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title (event name)
  ctx.fillStyle = '#a0aec0';
  ctx.font = `${Math.round(28 * scale)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(stats.isToday ? '🎉 TODAY 🎉' : (stats.isPast ? 'Since' : 'Countdown to'), width / 2, contentTop + 50 * scaleY);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(48 * scale)}px Arial`;
  ctx.fillText(stats.title, width / 2, contentTop + 110 * scaleY);

  // Target date subtitle
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const [year, month, day] = targetDate.split('-').map(Number);
  const displayDate = dateFormatter.format(new Date(year, month - 1, day));
  ctx.fillStyle = '#a0aec0';
  ctx.font = `${Math.round(22 * scale)}px Arial`;
  ctx.fillText(displayDate, width / 2, contentTop + 150 * scaleY);

  if (stats.isToday) {
    // Special "Today" display
    ctx.fillStyle = '#4fd1c5';
    ctx.font = `bold ${Math.round(120 * scale)}px Arial`;
    ctx.fillText('🎊', width / 2, contentTop + 300 * scaleY);
  } else {
    // Big number display
    const bigNumber = stats.daysRemaining;
    const bigNumberGradient = ctx.createLinearGradient(0, contentTop + 180 * scaleY, 0, contentTop + 320 * scaleY);
    if (stats.isPast) {
      bigNumberGradient.addColorStop(0, '#a0aec0');
      bigNumberGradient.addColorStop(1, '#718096');
    } else {
      bigNumberGradient.addColorStop(0, '#667eea');
      bigNumberGradient.addColorStop(1, '#764ba2');
    }
    ctx.fillStyle = bigNumberGradient;
    ctx.font = `bold ${Math.round(140 * scale)}px Arial`;
    ctx.fillText(bigNumber.toLocaleString(), width / 2, contentTop + 310 * scaleY);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.round(32 * scale)}px Arial`;
    ctx.fillText(stats.isPast ? 'days ago' : 'days to go', width / 2, contentTop + 360 * scaleY);
  }

  // Stats cards
  const cardY = contentTop + 390 * scaleY;
  const cardHeight = 80 * scale;
  const cardWidth = 180 * scale;
  const cardGap = 25 * scale;
  const startX = (width - (3 * cardWidth + 2 * cardGap)) / 2;

  if (!stats.isToday) {
    // Weeks Card
    drawCard(ctx, startX, cardY, cardWidth, cardHeight, '#667eea', 'Weeks', stats.weeksRemaining.toLocaleString(), scale * 0.8);

    // Months Card
    drawCard(ctx, startX + cardWidth + cardGap, cardY, cardWidth, cardHeight, '#f093fb', 'Months', stats.monthsRemaining.toLocaleString(), scale * 0.8);

    // Hours Card
    const hoursRemaining = stats.daysRemaining * 24;
    drawCard(ctx, startX + 2 * (cardWidth + cardGap), cardY, cardWidth, cardHeight, '#4fd1c5', 'Hours', hoursRemaining.toLocaleString(), scale * 0.8);
  }

  return canvas.toBuffer('image/png');
}

module.exports = { generateYearProgressImage, generateLifeWeeksImage, generateLifeDaysImage, generateCountdownImage };

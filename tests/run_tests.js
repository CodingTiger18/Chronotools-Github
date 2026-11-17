/**
 * ChronoTools Automated Comprehensive Test Suite
 * 
 * Tests:
 * 1. 12-Hour vs 24-Hour Time Formatting & Snapshot logic
 * 2. ISO 8601 Week Number Calculation Engine
 * 3. Unix Timestamp Converter Engine
 * 4. Timezone Offset Difference Engine (fractional offsets, day shifts)
 * 5. Static Route & Semantic HTML Integrity (all tools & pages)
 * 6. Sitemap & SEO Index Integrity (550+ URLs validated)
 * 7. Asset Optimization & Performance Budgets
 * 8. Core Bundle JavaScript Syntax & Variable Shadowing Verification
 * 
 * Run with: node tests/run_tests.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function describe(suiteName, fn) {
  console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suiteName}\x1b[0m`);
  fn();
}

function it(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
  } catch (err) {
    failedTests++;
    console.error(`  \x1b[31m✖\x1b[0m ${testName}`);
    console.error(`    \x1b[31m${err.message}\x1b[0m`);
    if (err.stack) {
      console.error(`    ${err.stack.split('\n')[1]}`);
    }
  }
}

// ==========================================
// Suite 1: 12-Hour vs 24-Hour Time Formatting
// ==========================================
describe('12-Hour vs 24-Hour Time Formatting & Snapshot Logic', () => {
  // Mirroring ChronoTools core time formatting functions
  function formatMinutes(mins, is24h) {
    const totalMinutes = ((mins % 1440) + 1440) % 1440;
    const hours = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    const mm = m.toString().padStart(2, '0');

    if (is24h) {
      return `${hours.toString().padStart(2, '0')}:${mm}`;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${mm} ${period}`;
  }

  function formatTimeScrubberButton(hours, minutes, is24h) {
    const mm = minutes.toString().padStart(2, '0');
    if (is24h) {
      return `${hours.toString().padStart(2, '0')}:${mm}`;
    }
    const h12 = hours % 12 || 12;
    const meridiem = hours >= 12 ? 'pm' : 'am';
    return minutes > 0 ? `${h12}:${mm} ${meridiem}` : `${h12}${meridiem}`;
  }

  function formatSnapshotTitle(timeStr, is24h, slotMinutes = 30) {
    const formattedTime = is24h ? timeStr : formatMinutes(
      parseInt(timeStr.split(':')[0], 10) * 60 + parseInt(timeStr.split(':')[1], 10),
      false
    );
    return `Selected ${slotMinutes}-Min Meeting Slot · (${formattedTime})`;
  }

  it('correctly formats midnight (00:00) in 12h and 24h mode', () => {
    assert.strictEqual(formatMinutes(0, false), '12:00 AM');
    assert.strictEqual(formatMinutes(0, true), '00:00');
  });

  it('correctly formats noon (12:00) in 12h and 24h mode', () => {
    assert.strictEqual(formatMinutes(720, false), '12:00 PM');
    assert.strictEqual(formatMinutes(720, true), '12:00');
  });

  it('correctly formats evening hours in 12h mode with PM', () => {
    assert.strictEqual(formatMinutes(13 * 60, false), '1:00 PM');
    assert.strictEqual(formatMinutes(19 * 60 + 30, false), '7:30 PM');
    assert.strictEqual(formatMinutes(23 * 60 + 59, false), '11:59 PM');
  });

  it('correctly formats scrubber buttons without 24h leakage when 12h mode is selected', () => {
    assert.strictEqual(formatTimeScrubberButton(9, 0, false), '9am');
    assert.strictEqual(formatTimeScrubberButton(12, 0, false), '12pm');
    assert.strictEqual(formatTimeScrubberButton(15, 0, false), '3pm');
    assert.strictEqual(formatTimeScrubberButton(21, 30, false), '9:30 pm');
    assert.strictEqual(formatTimeScrubberButton(15, 0, true), '15:00');
  });

  it('generates correct meeting snapshot header with dynamic 12h/24h toggle', () => {
    const title12 = formatSnapshotTitle('14:30', false, 30);
    assert.ok(title12.includes('2:30 PM'), `Expected 2:30 PM in: ${title12}`);
    assert.ok(!title12.includes('14:30'), `Did not expect 14:30 in 12h mode: ${title12}`);

    const title24 = formatSnapshotTitle('14:30', true, 60);
    assert.ok(title24.includes('14:30'), `Expected 14:30 in 24h mode: ${title24}`);
  });

  it('handles negative or overflow minute offsets gracefully', () => {
    assert.strictEqual(formatMinutes(-60, false), '11:00 PM');
    assert.strictEqual(formatMinutes(1440 + 120, false), '2:00 AM');
  });
});

// ==========================================
// Suite 2: ISO 8601 Week Calculation Logic
// ==========================================
describe('ISO 8601 Week Calculation Engine', () => {
  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number (with Sunday = 7)
    const dayNr = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dayNr + 3);
    const firstThursday = d.getTime();
    d.setUTCMonth(0, 1);
    if (d.getUTCDay() !== 4) {
      d.setUTCMonth(0, 1 + ((4 - d.getUTCDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - d.getTime()) / 604800000);
  }

  function getISOWeeksInYear(year) {
    const d = new Date(Date.UTC(year, 11, 28));
    return getISOWeek(d);
  }

  it('computes Week 1 for 2026-01-01 (Thursday)', () => {
    const week = getISOWeek(new Date('2026-01-01T00:00:00Z'));
    assert.strictEqual(week, 1);
  });

  it('identifies 2026 as a 53-week ISO year', () => {
    const totalWeeks = getISOWeeksInYear(2026);
    assert.strictEqual(totalWeeks, 53, '2026 starts and ends on Thursday, so it must have 53 ISO weeks');
  });

  it('identifies standard 52-week years (e.g. 2025, 2027)', () => {
    assert.strictEqual(getISOWeeksInYear(2025), 52);
    assert.strictEqual(getISOWeeksInYear(2027), 52);
  });

  it('correctly assigns late December days belonging to next year week 1', () => {
    // 2024-12-30 is Monday -> Week 1 of 2025
    assert.strictEqual(getISOWeek(new Date('2024-12-30T00:00:00Z')), 1);
  });
});

// ==========================================
// Suite 3: Unix Timestamp Converter Engine
// ==========================================
describe('Unix Timestamp Converter Engine', () => {
  function parseTimestamp(input) {
    const num = Number(input);
    if (isNaN(num)) throw new Error('Invalid numeric timestamp');
    // If greater than 1e11, treat as milliseconds, else seconds
    const ms = Math.abs(num) > 1e11 ? num : num * 1000;
    const d = new Date(ms);
    return {
      iso: d.toISOString(),
      utcYear: d.getUTCFullYear(),
      utcMonth: d.getUTCMonth() + 1,
      utcDate: d.getUTCDate(),
      utcHours: d.getUTCHours(),
      utcMinutes: d.getUTCMinutes(),
      utcSeconds: d.getUTCSeconds()
    };
  }

  it('converts epoch 0 to 1970-01-01T00:00:00.000Z', () => {
    const result = parseTimestamp(0);
    assert.strictEqual(result.iso, '1970-01-01T00:00:00.000Z');
  });

  it('automatically differentiates seconds from milliseconds', () => {
    const seconds = 1773748800;
    const millis = 1773748800000;
    const resSec = parseTimestamp(seconds);
    const resMs = parseTimestamp(millis);
    assert.strictEqual(resSec.iso, resMs.iso);
    assert.strictEqual(resSec.utcYear, 2026);
  });

  it('handles negative epoch timestamps (pre-1970)', () => {
    const res = parseTimestamp(-86400); // 1 day before epoch
    assert.strictEqual(res.iso, '1969-12-31T00:00:00.000Z');
  });
});

// ==========================================
// Suite 4: Time Zone Offset Difference Engine
// ==========================================
describe('Time Zone Offset Difference Engine', () => {
  function calculateDifference(offsetMinutesA, offsetMinutesB) {
    const diff = offsetMinutesB - offsetMinutesA;
    const sign = diff >= 0 ? '+' : '-';
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / 60);
    const minutes = absDiff % 60;
    return {
      diffMinutes: diff,
      formatted: minutes === 0 ? `${sign}${hours}h` : `${sign}${hours}h ${minutes}m`
    };
  }

  it('calculates integer hour timezone differences (EST -5 to London UTC 0)', () => {
    const diff = calculateDifference(-300, 0);
    assert.strictEqual(diff.diffMinutes, 300);
    assert.strictEqual(diff.formatted, '+5h');
  });

  it('calculates fractional timezone differences accurately (UTC to IST +5:30)', () => {
    const diff = calculateDifference(0, 330);
    assert.strictEqual(diff.diffMinutes, 330);
    assert.strictEqual(diff.formatted, '+5h 30m');
  });

  it('calculates complex fractional differences (EST -5 to IST +5:30)', () => {
    const diff = calculateDifference(-300, 330);
    assert.strictEqual(diff.diffMinutes, 630);
    assert.strictEqual(diff.formatted, '+10h 30m');
  });

  it('calculates Nepal (+5:45) 45-minute fractional differences', () => {
    const diff = calculateDifference(0, 345);
    assert.strictEqual(diff.diffMinutes, 345);
    assert.strictEqual(diff.formatted, '+5h 45m');
  });
});

// ==========================================
// Suite 5: Static Route & Semantic HTML Integrity
// ==========================================
describe('Static Route & Semantic HTML Integrity', () => {
  const tools = [
    { dir: 'weeks', titleSnippet: 'ISO 8601 Calendar Week' },
    { dir: 'market-hours', titleSnippet: 'International Stock Market Trading Hours' },
    { dir: 'difference', titleSnippet: 'Two-City Time Difference' },
    { dir: 'unix', titleSnippet: 'Unix Epoch Timestamp Converter' },
    { dir: 'teams', titleSnippet: 'Distributed Team Work Hour Alignment' },
    { dir: 'jetlag', titleSnippet: 'Jet Lag' }
  ];

  tools.forEach(tool => {
    it(`verifies static directory and index.html exists for /${tool.dir}/`, () => {
      const filePath = path.join(ROOT_DIR, tool.dir, 'index.html');
      assert.ok(fs.existsSync(filePath), `Missing ${tool.dir}/index.html`);

      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('<title>'), `${tool.dir}/index.html missing <title>`);
      assert.ok(content.includes(tool.titleSnippet), `${tool.dir}/index.html title missing '${tool.titleSnippet}'`);
      assert.ok(content.includes('rel="canonical"'), `${tool.dir}/index.html missing canonical tag`);
      assert.ok(content.includes(`/${tool.dir}/`), `${tool.dir}/index.html canonical must include /${tool.dir}/`);
      assert.ok(content.includes('application/ld+json'), `${tool.dir}/index.html missing Schema.org JSON-LD`);
      assert.ok(content.includes('assets/index-wimlX4lu.js'), `${tool.dir}/index.html missing JS bundle`);
      assert.ok(content.includes('assets/index-CQdmNX5M.css'), `${tool.dir}/index.html missing CSS bundle`);
    });
  });

  it('verifies 404.html error document exists and is styled', () => {
    const file404 = path.join(ROOT_DIR, '404.html');
    assert.ok(fs.existsSync(file404), '404.html is missing');
    const content = fs.readFileSync(file404, 'utf8');
    assert.ok(content.includes('404'), '404.html must mention 404 error');
  });

  it('verifies .htaccess exists with clean URL rewriting for Hostinger Apache', () => {
    const htaccessPath = path.join(ROOT_DIR, '.htaccess');
    assert.ok(fs.existsSync(htaccessPath), '.htaccess is missing');
    const content = fs.readFileSync(htaccessPath, 'utf8');
    assert.ok(content.includes('RewriteEngine On'), '.htaccess must enable RewriteEngine');
    assert.ok(content.includes('mod_deflate') || content.includes('gzip') || content.includes('ExpiresActive'), '.htaccess should configure compression/caching');
  });
});

// ==========================================
// Suite 6: Sitemap & SEO Index Integrity
// ==========================================
describe('Sitemap & SEO Index Integrity', () => {
  it('verifies master sitemap.xml exists and references sub-sitemaps', () => {
    const sitemapMaster = path.join(ROOT_DIR, 'sitemap.xml');
    assert.ok(fs.existsSync(sitemapMaster), 'sitemap.xml missing');
    const content = fs.readFileSync(sitemapMaster, 'utf8');
    assert.ok(content.includes('sitemap-core.xml'));
    assert.ok(content.includes('sitemap-tier1-batch1.xml'));
    assert.ok(content.includes('sitemap-tier2.xml'));
  });

  it('verifies all 550+ indexed URLs in sitemaps exist as physical files on disk', () => {
    const sitemapFiles = fs.readdirSync(ROOT_DIR).filter(f => f.startsWith('sitemap-') && f.endsWith('.xml'));
    assert.ok(sitemapFiles.length >= 4, `Expected at least 4 sitemap chunk files, found ${sitemapFiles.length}`);

    let totalIndexed = 0;
    let missingFiles = [];

    sitemapFiles.forEach(file => {
      const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
      const matches = content.match(/<loc>(https:\/\/chronotools\.online\/[^<]*)<\/loc>/g);
      if (matches) {
        matches.forEach(m => {
          totalIndexed++;
          const url = m.replace('<loc>', '').replace('</loc>', '');
          const pathname = url.replace('https://chronotools.online/', '');
          let localPath;
          if (!pathname || pathname === '') {
            localPath = path.join(ROOT_DIR, 'index.html');
          } else {
            const asDir = path.join(ROOT_DIR, pathname, 'index.html');
            const asHtml = path.join(ROOT_DIR, pathname.endsWith('.html') ? pathname : pathname + '.html');
            if (fs.existsSync(asDir)) {
              localPath = asDir;
            } else if (fs.existsSync(asHtml)) {
              localPath = asHtml;
            } else {
              missingFiles.push(url);
            }
          }
        });
      }
    });

    assert.ok(totalIndexed >= 500, `Expected over 500 indexed URLs, found ${totalIndexed}`);
    assert.strictEqual(missingFiles.length, 0, `Found ${missingFiles.length} broken URLs in sitemaps: ${missingFiles.slice(0, 5).join(', ')}`);
  });

  it('verifies Schema.org in index.html is free of invalid entity types and properties', () => {
    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    assert.ok(!indexHtml.includes('"priceRange": "$0"'), 'Organization schema must not contain priceRange');
    assert.ok(indexHtml.includes('CodingTiger18/Chronotools-Github'), 'GitHub URL must point to active repository');
  });
});

// ==========================================
// Suite 7: Asset Optimization & Performance Budgets
// ==========================================
describe('Asset Optimization & Performance Budgets', () => {
  it('verifies og-image.jpg is compressed below 200 KB performance budget', () => {
    const ogPath = path.join(ROOT_DIR, 'og-image.jpg');
    assert.ok(fs.existsSync(ogPath), 'og-image.jpg missing');
    const stats = fs.statSync(ogPath);
    const sizeKb = stats.size / 1024;
    assert.ok(sizeKb <= 200, `og-image.jpg is ${sizeKb.toFixed(1)} KB, which exceeds 200 KB budget`);
  });

  it('verifies favicons are lightweight (< 25 KB each)', () => {
    const f16 = path.join(ROOT_DIR, 'favicon-16x16.png');
    const f32 = path.join(ROOT_DIR, 'favicon-32x32.png');
    assert.ok(fs.existsSync(f16));
    assert.ok(fs.existsSync(f32));
    assert.ok(fs.statSync(f16).size <= 25600, 'favicon-16x16.png exceeds 25 KB');
    assert.ok(fs.statSync(f32).size <= 25600, 'favicon-32x32.png exceeds 25 KB');
  });
});

// ==========================================
// Suite 8: Core Bundle JavaScript Verification
// ==========================================
describe('Core Bundle JavaScript Verification', () => {
  const jsPath = path.join(ROOT_DIR, 'assets', 'index-wimlX4lu.js');

  it('verifies JavaScript bundle compiles without syntax errors', () => {
    assert.ok(fs.existsSync(jsPath), 'Core JS bundle missing');
    assert.doesNotThrow(() => {
      execSync(`node -c "${jsPath}"`, { stdio: 'pipe' });
    }, 'index-wimlX4lu.js contains a syntax error');
  });

  it('verifies is24HourMode is properly declared and not shadowed', () => {
    const code = fs.readFileSync(jsPath, 'utf8');
    assert.ok(code.includes('let is24HourMode=Boolean(e);'), 'Missing is24HourMode definition in timeline component');
    assert.ok(code.includes('is24HourMode?'), 'Missing 12h/24h condition in scrubber buttons');
    assert.ok(code.includes('is24h:is24HourMode'), 'City cards must receive is24h:is24HourMode');
  });

  it('verifies clean URL routing in Sn() for static tool entry points', () => {
    const code = fs.readFileSync(jsPath, 'utf8');
    assert.ok(code.includes('/weeks'), 'Sn() must support /weeks path routing');
    assert.ok(code.includes('/market'), 'Sn() must support /market-hours path routing');
    assert.ok(code.includes('/difference'), 'Sn() must support /difference path routing');
    assert.ok(code.includes('/unix'), 'Sn() must support /unix path routing');
    assert.ok(code.includes('/teams'), 'Sn() must support /teams path routing');
    assert.ok(code.includes('/jetlag'), 'Sn() must support /jetlag path routing');
  });
});

// ==========================================
// Final Summary Report
// ==========================================
console.log('\n==========================================');
console.log(`Total Tests Run: ${totalTests}`);
console.log(`\x1b[32mPassed: ${passedTests}\x1b[0m`);
if (failedTests > 0) {
  console.log(`\x1b[31mFailed: ${failedTests}\x1b[0m`);
  console.log('==========================================\n');
  process.exit(1);
} else {
  console.log(`\x1b[32mAll test suites passed successfully (100% pass rate)!\x1b[0m`);
  console.log('==========================================\n');
  process.exit(0);
}

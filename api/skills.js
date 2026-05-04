// api/skills.js
// SkillBox API - Vercel Serverless Function
// Generates beautiful SVG skill cards using Simple Icons (3000+ icons)

const simpleIcons = require('simple-icons');

// ============================================================
// THEMES
// ============================================================
const THEMES = {
  default: {
    cardBg: '#ffffff',
    cardBorder: '#e1e4e8',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    titleColor: '#24292e',
    subtitleColor: '#6a737d',
    iconBgGradientStart: '#f6f8fa',
    iconBgGradientEnd: '#e1e4e8',
    iconLabelColor: '#24292e',
    useIconColor: true, // colorize icons with their brand color
  },
  darkmode: {
    cardBg: '#0d1117',
    cardBorder: '#30363d',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    titleColor: '#f0f6fc',
    subtitleColor: '#8b949e',
    iconBgGradientStart: '#161b22',
    iconBgGradientEnd: '#21262d',
    iconLabelColor: '#c9d1d9',
    useIconColor: true,
  },
  light: {
    cardBg: '#ffffff',
    cardBorder: '#d0d7de',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    titleColor: '#1f2328',
    subtitleColor: '#656d76',
    iconBgGradientStart: '#ffffff',
    iconBgGradientEnd: '#f6f8fa',
    iconLabelColor: '#1f2328',
    useIconColor: true,
  },
  nautilus: {
    cardBg: '#1b262c',
    cardBorder: '#0f4c75',
    cardShadow: 'rgba(15, 76, 117, 0.4)',
    titleColor: '#bbe1fa',
    subtitleColor: '#7fb3d3',
    iconBgGradientStart: '#0f4c75',
    iconBgGradientEnd: '#3282b8',
    iconLabelColor: '#bbe1fa',
    useIconColor: false,
  },
  viridescent: {
    cardBg: '#0f3027',
    cardBorder: '#1a5848',
    cardShadow: 'rgba(26, 88, 72, 0.4)',
    titleColor: '#a8e6cf',
    subtitleColor: '#7fc8a9',
    iconBgGradientStart: '#1a5848',
    iconBgGradientEnd: '#2d7d6e',
    iconLabelColor: '#a8e6cf',
    useIconColor: false,
  },
  carbon: {
    cardBg: '#161616',
    cardBorder: '#393939',
    cardShadow: 'rgba(0, 0, 0, 0.6)',
    titleColor: '#f4f4f4',
    subtitleColor: '#a8a8a8',
    iconBgGradientStart: '#262626',
    iconBgGradientEnd: '#393939',
    iconLabelColor: '#f4f4f4',
    useIconColor: true,
  },
  serika: {
    cardBg: '#e1e1e3',
    cardBorder: '#323437',
    cardShadow: 'rgba(50, 52, 55, 0.15)',
    titleColor: '#323437',
    subtitleColor: '#646669',
    iconBgGradientStart: '#fafafa',
    iconBgGradientEnd: '#e6e6e8',
    iconLabelColor: '#323437',
    useIconColor: true,
  },
  sunset: {
    cardBg: '#2d1b3d',
    cardBorder: '#ff6b6b',
    cardShadow: 'rgba(255, 107, 107, 0.3)',
    titleColor: '#ffe66d',
    subtitleColor: '#ff9999',
    iconBgGradientStart: '#ff6b6b',
    iconBgGradientEnd: '#ee5a6f',
    iconLabelColor: '#ffe66d',
    useIconColor: false,
  },
};

// ============================================================
// CATEGORY ALIASES
// Friendly category names + special cases for icons that are
// known by short codes (like "js" instead of "javascript")
// ============================================================
const SLUG_ALIASES = {
  // Languages
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  cpp: 'cplusplus',
  cs: 'csharp',
  rb: 'ruby',
  golang: 'go',
  // Frameworks
  next: 'nextdotjs',
  nextjs: 'nextdotjs',
  nuxt: 'nuxtdotjs',
  nuxtjs: 'nuxtdotjs',
  vue: 'vuedotjs',
  vuejs: 'vuedotjs',
  node: 'nodedotjs',
  nodejs: 'nodedotjs',
  express: 'express',
  nest: 'nestjs',
  // Tools
  vscode: 'visualstudiocode',
  vs: 'visualstudio',
  gh: 'github',
  // Common typos / styles
  tailwindcss: 'tailwindcss',
  tailwind: 'tailwindcss',
};

const CATEGORY_LABELS = {
  languages: 'Languages',
  frameworks: 'Frameworks',
  libraries: 'Libraries',
  tools: 'Tools',
  software: 'Software & IDEs',
  databases: 'Databases',
  cloud: 'Cloud & Hosting',
  design: 'Design',
  other: 'Other',
};

// ============================================================
// ICON RESOLUTION
// ============================================================
function resolveIcon(name) {
  if (!name) return null;
  const cleaned = name.toLowerCase().trim();
  const slug = SLUG_ALIASES[cleaned] || cleaned;

  // simple-icons exports as Get<Slug> from the slug (e.g. siJavascript)
  // It also exposes a direct lookup via its own slug-based pattern.
  // We try a few approaches to be robust.
  const variations = [
    slug,
    slug.replace(/[^a-z0-9]/g, ''),
    slug.replace(/dot/g, '.'),
  ];

  for (const v of variations) {
    // simple-icons v13 exports `siXxx` style. We also have a direct .get()
    // helper in some versions. Try to look up via the package's index.
    const key = 'si' + v.charAt(0).toUpperCase() + v.slice(1);
    if (simpleIcons[key]) return simpleIcons[key];
  }

  // Fallback: scan all icons for a matching slug or title
  // (only done as last resort because it's slower)
  for (const key of Object.keys(simpleIcons)) {
    const icon = simpleIcons[key];
    if (!icon || typeof icon !== 'object') continue;
    if (icon.slug === slug) return icon;
    if (icon.title && icon.title.toLowerCase().replace(/[^a-z0-9]/g, '') === slug) {
      return icon;
    }
  }

  return null;
}

// ============================================================
// SVG ESCAPING
// ============================================================
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================
// SVG GENERATION
// ============================================================
function buildIconTile(icon, originalName, x, y, theme, includeName, tileSize, iconSize) {
  const iconColor = theme.useIconColor ? `#${icon.hex}` : theme.iconLabelColor;
  const label = icon.title || originalName;
  const iconOffset = (tileSize - iconSize) / 2;

  // Extract just the path data from the simple-icons SVG string
  // simple-icons provides: { svg: '<svg ...><path d="..."/></svg>', path: '...', hex: '...', title: '...' }
  const pathData = icon.path || '';

  const gradientId = `tile-grad-${x}-${y}-${Math.random().toString(36).slice(2, 8)}`;

  let tile = `
  <g transform="translate(${x},${y})">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.iconBgGradientStart}" />
        <stop offset="100%" stop-color="${theme.iconBgGradientEnd}" />
      </linearGradient>
    </defs>
    <rect width="${tileSize}" height="${tileSize}" rx="14" ry="14"
          fill="url(#${gradientId})"
          stroke="${theme.cardBorder}" stroke-width="0.5" />
    <g transform="translate(${iconOffset},${iconOffset})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="${pathData}" fill="${iconColor}" />
      </svg>
    </g>`;

  if (includeName) {
    const labelY = tileSize + 18;
    tile += `
    <text x="${tileSize / 2}" y="${labelY}"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="11" font-weight="500"
          text-anchor="middle"
          fill="${theme.iconLabelColor}">${escapeXml(label)}</text>`;
  }

  tile += `\n  </g>`;
  return tile;
}

function buildCategorySection(categoryKey, names, theme, options, startY, isFirst) {
  const { perline, includeNames, cardWidth } = options;

  const tileSize = 72;
  const iconSize = 44;
  const gapX = 18;
  const gapY = includeNames ? 50 : 26;
  const labelHeight = includeNames ? 22 : 0;

  const padding = 32;
  // First section gets larger title block ("Skills" + subtitle), later sections only subtitle
  const titleHeight = isFirst ? 70 : 40;

  // Resolve all icons up front; skip unknown ones gracefully
  const resolved = names
    .map((n) => ({ name: n, icon: resolveIcon(n) }))
    .filter((entry) => entry.icon !== null);

  if (resolved.length === 0) return { svg: '', height: 0 };

  const tilesPerRow = Math.min(perline, resolved.length);
  const rows = Math.ceil(resolved.length / tilesPerRow);

  // Left-align grid (matches original widgetbox)
  const gridStartX = padding;

  let svg = '';
  if (isFirst) {
    svg += `
  <text x="${padding}" y="${startY + 28}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="26" font-weight="700"
        fill="${theme.titleColor}">Skills</text>
  <text x="${padding}" y="${startY + 52}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="14" font-weight="400"
        fill="${theme.subtitleColor}">${escapeXml(CATEGORY_LABELS[categoryKey] || categoryKey)}</text>`;
  } else {
    svg += `
  <text x="${padding}" y="${startY + 22}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="14" font-weight="500"
        fill="${theme.subtitleColor}">${escapeXml(CATEGORY_LABELS[categoryKey] || categoryKey)}</text>`;
  }

  resolved.forEach((entry, i) => {
    const col = i % tilesPerRow;
    const row = Math.floor(i / tilesPerRow);
    const tileX = gridStartX + col * (tileSize + gapX);
    const tileY = startY + titleHeight + row * (tileSize + gapY);
    svg += buildIconTile(entry.icon, entry.name, tileX, tileY, theme, includeNames, tileSize, iconSize);
  });

  const sectionHeight =
    titleHeight + rows * tileSize + (rows - 1) * gapY + labelHeight + 16;

  return { svg, height: sectionHeight };
}

function buildSvg(categories, theme, options) {
  const { perline, includeNames } = options;
  const padding = 32;
  const sectionGap = 18;

  // Determine card width based on perline
  const tileSize = 72;
  const gapX = 18;
  const cardWidth = Math.max(
    400,
    perline * tileSize + (perline - 1) * gapX + padding * 2
  );

  let bodySvg = '';
  let currentY = padding;
  let isFirst = true;

  for (const [categoryKey, names] of Object.entries(categories)) {
    if (!names || names.length === 0) continue;
    const { svg, height } = buildCategorySection(
      categoryKey,
      names,
      theme,
      { perline, includeNames, cardWidth },
      currentY,
      isFirst
    );
    if (height === 0) continue;
    bodySvg += svg;
    currentY += height + sectionGap;
    isFirst = false;
  }

  const totalHeight = currentY + padding - sectionGap;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
       width="${cardWidth}" height="${totalHeight}"
       viewBox="0 0 ${cardWidth} ${totalHeight}"
       fill="none">
    <defs>
      <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${theme.cardShadow}" />
      </filter>
    </defs>
    <rect x="6" y="6" width="${cardWidth - 12}" height="${totalHeight - 12}"
          rx="20" ry="20"
          fill="${theme.cardBg}"
          stroke="${theme.cardBorder}" stroke-width="1"
          filter="url(#card-shadow)" />
    ${bodySvg}
  </svg>`;

  return svg;
}

// ============================================================
// HANDLER
// ============================================================
function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const params = url.searchParams;

    const categories = {
      languages: parseList(params.get('languages')),
      frameworks: parseList(params.get('frameworks')),
      libraries: parseList(params.get('libraries')),
      tools: parseList(params.get('tools')),
      software: parseList(params.get('software')),
      databases: parseList(params.get('databases')),
      cloud: parseList(params.get('cloud')),
      design: parseList(params.get('design')),
      other: parseList(params.get('other') || params.get('icons')),
    };

    const themeName = (params.get('theme') || 'default').toLowerCase();
    const theme = THEMES[themeName] || THEMES.default;

    const includeNames =
      params.get('includeNames') === 'true' || params.get('includenames') === 'true';

    let perline = parseInt(params.get('perline') || '6', 10);
    if (isNaN(perline) || perline < 1) perline = 6;
    if (perline > 50) perline = 50;

    const hasAnyIcons = Object.values(categories).some((arr) => arr.length > 0);
    if (!hasAnyIcons) {
      // Helpful default: render a small "usage" card
      categories.other = ['javascript', 'typescript', 'react', 'nodedotjs', 'docker', 'git'];
    }

    const svg = buildSvg(categories, theme, { perline, includeNames });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(svg);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

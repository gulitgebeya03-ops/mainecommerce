// src/utils/aiImageSearch.js

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function analyzePixels(imageData, size) {
  let totalR = 0, totalG = 0, totalB = 0, count = 0;
  let darkPixels = 0, brightPixels = 0;
  const colorMap = {};

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2];
    totalR += r; totalG += g; totalB += b; count++;
    const brightness = (r + g + b) / 3;
    if (brightness < 85) darkPixels++;
    if (brightness > 170) brightPixels++;

    const qr = Math.round(r / 48) * 48;
    const qg = Math.round(g / 48) * 48;
    const qb = Math.round(b / 48) * 48;
    const key = `${qr},${qg},${qb}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const avgBrightness = (avgR + avgG + avgB) / 3;
  const dominance = Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB);

  let dominantColor = 'neutral';
  if (dominance > 30) {
    if (avgR > avgG && avgR > avgB) dominantColor = 'red';
    else if (avgG > avgR && avgG > avgB) dominantColor = 'green';
    else dominantColor = 'blue';
  }

  let tone = 'neutral';
  if (avgBrightness < 85) tone = 'dark';
  else if (avgBrightness > 170) tone = 'bright';

  const topColors = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { r, g, b, hex: `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}` };
    });

  return {
    dominantColor,
    tone,
    avgBrightness: Math.round(avgBrightness),
    topColors,
    darkRatio: darkPixels / count,
    brightRatio: brightPixels / count,
  };
}

function getImageProfile(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        resolve(analyzePixels(data, size));
      } catch (err) {
        resolve({
          dominantColor: 'neutral',
          tone: 'neutral',
          avgBrightness: 128,
          topColors: [],
          darkRatio: 0.3,
          brightRatio: 0.3,
        });
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

function scoreProductMatch(product, profile) {
  let score = 0;

  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const combined = `${name} ${desc}`;

  const colorKeywords = {
    red: ['red', 'crimson', 'scarlet', 'cherry', 'wine', 'burgundy', 'rose', 'pink', 'coral'],
    green: ['green', 'olive', 'emerald', 'sage', 'mint', 'forest', 'lime', 'teal'],
    blue: ['blue', 'navy', 'sky', 'azure', 'cobalt', 'cyan', 'denim', 'indigo'],
    dark: ['black', 'dark', 'noir', 'charcoal', 'midnight', 'onyx'],
    bright: ['white', 'light', 'bright', 'cream', 'ivory', 'silver', 'gold', 'platinum'],
    neutral: ['beige', 'grey', 'gray', 'tan', 'khaki', 'brown', 'nude', 'sand'],
  };

  const targets = [
    ...(colorKeywords[profile.dominantColor] || []),
    ...(colorKeywords[profile.tone] || []),
  ];

  const matches = targets.filter((w) => combined.includes(w));
  score += matches.length * 3;

  if (cat.includes('cloth') || cat.includes('fashion') || cat.includes('shoe') || cat.includes('bag') || cat.includes('jewelry')) {
    score += 2;
  }

  if (profile.darkRatio > 0.5) {
    if (combined.includes('black') || combined.includes('dark')) score += 2;
  }
  if (profile.brightRatio > 0.5) {
    if (combined.includes('white') || combined.includes('light') || combined.includes('bright')) score += 2;
  }

  const price = product.price || 0;
  if (price > 1000 && price < 20000) score += 1;
  if (product.stock > 0) score += 1;
  if (product.tag) score += 1;

  return score;
}

export async function aiImageSearch(products, imageDataUrl, extraCategory = null) {
  try {
    const profile = await getImageProfile(imageDataUrl);

    let candidates = [...products];
    if (extraCategory) {
      const catMatch = candidates.filter(
        (p) => (p.category || '').toLowerCase().includes(extraCategory.toLowerCase())
      );
      if (catMatch.length > 0) candidates = catMatch;
    }

    const scored = candidates
      .filter((p) => p.stock > 0 || p.tag)
      .map((product) => ({
        product,
        score: scoreProductMatch(product, profile),
      }));

    scored.sort((a, b) => b.score - a.score);

    const topResults = scored
      .filter((s) => s.score > 0)
      .slice(0, 12)
      .map((s) => s.product);

    if (topResults.length === 0) {
      return scored.slice(0, 8).map((s) => s.product);
    }

    return topResults;
  } catch (err) {
    console.error('AI image search failed:', err);
    return products.slice(0, 8);
  }
}

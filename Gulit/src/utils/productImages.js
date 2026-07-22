export function productImageFallback(seed = 'Gulit') {
  const label = String(seed || 'Gulit').trim().slice(0, 24) || 'Gulit';
  const initial = label.charAt(0).toUpperCase() || 'G';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#f3f4f6"/>
      <rect x="120" y="90" width="560" height="420" rx="28" fill="#ffffff" stroke="#e5e7eb" stroke-width="4"/>
      <circle cx="400" cy="260" r="86" fill="#ffedd5"/>
      <text x="400" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="92" font-weight="700" fill="#ea580c">${initial}</text>
      <text x="400" y="405" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111827">Product Image</text>
      <text x="400" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#6b7280">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function handleProductImageError(event, seed) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = productImageFallback(seed);
}

const accentPicker = document.getElementById('accentPicker');
const themeCode = document.getElementById('themeCode');
const darkModeToggle = document.getElementById('darkModeToggle');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');
const secondaryType = document.getElementById('secondaryType');
const secondaryPreview = document.getElementById('secondaryPreview');


function getSecondaryHue(primaryHue, type) {
  if (type === 'complementary') return (primaryHue + 180) % 360;
  if (type === 'analogous') return (primaryHue + 30) % 360;
  if (type === 'analogous-negative') return (primaryHue + 330) % 360; // -30° = +330°
  return primaryHue;
}

function hexToHSL(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.substr(1, 2), 16) / 255;
    g = parseInt(hex.substr(3, 2), 16) / 255;
    b = parseInt(hex.substr(5, 2), 16) / 255;
  } else if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[2], 16) / 255;
    b = parseInt(hex[3] + hex[3], 16) / 255;
  }

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function updateThemeFromAccent(hex) {
  let { h, s, l } = hexToHSL(hex);
  const isDark = document.body.classList.contains('dark');
  s = Number(saturationSlider.value);

  // --- Secondary color logic ---
  const secondaryTypeValue = secondaryType.value;
  const secondaryHue = getSecondaryHue(h, secondaryTypeValue);

  // Make secondary a bit lighter and less saturated
  let secondaryL = Math.min(l + 20, 90); // 20% lighter, max 90%
  let secondaryS = Math.max(s - 15, 30); // 15% less saturated, min 30%

  // Set CSS variables for both primary and secondary
  document.documentElement.style.setProperty('--hue', h);
  document.documentElement.style.setProperty('--saturation', `${s}%`);
  document.documentElement.style.setProperty('--lightness', `${l}%`);
  document.documentElement.style.setProperty('--secondary-hue', secondaryHue);
  document.documentElement.style.setProperty('--secondary-saturation', `${secondaryS}%`);
  document.documentElement.style.setProperty('--secondary-lightness', `${secondaryL}%`);

  // Update secondary preview
  const secondaryColor = `hsl(${secondaryHue}, ${secondaryS}%, ${secondaryL}%)`;
  secondaryPreview.style.background = secondaryColor;

  // ...existing accent button color logic...
  const btns = document.getElementsByClassName('btn');
  for (let btn of btns) {
    if (l > 60) {
      btn.style.setProperty('color', 'black');
    } else {
      btn.style.setProperty('color', 'white');
    }
  }

  if (isDark) {
    document.documentElement.style.setProperty('--dark-saturation', `${Math.round(s * 0.7)}%`);
  } else {
    document.documentElement.style.setProperty('--dark-saturation', `${s}%`);
  }
  
  updateCodeSnippet(h, s, l, isDark, secondaryHue, secondaryS, secondaryL);
}

accentPicker.addEventListener('input', (e) => {
  updateThemeFromAccent(e.target.value);
});

darkModeToggle.addEventListener('change', (e) => {
  document.body.classList.toggle('dark', e.target.checked);
  updateThemeFromAccent(accentPicker.value);
});

saturationSlider.addEventListener('input', () => {
  saturationValue.textContent = `${saturationSlider.value}%`;
  updateThemeFromAccent(accentPicker.value);
});

// Initial setup
saturationValue.textContent = `${saturationSlider.value}%`;

// ...existing code...

const colorFormat = document.getElementById('colorFormat');
const copyCodeBtn = document.getElementById('copyCodeBtn');

// Helper functions for color conversion
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c/2, r=0, g=0, b=0;
  if (0 <= h && h < 60) [r,g,b] = [c,x,0];
  else if (60 <= h && h < 120) [r,g,b] = [x,c,0];
  else if (120 <= h && h < 180) [r,g,b] = [0,c,x];
  else if (180 <= h && h < 240) [r,g,b] = [0,x,c];
  else if (240 <= h && h < 300) [r,g,b] = [x,0,c];
  else if (300 <= h && h < 360) [r,g,b] = [c,0,x];
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

// ...existing code...

function getColorString(format, h, s, l) {
  if (format === "hsl") return `hsl(${h}, ${s}%, ${l}%)`;
  if (format === "rgb") {
    const { r, g, b } = hslToRgb(h, s, l);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (format === "hex") {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }
  if (format === "lch") {
    // Use culori for LCH
    const lch = culori.lch(culori.hsl({ h, s: s/100, l: l/100 }));
    return `lch(${lch.l.toFixed(2)}% ${lch.c.toFixed(2)} ${lch.h.toFixed(2)})`;
  }
  if (format === "oklch") {
    // Use culori for OKLCH
    const oklch = culori.oklch(culori.hsl({ h, s: s/100, l: l/100 }));
    return `oklch(${oklch.l.toFixed(4)} ${oklch.c.toFixed(4)} ${Math.round(oklch.h)}deg)`;
  }
  return `hsl(${h}, ${s}%, ${l}%)`;
}


// ...existing code...

function updateCodeSnippet(h, s, l, isDark, secondaryHue = null, secondaryS = null, secondaryL = null) {
  const format = colorFormat.value;
  const accent = getColorString(format, h, s, l);
  // Add secondary color
  let secondary = '';
  if (secondaryHue !== null && secondaryS !== null && secondaryL !== null) {
    secondary = getColorString(format, secondaryHue, secondaryS, secondaryL);
  }

  const bg = getColorString(format, h, s, 95);
  const text = getColorString(format, h, s, 15);
  const border = getColorString(format, h, s, 85);
  const card = getColorString(format, h, s, 98);

  const darkS = Math.round(s * 0.7);
  const darkBg = getColorString(format, h, darkS, 10);
  const darkText = getColorString(format, h, darkS, 90);
  const darkBorder = getColorString(format, h, darkS, 25);
  const darkCard = getColorString(format, h, darkS, 15);

  const lightCSS = `:root {
  --accent: ${accent};
  --secondary: ${secondary};
  --bg-color: ${bg};
  --text-color: ${text};
  --border-color: ${border};
  --card-bg: ${card};
}`;

  const darkCSS = `body.dark {
  --bg-color: ${darkBg};
  --text-color: ${darkText};
  --border-color: ${darkBorder};
  --card-bg: ${darkCard};
}`;

  themeCode.textContent = isDark ? `${lightCSS}\n\n${darkCSS}` : lightCSS;
}

// ...existing event listeners...

secondaryType.addEventListener('change', () => {
  updateThemeFromAccent(accentPicker.value);
});

colorFormat.addEventListener('change', () => {
  // Re-generate code in selected format
  const { h, s, l } = hexToHSL(accentPicker.value);
  updateCodeSnippet(h, Number(saturationSlider.value), l, document.body.classList.contains('dark'));
});

copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(themeCode.textContent).then(() => {
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => { copyCodeBtn.textContent = 'Copy Code'; }, 1200);
  });
});

// ...existing code...
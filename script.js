const accentPicker = document.getElementById('accentPicker');
const themeCode = document.getElementById('themeCode');
const darkModeToggle = document.getElementById('darkModeToggle');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');
const secondaryType = document.getElementById('secondaryType');
const secondaryPreview = document.getElementById('secondaryPreview');


function getSecondaryHue(primaryHue, type) {
  switch (type) {
    case 'complementary': return (primaryHue + 180) % 360;
    case 'analogous': return (primaryHue + 30) % 360;
    case 'analogous-negative': return (primaryHue + 330) % 360;
    case 'triadic': return (primaryHue + 120) % 360;
    case 'split-complementary': return (primaryHue + 150) % 360;
    case 'split-complementary-negative': return (primaryHue + 210) % 360;
    case 'tetradic': return (primaryHue + 90) % 360;
    case 'monochromatic': return primaryHue;
    default: return primaryHue;
  }
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
  let secondaryS = Math.max(s - 15, 5); // 15% less saturated, min 30%

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
  const changeables = document.getElementsByClassName('changeable');
  for (let changeable of changeables) {
    if (l > 65) {
      changeable.style.setProperty('color', 'black');
    } else {
      changeable.style.setProperty('color', 'white');
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
  let secondary = '';
  if (secondaryHue !== null && secondaryS !== null && secondaryL !== null) {
    secondary = getColorString(format, secondaryHue, secondaryS, secondaryL);
  }

  const bg = getColorString(format, h, s, 98);
  const text = getColorString(format, h, s, 15);
  const border = getColorString(format, h, s, 85);
  const card = getColorString(format, h, s, 95);

  const darkS = Math.round(s * 0.7);
  const darkBg = getColorString(format, h, darkS, 4);
  const darkText = getColorString(format, h, darkS, 90);
  const darkBorder = getColorString(format, h, darkS, 20);
  const darkCard = getColorString(format, h, darkS, 8);

  // Get the selected font
  const font = googleFontSelect.value || 'Roboto';
  const fontImport = `@import url('https://fonts.googleapis.com/css?family=${font.replace(/ /g, '+')}:400,700&display=swap');\n`;

  const fontCSS = `body {\n  font-family: '${font}', sans-serif;\n}\n`;

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

  // Combine font and theme CSS
  themeCode.textContent = fontImport + fontCSS + (isDark ? `${lightCSS}\n\n${darkCSS}` : lightCSS);
}

// Update setGoogleFont to NOT set fontCode.textContent anymore
function setGoogleFont(font, updateSelect = false) {
  if (!font) return;
  // Remove previous font link if exists
  let old = document.getElementById('googleFontLink');
  if (old) old.remove();
  // Add new font link
  const link = document.createElement('link');
  link.id = 'googleFontLink';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css?family=${font.replace(/ /g, '+')}:400,700&display=swap`;
  document.head.appendChild(link);
  // Set font on body
  document.body.style.fontFamily = `'${font}', sans-serif`;
  // Optionally update select if called directly
  if (updateSelect) googleFontSelect.value = font;
  // Update the combined code block
  // (re-run updateThemeFromAccent to update the code block with new font)
  updateThemeFromAccent(accentPicker.value);
}

// ...existing event listeners...

secondaryType.addEventListener('change', () => {
  updateThemeFromAccent(accentPicker.value);
});

colorFormat.addEventListener('change', () => {
  // Re-generate code in selected format, including secondary color
  const { h, s, l } = hexToHSL(accentPicker.value);
  const mainS = Number(saturationSlider.value);
  const secondaryTypeValue = secondaryType.value;
  const secondaryHue = getSecondaryHue(h, secondaryTypeValue);
  const secondaryL = Math.min(l + 20, 90);
  const secondaryS = Math.max(mainS - 15, 30);
  updateCodeSnippet(
    h,
    mainS,
    l,
    document.body.classList.contains('dark'),
    secondaryHue,
    secondaryS,
    secondaryL
  );
});

copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(themeCode.textContent).then(() => {
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => { copyCodeBtn.textContent = 'Copy Code'; }, 1200);
  });
});

// ...existing code...




// ...existing code...

// --- Font logic ---
const googleFontSelect = document.getElementById('googleFontSelect');
const googleFontSearch = document.getElementById('googleFontSearch');
const fontCode = document.getElementById('fontCode');
const GOOGLE_FONTS_API_KEY = 'AIzaSyBwy2Hf-lIgw09WmhCbQ9ngPK7bEnwjviY';
let allGoogleFonts = [];

async function loadGoogleFonts(selectedFont = '') {
  googleFontSelect.innerHTML = `<option value="">Loading fonts...</option>`;
  try {
    const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`);
    const data = await res.json();
    data.items.sort((a, b) => a.family.localeCompare(b.family));
    allGoogleFonts = data.items.map(f => f.family);

    // If no font is selected, default to Roboto
    let fontToSelect = selectedFont || 'Roboto';
    renderGoogleFontOptions(allGoogleFonts, fontToSelect);
    setGoogleFont(fontToSelect, true);
  } catch (e) {
    googleFontSelect.innerHTML = `<option value="">Failed to load fonts</option>`;
  }
}

function renderGoogleFontOptions(fonts, selectedFont = '') {
  googleFontSelect.innerHTML = fonts.map(f =>
    `<option value="${f}"${f === selectedFont ? ' selected' : ''}>${f}</option>`
  ).join('');
  googleFontSelect.onchange = (e) => setGoogleFont(e.target.value, true);
}

// function setGoogleFont(font, updateSelect = false) {
//   if (!font) return;
//   // Remove previous font link if exists
//   let old = document.getElementById('googleFontLink');
//   if (old) old.remove();
//   // Add new font link
//   const link = document.createElement('link');
//   link.id = 'googleFontLink';
//   link.rel = 'stylesheet';
//   link.href = `https://fonts.googleapis.com/css?family=${font.replace(/ /g, '+')}:400,700&display=swap`;
//   document.head.appendChild(link);
//   // Set font on body
//   document.body.style.fontFamily = `'${font}', sans-serif`;
//   // Show CSS code
//   fontCode.textContent =
// `@import url('https://fonts.googleapis.com/css?family=${font.replace(/ /g, '+')}:400,700&display=swap');
// body {
//   font-family: '${font}', sans-serif;
// }`;
//   // Optionally update select if called directly
//   if (updateSelect) googleFontSelect.value = font;
// }

// Font search
googleFontSearch.addEventListener('input', () => {
  const q = googleFontSearch.value.trim().toLowerCase();
  const filtered = allGoogleFonts.filter(f => f.toLowerCase().includes(q));
  renderGoogleFontOptions(filtered, filtered[0]);
  // If only one font matches, select and apply it
  if (filtered.length === 1) {
    setGoogleFont(filtered[0], true);
  }
});

// --- Preset logic (merged color + font) ---
function saveThemePreset() {
  let name = prompt('Preset name?');
  if (!name) return;
  let presets = JSON.parse(localStorage.getItem('themePresets') || '{}');
  presets[name] = {
    accent: accentPicker.value,
    secondaryType: secondaryType.value,
    saturation: saturationSlider.value,
    font: googleFontSelect.value || 'sans-serif' // Default to sans-serif if no font selected
  };
  localStorage.setItem('themePresets', JSON.stringify(presets));
  updatePresetList();
  presetList.value = name;
  saveThemeBtn.textContent = 'Saved!';
  setTimeout(() => { saveThemeBtn.textContent = 'Save'; }, 1200);
}

function updatePresetList() {
  let presets = JSON.parse(localStorage.getItem('themePresets') || '{}');
  presetList.innerHTML = '<option value="">Load Preset...</option>';
  Object.keys(presets).forEach(name => {
    let opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    presetList.appendChild(opt);
  });
}

function loadThemePreset(name) {
  let presets = JSON.parse(localStorage.getItem('themePresets') || '{}');
  let settings = presets[name];
  if (settings) {
    accentPicker.value = settings.accent;
    secondaryType.value = settings.secondaryType;
    saturationSlider.value = settings.saturation;
    saturationValue.textContent = `${settings.saturation}%`;
    updateThemeFromAccent(settings.accent);
    // Font
    if (settings.font) {
      // If font is not in filtered list, reload all fonts and select it
      if (!allGoogleFonts.includes(settings.font)) {
        loadGoogleFonts(settings.font).then(() => setGoogleFont(settings.font, true));
      } else {
        renderGoogleFontOptions(allGoogleFonts, settings.font);
        setGoogleFont(settings.font, true);
      }
      googleFontSearch.value = '';
    }
  }
}

// Delete selected preset
function deleteThemePreset() {
  let name = presetList.value;
  if (!name) return;
  if (!confirm(`Delete preset "${name}"?`)) return;
  let presets = JSON.parse(localStorage.getItem('themePresets') || '{}');
  delete presets[name];
  localStorage.setItem('themePresets', JSON.stringify(presets));
  updatePresetList();
  presetList.value = "";
}

const saveThemeBtn = document.getElementById('saveThemeBtn');
const presetList = document.getElementById('presetList');
const deletePresetBtn = document.getElementById('deletePresetBtn');
// Event listeners
saveThemeBtn.addEventListener('click', saveThemePreset);
presetList.addEventListener('change', () => {
  if (presetList.value) loadThemePreset(presetList.value);
});
deletePresetBtn.addEventListener('click', deleteThemePreset);

// ...existing code for deleteThemePreset, event listeners, etc...

// On page load, populate preset list and fonts
window.addEventListener('DOMContentLoaded', () => {
  updatePresetList();
  loadGoogleFonts();
});

// ...existing code...
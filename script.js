const accentPicker = document.getElementById('accentPicker');
const themeCode = document.getElementById('themeCode');
const darkModeToggle = document.getElementById('darkModeToggle');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');

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
  // Use slider value for saturation
  s = Number(saturationSlider.value);

  document.documentElement.style.setProperty('--hue', h);
  document.documentElement.style.setProperty('--saturation', `${s}%`);
  document.documentElement.style.setProperty('--lightness', `${l}%`);

  if (isDark) {
    document.documentElement.style.setProperty('--dark-saturation', `${Math.round(s * 0.7)}%`);
  } else {
    document.documentElement.style.setProperty('--dark-saturation', `${s}%`);
  }

  updateCodeSnippet(h, s, l, isDark);
}

function updateCodeSnippet(h, s, l, isDark) {
  const lightCSS = `:root {
  --hue: ${h};
  --saturation: ${s}%;
  --lightness: ${l}%;

  --accent: hsl(var(--hue), var(--saturation), var(--lightness));
  --bg-color: hsl(var(--hue), var(--saturation), 95%);
  --text-color: hsl(var(--hue), var(--saturation), 15%);
  --border-color: hsl(var(--hue), var(--saturation), 85%);
  --card-bg: hsl(var(--hue), var(--saturation), 98%);
}`;

  const darkCSS = `body.dark {
  --dark-saturation: ${Math.round(s * 0.7)}%;
  --bg-color: hsl(var(--hue), var(--dark-saturation), 10%);
  --text-color: hsl(var(--hue), var(--dark-saturation), 90%);
  --border-color: hsl(var(--hue), var(--dark-saturation), 25%);
  --card-bg: hsl(var(--hue), var(--dark-saturation), 15%);
}`;

  themeCode.textContent = isDark ? `${lightCSS}\n\n${darkCSS}` : lightCSS;
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
function updateThemeFromAccent(hex) {
  let { h, s, l } = hexToHSL(hex);
  s = Number(saturationSlider.value);
  const isDark = document.body.classList.contains('dark');

  const secondaryHue = getSecondaryHue(h, secondaryType.value);
  const secondaryS = Math.max(s - 15, 5);
  const secondaryL = Math.min(l + 20, 60);
  const secondaryColor = `hsl(${secondaryHue}, ${secondaryS}%, ${secondaryL}%)`;

  // Set CSS variables
  const root = document.documentElement.style;
  root.setProperty('--hue', h);
  root.setProperty('--saturation', `${s}%`);
  root.setProperty('--lightness', `${l}%`);
  root.setProperty('--secondary-hue', secondaryHue);
  root.setProperty('--secondary-saturation', `${secondaryS}%`);
  root.setProperty('--secondary-lightness', `${secondaryL}%`);

  // Accent and secondary text colors for dark backgrounds
  const secondaryRgb = hslToRgb(secondaryHue, secondaryS, secondaryL);
  root.setProperty('--accent-text-color', getReadableTextColor(hslToRgb(h, s, l)));
  root.setProperty('--secondary-text-color', getReadableTextColor(secondaryRgb));

  // Preview color
  secondaryPreview.style.background = secondaryColor;

  // Text color adjustment for contrast (smart one)
  const accentRgb = hslToRgb(h, s, l);
  const themeTextColor = getReadableTextColor(accentRgb);
  root.setProperty('--changeable-text-color', themeTextColor);

  // Set dark mode saturation
  root.setProperty('--dark-saturation', `${isDark ? Math.round(s * 0.7) : s}%`);

  updateCodeSnippet(h, s, l, isDark, secondaryHue, secondaryS, secondaryL);
}

function renderGoogleFontOptions(fonts, selectedFont = '') {
  googleFontSelect.innerHTML = fonts.map(f =>
    `<option value="${f}"${f === selectedFont ? ' selected' : ''}>${f}</option>`
  ).join('');
  googleFontSelect.onchange = (e) => setGoogleFont(e.target.value, true);
}

function getRandomTheme() {
  const h = Math.floor(Math.random() * 360);        // Hue: 0–359
  const s = Math.floor(Math.random() * 51) + 50;     // Saturation: 50%–100% (more colorful)
  const l = Math.floor(Math.random() * 36) + 15;     // Lightness: 15%–50% (avoid too dark/light)

  accentPicker.value = hslToHex(h, s, l);

  const secondary = [
    'complementary',
    'analogous',
    'analogous-negative',
    'triadic',
    'split-complementary',
    'split-complementary-negative',
    'tetradic',
    'monochromatic'
  ];
  const randomSecondaryType = secondary[Math.floor(Math.random() * secondaryType.length)];
  secondaryType.value = randomSecondaryType;
  
  saturationValue.textContent = `${s}%`;
  saturationSlider.value = s;

  const fontIndex = Math.floor(Math.random() * allGoogleFonts.length);
  const randomFont = allGoogleFonts[fontIndex];

  updateThemeFromRandomAccent(h ,s ,l , randomSecondaryType, randomFont);
}

function updateThemeFromRandomAccent(h ,s ,l , randomSecondaryType, randomFont) {
  const isDark = document.body.classList.contains('dark');
  

  const secondaryHue = getSecondaryHue(h, randomSecondaryType);
  const secondaryS = Math.max(s - 15, 5);
  const secondaryL = Math.min(l + 20 , 60);
  const secondaryColor = `hsl(${secondaryHue}, ${secondaryS}%, ${secondaryL}%)`;
  
  // Set CSS variables
  const root = document.documentElement.style;
  root.setProperty('--hue', h);
  root.setProperty('--saturation', `${s}%`);
  root.setProperty('--lightness', `${l}%`);
  root.setProperty('--secondary-hue', secondaryHue);
  root.setProperty('--secondary-saturation', `${secondaryS}%`);
  root.setProperty('--secondary-lightness', `${secondaryL}%`);

  // Accent and secondary text colors for dark backgrounds
  const secondaryRgb = hslToRgb(secondaryHue, secondaryS, secondaryL);
  root.setProperty('--accent-text-color', getReadableTextColor(hslToRgb(h, s, l)));
  root.setProperty('--secondary-text-color', getReadableTextColor(secondaryRgb));

  // Preview color
  secondaryPreview.style.background = secondaryColor;

  // Text color adjustment for contrast
  const accentRgb = hslToRgb(h, s, l);
  const themeTextColor = getReadableTextColor(accentRgb);
  root.setProperty('--changeable-text-color', themeTextColor);

  // Set dark mode saturation
  root.setProperty('--dark-saturation', `${isDark ? Math.round(s * 0.7) : s}%`);

  setGoogleFont(randomFont, true); // Set random font
  updateCodeSnippet(h, s, l, isDark, secondaryHue, secondaryS, secondaryL);
}

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

function updateCodeSnippet(h, s, l, isDark, secondaryHue, secondaryS, secondaryL) {
  const format = colorFormat.value;
  const accent = getColorString(format, h, s, l);
  const secondary = getColorString(format, secondaryHue, secondaryS, secondaryL);

  const bg = getColorString(format, h, s, 98);
  const text = getColorString(format, h, s, 15);
  const border = getColorString(format, h, s, 85);
  const card = getColorString(format, h, s, 95);

  const darkS = Math.round(s * 0.7);
  const darkBg = getColorString(format, h, darkS, 4);
  const darkText = getColorString(format, h, darkS, 90);
  const darkBorder = getColorString(format, h, darkS, 20);
  const darkCard = getColorString(format, h, darkS, 8);

  const font = googleFontSelect.value || 'Roboto';
  const fontImport = `@import url('https://fonts.googleapis.com/css?family=${font.replace(/ /g, '+')}:400,700&display=swap');\n`;
  const fontCSS = `body {\n  font-family: '${font}', sans-serif;\n}\n`;

  const lightCSS = `:root {
  --accent: ${accent};
  --secondary: ${secondary};
  --bg-color: ${bg};
  --text-color: ${text};
  --border-color: ${border};
  --card-bg-color: ${card};
}`;

  const darkCSS = `body.dark {
  --bg-color: ${darkBg};
  --text-color: ${darkText};
  --border-color: ${darkBorder};
  --card-bg-color: ${darkCard};
}`;

  themeCode.textContent = fontImport + fontCSS + lightCSS + (isDark ? `\n\n${darkCSS}` : '');
  updateContrastChecker(h, s, l, secondaryHue, secondaryS, secondaryL, isDark);
}

function updateContrastChecker(h, s, l, secondaryHue, secondaryS, secondaryL, isDark) {
  const accentRgb = hslToRgb(h, s, l);
  const secondaryRgb = hslToRgb(secondaryHue, secondaryS, secondaryL);
  const lightBgRgb = hslToRgb(h, s, 98);
  const darkBgRgb = hslToRgb(h, Math.round(s * 0.7), 4);

  const accentTextRgb = getReadableTextColor(accentRgb) === '#fff' ? {r:255,g:255,b:255} : {r:0,g:0,b:0};
  const secondaryTextRgb = getReadableTextColor(secondaryRgb) === '#fff' ? {r:255,g:255,b:255} : {r:0,g:0,b:0};
  const darkTextRgb = getReadableTextColor(darkBgRgb) === '#fff' ? {r:255,g:255,b:255} : {r:0,g:0,b:0};

  const contrastPairs = [
    { label: 'Accent / Light Background', fg: accentRgb, bg: lightBgRgb },
    { label: 'Secondary / Light Background', fg: secondaryRgb, bg: lightBgRgb },
    { label: 'Text (accent) / Accent', fg: accentTextRgb, bg: accentRgb },
    { label: 'Text (secondary) / Secondary', fg: secondaryTextRgb, bg: secondaryRgb },
    { label: 'Dark Mode BG / Text', fg: darkTextRgb, bg: darkBgRgb }
  ];

  const contrastSection = document.getElementById('contrastResults');
  if (!contrastSection) return;

  contrastSection.innerHTML = contrastPairs.map((item) => {
    const ratio = getContrastRatio(item.fg, item.bg);
    const level = getContrastLevel(ratio);
    const passed = ratio >= 4.5;
    const statusEmoji = passed ? '✔' : '✖';
    const levelClass = level.toLowerCase().replace(' ', '-');
    const fgHex = rgbToHex(item.fg.r, item.fg.g, item.fg.b);
    const bgHex = rgbToHex(item.bg.r, item.bg.g, item.bg.b);

    return `
      <div class="contrast-row">
        <span class="contrast-icon" aria-hidden="true">${statusEmoji}</span>
        <span class="contrast-swatch" style="background:${bgHex}; color:${fgHex}; border-color:${fgHex};">Aa</span>
        <div class="contrast-meta">
          <div><strong>${item.label}</strong></div>
          <div>
            <span class="contrast-value">${ratio.toFixed(2)}:1</span>
            <span class="contrast-level ${levelClass}">${level}</span>
            <span class="contrast-hex">${fgHex} / ${bgHex}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const passFail = isDark ? (getContrastRatio(darkBgRgb, darkTextRgb) >= 4.5) : (getContrastRatio(lightBgRgb, lightTextRgb) >= 4.5);
  const summary = document.getElementById('contrastSummary');
  
}

function getSecondaryHue(primaryHue, type) {
  const hueMap = {
    'complementary': 180,
    'analogous': 30,
    'analogous-negative': -30,
    'triadic': 120,
    'split-complementary': 150,
    'split-complementary-negative': -150,
    'tetradic': 90,
    'monochromatic': 0
  };
  let shift = hueMap[type] || 0;
  let result = (primaryHue + shift) % 360;
  return (result + 360) % 360; // ensure positive value
}
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

  // Preview color
  secondaryPreview.style.background = secondaryColor;

  // Text color adjustment for contrast
  const changeables = document.getElementsByClassName('changeable');
  for (let el of changeables) {
    el.style.color = l > 65 ? 'black' : 'white';
  }

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

  // Preview color
  secondaryPreview.style.background = secondaryColor;

  // Text color adjustment for contrast
  const changeables = document.getElementsByClassName('changeable');
  for (let el of changeables) {
    el.style.color = l > 65 ? 'black' : 'white';
  }

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

// === DOM Elements ===
const accentPicker = document.getElementById('accentPicker');
const themeCode = document.getElementById('themeCode');
const darkModeToggle = document.getElementById('darkModeToggle');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');
const secondaryType = document.getElementById('secondaryType');
const secondaryPreview = document.getElementById('secondaryPreview');

const randomThemeBtn = document.getElementById('randomTheme');
const saveThemeBtn = document.getElementById('saveThemeBtn');
const presetList = document.getElementById('presetList');
const deletePresetBtn = document.getElementById('deletePresetBtn');

const colorFormat = document.getElementById('colorFormat');
const copyCodeBtn = document.getElementById('copyCodeBtn');

const googleFontSelect = document.getElementById('googleFontSelect');
const googleFontSearch = document.getElementById('googleFontSearch');

const GOOGLE_FONTS_API_KEY = 'AIzaSyBwy2Hf-lIgw09WmhCbQ9ngPK7bEnwjviY';
// Replace with your own Google Fonts API key from https://console.cloud.google.com/ to load the full font list
let allGoogleFonts = [];


// === Event Listeners ===

accentPicker.addEventListener('input', (e) => {
  let {h, s, l} = hexToHSL(e.target.value);
  saturationSlider.value  = s;
  saturationValue.textContent = `${s}%`;
  updateThemeFromAccent(e.target.value);
});

secondaryType.addEventListener('change', () => {
  updateThemeFromAccent(accentPicker.value);
});

darkModeToggle.addEventListener('change', (e) => {
  document.body.classList.toggle('dark', e.target.checked);
  updateThemeFromAccent(accentPicker.value);
});

saturationSlider.addEventListener('input', () => {
  saturationValue.textContent = `${saturationSlider.value}%`;
  let {h, s, l} = hexToHSL(accentPicker.value);
  accentPicker.value = hslToHex(h, saturationSlider.value, l);
  updateThemeFromAccent(accentPicker.value);
});

googleFontSearch.addEventListener('input', () => {
  const q = googleFontSearch.value.trim().toLowerCase();
  const filtered = allGoogleFonts.filter(f => f.toLowerCase().includes(q));
  renderGoogleFontOptions(filtered, filtered[0]);
  // If only one font matches, select and apply it
  if (filtered.length === 1) {
    setGoogleFont(filtered[0], true);
  }
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

saveThemeBtn.addEventListener('click', saveThemePreset);

presetList.addEventListener('change', () => {
  if (presetList.value) loadThemePreset(presetList.value);
});

deletePresetBtn.addEventListener('click', deleteThemePreset);

randomThemeBtn.addEventListener('click', () =>{
  getRandomTheme();
});

window.addEventListener('DOMContentLoaded', () => {
  updatePresetList();
  loadGoogleFonts();
  getRandomTheme();
});

// === Initial Setup ===

async function loadGoogleFonts(selectedFont = '') {
  googleFontSelect.innerHTML = `<option value="">Loading fonts...</option>`;

    const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`);
    const data = await res.json();
    data.items.sort((a, b) => a.family.localeCompare(b.family));
    allGoogleFonts = data.items.map(f => f.family);

    // If no font is selected, default to Roboto
    let fontToSelect = selectedFont || 'Roboto';
    renderGoogleFontOptions(allGoogleFonts, fontToSelect);
    setGoogleFont(fontToSelect, true);
   
}

saturationValue.textContent = `${saturationSlider.value}%`;





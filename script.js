
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
let allGoogleFonts = [];

const { Client, Databases, Account, Query } = Appwrite;

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('687b3aa300085bb26671'); // Replace with your Appwrite project ID

// Now you can use Account, Databases, etc.
const databases = new Databases(client);

const loading = document.getElementById('themeLoading');
loading.style.display = 'block'; 
// === Utility Functions ===
databases.listDocuments(
'687b3b3b0011d5710d77',
'687b3bf200180bc11712',
[
  Query.orderDesc('$createdAt'), // Sort by newest first
  Query.limit(10)                // Limit to latest 10
]
).then(response => {
  const container = document.getElementById('trendingThemes');
  container.innerHTML = ''; // Clear any existing content

// Store document data by card ID
const themeDataMap = new Map();

response.documents.forEach(doc => {
  const { hue, saturation, lightness, font, name } = doc;
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  const card = document.createElement('div');
  card.className = 'theme-card';
  const uniqueId = crypto.randomUUID(); // Or use doc.$id
  card.dataset.themeId = uniqueId;

  // Save the data in a Map
  themeDataMap.set(uniqueId, doc);

  card.innerHTML = `
    <div class="theme-color" style="background:${color}; color:white;">
      ${name}
    </div>
  `;

  container.appendChild(card);

  loading.style.display = 'none';  
});

// 🧠 Single event listener for all cards
container.addEventListener('click', e => {
  const card = e.target.closest('.theme-card');
  if (!card) return;

  const id = card.dataset.themeId;
  const doc = themeDataMap.get(id);
  if (!doc) return;

  accentPicker.value = hslToHex(doc.hue, doc.saturation, doc.lightness);
  saturationValue.textContent = `${doc.saturation}%`;
  saturationSlider.value = doc.saturation;
  secondaryType.value = doc.secondaryType;
  updateThemeFromRandomAccent(
    doc.hue,
    doc.saturation,
    doc.lightness,
    doc.secondaryType,
    doc.font
  );
});
}).catch(err => {
  console.error('Failed to fetch trending themes:', err);
  loading.textContent = 'Failed to load themes.';
});

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

saturationValue.textContent = `${saturationSlider.value}%`;

const openBtn = document.getElementById('openAboutBtn');
const modal = document.getElementById('aboutModal');
const closeBtn = document.getElementById('closeAboutBtn');

openBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});



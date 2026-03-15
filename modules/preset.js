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
  presetList.innerHTML = '<option value="">Saved Preset...</option>';
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

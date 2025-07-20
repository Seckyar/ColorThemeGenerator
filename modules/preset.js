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

  let { h, s, l } = hexToHSL(accentPicker.value);

  databases.createDocument(
  '687b3b3b0011d5710d77',
  '687b3bf200180bc11712',
  'unique()', // Document ID, use 'unique()' to auto-generate
  {
    name: name,
    hue: h,
    saturation: parseInt(saturationSlider.value),
    lightness: l,
    secondaryType: secondaryType.value,
    font: googleFontSelect.value || 'sans-serif'
  }
  ).then(response => {
    console.log('Document created:', response);
  }).catch(error => {
    console.error('Failed to create document:', error);
  });
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
  let {h, s, l} = hexToHSL(accentPicker.value);
  databases.listDocuments('687b3b3b0011d5710d77', '687b3bf200180bc11712', [
    Query.equal('name', name),
    Query.equal('hue', h)
  ])
  .then(result => {
    if (result.documents.length > 0) {
      const docId = result.documents[0].$id;
      databases.deleteDocument('687b3b3b0011d5710d77', '687b3bf200180bc11712', docId)
        .then(() => {
          console.log('Deleted from Appwrite');
        })
        .catch(err => console.error('Delete failed:', err));
    } else {
      console.log('No Appwrite doc found with that name.');
    }
  })
  .catch(err => console.error('Search failed:', err));
}

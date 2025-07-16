🎨 Dynamic Color Theme Generator

A simple, customizable theme generator that allows you to build a beautiful, modern CSS theme based on your preferred accent color, dark mode, saturation level, Google Font, and includes a save feature to preserve your custom themes.

✨ Features

🎨 Accent Color Picker: Choose your primary color and watch the theme update dynamically.

🌘 Dark Mode Toggle: Easily switch between light and dark modes.

💧 Saturation Control: Fine-tune the vibrancy of your theme.

🔋 Save Functionality: Save your current theme setup to restore it later.

🕋 Google Font Selector: Instantly apply your favorite font from a curated list.

🌈 Multiple color formats supported: #HEX, rgb() hsl(), lch(), oklch()

🧹 Live Code Preview: Copy the full CSS variables and @import link for use in your own projects.

🚀 How It Works

Pick your accent color using the color input.
Toggle dark mode to match your app’s style.
Adjust the saturation slider to increase or decrease color vibrancy.
Choose a Google Font from the dropdown.
Hit Save to store your theme.
Copy the generated theme code and paste it into your own CSS or <style> block.

The theme code includes:
Google Fonts @import
Root variables for accent and derived color shades
Font family
Theme-specific styles (like background and text colors)

📁 Project Structure

📆 dynamic-theme-generator
├── index.html        # Main HTML structure
├── styles.css        # Base styles for layout and responsiveness
├── script.js         # Core logic to handle theme updates and saving

🛠 Technologies Used
HTML5
CSS3
Vanilla JavaScript
Google Fonts API
Local Storage (for Save/Load feature)

🧪 Example Output

@import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
body {
  font-family: 'Roboto', sans-serif;
}
:root {
  --accent: hsl(253, 100%, 30%);
  --secondary: hsl(223, 85%, 50%);
  --bg-color: hsl(253, 100%, 98%);
  --text-color: hsl(253, 100%, 15%);
  --border-color: hsl(253, 100%, 85%);
  --card-bg: hsl(253, 100%, 95%);
}

📌 How to Use

Just open index.html in your browser or go to https://seckyar.github.io/ColorThemeGenerator and start customizing. You can:

Preview the changes in real time

Save your favorite theme

Copy the CSS code block and use it in your projects

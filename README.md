# Smartphone Savvy (Vanilla JS Version)

This project has been migrated from React to Vanilla HTML/CSS/JS.

## How to Run

Since the project uses ES Modules (`<script type="module">`), you need to serve it using a local HTTP server. You cannot just open the HTML files directly in the browser due to CORS restrictions.

### Option 1: Using Python (Recommended)
Since Python is detected in your environment:
```bash
python -m http.server
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Using Node.js
If you have Node.js installed and configured:
```bash
npx serve .
```
or
```bash
npm install
npm start
```

## Project Structure
- **HTML Files**: `index.html` (Login), `welcome.html`, `dashboard.html`, `upload.html`, `player.html`, `settings.html`
- **js/**: Contains all JavaScript logic (`store.js`, `geminiService.js`, and page-specific scripts).
- **_backup/**: Contains the original React/Vite source code.

## API Key Configuration
The app uses Google Gemini API for analyzing screenshots.
1. Open the app in your browser.
2. Open the Developer Tools (F12) -> Console.
3. Run the following command with your actual API Key:
   ```javascript
   localStorage.setItem('GEMINI_API_KEY', 'your_actual_api_key_here');
   ```
4. Refresh the page.

## Notes
- The app uses `localStorage` to simulate a database for lessons and user session.
- Veo video generation is experimental and requires specific API access.

# Guide (Vanilla JS Version)

This project has been migrated from React to Vanilla HTML/CSS/JS.

## How to Run

You need to start both the **Backend (API)** and the **Frontend (Client)**.

### 1. Start the Backend (FastAPI)
Open a terminal and run:
```bash
# Install dependencies first if you haven't:
# pip install fastapi uvicorn python-multipart passlib[bcrypt] python-jose[jwt]

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
```
The API will be available at `http://appguide.tech:8001`.

### 2. Start the Frontend (Client)
Open a second terminal in the project root and run:
```bash
python -m http.server 8000
```
Then open [http://localhost:8000/pages/index.html](http://localhost:8000/pages/index.html) in your browser.

**Note:** You must use your **Email** to log in. The login form has been updated to reflect this.

---

## Project Structure
- **backend/**: FastAPI implementation (auth, database, schemas)
- **pages/**: HTML templates
- **js/**: JavaScript logic and API integration
- **static/avatars/**: User uploaded profile pictures
- **_backup/**: Original React source code

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

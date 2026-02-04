from fastapi import FastAPI, HTTPException, status, Depends, File, UploadFile, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import shutil
import os
import logging
import traceback
import requests
import time
from dotenv import load_dotenv

load_dotenv()

# Set up logging to both file and console
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.log")
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
logger.info(f"Logging initialized. Log file: {log_file_path}")

from .schemas import UserCreate, UserInDB, Token, PasswordChange
from .auth import get_password_hash, verify_password, create_access_token, verify_token
from .database import create_user, get_user, update_user, get_user_by_email

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Allow both localhost and 127.0.0.1 with port 8000 and 8001
origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AVATAR_DIR = os.path.join(os.path.dirname(BASE_DIR), "static", "avatars")
PHOTOS_DIR = os.path.join(BASE_DIR, "photos")
VIDEOS_DIR = os.path.join(BASE_DIR, "videos")

os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(PHOTOS_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(BASE_DIR), "static")), name="static")
app.mount("/backend/videos", StaticFiles(directory=VIDEOS_DIR), name="videos")
app.mount("/backend/photos", StaticFiles(directory=PHOTOS_DIR), name="photos")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = verify_token(token, credentials_exception)
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

@app.get("/")
async def read_root():
    return {"status": "ok"}

@app.get("/@vite/client")
async def vite_client_placeholder():
    return Response(status_code=204)

@app.get("/config")
async def get_config():
    return {
        "baidu_api_key": os.getenv("BAIDU_QIANFAN_API_KEY"),
        "gemini_api_key": os.getenv("GEMINI_API_KEY")
    }

@app.post("/signup", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # Check if username or email already exists
    if get_user(user.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    if get_user_by_email(user.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = UserInDB(username=user.username, email=user.email, hashed_password=hashed_password)
    create_user(db_user)
    return db_user


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user: {form_data.username}")
    # Try to find user by email first, as requested
    user = get_user_by_email(form_data.username)
    # If not found by email, try username (optional, but good for backward compatibility)
    if not user:
        user = get_user(form_data.username)
        
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserInDB)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@app.put("/users/me/password", response_model=UserInDB)
async def change_password(password_change: PasswordChange, current_user: UserInDB = Depends(get_current_user)):
    if not verify_password(password_change.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
    
    hashed_new_password = get_password_hash(password_change.new_password)
    updated_user = update_user(current_user.username, {"hashed_password": hashed_new_password})
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update password")
    return updated_user

@app.post("/users/me/avatar", response_model=UserInDB)
async def change_avatar(file: UploadFile = File(...), current_user: UserInDB = Depends(get_current_user)):
    file_extension = os.path.splitext(file.filename)[1]
    avatar_filename = f"{current_user.username}{file_extension}"
    file_path = os.path.join(AVATAR_DIR, avatar_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    avatar_url = f"/{AVATAR_DIR}/{avatar_filename}"
    updated_user = update_user(current_user.username, {"avatar_url": avatar_url})
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update avatar")
    return updated_user

@app.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    try:
        # Create photos directory if it doesn't exist (absolute path)
        absolute_photos_dir = os.path.join(os.getcwd(), "backend", "photos")
        os.makedirs(absolute_photos_dir, exist_ok=True)
        
        file_path = os.path.join(absolute_photos_dir, file.filename)
        logger.info(f"Saving uploaded file to: {file_path}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"filename": file.filename, "status": "success", "path": file_path}
    except Exception as e:
        logger.error(f"Error uploading photo: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-video")
async def generate_video(payload: dict):
    logger.info(f"Received generate-video request. Payload keys: {list(payload.keys())}")
    base64_image = payload.get("base64_image")
    prompt = payload.get("prompt")
    
    if not base64_image:
        logger.error("Missing base64_image in payload")
        raise HTTPException(status_code=400, detail="Missing base64_image")
        
    api_key = os.getenv("BAIDU_QIANFAN_API_KEY")
    if not api_key:
        logger.error("BAIDU_QIANFAN_API_KEY not found in environment")
        raise HTTPException(status_code=500, detail="Baidu API key not configured on server")
        
    try:
        # 1. Start generation task
        baidu_url = "https://qianfan.baidubce.com/video/generations"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        # Use content structure (legacy/standard for this endpoint)
        body = {
            "model": "musesteamer-2.0-turbo-i2v",
            "content": [
                {"type": "text", "text": prompt or "Create a helpful video tutorial."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]
        }
        
        logger.info(f"Sending request to Baidu API: {baidu_url}")
        logger.info(f"Image base64 length: {len(base64_image)}")
        
        response = requests.post(baidu_url, headers=headers, json=body)
        
        if response.status_code != 200:
            logger.error(f"Baidu API error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"Baidu API error: {response.text}")
            
        data = response.json()
        logger.info(f"Baidu API response data: {data}")
        
        # Try different ways to get task_id based on Baidu's response structure
        task_id = data.get("task_id") or data.get("id") or (data.get("result", {}).get("task_id"))
        
        if not task_id:
            # Check if it returned a direct video_url (some models might)
            video_url = data.get("video_url") or data.get("result", {}).get("video_url")
            if video_url:
                logger.info(f"Video generated directly: {video_url}")
                return await save_video({"video_url": video_url, "filename": f"video_{int(time.time())}.mp4"})
            
            logger.error(f"Failed to get task ID from Baidu. Full response: {data}")
            raise HTTPException(status_code=500, detail="Failed to get task ID from Baidu")
            
        # 2. Polling for completion
        logger.info(f"Polling Baidu task: {task_id}")
        attempts = 0
        max_attempts = 60 # Increase to 10 minutes
        
        while attempts < max_attempts:
            time.sleep(10)
            attempts += 1
            
            poll_url = "https://qianfan.baidubce.com/video/generations"
            poll_params = {"task_id": task_id}
            poll_response = requests.get(poll_url, params=poll_params, headers={"Authorization": f"Bearer {api_key}"})
            
            if poll_response.status_code == 200:
                poll_data = poll_response.json()
                logger.info(f"Poll data for {task_id}: {poll_data}")
                
                # Check for status (handle case sensitivity)
                raw_status = poll_data.get("status") or poll_data.get("task_status")
                status = str(raw_status).lower() if raw_status else ""
                
                # Check for video_url in various locations (including the 'content' field seen in succeeded tasks)
                video_url = (
                    poll_data.get("video_url") or 
                    poll_data.get("result", {}).get("video_url") or 
                    poll_data.get("content", {}).get("video_url")
                )
                
                # If we have a video URL, we are good to go, regardless of status
                if video_url:
                    logger.info(f"Task {task_id} succeeded (Video URL found). Status: {raw_status}")
                    return await save_video({"video_url": video_url, "filename": f"video_{int(time.time())}.mp4"})
                
                # Otherwise check status explicitly
                if status in ["success", "completed", "succeeded"]:
                     logger.error(f"Task {task_id} marked as success but no video_url found: {poll_data}")
                     raise HTTPException(status_code=500, detail="Video URL missing in success response")
                elif status in ["failed", "error"]:
                    logger.error(f"Baidu generation failed for task {task_id}: {poll_data}")
                    raise HTTPException(status_code=500, detail="Baidu video generation failed")
                    
                logger.info(f"Still processing task {task_id}: {raw_status} (Attempt {attempts}/{max_attempts})...")
            else:
                logger.warning(f"Polling error for task {task_id}: {poll_response.status_code} - {poll_response.text}")
                
        raise HTTPException(status_code=408, detail="Baidu video generation timed out")
        
    except Exception as e:
        logger.error(f"Error in generate_video: {e}")
        logger.error(traceback.format_exc())
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-video")
async def save_video(payload: dict):
    video_url = payload.get("video_url")
    filename = payload.get("filename")
    
    if not video_url or not filename:
        raise HTTPException(status_code=400, detail="Missing video_url or filename")
    
    try:
        # Ensure filename has .mp4 extension
        if not filename.endswith(".mp4"):
            filename += ".mp4"
            
        local_path = os.path.join(VIDEOS_DIR, filename)
        logger.info(f"Downloading video from {video_url} to {local_path}")
        
        response = requests.get(video_url, stream=True)
        logger.info(f"Download response status: {response.status_code}")
        if response.status_code == 200:
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            logger.info(f"Video saved successfully to {local_path}")
            # Return relative path for frontend
            return {"status": "success", "path": f"/backend/videos/{filename}"}
        else:
            logger.error(f"Failed to download video from Baidu: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to download video from Baidu")
            
    except Exception as e:
        logger.error(f"Error saving video: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

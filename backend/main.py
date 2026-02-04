from fastapi import FastAPI, HTTPException, status, Depends, File, UploadFile, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import shutil
import os
import logging
import traceback
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

AVATAR_DIR = "static/avatars"
PHOTOS_DIR = "backend/photos"
VIDEOS_DIR = "backend/videos"
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(PHOTOS_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/backend/videos", StaticFiles(directory="backend/videos"), name="videos")
app.mount("/backend/photos", StaticFiles(directory="backend/photos"), name="photos")

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

@app.post("/save-video")
async def save_video(payload: dict):
    video_url = payload.get("video_url")
    filename = payload.get("filename")
    
    if not video_url or not filename:
        raise HTTPException(status_code=400, detail="Missing video_url or filename")
    
    try:
        import requests
        
        # Ensure filename has .mp4 extension
        if not filename.endswith(".mp4"):
            filename += ".mp4"
            
        local_path = os.path.join(VIDEOS_DIR, filename)
        logger.info(f"Downloading video from {video_url} to {local_path}")
        
        response = requests.get(video_url, stream=True)
        if response.status_code == 200:
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return {"status": "success", "path": f"/backend/videos/{filename}"}
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to download video from Baidu")
            
    except Exception as e:
        logger.error(f"Error saving video: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI, HTTPException, status, Depends, File, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import shutil
import os

from .schemas import UserCreate, UserInDB, Token, PasswordChange
from .auth import get_password_hash, verify_password, create_access_token, verify_token
from .database import create_user, get_user, update_user

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

AVATAR_DIR = "static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)

# Mount static files (avatars only; frontend served separately)
app.mount("/static", StaticFiles(directory="static"), name="static")

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

@app.post("/signup", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    db_user = get_user(user.username)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = UserInDB(username=user.username, email=user.email, hashed_password=hashed_password)
    create_user(db_user)
    return db_user


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
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

# app/interfaces/routes/user.py
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
from fastapi import APIRouter, Depends, status

from app.application.use_cases import (
    CreateUser, 
    AuthenticateUser, 
    GetUserById,
    UpdateUserPassword,
    DeleteUser,
    ListUsers,
    UpdateStatus,
    ForgotPassword
)
from app.infrastructure.user_repo import MongoUserRepo
from app.interfaces.schemas import (
    UserCreateIn, 
    UserOut, 
    UserLoginIn, 
    UserAuthOut,
    PasswordUpdateIn,
    StatusUpdateRequest,
    ForgotPasswordRequest
)

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


# Dependency
def user_repo() -> MongoUserRepo:
    return MongoUserRepo()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreateIn,
    repo: MongoUserRepo = Depends(user_repo)
):
    """Register a new user with encrypted password."""
    uc = CreateUser(repo)
    result = await uc.execute(
        name=user_data.name,
        email=user_data.email,
        username=user_data.username,
        password=user_data.password
    )
    
    if result.error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return UserOut(
        userId=result.user.user_id,
        name=result.user.name,
        email=result.user.email,
        username=result.user.username
    )


@router.post("/login", response_model=UserAuthOut)
async def login_user(
    credentials: UserLoginIn,
    repo: MongoUserRepo = Depends(user_repo)
):
    """Authenticate user and return user details."""
    uc = AuthenticateUser(repo)
    result = await uc.execute(
        username=credentials.username,
        password=credentials.password
    )
    
    if result.error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.error
        )
    
    if result.user.status == 'Inactive':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You're no longer an active user.")


    return UserAuthOut(
        userId=result.user.user_id,
        name=result.user.name,
        email=result.user.email,
        username=result.user.username,
        status = result.user.status,
        role = result.user.role,
        message="Authentication successful"
    )


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str,
    repo: MongoUserRepo = Depends(user_repo)
):
    """Get user by ID."""
    uc = GetUserById(repo)
    user = await uc.execute(user_id=user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserOut(
        userId=user.user_id,
        name=user.name,
        email=user.email,
        username=user.username
    )


@router.get("", response_model=list[UserOut])
async def list_all_users(
    repo: MongoUserRepo = Depends(user_repo)
):
    """List all users (without passwords)."""
    uc = ListUsers(repo)
    users = await uc.execute()
    
    return [
        UserOut(
            userId=u.user_id,
            name=u.name,
            email=u.email,
            username=u.username,
            status = u.status,
            role = u.role
        )
        for u in users
    ]


@router.put("/{user_id}/password", status_code=status.HTTP_200_OK)
async def update_password(
    user_id: str,
    password_data: PasswordUpdateIn,
    repo: MongoUserRepo = Depends(user_repo)
):
    """Update user password."""
    uc = UpdateUserPassword(repo)
    result = await uc.execute(
        user_id=user_id,
        old_password=password_data.oldPassword,
        new_password=password_data.newPassword
    )
    
    if result.error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    
    return {"message": "Password updated successfully"}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    repo: MongoUserRepo = Depends(user_repo)
):
    """Delete a user."""
    uc = DeleteUser(repo)
    result = await uc.execute(user_id=user_id)
    
    if result.error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error
        )
    
    return None


@router.put("/update_status")
async def update_status(data:StatusUpdateRequest, repo: MongoUserRepo = Depends(user_repo)):
    """Any user's status can be changed using this endpoint"""

    allowed_statuses = ["Active", "Inactive"]
    if data.new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{data.new_status}'. Allowed values: {allowed_statuses}")

    uc = UpdateStatus(repo)
    result = await uc.execute(data.user_id, data.new_status)

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"User '{data.user_id}' not found or status already '{data.new_status}'"
        )
    return {"message": "User's status updated successfully"}
   

@router.post(
    "/forgot-password", # Set the endpoint path
    status_code=status.HTTP_200_OK, 
    response_model=dict, # Define the expected successful response type
    summary="Request a password reset link."
)
async def forgot_password(
    request: ForgotPasswordRequest, 
    repo: MongoUserRepo = Depends(user_repo)
):
    try:
        uc = ForgotPassword(repo) 
        await uc.execute(email=request.email)
        return {"message": "Password reset link sent to your email."}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {e}"
        )
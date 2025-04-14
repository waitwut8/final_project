from models import Message
from sqlmodel import select
from fastapi import APIRouter, HTTPException, Depends
from dependencies import SessionDep
from datetime import datetime
from libs.lib_ai import fetch_chat_response, client, model_name

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    responses={404: {"description": "Not found"}},
)

@router.post("/send-message")
async def send_message(user_id: int, content: str, session: SessionDep):
    """
    Store a user message, generate an AI response using OpenAI, and store the response.
    Args:
        user_id (int): The ID of the user sending the message.
        content (str): The content of the user's message.
        session (SessionDep): The database session dependency.
    Returns:
        dict: The user's message and the AI's response.
    """
    if not content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    # Store the user's message
    user_message = Message(user_id=user_id, content=content, role="user", timestamp=datetime.utcnow())
    session.add(user_message)
    session.commit()
    session.refresh(user_message)

    # Generate an AI response using OpenAI
    try:
        ai_response_content = fetch_chat_response(
            client=client,
            model_name=model_name,
            user_message=content,
            temperature=0.7,
            top_p=1,
            max_tokens=1000,
            time_limit=20
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI response: {str(e)}")

    # Store the AI's response
    ai_message = Message(user_id=user_id, content=ai_response_content, role="ai", timestamp=datetime.utcnow())
    session.add(ai_message)
    session.commit()
    session.refresh(ai_message)

    return {
        "user_message": user_message,
        "ai_response": ai_message
    }


@router.get("/get-messages/{user_id}")
async def get_messages(user_id: int, session: SessionDep):
    """
    Retrieve all messages for a specific user.
    Args:
        user_id (int): The ID of the user whose messages are being retrieved.
        session (SessionDep): The database session dependency.
    Returns:
        list: A list of messages for the user.
    """
    messages = session.exec(select(Message).where(Message.user_id == user_id).order_by(Message.timestamp)).all()
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found for this user")
    return messages
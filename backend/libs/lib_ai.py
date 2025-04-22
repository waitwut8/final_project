import os
from openai import OpenAI
from dotenv import load_dotenv
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError

# Load environment variables
load_dotenv()
token = os.getenv("GH_TOKEN")
endpoint = "https://models.inference.ai.azure.com"
model_name = "gpt-4o"

# Initialize OpenAI client
client = OpenAI(
    base_url=endpoint,
    api_key=token,
)

def fetch_chat_response(client, model_name, user_message, temperature=0.7, top_p=1, max_tokens=1000, time_limit=20):
    """
    Fetches a chat response from the OpenAI client with streaming enabled.

    Args:
        client: The OpenAI client instance.
        model_name: The name of the model to use.
        user_message: The user's input message.
        temperature: Sampling temperature.
        top_p: Nucleus sampling probability.
        max_tokens: Maximum number of tokens in the response.
        time_limit: Time limit for the request in seconds.

    Returns:
        None
    """
    # Define the system message
    system_message = (
        "You are a helpful and professional support chatbot. Your goal is to assist users with their questions and "
        "provide clear, concise, and accurate information. Be polite and empathetic in your responses."
    )

    def get_chat_response(client, model_name, system_message, user_message, temperature, top_p, max_tokens):
        try:
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message},
                ],
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                model=model_name,
                stream=True,  # Streaming enabled
            )
            return response
        except Exception as e:
            print(f"Error occurred: {e}")
            return None

    # Timing the request
    start_time = time.time()

    with ThreadPoolExecutor() as executor:
        future = executor.submit(
            get_chat_response,
            client,
            model_name,
            system_message,
            user_message,
            temperature,
            top_p,
            max_tokens
        )
        try:
            response = future.result(timeout=time_limit)
            if response:
                # Dynamically output the response as it streams in
                for update in response:
                    if update.choices and update.choices[0].delta:
                        # Print the content as it arrives
                        print(update.choices[0].delta.content or "", end="", flush=True)  # `flush=True` to ensure immediate output
        except TimeoutError:
            print("\nRequest timed out!")

    # Timing the end of the response
    end_time = time.time()
    print(f"\nTime taken: {end_time - start_time:.2f} seconds")


fetch_chat_response(
    client,
    model_name,
    "Hi, I've tried adding items into my cart, but they don't seem to be saving. Can you help me with that? (Please provide a detailed response.)",
)

import os
import json
from groq import Groq
from typing import Dict, Any
from dotenv import load_dotenv

# Try loading ai-engine/.env first, fallback to backend/.env
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '../../backend/.env'))

class GroqClient:
    def __init__(self):
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            print("WARNING: GROQ_API_KEY not found in environment. Please add it to .env")
            self.client = None
        else:
            self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-8b-instant"

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not self.client:
            return {"error": "GROQ_API_KEY is not configured on the backend."}

        chat_completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                }
            ],
            model=self.model,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        response_text = chat_completion.choices[0].message.content
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {"error": "Failed to parse JSON", "raw": response_text}

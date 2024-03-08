# this class implements a logic that generates audio from a given text data
import requests
import logging
import json

class AudioGenerator:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def generate_audio(text, temperature, api_key):
        url = "https://api.openai.com/v1/audio/speech"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": "tts-1",
            "input": text,
            "voice": "alloy",
            "temperature": temperature
        }
        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()  # Raise exception for non-200 status codes

            content_type = response.headers.get("Content-Type")
            if content_type != "audio/mpeg":
                raise ValueError(f"Unexpected content type in response: {content_type}")

            AudioGenerator.logger.info('Audio generated successfully!')
            
            return response.content

        except requests.exceptions.RequestException as e:
            AudioGenerator.logger.error("Error making API request:", exc_info=e)
            raise
        except json.JSONDecodeError as e:
            AudioGenerator.logger.error("Error parsing API response:", exc_info=e)
            raise
        except Exception as e:  # Catch any other unexpected exceptions
            AudioGenerator.logger.error("Unexpected error:", exc_info=e)
            raise
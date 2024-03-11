# this class implements a logic that generates audio from a given text data
import io
import requests
import logging
import json
from openai import OpenAI

class AudioGenerator:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def generate_audio(text, api_key):
        client = OpenAI(api_key=api_key)
        
        try:
            response = client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=text
            )
            
            audio_buffer = io.BytesIO()
            audio_buffer.write(response.content)
            audio_buffer.seek(0)

            AudioGenerator.logger.info('Audio generated successfully!')
            
            return audio_buffer

        except requests.exceptions.RequestException as e:
            AudioGenerator.logger.error("Error making API request:", exc_info=e)
            raise
        except json.JSONDecodeError as e:
            AudioGenerator.logger.error("Error parsing API response:", exc_info=e)
            raise
        except Exception as e:  # Catch any other unexpected exceptions
            AudioGenerator.logger.error("Unexpected error:", exc_info=e)
            raise
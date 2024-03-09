# this class implements a logic that generates audio from a given text data
import io
import requests
import logging
import json
from pathlib import Path
from openai import OpenAI

class AudioGenerator:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def generate_audio(text, api_key):
        client = OpenAI(api_key=api_key)
        speech_file_path = Path(__file__).parent/"speech.mp3"
        
        try:
            response = client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=text
            )
            
            response.stream_to_file(speech_file_path)

            # content_type = response.
            # if content_type != "audio/mpeg":
            #     raise ValueError(f"Unexpected content type in response: {content_type}")
            
            audio_content = response.content

            AudioGenerator.logger.info('Audio generated successfully!')
            
            return audio_content

        except requests.exceptions.RequestException as e:
            AudioGenerator.logger.error("Error making API request:", exc_info=e)
            raise
        except json.JSONDecodeError as e:
            AudioGenerator.logger.error("Error parsing API response:", exc_info=e)
            raise
        except Exception as e:  # Catch any other unexpected exceptions
            AudioGenerator.logger.error("Unexpected error:", exc_info=e)
            raise
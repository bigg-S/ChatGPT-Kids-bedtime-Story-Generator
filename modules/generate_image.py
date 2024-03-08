import requests
from PIL import Image
from io import BytesIO
import logging
import json

class ImageGenerator:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def generate_image(api_key, title=None):
        url = "https://api.openai.com/v1/images/generations"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "prompt": f"A kids bedtime story cover image based on the title, {title}" if title else "A light blue canvas",
            "n": 1,
            "size": "1024x1024",
            "quality": "standard",
            "model": "dall-e-3"
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()  # Raise an exception for non-200 status codes
            
            image_url = response.json()["data"][0]["url"]
            image_response = requests.get(image_url)
            image_response.raise_for_status()  # Raise an exception if image retrieval fails
            image = Image.open(BytesIO(image_response.content))
            
            ImageGenerator.logger.info('Image generated successfully!')
            return image
        
        except requests.exceptions.RequestException as e:
            ImageGenerator.logger.error(f"Error making API request: {e}")
            raise
        except json.JSONDecodeError as e:
            ImageGenerator.logger.error(f"Error parsing API response: {e}")
            raise
        except Exception as e:
            ImageGenerator.logger.error(f"Unexpected error: {e}")
            raise

import requests
from PIL import Image
from io import BytesIO
import logging
import json
import numpy as np
from openai import OpenAI

class ImageGenerator:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def generate_image(api_key, title=None):
        client = OpenAI(api_key=api_key)
        
        prompt = f"A kids bedtime story cover image based on the title, {title}" if title else "A light blue canvas"
        
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1
            )
            
            image_url = response.data[0].url
            image_response = requests.get(image_url)
            image_response.raise_for_status()  # Raise an exception if image retrieval fails
            image = Image.open(BytesIO(image_response.content))
            image = np.array(image)
            
            ImageGenerator.logger.info('Image generated successfully!')
            
            # Return a dictionary containing the image and its URL
            return {
                'image': image,
                'image_url': image_url
            }
        
        except requests.exceptions.RequestException as e:
            ImageGenerator.logger.error(f"Error making API request: {e}")
            raise
        except json.JSONDecodeError as e:
            ImageGenerator.logger.error(f"Error parsing API response: {e}")
            raise
        except Exception as e:
            ImageGenerator.logger.error(f"Unexpected error: {e}")
            raise


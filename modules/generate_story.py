# This class implements a logic that generates text (s bed time story) based on a title provided by a user
import requests
import logging

class StoryGenerator:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def generate_story(api_key, temperature, max_tokens=500, title=None):
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "prompt": f'Write a kids bedtime story based on the following title {title}' if title else 'Write a kids bedtime story.',
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        try: 
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status() # raise an exception for non-200 status codes
            story_text = response.json()["choices"][0]["text"]
            if title:
                story_text = f"{title}\n\n{story_text}"
            StoryGenerator.logger.info('Bed time story generated successfully!')
            return story_text
        except requests.exceptions.RequestException as e:
            StoryGenerator.logger.error('Error making API request: ', exc_info=e)
            raise
        except Exception as e: # catch any other unexpected exceptions
            StoryGenerator.logger.error('Unexpected error: ', exc_info=e)
            raise
import logging
from openai import OpenAI

class StoryGenerator:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def generate_story(api_key, temperature, max_tokens=500, title=None):
        client = OpenAI(api_key=api_key)
        
        prompt = f'Write a kids bedtime story based on the following title: {title}.' if title else 'Write a kids bedtime story.'
        
        try: 
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=float(temperature)
            )
            
            # Check if the completion contains choices
            if response.choices:
                # Get the first choice (assuming there is only one)
                first_choice = response.choices[0]
                # Check if the choice contains a message
                if first_choice.message:
                    # Get the content of the message
                    story_text = first_choice.message.content.strip()
                    if title:
                        story_text = f"{title}\n\n{story_text}"
                    print(story_text)
                    StoryGenerator.logger.info('Bed time story generated successfully!')
                    return story_text
            
            # Return an empty string if no story text is found
            return ""
        except Exception as e:
            StoryGenerator.logger.error('Error generating story: ', exc_info=e)
            raise

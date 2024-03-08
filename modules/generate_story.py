import requests

class StoryGenerator:
    @staticmethod
    def generate_story(prompt, api_key):
        url = "https://api.openai.com/v1/engines/text-davinci-003/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "prompt": prompt,
            "max_tokens": 200
        }
        response = requests.post(url, json=data, headers=headers)
        story_text = response.json()["choices"][0]["text"]
        return story_text
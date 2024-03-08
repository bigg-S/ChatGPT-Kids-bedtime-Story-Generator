import requests
from PIL import Image
from io import BytesIO

class ImageGenerator:
    @staticmethod
    def generate_image(prompt, api_key):
        url = "https://api.openai.com/v1/images/generations"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024"
        }
        response = requests.post(url, json=data, headers=headers)
        image_url = response.json()["data"][0]["url"]
        image_response = requests.get(image_url)
        image = Image.open(BytesIO(image_response.content))
        return image
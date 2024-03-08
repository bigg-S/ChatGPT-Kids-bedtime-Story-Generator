import requests

class AudioGenerator:
    @staticmethod
    def generate_audio(text, api_key):
        url = "https://api.openai.com/v1/audio/speech"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": "tts-1",
            "input": text,
            "voice": "alloy"
        }
        response = requests.post(url, json=data, headers=headers)
        audio_content = response.content
        return audio_content
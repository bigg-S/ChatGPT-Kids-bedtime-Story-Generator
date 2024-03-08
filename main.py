import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from modules.generate_story import StoryGenerator
from modules.generate_image import ImageGenerator
from modules.generate_audio import AudioGenerator
from modules.combine_audio_image import AudioImageCombiner

load_dotenv()

app = Flask(__name__)

@app.route('/generate_bedtime_story', methods=['POST'])
def generate_bedtime_story():
    data = request.get_json()
    title = data.get('title')
    api_key = os.getenv('OPENAI_API_KEY')
    temperature = os.getenv('TEMPERATURE')

    # Generate story text
    story_text = StoryGenerator.generate_story(api_key=api_key, temperature=temperature, title=title)

    # Generate image
    image = ImageGenerator.generate_image(api_key=api_key, title=title)

    # Generate audio
    audio_content = AudioGenerator.generate_audio(text=story_text, temperature=temperature, api_key=api_key)

    # Combine audio with image
    combined_audio_image = AudioImageCombiner.combine(audio_content=audio_content, image=image)

    # Return combined audio with image
    return jsonify({"message": "Bedtime story generated successfully.", "audio_with_image": combined_audio_image, "story_text": story_text})

if __name__ == '__main__':
    app.run(debug=True)

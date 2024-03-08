from flask import Flask, jsonify, request
from modules.generate_story import StoryGenerator
from modules.generate_image import ImageGenerator
from modules.generate_audio import AudioGenerator
from modules.combine_audio_image import AudioImageCombiner

app = Flask(__name__)

@app.route('/generate_bedtime_story', methods=['POST'])
def generate_bedtime_story():
    data = request.get_json()
    prompt = data.get('prompt')
    api_key = data.get('api_key')

    # Generate story text
    story_text = StoryGenerator.generate_story(prompt, api_key)

    # Generate image
    image = ImageGenerator.generate_image(prompt, api_key)

    # Generate audio
    audio_content = AudioGenerator.generate_audio(story_text, api_key)
    with open("audio.mp3", "wb") as f:
        f.write(audio_content)

    # Combine audio with image
    combined_audio_image = AudioImageCombiner.combine("audio.mp3", image)

    # Return combined audio with image
    return jsonify({"message": "Bedtime story generated successfully.", "audio_with_image": combined_audio_image})

if __name__ == '__main__':
    app.run(debug=True)
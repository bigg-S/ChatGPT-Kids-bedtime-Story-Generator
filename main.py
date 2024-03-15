import os
import json
import base64
import requests
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from flask import Flask, jsonify, request, render_template, redirect, session, url_for, abort
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)

from oauthlib.oauth2 import WebApplicationClient

from dotenv import load_dotenv

from modules.user import User
from modules.database_initializer import DatabaseInitializer
from modules.generate_story import StoryGenerator
from modules.generate_image import ImageGenerator
from modules.generate_audio import AudioGenerator
from modules.combine_audio_image import AudioImageCombiner

load_dotenv()

# Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
GOOGLE_DISCOVERY_URL = os.getenv('GOOGLE_DISCOVERY_URL', None)

database_initializer = DatabaseInitializer()

app = Flask(__name__)
#print(os.urandom(24))
app.secret_key = os.getenv('APP_SECRET_KEY')

app.config.update(
    DEBUG=True,
    SESSION_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_PERMANENT=True,
)

# User session management setup
login_manager = LoginManager()
login_manager.init_app(app=app)
login_manager.session_protection = "strong"
login_manager.needs_refresh_message = (u"Session timedout, please login again")
login_manager.needs_refresh_message_category = "info"

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# OAuth 2 client setup
client = WebApplicationClient(GOOGLE_CLIENT_ID)

# Flask-Login helper to retrieve a user from our db
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id=user_id)

@app.route('/')
def index():
    _stories = None
    _stories_with_index = None
    if current_user.is_authenticated:
        _stories = get_stories()
        # Attach index attribute to each story
        _stories_with_index = enumerate(_stories) if _stories else None  
    return render_template('index.html', stories=_stories_with_index, current_user=current_user)


def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()

@app.route('/login')
def login():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg['authorization_endpoint']
    
    # retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )

    return redirect(request_uri)

# login callback
@app.route("/login/callback")
def callback():
    # Get authorization code Google sent back to you
    code = request.args.get("code")
    
    # Find out what URL to hit to get tokens that allow you to ask for
    # things on behalf of a user
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]
    
    # Prepare and send a request to get tokens
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response = request.url,
        redirect_url=request.base_url,
        code=code
    )
    
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )
    
    # parse the tokens
    client.parse_request_body_response(json.dumps(token_response.json()))
    
    # fetch user profile information
    user_info_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(user_info_endpoint)
    user_info_response = requests.get(uri, headers=headers, data=body)
    
    # You want to make sure their email is verified.
    # The user authenticated with Google, authorized your
    # app, and now you've verified their email through Google
    
    if user_info_response.json().get("email_verified"):
        unique_id = user_info_response.json()["sub"]
        user_email = user_info_response.json()["email"]
        user_name = user_info_response.json()["given_name"]
        stories = []
        
         # create a user in the database
        user = User(
            id_=unique_id, name=user_name, email=user_email, stories=stories
        )
        
        # if a user doesn't exist add it to the database
        if not User.get(unique_id):
            User.create(unique_id, user_name, user_email, stories)
        
         # Begin user session by logging the user in
        login_user(user=user, force=True)
        
        # Send user back to homepage
        return redirect(url_for("index"))        
        
    else:
        return "User email not available or not verified by Google.", 400    


# logout logic
@app.route("/logout")
@login_required
def logout():
    session.clear()
    logout_user()
    return redirect(url_for("index"))
    

@app.route('/generate_bedtime_story', methods=['POST'])
def generate_bedtime_story():
    data = request.get_json()
    title = data.get('title')
    api_key = os.getenv('OPENAI_API_KEY')
    temperature = os.getenv('TEMPERATURE')

    # Define a function to generate story text
    def generate_story_text():
        return StoryGenerator.generate_story(api_key=api_key, temperature=temperature, title=title)

    # Define a function to generate image
    def generate_image():
        return ImageGenerator.generate_image(api_key=api_key, title=title)

    # Define a function to generate audio
    def generate_audio(story_text):
        return AudioGenerator.generate_audio(text=story_text, api_key=api_key)
    
    # Execute the tasks concurrently using ThreadPoolExecutor
    with ThreadPoolExecutor() as executor:
        # Submit the tasks
        future_story_text = executor.submit(generate_story_text)
        future_image = executor.submit(generate_image)
        
        # Wait for story text to complete and retrieve the result
        story_text = future_story_text.result()

        # Submit audio generation task with story text as argument
        future_audio = executor.submit(generate_audio, story_text)

        # Wait for image generation and audio generation to complete
        image = future_image.result()
        audio_content = future_audio.result()

    # Combine audio with image
    combined_audio_image = AudioImageCombiner.combine(audio_content=audio_content, image_data=image)
    
    # Save story to database if a user is signed in
    if current_user.is_authenticated:
        # Construct the story object
        story_object = {
            "title": title,
            "story_text": story_text
        }

        # Retrieve the current user's record
        user = User.get(current_user.id)
        
        # Append the new story object to the user's stories array
        user.stories.append(story_object)
        
        # Save the user with the updated stories array
        user.save()
       
    
    # Encode the combined_audio_image using base64 encoding
    combined_audio_image_base64 = base64.b64encode(combined_audio_image).decode('utf-8')

    # Return combined audio with image
    return jsonify({"message": "Success!", "audio_with_image": combined_audio_image_base64, "story_text": story_text})

# generate video from stored image and story text
@app.route('/view_story', methods=['POST'])
def view_story():
    data = request.get_json()
    title = data.get('title')
    story_text = data.get('story_text')
    api_key = os.getenv('OPENAI_API_KEY')
    
    # Define a function to generate audio content and image concurrently
    def generate_audio_image():
        # Generate image
        image = ImageGenerator.generate_image(api_key=api_key, title=title)

        # Generate audio
        audio_content = AudioGenerator.generate_audio(text=story_text, api_key=api_key)

        return audio_content, image
    
    # Execute the function concurrently
    with ThreadPoolExecutor() as executor:
        future = executor.submit(generate_audio_image)
        audio_content, image = future.result()  # Wait for both tasks to complete

    # Combine audio with image
    combined_audio_image = AudioImageCombiner.combine(audio_content=audio_content, image_data=image)
    
    # Encode the combined_audio_image using base64 encoding
    combined_audio_image_base64 = base64.b64encode(combined_audio_image).decode('utf-8')

    # Return combined audio with image
    return jsonify({"message": "Success!", "audio_with_image": combined_audio_image_base64 })


# route to delete a story
@app.route('/delete_story/<int:index>', methods=['DELETE'])
@login_required
def delete_story(index):
    # Retrieve the current user's record
    user = User.get(current_user.id)
    
    # Check if the user exists
    if not user:
        abort(404, description="User not found")
    
    # Check if the story exists
    if index >= len(user.stories) or index < 0:
        abort(404, description="Story not found")
    
    # Delete the story from the user's stories array
    del user.stories[index]
    
    # If all stories are deleted, set stories field to an empty array
    if not user.stories:
        user.stories = []
    
    # Update the user's record in the database
    user.save()
    
    return jsonify({"message": "Story deleted successfully"}), 200


# route to get stories
def get_stories():
    # Retrieve the current user's record
    if current_user.id:
        user = User.get(current_user.id)
    
    # Check if the user exists
    if not user:
        return abort(404, description="User not found")
    
    return user.stories

if __name__ == '__main__':
    app.run(ssl_context="adhoc", debug=True)

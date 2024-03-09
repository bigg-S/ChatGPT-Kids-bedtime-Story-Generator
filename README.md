# Bedtime Story Generator

This project implements a bedtime story generator using OpenAI's GPT-4 model to generate story text based on user-provided titles. It also generates an image and audio, combining them into a video track for the user.

## Table of Contents

    -[Prerequisites](#prerequisites)
    -[Installation](#installation)
    -[Usage](#usage)
    -[Endpoints](#endpoints)
    -[Classes](#classes)
        -[StoryGenerator](#story-generator)
        -[ImageGenerator](#image-generator)
        -[AudioGenerator](#audio-generator)
        -[AudioImageCombiner](#audio-image-combiner)
    -[Licence](#licence)
    -[Acknowledgements](#acknowledgments)

### Prerequisites

Before running the project, ensure you have the following installed:

    -Python 3
    -Git
    -Visual Studio Code

### Installation

    1. Clone the repository to your local machine. Open the git terminal in your project directory  and run:
        ```bash
            git clone https://github.com/bigg-S/Downloading-a-PDF-from-Next.js-server-and-uploading-it-to-Supabase.git
        ```
    2. Create a virtual environment in your project directory.
        ```bash
            python3 -m venv <your virtual environment name>
        ```
    3. Install the required dependencies by running 
        ```bash
            pip install -r requirements.txt.
        ```
    4. Create a .env file in the root directory and add your OpenAI API key.
        ```bash
            OPENAI_API_KEY=your_api_key
            TEMPERATURE=0.7
        ```

### Usage

    1. Run the Flask application by executing 
        ```bash
            python main.py.
        ```
    2. Send a POST request to the /generate_bedtime_story endpoint with a JSON payload containing a title field representing the bedtime story title.
    3. Receive the generated bedtime story text, audio file, and video file as a response.
    4. The previous steps will be easier after we have an interface

### Endpoints

    /generate_bedtime_story: POST endpoint to generate a bedtime story based on the provided title.

### Classes

#### StoryGenerator

    Description: Generates a bedtime story text based on a provided title using OpenAI's GPT-3 model.
    Method: generate_story(api_key, temperature, max_tokens=500, title=None)
    Parameters:
        api_key: Your OpenAI API key.
        temperature: The temperature parameter for text generation.
        max_tokens: Maximum number of tokens for the generated text.
        title: The title of the bedtime story (optional).
    Returns: The generated bedtime story text.

    Initialization:
        Import the required libraries: requests for making API requests and logging for logging errors and messages.
        Define the StoryGenerator class.

    Logger Setup:
        Initialize a logger using logging.getLogger(__name__) to enable logging for this class.

    Generate Story Method:
        Define the generate_story method as a static method.
        Accept parameters: api_key, max_tokens (default: 500), and title (default: None).

    API Request Setup:
        Set the URL for the OpenAI API endpoint.
        Set the headers including the content type and authorization token using the provided API key.

    Create Prompt:
        Create a prompt string based on the provided title. If title is not provided, use a generic prompt for generating a bedtime story.

    API Request:
        Make a POST request to the OpenAI API with the generated prompt and other parameters.
        Handle exceptions: Log errors and raise exceptions for any issues encountered during the API request.

    Process Response:
        Extract the generated story text from the API response.
        If a title was provided, prepend the title to the story text with a newline separator.

    Logging:
        Log a success message indicating that the bedtime story was generated successfully.

    Return Story Text:
        Return the generated story text.

#### ImageGenerator

    Description: Generates a cover image for the bedtime story based on a provided title using OpenAI's DALL-E model.
    Method: generate_image(api_key, title=None)
    Parameters:
        api_key: Your OpenAI API key.
        title: The title of the bedtime story (optional).
    Returns: The generated cover image.

    Initialization:

        Import the required libraries: requests for making API requests, PIL.Image for working with images, io.BytesIO for handling in-memory data, and logging for logging errors and messages.
        Define the ImageGenerator class.

    Logger Setup:

        Initialize a logger using logging.getLogger(__name__) to enable logging for this class.

    Generate Image Method:

        Define the generate_image method as a static method.
        Accept parameters: api_key (API key for accessing the OpenAI API) and title (title of the bedtime story for generating the cover image).

    API Request:

        Set the URL for the OpenAI API endpoint.
        Set the headers including the content type and authorization token using the provided API key.
        Define data including the prompt, number of images, size, quality, and model for image generation.
        Make a POST request to the OpenAI API with the provided data and headers.
        Handle exceptions: Log errors and raise exceptions for any issues encountered during the API request.
        If successful, extract the image URL from the API response and retrieve the image data.
        Open the image using PIL.Image and return it.

#### AudioGenerator

    Description: Generates audio for the bedtime story text using OpenAI's text-to-speech (TTS) model.
    Method: generate_audio(text, temperature, api_key)
    Parameters:
        text: The text for which audio needs to be generated.
        temperature: The temperature parameter for audio generation.
        api_key: Your OpenAI API key.
    Returns: The generated audio file content.

    Initialization:
        Import the required libraries: requests for making API requests and logging for logging errors and messages.
        Define the AudioGenerator class.

    Logger Setup:
        Initialize a logger using logging.getLogger(__name__) to enable logging for this class.

    Generate Audio Method:
        Define the generate_audio method as a static method.
        Accept parameters: text (text data for audio generation) and api_key.

    API Request Setup:
        Set the URL for the OpenAI API endpoint.
        Set the headers including the content type and authorization token using the provided API key.

    API Request:
        Make a POST request to the OpenAI API with the provided text data and other parameters.
        Handle exceptions: Log errors and raise exceptions for any issues encountered during the API request.

    Content Type Check:
        Check the content type of the API response to ensure it is "audio/mpeg" as expected.
        If the content type is not as expected, raise a ValueError with a descriptive error message.

    Logging:
        Log a success message indicating that the audio was generated successfully.

    Return Audio Content:
        Return the content of the generated audio file.

#### AudioImageCombiner

    Description: Combines the generated audio and image into an MP4 video track.
    Method: combine(audio_content, image_data, output_file="bedtime_story.mp4")
    Parameters:
        audio_content: The content of the audio file.
        image_data: The content of the image file.
        output_file: The path to save the output video file (optional).
    Returns: The path of the generated video file.

    Initialization:

        Import the required libraries: moviepy.editor for working with audio and video files and logging for logging errors and messages.
        Define the AudioImageCombiner class.

    Logger Setup:

        Initialize a logger using logging.getLogger(__name__) to enable logging for this class.

    Combine Method:

        Define the combine method as a static method.
        Accept parameters: audio_content (content of the audio file), image_data (image data for the cover), and output_file (name of the output video file).

    API Request:

        Load the audio file using AudioFileClip.
        Load the image from the in-memory data using ImageClip.
        Create a video clip by setting the audio track to the image.
        Set the frames per second (fps) for the video.
        Export the final video file with the specified audio codec and codec.
        Log a success message indicating that the audio and image were combined successfully.
        Return the name of the output video file.

## Licence

N/A

## Acknowledgments

Special thanks to the following libraries and frameworks used in this project:

- Flask

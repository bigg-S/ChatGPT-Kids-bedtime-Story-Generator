# The following class implements a logic that generates an mp4 track from an image and an audio file 
from moviepy.editor import AudioFileClip, ImageClip, CompositeVideoClip
import logging

class AudioImageCombiner:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def combine(audio_content, image_data, output_file="bedtime_story.mp4"):
        try:
            # Load audio file
            audio = AudioFileClip(audio_content)

            # Load image from in-memory data
            image = ImageClip(image_data, duration=audio.duration)
            
            # create a video clip
            video = image.set_audio(audio)
            
            video.fps = 30

            # Export the final video with the same audio file extension
            video.write_videofile(output_file, audio_codec='aac', codec="libx264")
            
            AudioImageCombiner.logger.info('Audio and image combined successfully!')
            
            return output_file
        
        except Exception as e:
            AudioImageCombiner.logger.error(f"Unexpected error while combining audio and image: {e}")
            raise
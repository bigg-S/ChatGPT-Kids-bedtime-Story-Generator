# The following class implements a logic that generates an mp4 track from an image and an audio file 
from moviepy.editor import AudioFileClip, ImageClip, CompositeVideoClip
import logging

class AudioImageCombiner:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def combine(audio_content, image_data, output_file="combined_audio_image.mp4"):
        try:
            # Load audio file
            audio = AudioFileClip(audio_content)

            # Load image from in-memory data
            image = ImageClip(image_data, duration=audio.duration)
            
            # create a video clip
            video = CompositeVideoClip([image]).set_audio(audio)

            # Export the final video with the same audio file extension
            video.write_videofile("combined_audio_image.mp4", audio_codec='aac', fps=24, codec="libx264")
            
            AudioImageCombiner.logger.info('Audio and image combined successfully!')
            
            return output_file
        
        except Exception as e:
            AudioImageCombiner.logger.error(f"Unexpected error while combining audio and image: {e}")
            raise
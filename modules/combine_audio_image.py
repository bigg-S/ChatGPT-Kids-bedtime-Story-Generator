# The following class implements a logic that generates an mp4 track from an image and an audio file 
from moviepy.editor import AudioFileClip, ImageClip, VideoClip
import logging
import tempfile
from pathlib import Path

class AudioImageCombiner:
    logger = logging.getLogger(__name__)
    
    @staticmethod
    def combine(audio_content, image_data, output_file="bedtime_story.mp4"):
        try:
            video_file_path = str(Path(__file__).parent/output_file)
            
            # save audio content to a temporary file
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_audio_file:
                temp_audio_file.write(audio_content.read())
                temp_audio_file.flush()
                
                # Load audio file
                audio = AudioFileClip(temp_audio_file.name, fps=44100)

            # Load image from in-memory data
            image = ImageClip(image_data)
            
            # create a video clip
            video = VideoClip(make_frame=lambda t: image.get_frame(t), duration=audio.duration)
            
            video = video.set_audio(audio)

            # Export the final video with the same audio file extension
            video.write_videofile(video_file_path, fps=24, codec="libx264" )
            
            AudioImageCombiner.logger.info('Audio and image combined successfully!')
            
            return output_file
        
        except Exception as e:
            AudioImageCombiner.logger.error(f"Unexpected error while combining audio and image: {e}")
            raise
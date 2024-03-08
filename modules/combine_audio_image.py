from moviepy.editor import AudioFileClip, ImageClip, concatenate_videoclips

class AudioImageCombiner:
    @staticmethod
    def combine(audio_file, image):
        # Load audio file
        audio = AudioFileClip(audio_file)

        # Create video clip with image as static frame
        image_clip = ImageClip(image)
        video = image_clip.set_duration(audio.duration)

        # Set audio as the audio track of the video
        final_clip = video.set_audio(audio)

        # Export the final video with the same audio file extension
        final_clip.write_videofile("combined_audio_image.mp4", audio_codec='aac', fps=24, codec="libx264")

        return "combined_audio_image.mp4"
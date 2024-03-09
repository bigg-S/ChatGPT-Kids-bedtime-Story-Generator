function generateStory() {
    const title = document.getElementById('storyTitle').value;
    fetch('/generate_bedtime_story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('storyDisplay').innerText = data.story_text;
    })
    .catch(error => console.error('Error:', error));
}

function toggleView() {
    const storyDisplay = document.getElementById('storyDisplay');
    const audioWithImage = document.getElementById('audioWithImage');

    if (storyDisplay.style.display === 'none') {
        storyDisplay.style.display = 'block';
        audioWithImage.style.display = 'none';
    } else {
        storyDisplay.style.display = 'none';
        audioWithImage.style.display = 'block';
    }
}

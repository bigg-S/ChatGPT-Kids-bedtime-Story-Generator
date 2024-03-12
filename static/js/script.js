// Function to toggle loading state
function toggleLoadingState() {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.innerHTML = `        
        <div role="status" class="flex items-center">
            <!-- Loading symbol -->
            <svg aria-hidden="true" class="w-8 h-8 text-blue-600 animate-spin dark:text-gray-600 fill-current mr-2" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>

            <!-- Loading text -->
            <span class="mr-2">Generating...</span>
        </div>

    `;
}

// function to generate the story
async function generateStory() {
    toggleLoadingState();

    // Disable the "Generate" button
    document.getElementById('generateButton').disabled = true;

    const title = document.getElementById('storyTitle').value;

    try {
        const response = await fetch('/generate_bedtime_story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        const storyText = data.story_text;
        const videoBase64 = data.audio_with_image;

        // Split the story text by the "\n\n" delimiter
        const storyParts = storyText.split('\n\n');

        // Extract the title and the rest of the story
        const _title = storyParts[0];
        const restOfStory = storyParts.slice(1).join('\n\n'); // Rejoin the rest of the story

        // Create story display HTML
        const storyDisplayHTML = `
            <p><strong>${_title}</strong></p>
            <p>${restOfStory}</p>
            <hr class="my-4 border-gray-300">
            <h2 class="text-lg font-bold">Listen!</h2>
        `;

        // Display story text and heading
        document.getElementById('storyDisplay').innerHTML = storyDisplayHTML;
        
        // Convert Base64 string to typed byte array
        const videoBytes = base64ToUint8Array(videoBase64);

        // create a blob from the decoded video bytes
        const videoBlob = new Blob([videoBytes], { type: 'video/mp4' });

        // create the video object url
        const videoUrl = URL.createObjectURL(videoBlob);

        // create the video element
        const videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.src = videoUrl;
        videoElement.classList.add('w-full', 'h-400'); // Add Tailwind CSS class for full width
        
        // Append the video element to the story display
        document.getElementById('storyDisplay').appendChild(videoElement);
    } catch (error) {
        console.error('Error:', error);
        // Display error message if request fails
        document.getElementById('storyDisplay').innerHTML = '<p class="error-message">Error fetching story. Please try again later.</p>';
    } finally {
        // Enable the "Generate" button
        document.getElementById('generateButton').disabled = false;
    }
}


// Function to convert Base64 string to typed byte array
function base64ToUint8Array(base64String) {
    const binaryString = window.atob(base64String);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
}

function viewStory(index, stories) {
    // Get the story data based on the index
    var story = stories[index];
    
    // Prepare data to send to the view_story route
    var requestData = {
        image_url: story.title.image_url,
        story_text: story.title.story_text
    };
    
    // Call the view_story route
    fetch('/view_story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Decode the base64 encoded video
        var videoBytes = base64ToUint8Array(data.audio_with_image);

        const videoBlob = new Blob([videoBytes], { type: 'video/mp4' });
        
        // Create a URL for the video blob
        var videoURL = URL.createObjectURL(videoBlob);
        
        // Create a video element
        var videoElement = document.createElement('video');
        videoElement.src = videoURL;
        videoElement.controls = true;
        
        // Append the video element to the story display section
        videoElement.classList.add('w-full', 'h-400'); // Add Tailwind CSS class for full width
        
        // Append the video element to the story display
        document.getElementById('storyDisplay').appendChild(videoElement);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function deleteStory(index) {
    fetch('/delete_story/' + index, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        //reload the page to update the stories array after deletion
        location.reload();
    })
    .catch(error => {
        console.error('There was a problem with the delete operation:', error);
    });
}

// function to search a story
function searchStory() {
    var searchTerm = document.getElementById('searchStory').value.trim().toLowerCase();
    var searchResultsList = document.getElementById('searchResultsList');
    
    // Clear previous search results
    searchResultsList.innerHTML = '';
    
    // If search term is empty, display all stories
    if (!searchTerm) {
        renderStories(stories);
        return;
    }
    
    // Filter stories based on search term
    var filteredStories = stories.filter(story => story.title.toLowerCase().includes(searchTerm));
    
    // Display search results
    if (filteredStories.length > 0) {
        var ul = document.createElement('ul');
        filteredStories.forEach((story, index) => {
            var li = document.createElement('li');
            li.classList.add('mb-4');
            
            var p = document.createElement('p');
            p.textContent = story.title;
            
            var viewButton = document.createElement('button');
            viewButton.textContent = 'View';
            viewButton.classList.add('bg-green-500', 'text-white', 'py-2', 'px-4', 'rounded-lg', 'hover:bg-green-600', 'focus:outline-none', 'focus:bg-green-600');
            viewButton.onclick = function() {
                viewStory(index);
            };
            
            var deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('bg-red-500', 'text-white', 'py-2', 'px-4', 'rounded-lg', 'hover:bg-red-600', 'focus:outline-none', 'focus:bg-red-600');
            deleteButton.onclick = function() {
                deleteStory(index);
            };
            
            li.appendChild(p);
            li.appendChild(viewButton);
            li.appendChild(deleteButton);
            
            ul.appendChild(li);
        });
        searchResultsList.appendChild(ul);
    } else {
        var p = document.createElement('p');
        p.classList.add('text-gray-500');
        p.textContent = 'No matching stories found';
        searchResultsList.appendChild(p);
    }
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

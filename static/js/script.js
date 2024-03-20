
let isRequestInProgress = false;
let isScrollToTopButtonCreated = false;

// Function to toggle loading state for story
function toggleStoryLoadingState() {
    const loadingMessage = document.getElementById('storyLoadingMessage');
    loadingMessage.innerHTML = `        
        <div role="status" class="flex items-center">
            <!-- Loading symbol -->
            <svg aria-hidden="true" class="w-8 h-8 text-blue-600 animate-spin dark:text-gray-600 fill-current mr-2" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>

            <!-- Loading text -->
            <span class="mr-2"> Generating Text...</span>
        </div>
    `;
}

// Function to toggle loading state for video
function toggleVideoLoadingState() {
    const loadingMessage = document.getElementById('videoLoadingMessage');
    loadingMessage.innerHTML = `        
        <div role="status" class="flex items-center">
            <!-- Loading symbol -->
            <svg aria-hidden="true" class="w-8 h-8 text-blue-600 animate-spin dark:text-gray-600 fill-current mr-2" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>

            <!-- Loading text -->
            <span class="mr-2"> Loading Video...</span>
        </div>
    `;
}

// function to handle logout
function logout() {
    clearObjectStore();

    localStorage.clear();
    
    location.reload();
    
    // Perform logout action
    window.location.href = '/logout';
}

// Function to perform request with polling for async tasks
async function performRequestWithPolling(url, requestData, loadingStateFunction) {
    if (isRequestInProgress) return;

    isRequestInProgress = true;

    try {
        loadingStateFunction();
        if(url === '/generate_bedtime_story') {
            toggleVideoLoadingState();
        }

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let responseData = await response.json();

        // Check if the response indicates that the task is asynchronous
        if (responseData.asyncTask) {
            // Poll for the result of the async task
            let result = await pollForResult(responseData.asyncTaskId, url, loadingStateFunction);
            return result;
        }

        return responseData; // Return the response if not an async task
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        isRequestInProgress = false;
    }
}

// Function to poll for the result of an async task
async function pollForResult(taskId, url, loadingStateFunction) {
    const POLL_INTERVAL = 1000; // Polling interval in milliseconds
    let result = null;

    while (true) {
        try {
            let response = await fetch(url + '/' + taskId); // Assuming taskId is used to check task status
            let responseData = await response.json();

            if (response.ok) {
                // Check if the task is completed
                if (responseData.taskCompleted) {
                    result = responseData.result;
                    break; // Exit the loop if task is completed
                }
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle error if necessary
        }

        // Wait for the next polling interval
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    // Task completed, return the result
    return result;
}

// function to generate the story
async function generateStory() {

    const sChildren = document.getElementById('storyTextDisplay').children;
    if(sChildren) {
        clearChildren(sChildren, 'storyLoadingMessage');
    }

    const vChildren = document.getElementById('videoDisplay').children;
    if(vChildren) {
        clearChildren(vChildren, 'videoLoadingMessage');
    }

    const videoElement = document.querySelector('video');
    if (videoElement) {
        videoElement.remove();
    }

    clearObjectStore();

    // Disable the "Generate" button
    document.getElementById('generateButton').disabled = true;

    const title = document.getElementById('storyTitle').value;

    try {

        const data = await performRequestWithPolling('/generate_bedtime_story', { title: title }, toggleStoryLoadingState);

        const storyText = data.story_text;
        const videoBase64 = data.audio_with_image;

        // Split the story text by the "\n\n" delimiter
        const storyParts = storyText.split('\n\n');

        // Extract the title and the rest of the story
        const _title = storyParts[0];
        const restOfStory = storyParts.slice(1).join('\n\n'); // Rejoin the rest of the story

        storeDataInIndexedDB(_title, restOfStory, videoBase64);

        displayStoryText(_title, restOfStory) 

        displayVideo(videoBase64)

        location.reload();
        
    } catch (error) {
        console.error('Error:', error);
        // Display error message if request fails
        document.getElementById('storyTextDisplay').innerHTML = '<p class="error-message">Error fetching story. Please try again later.</p>';
        document.getElementById('videoDisplay').innerHTML = '<p class="error-message">Error fetching story. Please try again later.</p>';
    } finally {
        // Enable the "Generate" button
        document.getElementById('generateButton').disabled = false;
    }
}

// to store the story in the indexDB of the browser
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('storyDatabase', 1);

        request.onerror = function(event) {
            console.error('Failed to open database:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            const store = db.createObjectStore('stories', { keyPath: 'title' });
            store.createIndex('title', 'title', { unique: true });
        };
    });
}

async function storeDataInIndexedDB(title, storyText, videoBase64) {

    localStorage.setItem('currentTitle', (JSON.stringify(title)));

    // clear the ind db before storing data in it
    clearObjectStore();

    // Open IndexedDB database
    const db = await openDatabase();

    // Start a transaction
    const tx = db.transaction(['stories'], 'readwrite');

    // Access the object store
    const store = tx.objectStore('stories');

    // Create a data object
    const data = { title, storyText, videoBase64 };

    // Add or update the data in the object store
    const request = store.put(data);

    // Handle success and error callbacks
    request.onsuccess = function(event) {
        console.log('Data stored successfully');
    };

    request.onerror = function(event) {
        console.error('Error storing data:', event.target.error);
    };

}

// retrieve data from indb
async function retrieveDataFromIndexedDB(title) {
    // Open IndexedDB database
    const db = await openDatabase();

    // Start a transaction
    const tx = db.transaction(['stories'], 'readonly');

    // Access the object store
    const store = tx.objectStore('stories');

    // Get the data by primary key (title)
    const request = store.get(title);

    // Handle success and error callbacks
    request.onsuccess = function(event) {
        // Retrieve the data from the result
        const data = event.target.result;

        if (data) {
            // Extract title, story text, and video Base64 bytes
            const title = data.title;
            const storyText = data.storyText;
            const videoBase64 = data.videoBase64;

            displayStoryText(title, storyText);

            displayVideo(videoBase64);
        } else {
            console.log('No data found for the specified title.');
        }
    };

    request.onerror = function(event) {
        console.error('Error retrieving data:', event.target.error);
    };

    // Complete the transaction
    await tx.complete;
}

async function clearObjectStore() {
    const db = await openDatabase();
    
    // Start a transaction with readwrite mode
    const tx = db.transaction(['stories'], 'readwrite');
    
    // Access the object store
    const store = tx.objectStore('stories');
    
    // Clear the object store
    await store.clear();

    // Complete the transaction
    await tx.complete;
    
    console.log('Object store "stories" cleared successfully.');
}



// clear the content of child elements of a particular element
function clearChildren(children, id) {
    // Loop through each child element
    for (let i = 0; i < children.length; i++) {
        // Check if the child element is not the videoLoadingMessage element
        if (children[i].id !== id) {
            // Set the innerHTML of the child element to an empty string
            children[i].innerHTML = '';
        }
    }
}

// display text
function displayStoryText(_title, restOfStory) {
    // Create story display HTML
    const storyDisplayHTML = `
    <p><strong>${_title}</strong></p>
    <p>${restOfStory}</p>
    <hr class="my-4 border-gray-300">
    `;

    document.getElementById('storyLoadingMessage').textContent = '';

    // Append the story HTML to the existing content
    document.getElementById('storyTextDisplay').innerHTML += storyDisplayHTML;
}

//display video
function displayVideo(videoBase64) {
    const vChildren = document.getElementById('videoDisplay').children;
    if(vChildren) {
        clearChildren(vChildren, 'videoLoadingMessage');
    }
    // Convert Base64 string to typed byte array
    const videoBytes = base64ToUint8Array(videoBase64);

    // create a blob from the decoded video bytes
    const videoBlob = new Blob([videoBytes], { type: 'video/mp4' });

    // create the video object url
    const videoUrl = URL.createObjectURL(videoBlob);

    // create the video element
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;

    // event listener to ensure styles are applied after video is loaded
    videoElement.addEventListener('loadedmetadata', function() {
        videoElement.controls = true;
        videoElement.classList.add('w-full', 'max-h-400'); 

        // Create and append the heading element
        const heading = document.createElement('h2');
        heading.textContent = 'Listen!';
        document.getElementById('videoDisplay').appendChild(heading);

        document.getElementById('videoLoadingMessage').textContent = '';

        videoElement.style.height = '500px';

        // Append the video element to the video display
        document.getElementById('videoDisplay').appendChild(videoElement);
    });

    // Append the video element to the video display
    document.getElementById('videoDisplay')
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

// function to generate a video of an existing story
async function viewStory(story) {
    try {
        // Prepare data to send to the view_story route
        var requestData = {
            title: story.title,
            story_text: story.story_text
        };

        const sChildren = document.getElementById('storyTextDisplay').children;
        if(sChildren) {
            clearChildren(sChildren, 'storyLoadingMessage');
        }

        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.remove();
        }

        displayStoryText(story.title, story.story_text);

        toggleVideoLoadingState();
        
        // Set a timeout for 2 minutes
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout exceeded'));
            }, 180000); // 3 minutes
        });

        // Call the view_story route with timeout
        const dataPromise = performRequestWithPolling('/view_story', requestData, toggleVideoLoadingState);
        
        // Wait for either the data or the timeout
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        if(data) {
            displayVideo(data.audio_with_image);

            storeDataInIndexedDB(story.title, story.story_text, data.audio_with_image);

            location.reload();
        } else {
            document.getElementById('videoDisplay').appendChild('<p class="error-message">Error loading video.</p>');
            throw new Error('Timeout exceeded');
        }
        
    } catch(error) {
        document.getElementById('videoDisplay').innerHTML = '<p class="error-message">Error loading video.</p>';
        console.log(error)
    }
}

// delete a story
function deleteStory(story, index) {
    if(isRequestInProgress) {
        return;
    }

    // confirmation before proceeding with deletion
    const confirmed = window.confirm('Are you sure you want to delete this story?');
    if (!confirmed) {
        isRequestInProgress = false;
        return; 
    }

    if(JSON.parse(localStorage.getItem('currentTitle')) === story.title) {
        clearObjectStore();
        localStorage.clear();
    }

    isRequestInProgress = true;

    fetch('/delete_story/' + index, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            isRequestInProgress = false;
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        //reload the page to update the stories array after deletion
        isRequestInProgress = false;
        location.reload();
    })
    .catch(error => {
        console.error('There was a problem with the delete operation:', error);
        isRequestInProgress = false;
    });
}

// Function to display the "Listen" button
function displayListenButton() {
    const videoDisplay = document.getElementById('videoDisplay');
    const videoElement = videoDisplay.querySelector('video');

    if (videoElement) {
        // If a video element exists, create the "Listen" button
        const listenButton = document.createElement('button');
        listenButton.textContent = 'Listen';
        listenButton.onclick = scrollToVideo;
        listenButton.classList.add('bg-blue-500', 'text-white', 'py-2', 'px-4', 'rounded-lg', 'md:ml-2', 'mt-2', 'md:mt-0', 'hover:bg-blue-600', 'focus:outline-none', 'focus:bg-blue-600');

        // Append the button next to the "Generate" button
        const generateButton = document.getElementById('generateButton');
        generateButton.parentNode.insertBefore(listenButton, generateButton.nextSibling);
    }
}

// Function to scroll to the video display section
function scrollToVideo() {
    const videoDisplay = document.getElementById('videoDisplay');
    videoDisplay.scrollIntoView({ behavior: 'smooth' });
}

// Create a new observer
const observer = new MutationObserver(function(mutationsList, observer) {
    // Check if a new node is added to the videoDisplay div
    const videoDisplay = document.getElementById('videoDisplay');
    const videoElement = videoDisplay.querySelector('video');
    if (videoElement) {
        // If a video element is added, display the "Listen" button
        displayListenButton();
    }
});

// Observe changes to the videoDisplay div
observer.observe(document.getElementById('videoDisplay'), { childList: true });

// Function to create and append the "Scroll to Top" button
function createScrollToTopButton() {
    if (!isScrollToTopButtonCreated) {
        const scrollToTopButton = document.createElement('button');
        scrollToTopButton.textContent = 'Back to Top';
        scrollToTopButton.onclick = scrollToTop;
        scrollToTopButton.classList.add(
            'fixed',
            'bottom-4', 
            'right-4',
            'bg-blue-500',
            'text-white',
            'rounded-lg',
            'hover:bg-blue-600',
            'focus:outline-none',
            'focus:bg-blue-600',
            'z-10',
            'w-auto'
        );
        document.body.appendChild(scrollToTopButton);
        isScrollToTopButtonCreated = true;
    }
}

// Function to scroll to the top of the page
function scrollToTop() {
    if (document.body.scrollTop !== 0 || document.documentElement.scrollTop !== 0) {
        window.scrollBy(0, -50);
        requestAnimationFrame(scrollToTop);
    }
}

// Function to remove the "Scroll to Top" button
function removeScrollToTopButton() {
    const scrollToTopButton = document.getElementById('scrollToTopButton');
    if (scrollToTopButton) {
        scrollToTopButton.remove();
        isScrollToTopButtonCreated = false;
    }
}

// Event listener for scrolling
window.addEventListener('scroll', function() {
    const scrollPositionFromBottom = document.body.offsetHeight - (window.innerHeight + window.scrollY);
    if (scrollPositionFromBottom <= 30) {
        // If the user has scrolled up to approximately 30px from the bottom, create and append the "Scroll to Top" button
        createScrollToTopButton();
    } else {
        // If the user is not scrolled up to approximately 30px from the bottom, remove the "Scroll to Top" button
        removeScrollToTopButton();
    }
});
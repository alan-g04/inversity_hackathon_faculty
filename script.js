// Async function to search for a topic and generate flashcards based on it
async function searchTopic() {
    // Retrieve the value of the input field with id 'topicInput'
    const topicInput = document.getElementById('topicInput').value;
    
    // Check if input is empty; alert the user and exit if so
    if (!topicInput) {
        alert("Please enter a topic.");
        return;
    }

    // Get the container for displaying flashcards and clear any existing content
    const flashcardsContainer = document.getElementById('flashcardsContainer');
    flashcardsContainer.innerHTML = '';

    // API endpoint and API key to access the OpenAI model
    const endpoint = 'https://educationhackathon.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview';
    const apiKey = "F4t6ZhKWbThgotYQuaNURBVcJsDcqL4xkebqwPiVrVHw3s8d7dTjJQQJ99AKACfhMk5XJ3w3AAABACOGoNkI";

    // Define the request body for generating flashcards based on the input topic
    const requestBody = {
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: `Generate 5 flashcards for learning ${topicInput}. Each card should have:
                          1. A question with explanation on how to solve it (on the front).
                          2. The final answer on the back.
                          
                          Each flashcard should be on a new line, generate 5 questions and f_answers`
            }
        ],
        max_tokens: 150, // Limit on response length
        temperature: 0.7 // Controls response randomness
    };

    try {
        // Send a POST request to the OpenAI endpoint with the request body
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(requestBody)
        });

        // Throw an error if response is not ok
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Check if the response includes valid flashcard content
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            // Split the response into separate flashcards
            const flashcardsData = data.choices[0].message.content.trim().split("\n\n");

            // Loop through each flashcard (up to 5) and format its content
            flashcardsData.slice(0, 5).forEach((card, index) => {
                // Separate question with explanation and answer
                const [questionAndExplanation, answer] = card.split("Answer: ");
                
                // Skip invalid flashcards
                if (!questionAndExplanation || !answer) {
                    console.log(`Skipping invalid card at index ${index}`);
                    return;
                }

                // Create a flashcard element with front and back sides
                const flashcard = document.createElement('div');
                flashcard.classList.add('flashcard');

                // Create front side with question and explanation
                const front = document.createElement('div');
                front.classList.add('front');
                front.innerHTML = `<p><strong>Q${index + 1}:</strong> ${questionAndExplanation.trim()}</p>`;

                // Create back side with answer
                const back = document.createElement('div');
                back.classList.add('back');
                back.innerHTML = `<p><strong>Answer:</strong> ${answer.trim()}</p>`;

                // Append front and back to the flashcard
                flashcard.appendChild(front);
                flashcard.appendChild(back);

                // Add the flashcard to the container
                flashcardsContainer.appendChild(flashcard);

                // Add click event for flipping the flashcard
                flashcard.addEventListener('click', () => {
                    flashcard.classList.toggle('flipped');
                });
            });
        } else {
            // Display a message if API response has no valid content
            flashcardsContainer.innerHTML = "<p>No content returned from the API.</p>";
        }
    } catch (error) {
        // Display an error message if the fetch request fails
        flashcardsContainer.innerHTML = "<p>Failed to generate flashcards. Please try again later.</p>";
    }
}


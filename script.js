// DOM Elements
const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('input-field');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const timeElement = document.getElementById('time');
const difficultySelect = document.getElementById('difficulty');
const timeSelect = document.getElementById('time-select');
const themeToggle = document.getElementById('theme-toggle');
const resultModal = document.getElementById('result-modal');
const closeModal = document.getElementById('close-modal');
const tryAgainBtn = document.getElementById('try-again-btn');
const shareBtn = document.getElementById('share-btn');
const resultWpm = document.getElementById('result-wpm');
const resultAccuracy = document.getElementById('result-accuracy');
const resultTime = document.getElementById('result-time');
const resultAnalysis = document.getElementById('result-analysis');
const toggleAssistant = document.getElementById('toggle-assistant');
const assistantContent = document.querySelector('.assistant-content');
const assistantInput = document.getElementById('assistant-input-field');
const sendMessageBtn = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');

// Sample texts for different difficulty levels
const sampleTexts = {
    easy: [
        "The quick brown fox jumps over the lazy dog. Simple sentences like this one are great for typing practice.",
        "Learning to type quickly can save you time and increase your productivity at work or school.",
        "Typing without looking at the keyboard is called touch typing. It's a skill that takes practice to master."
    ],
    medium: [
        "The acquisition of new skills requires dedication and consistent practice. Typing is no exception to this rule, and regular practice sessions are essential for improvement.",
        "Artificial intelligence has revolutionized many industries, from healthcare to transportation. The ethical implications of these technologies continue to be debated.",
        "Effective communication is a cornerstone of successful relationships, both personal and professional. Clear writing is an extension of clear thinking."
    ],
    hard: [
        "The juxtaposition of quantum mechanics with general relativity presents one of the most perplexing contradictions in modern physics; reconciling these theories has occupied many brilliant minds for decades.",
        "Cryptocurrency enthusiasts argue that blockchain technology represents a paradigm shift in how financial transactions are verified and recorded, eliminating the need for centralized authorities.",
        "The anthropocene epoch is characterized by significant human impact on Earth's geology and ecosystems, including but not limited to anthropogenic climate change and biodiversity loss."
    ],
    literature: [
        // Classic Novels
        "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters. My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last? - Pride and Prejudice (Jane Austen)",
        "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses... - Moby Dick (Herman Melville)",
        "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had. He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. - The Great Gatsby(F. Scott Fitzgerald)",

    ]
};

// Add more literature samples
function addMoreLiterature() {
    sampleTexts.literature.push(
        "It was the best of times, it was the worst of times... - A Tale of Two Cities (Charles Dickens)",
        "You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer... - Adventures of Huckleberry Finn (Mark Twain)",
        "There was a boy called Eustace Clarence Scrubb, and he almost deserved it. - The Voyage of the Dawn Treader (C.S. Lewis)"
    );
}
addMoreLiterature();


// Global variables
let currentText = '';
let startTime;
let timer;
let testActive = false;
let charIndex = 0;
let mistakes = 0;
let testTimeInSeconds = parseInt(timeSelect.value);
let testInProgress = false;
let wordHistory = [];
let typingData = [];
let performanceChart = null;

// Initialize the app
function init() {
    // Set up event listeners
    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    themeToggle.addEventListener('click', toggleTheme);
    closeModal.addEventListener('click', closeResultModal);
    tryAgainBtn.addEventListener('click', closeResultModal);
    shareBtn.addEventListener('click', shareResults);
    toggleAssistant.addEventListener('click', toggleAssistantPanel);
    sendMessageBtn.addEventListener('click', sendMessage);
    assistantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    timeSelect.addEventListener('change', () => {
        testTimeInSeconds = parseInt(timeSelect.value);
        timeElement.textContent = testTimeInSeconds;
    });
    
    difficultySelect.addEventListener('change', () => {
        if (!testInProgress) {
            loadRandomText();
        }
    });

    // Load initial text
    loadRandomText();
    
    // Check for stored theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Disable input field initially
    inputField.disabled = true;
}

// Load a random text based on difficulty
function loadRandomText() {
    const difficulty = difficultySelect.value;
    const texts = sampleTexts[difficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);
    currentText = texts[randomIndex];
    
    displayText();
}

// Display text in the text display area
function displayText() {
    textDisplay.innerHTML = '';
    
    // Split the text into spans for each character
    currentText.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        textDisplay.appendChild(charSpan);
    });
    
    // Highlight the first character
    if (textDisplay.firstChild) {
        textDisplay.firstChild.classList.add('active');
    }
}

// Start the typing test
function startTest() {
    if (testInProgress) return;
    
    resetTest();
    testInProgress = true;
    inputField.disabled = false;
    inputField.focus();
    
    startTime = new Date();
    
    // Set up the timer
    timer = setInterval(() => {
        const timeElapsed = Math.floor((new Date() - startTime) / 1000);
        const timeRemaining = testTimeInSeconds - timeElapsed;
        
        if (timeRemaining <= 0) {
            endTest();
        } else {
            timeElement.textContent = timeRemaining;
        }
        
        // Calculate and update WPM every second
        updateStats();
        
        // Record data for chart
        if (timeElapsed % 5 === 0) { // Record every 5 seconds
            typingData.push({
                time: timeElapsed,
                wpm: calculateWPM(timeElapsed)
            });
        }
    }, 1000);
    
    // Set up input field event listener
    inputField.addEventListener('input', handleTyping);
    
    // Change button state
    startBtn.disabled = true;
    startBtn.classList.add('secondary-btn');
    startBtn.classList.remove('primary-btn');
}

// Handle the typing input
function handleTyping() {
    if (!testInProgress) return;
    
    const inputText = inputField.value;
    const currentChar = inputText.length - 1;
    
    // Check if the typed character matches the expected character
    if (currentChar >= 0) {
        const chars = textDisplay.querySelectorAll('span');
        
        if (currentChar < chars.length) {
            // Remove active class from previous character
            if (currentChar > 0) {
                chars[currentChar - 1].classList.remove('active');
            }
            
            // Add active class to current character
            chars[currentChar].classList.add('active');
            
            // Check if character is correct
            if (inputText[currentChar] === currentText[currentChar]) {
                chars[currentChar].classList.add('correct');
                chars[currentChar].classList.remove('incorrect');
            } else {
                chars[currentChar].classList.add('incorrect');
                chars[currentChar].classList.remove('correct');
                mistakes++;
            }
            
            // Check if test is completed
            if (currentChar === currentText.length - 1) {
                endTest();
            }
        }
    }
    
    // Update stats
    updateStats();
}

// Update WPM and accuracy stats
function updateStats() {
    if (!testInProgress) return;
    
    const timeElapsed = Math.max(1, Math.floor((new Date() - startTime) / 1000));
    const wpm = calculateWPM(timeElapsed);
    
    wpmElement.textContent = wpm;
    
    // Calculate accuracy
    const typedCharacters = inputField.value.length;
    const accuracy = Math.max(0, Math.floor(((typedCharacters - mistakes) / typedCharacters) * 100)) || 100;
    accuracyElement.textContent = `${accuracy}%`;
}

// Calculate words per minute
function calculateWPM(timeElapsedInSeconds) {
    const typedCharacters = inputField.value.length;
    const words = typedCharacters / 5; // Standard: 5 characters = 1 word
    const minutes = timeElapsedInSeconds / 60;
    return Math.floor(words / minutes) || 0;
}

// End the typing test
function endTest() {
    clearInterval(timer);
    inputField.disabled = true;
    inputField.removeEventListener('input', handleTyping);
    testInProgress = false;
    
    // Reset button state
    startBtn.disabled = false;
    startBtn.classList.remove('secondary-btn');
    startBtn.classList.add('primary-btn');
    
    // Show results
    showResults();
}

// Reset the typing test
function resetTest() {
    clearInterval(timer);
    inputField.value = '';
    inputField.disabled = true;
    timeElement.textContent = testTimeInSeconds;
    wpmElement.textContent = '0';
    accuracyElement.textContent = '100%';
    charIndex = 0;
    mistakes = 0;
    testInProgress = false;
    typingData = [];
    
    // Reset button state
    startBtn.disabled = false;
    startBtn.classList.remove('secondary-btn');
    startBtn.classList.add('primary-btn');
    
    // Load a new text
    loadRandomText();
}

// Show the results modal
function showResults() {
    const timeElapsed = Math.floor((new Date() - startTime) / 1000);
    const wpm = calculateWPM(timeElapsed);
    const typedCharacters = inputField.value.length;
    const accuracy = Math.max(0, Math.floor(((typedCharacters - mistakes) / typedCharacters) * 100)) || 100;
    
    resultWpm.textContent = wpm;
    resultAccuracy.textContent = `${accuracy}%`;
    resultTime.textContent = `${timeElapsed}s`;
    
    // Generate analysis
    resultAnalysis.textContent = generateAnalysis(wpm, accuracy);
    
    // Create performance chart
    createPerformanceChart();
    
    // Show modal
    resultModal.classList.add('show');
    
    // Ask AI assistant for feedback
    if (typedCharacters > 10) {
        generateAIFeedback(wpm, accuracy, typedCharacters, mistakes);
    }
}

// Generate analysis text based on performance
function generateAnalysis(wpm, accuracy) {
    let analysis = '';
    
    if (wpm < 30) {
        analysis = 'You\'re just getting started! Regular practice will help improve your speed.';
    } else if (wpm < 50) {
        analysis = 'You have a decent typing speed. Keep practicing to get even faster!';
    } else if (wpm < 70) {
        analysis = 'Great job! Your typing speed is above average.';
    } else if (wpm < 90) {
        analysis = 'Excellent! You\'re a fast typist.';
    } else {
        analysis = 'Wow! Your typing speed is outstanding. You\'re in the top percentile of typists!';
    }
    
    if (accuracy < 90) {
        analysis += ' Focus on accuracy to improve your overall performance.';
    } else {
        analysis += ' Your accuracy is impressive!';
    }
    
    return analysis;
}

// Create a performance chart
function createPerformanceChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    // Add final data point
    const timeElapsed = Math.floor((new Date() - startTime) / 1000);
    typingData.push({
        time: timeElapsed,
        wpm: calculateWPM(timeElapsed)
    });
    
    // Create new chart
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: typingData.map(data => `${data.time}s`),
            datasets: [{
                label: 'WPM',
                data: typingData.map(data => data.wpm),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Words Per Minute'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Elapsed'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            return `Time: ${items[0].label}`;
                        },
                        label: (item) => {
                            return `WPM: ${item.raw}`;
                        }
                    }
                }
            }
        }
    });
    }
    
    // Close the results modal
    function closeResultModal() {
        resultModal.classList.remove('show');
    }
    
    // Share results (placeholder function)
    function shareResults() {
        const wpm = resultWpm.textContent;
        const accuracy = resultAccuracy.textContent;
        const shareText = `I just scored ${wpm} WPM with ${accuracy} accuracy on TypeMaster typing test! Can you beat my score?`;
        
        // In a real app, you would implement actual sharing functionality
        alert('Share feature would post this message: ' + shareText);
    }
    
    // Toggle dark/light theme
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('darkMode', 'true');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', 'false');
        }
        
        // Update chart colors if it exists
        if (performanceChart) {
            createPerformanceChart();
            
        }
    }
    
    // Toggle AI assistant panel
    function toggleAssistantPanel() {
        assistantContent.classList.toggle('hidden');
        
        if (assistantContent.classList.contains('hidden')) {
            toggleAssistant.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            toggleAssistant.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    }
    
    // Send message to AI assistant
    function sendMessage() {
        const message = assistantInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessageToChat(message, 'user');
        
        // Clear input
        assistantInput.value = '';
        
        // Get AI response
        getAIResponse(message);
    }
    // Typing Assistant - Enhanced Version

// Store conversation history for more contextual responses
const conversationHistory = [];
const MAX_HISTORY_LENGTH = 10;

// Store user typing metrics for better analysis
let userMetrics = {
    averageWPM: 0,
    averageAccuracy: 0,
    testsTaken: 0,
    commonMistakes: {},
    improvement: { wpm: [], accuracy: [] }
};

// Send message to AI assistant
function sendMessage() {
    const message = assistantInput.value.trim();
    if (!message) return;
    
    // Add user message to chat and history
    addMessageToChat(message, 'user');
    conversationHistory.push({ role: 'user', content: message });
    
    // Trim history if needed
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
        conversationHistory.shift();
    }
    
    // Clear input and focus for next message
    assistantInput.value = '';
    assistantInput.focus();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get AI response
    getAIResponse(message);
}

// Show typing indicator to improve UX
function showTypingIndicator() {
    const indicatorElement = document.createElement('div');
    indicatorElement.classList.add('message', 'assistant', 'typing-indicator');
    
    const bubbleElement = document.createElement('div');
    bubbleElement.classList.add('message-bubble');
    bubbleElement.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    
    indicatorElement.appendChild(bubbleElement);
    chatMessages.appendChild(indicatorElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator when response is ready
function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Add message to chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    const bubbleElement = document.createElement('div');
    bubbleElement.classList.add('message-bubble');
    
    // Process markdown-like formatting in messages
    const formattedMessage = formatMessage(message);
    bubbleElement.innerHTML = formattedMessage;
    
    messageElement.appendChild(bubbleElement);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simple markdown-like formatting for messages
function formatMessage(message) {
    // Convert line breaks to <br>
    let formatted = message.replace(/\n/g, '<br>');
    
    // Bold text between asterisks
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text between single asterisks
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists with bullets
    formatted = formatted.replace(/• (.*?)(?=<br>|$)/g, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    
    // Convert numbered lists
    formatted = formatted.replace(/(\d+)\. (.*?)(?=<br>|$)/g, '<li>$2</li>');
    formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ol>$&</ol>');
    
    // Handle emojis to make sure they display properly
    formatted = formatted.replace(/(🖐️|👍|🔤|🔄|🔢|📚|👩‍💻|🤔|⏱️|✂️|📋|📌|↩️|↪️|💾|🔍)/g, '<span class="emoji">$1</span>');
    
    return formatted;
}

// Get AI response based on user message and conversation history
function getAIResponse(message) {
    // In a real app, this would be an API call to an AI service
    // For the prototype, we'll use predefined responses with improved context awareness
    
    setTimeout(() => {
        removeTypingIndicator();
        
        let response = '';
        const lowercaseMessage = message.toLowerCase();
        const context = analyzeConversationContext();
        
        // More comprehensive response mapping with context awareness
        if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
            if (context.returning) {
                response = "Welcome back! How has your typing practice been going? Would you like to continue where we left off discussing " + context.lastTopic + "?";
            } else {
                response = "Hello there! I'm your typing assistant. I can help with typing techniques, speed improvement, ergonomics, keyboard recommendations, or practice suggestions. What would you like to know?";
            }
        } 
        else if (lowercaseMessage.includes('improve') || lowercaseMessage.includes('better') || lowercaseMessage.includes('faster')) {
            if (lowercaseMessage.includes('speed')) {
                response = "To improve your typing speed:\n\n1. **Practice consistently** (15-20 minutes daily is better than 2 hours once a week)\n2. Focus on accuracy first - speed will follow\n3. Use proper finger positioning (home row technique)\n4. Challenge yourself with gradually more difficult texts\n5. Try rhythm typing - typing to music can help develop consistent pace\n6. Use typing games that increase speed requirements as you improve\n7. Learn common words and practice typing frequently used phrases in your field";
                
                if (userMetrics.testsTaken > 0) {
                    response += "\n\nBased on your previous tests (average " + userMetrics.averageWPM + " WPM), I'd recommend focusing on " + getPersonalizedSpeedAdvice();
                }
            } else if (lowercaseMessage.includes('accuracy')) {
                response = "To improve typing accuracy:\n\n1. **Slow down** - accuracy before speed\n2. Focus on maintaining proper finger positioning\n3. Practice problem characters that you frequently mistype\n4. Don't look at the keyboard (cover your hands if needed)\n5. Take breaks to prevent fatigue-related mistakes\n6. Practice with texts that contain challenging letter combinations\n7. Pay attention to your error patterns and create specific exercises to address them";
                
                if (Object.keys(userMetrics.commonMistakes).length > 0) {
                    response += "\n\nI've noticed you frequently have trouble with these characters: " + getCommonMistakesList() + ". Try creating practice sequences focusing on these.";
                }
            } else {
                response = "To improve your overall typing:\n\n1. Practice regularly with proper technique\n2. Start with accuracy, then build speed\n3. Learn touch typing if you haven't already\n4. Use online typing tests to track progress\n5. Practice with various types of content (code, literature, business writing)\n6. Consider ergonomics - proper chair height, desk position, and wrist support\n7. Take breaks and do finger/wrist stretches";
            }
        }
        else if (lowercaseMessage.includes('finger') || lowercaseMessage.includes('hand position') || lowercaseMessage.includes('posture')) {
            response = "Proper typing position is crucial:\n\n🖐️ Left hand fingers on A (pinky), S (ring), D (middle), F (index)\n🖐️ Right hand fingers on J (index), K (middle), L (ring), ; (pinky)\n👍 Thumbs rest on the space bar\n\nFingers should curve slightly and hover over the keys. Your wrists should float just above the keyboard, not resting on the desk. Keep your back straight and elbows at roughly 90-degree angles. The top of your monitor should be at eye level.";
            
            // Add information about ergonomic keyboards if user has mentioned pain previously
            if (context.mentions.includes('pain') || context.mentions.includes('strain')) {
                response += "\n\nSince you mentioned discomfort earlier, you might want to consider an ergonomic keyboard that allows for a more natural hand position.";
            }
        }
        else if (lowercaseMessage.includes('average') || lowercaseMessage.includes('normal') || lowercaseMessage.includes('typical') || lowercaseMessage.includes('wpm')) {
            response = "Typing speed benchmarks:\n\n• 0-30 WPM: Below average\n• 30-40 WPM: Average for casual typists\n• 40-60 WPM: Above average\n• 60-80 WPM: Fast/professional level\n• 80-100 WPM: Excellent\n• 100+ WPM: Elite/professional typist\n\nThe global average is around 40 WPM with approximately 92% accuracy. Professional jobs requiring typing skills often expect 50-70 WPM. Court reporters and transcriptionists can reach 200+ WPM using specialized stenotype machines.";
            
            if (userMetrics.testsTaken > 0) {
                response += "\n\nYour current average is " + userMetrics.averageWPM + " WPM with " + userMetrics.averageAccuracy + "% accuracy, which puts you in the " + getSpeedCategory(userMetrics.averageWPM) + " category.";
            }
        }
        else if (lowercaseMessage.includes('exercise') || lowercaseMessage.includes('practice') || lowercaseMessage.includes('drill')) {
            response = "Effective typing exercises:\n\n1. 🔤 Alphabet drills: Type the alphabet forward, backward, or in patterns\n2. 🔄 Repeated letter sequences: Practice transitions like 'asdf jkl;' or 'qwer uiop'\n3. 🔢 Number and symbol practice: Focus on the top row characters\n4. 📚 Pangrams: Sentences using all letters like 'The quick brown fox...'\n5. 👩‍💻 Code snippets: For programming-specific typing practice\n6. 🤔 Blind typing: Cover your hands or turn off your monitor\n7. ⏱️ Speed bursts: Type as fast as possible for 30 seconds, rest, repeat\n\nConsistency is more important than duration - 15 minutes daily beats 2 hours once a week.";
            
            // Personalize exercises based on user's context
            if (context.mentions.includes('code') || context.mentions.includes('programming')) {
                response += "\n\nSince you're interested in coding, try practicing with actual code snippets in your preferred language. Focus on typing symbols like {}, [], and special operators that are common in programming.";
            }
        }
        else if (lowercaseMessage.includes('keyboard') || lowercaseMessage.includes('mechanical') || lowercaseMessage.includes('equipment')) {
            response = "Keyboard recommendations:\n\n• Mechanical keyboards offer better tactile feedback and durability (Cherry MX Brown switches are popular for typing)\n• Ergonomic keyboards can reduce strain during long typing sessions\n• Full-size keyboards are best for learning, but compact keyboards are fine once you're comfortable\n• Consider split keyboards if you experience wrist strain\n• For serious typing, keyboards with n-key rollover prevent missed keystrokes\n\nThe best keyboard is one that feels comfortable for your specific hands and typing style. If possible, try before buying.";
            
            // Add personalized recommendation based on previous mentions
            if (context.mentions.includes('programming') || context.mentions.includes('code')) {
                response += "\n\nFor programmers, keyboards with programmable macros and good access to special characters can boost productivity. Many developers prefer mechanical keyboards with tactile feedback.";
            } else if (context.mentions.includes('pain') || context.mentions.includes('strain')) {
                response += "\n\nGiven your concerns about discomfort, I'd strongly recommend looking into ergonomic options like the Microsoft Sculpt, Logitech Ergo K860, or Kinesis Advantage2.";
            }
        }
        else if (lowercaseMessage.includes('thank')) {
            response = "You're welcome! I'm here to help with your typing journey. Remember that consistent practice is key to improvement. Don't hesitate to ask if you have more questions about typing techniques, ergonomics, or practice strategies.";
            
            if (userMetrics.testsTaken > 0) {
                response += "\n\nBased on your progress so far, you're making good improvements in your typing skills. Keep it up!";
            }
        }
        else if (lowercaseMessage.includes('ergonomic') || lowercaseMessage.includes('pain') || lowercaseMessage.includes('hurt') || lowercaseMessage.includes('strain')) {
            response = "Ergonomics are crucial for preventing strain injuries:\n\n1. Keep wrists straight, not bent up/down/sideways\n2. Position your keyboard so elbows form 90° angles\n3. Sit with back straight, feet flat on floor\n4. Monitor should be at eye level\n5. Take 5-minute breaks every 30 minutes\n6. Do hand stretches regularly\n7. Consider ergonomic keyboards, wrist rests, and adjustable chairs\n\nIf you're experiencing persistent pain, please consult a healthcare professional - typing shouldn't hurt!";
            
            // Add additional stretching exercises
            response += "\n\nTry these quick exercises during breaks:\n• Extend your fingers wide, then make a fist (repeat 10x)\n• Gently rotate your wrists in circles both directions\n• Squeeze a stress ball for 5-10 seconds, then release";
        }
        else if (lowercaseMessage.includes('code') || lowercaseMessage.includes('programming') || lowercaseMessage.includes('developer')) {
            response = "Typing tips for programmers:\n\n1. Learn language-specific touch typing (symbols and special characters)\n2. Practice with actual code, not just regular text\n3. Learn keyboard shortcuts for your IDE/editor\n4. Consider programmer-friendly keyboards (mechanical with proper function key access)\n5. Practice typing common syntax patterns in your languages\n6. For programming, accuracy is even more important than speed\n7. Terminal/command line practice is valuable for developers\n\nMany programmers find that Dvorak or Colemak keyboard layouts improve their coding speed after the initial learning curve.";
            
            // Ask follow-up about programming languages
            if (!context.mentions.includes('python') && !context.mentions.includes('javascript') && !context.mentions.includes('java') && !context.mentions.includes('c++')) {
                response += "\n\nWhat programming languages do you primarily work with? I can suggest language-specific typing exercises.";
            } else {
                const language = getProgrammingLanguage(context.mentions);
                response += "\n\nSince you work with " + language + ", try creating practice exercises with common " + language + " syntax patterns like " + getLanguageExamples(language);
            }
        }
        else if (lowercaseMessage.includes('layout') || lowercaseMessage.includes('qwerty') || lowercaseMessage.includes('dvorak') || lowercaseMessage.includes('colemak')) {
            response = "Keyboard layout comparison:\n\n• QWERTY: Standard layout, most common but not optimized for typing efficiency\n• Dvorak: Designed for efficiency, common letters on home row, reduces finger movement\n• Colemak: Modern alternative, easier transition from QWERTY than Dvorak\n• Workman: Focuses on reducing lateral finger movements\n\nChanging layouts has a steep learning curve (2-4 weeks of decreased productivity) but can reduce finger travel by 30-50%. For most casual typists, becoming proficient in QWERTY is more practical than switching.";
            
            // Add personalized advice based on user's typing speed
            if (userMetrics.averageWPM > 70) {
                response += "\n\nWith your already advanced typing speed, exploring alternative layouts might offer you meaningful improvements. Colemak is often recommended as it's easier to transition to from QWERTY.";
            } else if (userMetrics.averageWPM > 0) {
                response += "\n\nAt your current speed level, I'd recommend focusing on improving QWERTY proficiency before considering alternative layouts.";
            }
        }
        else if (lowercaseMessage.includes('game') || lowercaseMessage.includes('fun') || lowercaseMessage.includes('enjoy')) {
            response = "Fun ways to improve typing:\n\n1. TypeRacer - Race against others in real-time\n2. Nitro Type - Car racing typing game\n3. ZType - Shoot down enemies by typing words\n4. Typing of the Dead - Zombie-themed typing game\n5. Epistory - Adventure game controlled entirely by typing\n6. KeyBr - Competitive typing with statistics\n7. 10FastFingers - Popular testing and competition site\n\nGamification can make practice more enjoyable and consistent. Find what motivates you - competition, progress tracking, or just the satisfaction of improvement!";
            
            // Personalize game recommendations
            if (userMetrics.averageWPM > 60) {
                response += "\n\nWith your advanced speed, you might enjoy competitive sites like Monkeytype or TypeRacer where you can race against others of similar skill.";
            } else if (userMetrics.averageWPM > 0 && userMetrics.averageWPM < 40) {
                response += "\n\nAt your current speed level, games like ZType and KeyBr would be perfect for building skills while having fun.";
            }
        }
        else if (lowercaseMessage.includes('shortcut') || lowercaseMessage.includes('hotkey')) {
            response = "Essential keyboard shortcuts to practice:\n\n✂️ Cut: Ctrl+X (⌘+X on Mac)\n📋 Copy: Ctrl+C (⌘+C)\n📌 Paste: Ctrl+V (⌘+V)\n↩️ Undo: Ctrl+Z (⌘+Z)\n↪️ Redo: Ctrl+Y or Ctrl+Shift+Z (⌘+Shift+Z)\n💾 Save: Ctrl+S (⌘+S)\n🔍 Find: Ctrl+F (⌘+F)\n\nLearning shortcuts can significantly boost your productivity beyond raw typing speed. Consider learning application-specific shortcuts for programs you use daily.";
            
            // Add program-specific shortcuts based on context
            if (context.mentions.includes('code') || context.mentions.includes('programming')) {
                response += "\n\n**Developer IDE Shortcuts:**\n• Comment/Uncomment: Ctrl+/ (⌘+/ on Mac)\n• Duplicate line: Ctrl+D (⌘+D)\n• Multi-cursor editing: Alt+Click (Option+Click)\n• Line move up/down: Alt+↑/↓ (Option+↑/↓)";
            } else if (context.mentions.includes('word') || context.mentions.includes('office') || context.mentions.includes('document')) {
                response += "\n\n**Word Processing Shortcuts:**\n• Bold: Ctrl+B (⌘+B)\n• Italic: Ctrl+I (⌘+I)\n• Underline: Ctrl+U (⌘+U)\n• Heading styles: Ctrl+Alt+1/2/3 (⌘+Option+1/2/3)";
            }
        }
        else {
            // More intelligent generic response
            let topicsToSuggest = getRelevantTopics(context);
            
            response = "I'm your typing assistant, dedicated to helping you become a more efficient typist. Based on our conversation, you might be interested in:";
            
            topicsToSuggest.forEach((topic, index) => {
                response += "\n\n• " + topic;
            });
            
            response += "\n\nWhat specific aspect of typing would you like help with today?";
        }
        
        // Add message to conversation history
        conversationHistory.push({ role: 'assistant', content: response });
        
        // Keep history within limits
        if (conversationHistory.length > MAX_HISTORY_LENGTH) {
            conversationHistory.shift();
        }
        
        addMessageToChat(response, 'assistant');
    }, Math.random() * 500 + 800); // Randomize response time slightly for more natural feel
}

// Analyze conversation context for better responses
function analyzeConversationContext() {
    const context = {
        returning: conversationHistory.length > 2,
        lastTopic: '',
        mentions: []
    };
    
    // Extract key topics/keywords from previous messages
    conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
            const lowercaseContent = msg.content.toLowerCase();
            
            // Check for topic mentions
            const topics = ['speed', 'accuracy', 'ergonomic', 'keyboard', 'game', 
                           'exercise', 'finger', 'posture', 'pain', 'strain',
                           'code', 'programming', 'python', 'javascript', 'java', 'c++',
                           'layout', 'dvorak', 'colemak', 'shortcut', 'word', 'office', 'document'];
            
            topics.forEach(topic => {
                if (lowercaseContent.includes(topic) && !context.mentions.includes(topic)) {
                    context.mentions.push(topic);
                }
            });
        }
    });
    
    // Determine last discussed topic
    if (conversationHistory.length >= 2) {
        const lastUserMsg = conversationHistory.filter(msg => msg.role === 'user').pop();
        if (lastUserMsg) {
            const lastContent = lastUserMsg.content.toLowerCase();
            
            if (lastContent.includes('speed')) context.lastTopic = 'typing speed';
            else if (lastContent.includes('accuracy')) context.lastTopic = 'typing accuracy';
            else if (lastContent.includes('keyboard')) context.lastTopic = 'keyboard options';
            else if (lastContent.includes('ergonomic') || lastContent.includes('pain')) context.lastTopic = 'ergonomics';
            else if (lastContent.includes('exercise') || lastContent.includes('practice')) context.lastTopic = 'typing exercises';
            else if (lastContent.includes('game')) context.lastTopic = 'typing games';
            else if (lastContent.includes('code') || lastContent.includes('programming')) context.lastTopic = 'coding-specific typing';
            else context.lastTopic = 'typing techniques';
        }
    }
    
    return context;
}

// Get relevant topics based on conversation context
function getRelevantTopics(context) {
    const allTopics = [
        "Speed improvement techniques",
        "Accuracy enhancement strategies",
        "Proper finger positioning and ergonomics",
        "Typing exercises and practice methods",
        "Keyboard recommendations",
        "Average typing speeds and benchmarks",
        "Special typing techniques for programming/coding",
        "Keyboard layouts (QWERTY, Dvorak, Colemak)",
        "Essential keyboard shortcuts",
        "Fun typing games and resources"
    ];
    
    // If we have context, prioritize relevant topics
    if (context.mentions.length > 0) {
        let prioritized = [];
        
        if (context.mentions.includes('code') || context.mentions.includes('programming')) {
            prioritized.push("Special typing techniques for programming/coding");
            prioritized.push("Keyboard shortcuts for developers");
        }
        
        if (context.mentions.includes('pain') || context.mentions.includes('ergonomic') || context.mentions.includes('strain')) {
            prioritized.push("Ergonomic keyboard options and positioning");
            prioritized.push("Exercises to prevent repetitive strain injuries");
        }
        
        if (context.mentions.includes('game') || context.mentions.includes('fun')) {
            prioritized.push("Fun typing games and resources");
            prioritized.push("Competitive typing platforms");
        }
        
        if (context.mentions.includes('speed')) {
            prioritized.push("Advanced speed improvement techniques");
            prioritized.push("Breaking through typing speed plateaus");
        }
        
        // Fill with other topics if needed
        while (prioritized.length < 4) {
            const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
            if (!prioritized.includes(randomTopic)) {
                prioritized.push(randomTopic);
            }
        }
        
        return prioritized.slice(0, 4); // Return top 4 relevant topics
    }
    
    // Default: shuffle and return first 4
    return shuffleArray(allTopics).slice(0, 4);
}

// Helper functions for personalized responses
function getSpeedCategory(wpm) {
    if (wpm < 30) return "below average";
    if (wpm < 40) return "average";
    if (wpm < 60) return "above average";
    if (wpm < 80) return "fast/professional";
    if (wpm < 100) return "excellent";
    return "elite";
}

function getPersonalizedSpeedAdvice() {
    if (userMetrics.averageWPM < 30) return "building muscle memory through consistent daily practice";
    if (userMetrics.averageWPM < 50) return "challenging yourself with slightly more difficult material";
    if (userMetrics.averageWPM < 70) return "rhythm typing and focus on problem character combinations";
    return "specialized exercises and advanced techniques like burst training";
}

function getCommonMistakesList() {
    return Object.keys(userMetrics.commonMistakes)
        .sort((a, b) => userMetrics.commonMistakes[b] - userMetrics.commonMistakes[a])
        .slice(0, 3)
        .join(", ");
}

function getProgrammingLanguage(mentions) {
    if (mentions.includes('python')) return "Python";
    if (mentions.includes('javascript')) return "JavaScript";
    if (mentions.includes('java')) return "Java";
    if (mentions.includes('c++')) return "C++";
    return "your programming language";
}

function getLanguageExamples(language) {
    switch(language) {
        case "Python":
            return "function definitions, list comprehensions, and indentation patterns";
        case "JavaScript":
            return "arrow functions, object literals, and async/await syntax";
        case "Java":
            return "class definitions, exception handling, and lambda expressions";
        case "C++":
            return "template syntax, pointer operations, and STL container usage";
        default:
            return "common syntax structures and idioms";
    }
}

// Fisher-Yates shuffle algorithm for arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate AI feedback based on test performance with more detailed analysis
function generateAIFeedback(wpm, accuracy, typedCharacters, mistakes, typingData) {
    // Update user metrics for better personalized feedback
    updateUserMetrics(wpm, accuracy, mistakes);
    
    // Show typing indicator for natural experience
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        
        // Calculate more detailed metrics
        const mistakeRate = (mistakes / typedCharacters) * 100;
        const consistencyRating = getConsistencyRating(typingData);
        const improvementRate = calculateImprovementRate();
        
        // Create personalized feedback based on multiple factors
        let feedback = `I've analyzed your typing test (${wpm} WPM, ${accuracy}% accuracy). `;
        
        // Add improvement info if available
        if (userMetrics.testsTaken > 1) {
            feedback += `You've ${improvementRate.wpm > 0 ? 'improved' : 'decreased'} by ${Math.abs(improvementRate.wpm).toFixed(1)} WPM since your last test. `;
        }
        
        // Speed-based feedback
        if (wpm < 20) {
            feedback += "You're in the beginning stages of developing typing skills. ";
            feedback += "Right now, focus entirely on proper finger positioning rather than speed. ";
            feedback += "Try typing very slowly while keeping your fingers on the home row (ASDF JKL;). ";
        } else if (wpm < 40) {
            feedback += "You're building a solid foundation. ";
            feedback += "Your speed is approaching the average range, which is excellent progress. ";
            feedback += "Now is the perfect time to eliminate any 'hunt and peck' habits if they exist. ";
        } else if (wpm < 60) {
            feedback += "You've developed good typing skills with above-average speed. ";
            feedback += "At this level, small technique refinements can yield significant improvements. ";
            feedback += "Pay attention to challenging key combinations to break through to the next level. ";
        } else if (wpm < 80) {
            feedback += "Your typing speed is excellent, in the range of professional typists. ";
            feedback += "You've clearly developed strong muscle memory and good technique. ";
            feedback += "Continued improvement at this level comes from specialized practice and rhythm development. ";
        } else {
            feedback += "Your typing speed is exceptional - in the top percentile of typists. ";
            feedback += "You've mastered the fundamentals and developed advanced typing skills. ";
            feedback += "Consider experimenting with different keyboards or layouts to see if they offer further optimization. ";
        }
        
        // Accuracy-based feedback
        if (accuracy < 92) {
            feedback += "I noticed your accuracy has room for improvement. ";
            
            if (wpm > 50) {
                feedback += "Since your speed is already good, try slowing down 20% to focus on precision. ";
                feedback += "Speed with errors is less efficient than slightly slower, accurate typing. ";
            } else {
                feedback += "Working on accuracy now will build a stronger foundation for speed later. ";
                feedback += "Try consciously slowing down and feeling each keypress before moving to the next. ";
            }
            
            if (mistakeRate > 8) {
                feedback += "Consider practicing problematic character combinations separately. ";
            }
        } else if (accuracy < 97) {
            feedback += "Your accuracy is good, in the normal range for skilled typists. ";
            feedback += "Minor improvements could come from focused practice on your specific error patterns. ";
        } else {
            feedback += "Your accuracy is exceptional! ";
            feedback += "This precision will serve you well, especially for specialized typing like programming. ";
        }
        
        // Consistency feedback
        if (consistencyRating === 'low') {
            feedback += "I notice your typing speed varies considerably. ";
            feedback += "Developing a more consistent rhythm will help you maintain efficiency for longer periods. ";
            feedback += "Try typing to music or using a metronome app to develop better cadence. ";
        } else if (consistencyRating === 'medium') {
            feedback += "Your typing rhythm is fairly consistent, which is good. ";
            feedback += "Further refinement of your cadence could help with both speed and accuracy. ";
        } else {
            feedback += "You maintain excellent rhythm while typing, showing strong muscle memory and technique. ";
        }
        
        // Add specific exercise recommendation based on performance
        feedback += "\n\nBased on your results, here's a specific exercise to try: ";
        
        if (accuracy < 95 && wpm > 40) {
            feedback += "Practice 'accuracy sprints' - type at 80% of your maximum speed while aiming for perfect accuracy for short 30-second bursts.";
        } else if (wpm < 30) {
            feedback += "Try 'home row mastery' exercises focusing only on keys ASDF JKL; until using the correct fingers becomes completely automatic.";
        } else if (consistencyRating !== 'high') {
            feedback += "Work on 'rhythm typing' - find a song with 60-80 BPM and try to type one character per beat to develop consistent timing.";
        }  else {
                feedback += "Challenge yourself with 'progressive texts' - start with familiar content, then gradually introduce more complex or technical material while maintaining your speed.";
            }
            
            addMessageToChat(feedback, 'assistant');
        }, 1500);
    }
    
    // Helper function to measure typing consistency from typing data
    function getConsistencyRating(typingData) {
        if (typingData.length < 2) return 'medium';
        
        // Extract WPM values
        const wpmValues = typingData.map(data => data.wpm);
        
        // Calculate standard deviation
        const mean = wpmValues.reduce((sum, val) => sum + val, 0) / wpmValues.length;
        const squareDiffs = wpmValues.map(val => (val - mean) ** 2);
        const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
        const stdDev = Math.sqrt(avgSquareDiff);
        
        // Calculate coefficient of variation (normalized standard deviation)
        const cv = stdDev / mean;
        
        // Rate consistency based on coefficient of variation
        if (cv > 0.25) return 'low';
        if (cv > 0.15) return 'medium';
        return 'high';
    }
    
    // Add more sample texts based on difficulty
    function addMoreTexts() {
        // Easy texts
        sampleTexts.easy.push(
            "Practice makes perfect. This is a simple sentence to help you get comfortable with typing.",
            "Reading and writing are fundamental skills that everyone should develop.",
            "The sun sets in the west and rises in the east. This natural cycle repeats daily."
        );
        
        // Medium texts
        sampleTexts.medium.push(
            "Programming requires attention to detail and logical thinking. Learning to code can open many career opportunities.",
            "The internet has revolutionized how we communicate and access information. Social media platforms have changed our social dynamics.",
            "Regular exercise and a balanced diet are essential components of a healthy lifestyle. Mental health is equally important."
        );
        
        // Hard texts
        sampleTexts.hard.push(
            "The symbiotic relationship between technological innovation and economic growth exemplifies how scientific advancements can catalyze broader societal transformation.",
            "Neuroplasticity refers to the brain's ability to reorganize itself by forming new neural connections, allowing neurons to adjust their activities in response to new situations or changes in their environment.",
            "The philosophical concept of existentialism emphasizes individual existence, freedom, and choice, asserting that humans define their own meaning in life, and try to make rational decisions despite existing in an irrational universe."
        );
    }
    
    // Call the function to add more texts
    addMoreTexts();
    
    // Initialize the app when the DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
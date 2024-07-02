document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

const knowledge = {
    "good morning": "Good morning!",
    "good evening": "Good evening!",
    "need advice": "Please ask!",
    "follow a course": "Ok... go on..",
    "thank you": "You are welcome"
};

const randomResponses = {
    "how are you": ["I'm fine", "I am ok", "Not bad", "Good", "Alright"],
    "hi": ["Hi!", "Hello!", "Hello dear", "Hey, nice to see you"],
    "hello": ["Hi!", "Hello!", "Hello dear", "Hey, nice to see you"]
};

let userName = "";
let awaitingName = false;
let jobQuestionIndex = 0;
let jobResponses = [];

const jobQuestions = [
    "What type of job are you looking for?",
    "What industry or field are you interested in?",
    "What specific job roles or titles are you targeting?",
    "Do you have a preferred location for your job search?"
];

const availableJobs = [
    { type: "full-time", industry: "technology", role: "software engineer", location: "san francisco", description: "Software Engineer at Tech Corp in San Francisco" },
    { type: "full-time", industry: "technology", role: "network engineer", location: "san francisco", description: "Network Engineer at Tech Corp in San Francisco" },
    { type: "part-time", industry: "marketing", role: "social media manager", location: "new york", description: "Part-time Social Media Manager at Marketing Inc in New York" },
    { type: "internship", industry: "finance", role: "financial analyst intern", location: "chicago", description: "Financial Analyst Intern at Finance LLC in Chicago" }
];

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (message !== '') {
        addMessage(message, 'user-message');
        userInput.value = '';
        processMessage(message);
    }
}

function addMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.innerText = message;
    document.getElementById('messages').appendChild(messageElement);
    messageElement.scrollIntoView();
}

function processMessage(userMessage) {
    const lowercaseMessage = userMessage.toLowerCase();

    if (awaitingName) {
        userName = userMessage;
        const reply = `Nice to meet you, ${userName}! How can I help you today?`;
        addMessage(reply, 'bot-message');
        readMessage(reply);
        awaitingName = false;
        return;
    }

    if (lowercaseMessage.includes("your name")) {
        const reply = "I'm Robby and what is your name?";
        addMessage(reply, 'bot-message');
        readMessage(reply);
        awaitingName = true;
        return;
    }

    if (lowercaseMessage.includes("bye")) {
        const reply = `Goodbye ${userName}`;
        addMessage(reply, 'bot-message');
        readMessage(reply);
        return;
    }

    for (const key in knowledge) {
        if (lowercaseMessage.includes(key)) {
            const reply = knowledge[key];
            addMessage(reply, 'bot-message');
            readMessage(reply);
            return;
        }
    }

    for (const key in randomResponses) {
        if (lowercaseMessage.includes(key)) {
            const responses = randomResponses[key];
            const randomIndex = Math.floor(Math.random() * responses.length);
            const reply = responses[randomIndex];
            addMessage(reply, 'bot-message');
            readMessage(reply);
            return;
        }
    }

    if (lowercaseMessage.includes("find me a job")) {
        jobResponses = [];
        jobQuestionIndex = 0;
        askJobQuestion();
        return;
    }

    if (jobQuestionIndex > 0 && jobQuestionIndex <= jobQuestions.length) {
        jobResponses.push(userMessage);
        if (jobQuestionIndex < jobQuestions.length) {
            askJobQuestion();
        } else {
            showAvailableJobs();
        }
        return;
    }

    const reply = "Sorry, I don't understand that. Please try another question.";
    addMessage(reply, 'bot-message');
    readMessage(reply);
}

function askJobQuestion() {
    if (jobQuestionIndex < jobQuestions.length) {
        const question = jobQuestions[jobQuestionIndex];
        addMessage(question, 'bot-message');
        readMessage(question);
        jobQuestionIndex++;
    }
}

function showAvailableJobs() {
    const userJobPreferences = {
        type: jobResponses[0].toLowerCase(),
        industry: jobResponses[1].toLowerCase(),
        role: jobResponses[2].toLowerCase(),
        location: jobResponses[3].toLowerCase()
    };

    const filteredJobs = availableJobs.filter(job =>
        job.type.includes(userJobPreferences.type) &&
        job.industry.includes(userJobPreferences.industry) &&
        job.role.includes(userJobPreferences.role) &&
        job.location.includes(userJobPreferences.location)
    );

    if (filteredJobs.length > 0) {
        filteredJobs.forEach(job => {
            const jobMessage = `Job: ${job.description}`;
            addMessage(jobMessage, 'bot-message');
            readMessage(jobMessage);
        });
    } else {
        const noJobsMessage = "Sorry, no jobs match your criteria.";
        addMessage(noJobsMessage, 'bot-message');
        readMessage(noJobsMessage);
    }

    jobQuestionIndex = 0;
    jobResponses = [];
}

function readMessage(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utterance);
}

// Speech-to-Text Functionality
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.getElementById('microphone-button').addEventListener('click', () => {
    recognition.start();
});

recognition.addEventListener('result', (event) => {
    const speechResult = event.results[0][0].transcript;
    const userInput = document.getElementById('user-input');
    userInput.value = speechResult;

    setTimeout(() => {
        addMessage(speechResult, 'user-message');
        processMessage(speechResult);
    }, 3000);
});

recognition.addEventListener('speechend', () => {
    recognition.stop();
});

recognition.addEventListener('error', (event) => {
    addMessage('Error occurred in recognition: ' + event.error, 'bot-message');
});

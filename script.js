
const startBtn = document.getElementById('start-btn');
const status = document.getElementById('status');
const heard = document.getElementById('heard');
const response = document.getElementById('response');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const repeatBtn = document.getElementById('repeat-btn');
const timerDisplay = document.getElementById('timer-display');
const resultDisplay = document.getElementById('result-display');
const calculator = document.getElementById('calculator');
const calcDisplay = document.getElementById('calc-display');
const audioPlayer = document.getElementById('audio-player');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const startStopButton = document.getElementById('startStop');
const resetButton = document.getElementById('reset');
const muteBtn = document.getElementById('mute-btn');
const saveToggleBtn = document.getElementById('save-toggle');
const ringtoneToggleBtn = document.getElementById('ringtone-toggle');

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();


audioPlayer.playbackRate = 1.0; // Default speed
audioPlayer.volume = 0.5;

let isRepeat = false;
let isActive = false;
let isMuted = false;
let isSpeaking = false;
let currentUtterance = null; // To track the current speech
let timerEndTime = null;
let timerInterval = null;

let minutes = 0;
let seconds = 0;
let milliseconds = 0;
let saveData = true;
let ringtoneEnabled = true;
let timers = []; // Array to hold multiple timers
let timerIntervals = new Map(); // Map to track intervals for each timer
let ringtoneTimeout = null;
let ringtonePreloaded = false;

// Stopwatch settings
let stopwatchStartTime = null;
let elapsedTime = 0;
let isRunning = false;
let timer = null;




const stopwatchDisplay = document.getElementById('stopwatch-display'); // Add this to your variable declarations



const playlist = [
    { title: "Samajavaragamana", url: "https://www.dropbox.com/scl/fi/hyk0j59j1cuuebg602ivd/Samajavaragamana.mp3?rlkey=ebt7ly8g7ykt9hqhiodrjtek1&st=8ctouucc&dl=1" },
    { title: "Bagundu Bagundu Song", url: "https://www.dropbox.com/scl/fi/cbg9hxehlvcm0rvkcbae6/Bagundu-Bagundu.mp3?rlkey=yru56be3o6kefmetbfflzl89q&st=dkqrtoi5&dl=1" },
    { title: "diwali song", url: "https://www.dropbox.com/scl/fi/ttxiawlzem9899svsxe0f/DIPAWALI-SONG.mp3?rlkey=h198miz3f5gthcnjmf75w79wp&st=4a3z8c4c&dl=1" },
    { title: "mother song", url: "https://www.dropbox.com/scl/fi/ch771ywkuh9qdlu04vl1s/Emotional-Mother-Song.mp3?rlkey=qg7i9omp8hwu7ijp29iusprwx&st=2yopxgeo&dl=1" },
    { title: "Aradhya song", url: "https://www.dropbox.com/scl/fi/rqeg1abtqta4p7rk789dt/Aradhya.mp3?rlkey=jirtlk9cn8ajftns2uvxkdk8j&st=etutsb2s&dl=1" },
    { title: "Bullettu-Bandi", url: "https://www.dropbox.com/scl/fi/q5hf2wx0pok0lckevk047/Bullettu-Bandi.mp3?rlkey=25wkb9m963tez217f1zycs4h0&st=kp5nr51k&dl=1" },
    { title: "Sommasilli-Pothunnave", url: "https://www.dropbox.com/scl/fi/1x8aojrcdgyl2w07f2mil/Sommasilli-Pothunnave.mp3?rlkey=d1fiepn90xla8ejnuz5ea5ev3&st=p0y0qb7l&dl=1" },
    { title: "Sandalle-Sandalle", url: "https://www.dropbox.com/scl/fi/ejrri7nrczlrt7h45v6yz/Sandalle-Sandalle.mp3?rlkey=8b56ztjffhv01ffctp849rrdm&st=o1uz0rys&dl=1" },
    { title: "Vachindamma", url: "https://www.dropbox.com/scl/fi/ma70fw9mhkb14rszqd6s5/Vachindamma.mp3?rlkey=w0tcuncbxmffiqgoui9oj3v3a&st=fvvww1l0&dl=1" },
    { title: "Selayeru-Paduthunte", url: "https://www.dropbox.com/scl/fi/n0sizn8rzlrwg4np1xm0d/Selayeru-Paduthunte.mp3?rlkey=ztroxizel2hlz048rrd9d2koz&st=5d6cvlbb&dl=1" },
    { title: "timer-ringtone-venkataeswara-swamy-song", url: "https://www.dropbox.com/scl/fi/ahko1k8bh2424rwoy8dgf/venkataeswara-swamy.mp3?rlkey=7f49x9oxh1k1hz7w46fclbx1g&st=zvzj9nof&dl=1" }
];
let currentSongIndex = 0;


// Preload ringtone (unchanged)
function preloadRingtone() {
    const ringtoneSong = playlist.find(song => song.title === "timer-ringtone-venkataeswara-swamy-song");
    if (ringtoneSong && !ringtonePreloaded) {
        const preloadAudio = new Audio(ringtoneSong.url);
        preloadAudio.preload = "auto";
        preloadAudio.load();
        ringtonePreloaded = true;
    }
}
function setTimer(secondsInput, timerName = "Unnamed") {
    const id = Date.now().toString();
    const totalSeconds = Math.max(1, Math.floor(secondsInput));
    const endTime = Date.now() + totalSeconds * 1000;
    const expired = false; // New flag

    const timer = { 
        id, 
        name: timerName, 
        endTime, 
        totalSeconds,
        remainingSeconds: totalSeconds,
        expired // Track expiration status
    };
    
    timers.push(timer);
    createTimerDisplay(timer);

    const interval = setInterval(() => {
        const now = Date.now();
        const remainingTime = Math.max(0, Math.round((timer.endTime - now) / 1000));
        
        timer.remainingSeconds = remainingTime;
        updateSingleTimerDisplay(timer);

        // Inside the timer interval where remainingTime <= 0
if (remainingTime <= 0) {
    clearInterval(interval);
    timerIntervals.delete(timer.id);
    timers = timers.filter(t => t.id !== timer.id);
    
    const timerElement = document.getElementById(`timer-${timer.id}`);
    if (timerElement) timerElement.remove();

    // Mark as expired in storage
    if (saveData) {
        const timerData = JSON.parse(localStorage.getItem('timerData')) || [];
        const updatedTimers = timerData.map(t => 
            t.id === timer.id ? {...t, expired: true} : t
        );
        localStorage.setItem('timerData', JSON.stringify(updatedTimers));
    }

    const completionMessage = `${timer.name} timer finished!`;
    respond(completionMessage);
    resultDisplay.textContent = completionMessage;
    
    if (ringtoneEnabled) playTimerRingtone();
    showNotification('Timer Complete', completionMessage);


            // Update storage immediately when timer completes
            if (saveData) {
                localStorage.setItem('timerData', JSON.stringify(
                    timers.map(t => ({
                        id: t.id,
                        name: t.name,
                        endTime: t.endTime,
                        totalSeconds: t.totalSeconds
                    }))
                ));
            }
        }
    }, 100);

    timerIntervals.set(id, interval);
    
    // Update storage when creating new timer
    if (saveData) {
        localStorage.setItem('timerData', JSON.stringify(
            timers.map(t => ({
                id: t.id,
                name: t.name,
                endTime: t.endTime,
                totalSeconds: t.totalSeconds
            }))
        ));
    }

    respond(`Timer "${timerName}" set for ${formatTime(totalSeconds)}`);
}



// Call this when your app starts
window.addEventListener('load', () => {
    cleanupExpiredTimers();
    // Rest of your initialization code...
});


function checkExpiredTimersOnLoad() {
    if (!saveData) return;

    const timerData = JSON.parse(localStorage.getItem('timerData')) || [];
    const now = Date.now();
    const expiredTimers = [];

    timerData.forEach(timer => {
        if (timer.endTime <= now && !timer.expired) {
            expiredTimers.push({
                ...timer,
                timePassed: Math.round((now - timer.endTime) / 1000)
            });
            // Mark as expired in storage
            timer.expired = true;
        }
    });

    // Update storage with expired flags
    if (expiredTimers.length > 0) {
        localStorage.setItem('timerData', JSON.stringify(timerData));
    }

    // Show notifications for expired timers
    expiredTimers.forEach(timer => {
        const timePassed = formatTime(timer.timePassed);
        const message = `Your timer "${timer.name}" went off ${timePassed} ago`;
        
        // Create a notification UI element
        const notification = document.createElement('div');
        notification.className = 'timer-notification';
        notification.innerHTML = `
            <p>${message}</p>
            <button class="dismiss-btn">OK</button>
        `;
        
        // Add to notifications container
        document.getElementById('notifications-container').appendChild(notification);
        
        // Add dismiss functionality
        notification.querySelector('.dismiss-btn').addEventListener('click', () => {
            notification.remove();
            // Remove from storage if needed
            if (saveData) {
                const updatedTimers = timerData.filter(t => t.id !== timer.id);
                localStorage.setItem('timerData', JSON.stringify(updatedTimers));
            }
        });
    });
}


function stopTimer(timerName) {
    const timer = timers.find(t => t.name.toLowerCase() === timerName.toLowerCase());
    if (timer) {
        clearInterval(timerIntervals.get(timer.id));
        timerIntervals.delete(timer.id);
        timers = timers.filter(t => t.id !== timer.id);
        document.getElementById(`timer-${timer.id}`)?.remove();

        if (saveData) {
            localStorage.setItem('timerData', JSON.stringify(timers.map(t => ({
                id: t.id,
                name: t.name,
                endTime: t.endTime,
                remainingSeconds: t.remainingSeconds
            }))));
        }

        stopRingtone();
        respond(`Timer "${timerName}" stopped.`);
    } else {
        respond(`No timer named "${timerName}" found.`);
    }
}

function clearAllTimers() {
    timers.forEach(timer => {
        clearInterval(timerIntervals.get(timer.id));
        document.getElementById(`timer-${timer.id}`)?.remove();
    });
    timers = [];
    timerIntervals.clear();
    if (saveData) localStorage.removeItem('timerData');
    stopRingtone();
    timerDisplay.textContent = '00:00';
    respond('All timers cleared.');
}
// Better timer loading from storage
function loadTimerFromStorage() {
    if (!saveData) return;

    const timerData = JSON.parse(localStorage.getItem('timerData'));
    if (timerData && Array.isArray(timerData)) {
        timers = [];
        timerIntervals.clear();

        timerData.forEach(savedTimer => {
            const remainingTime = Math.round((savedTimer.endTime - Date.now()) / 1000);
            if (remainingTime > 0) {
                // Recreate active timer
                const timer = {
                    id: savedTimer.id,
                    name: savedTimer.name,
                    endTime: savedTimer.endTime,
                    totalSeconds: savedTimer.totalSeconds,
                    remainingSeconds: remainingTime
                };
                timers.push(timer);
                createTimerDisplay(timer);

                // Restart the interval
                const interval = setInterval(() => {
                    const now = Date.now();
                    const remainingTime = Math.max(0, Math.round((timer.endTime - now) / 1000));
                    
                    timer.remainingSeconds = remainingTime;
                    updateSingleTimerDisplay(timer);

                    if (remainingTime <= 0) {
                        clearInterval(interval);
                        timerIntervals.delete(timer.id);
                        timers = timers.filter(t => t.id !== timer.id);
                        
                        const timerElement = document.getElementById(`timer-${timer.id}`);
                        if (timerElement) timerElement.remove();

                        const completionMessage = `${timer.name} timer finished!`;
                        respond(completionMessage);
                        resultDisplay.textContent = completionMessage;
                        
                        if (ringtoneEnabled) playTimerRingtone();
                        showNotification('Timer Complete', completionMessage);

                        // Update storage immediately
                        if (saveData) {
                            localStorage.setItem('timerData'), JSON.stringify(
                                timers.map(t => ({
                                    id: t.id,
                                    name: t.name,
                                    endTime: t.endTime,
                                    totalSeconds: t.totalSeconds
                                }))
                            );
                        }
                    }
                }, 100);

                timerIntervals.set(timer.id, interval);
            } else {
                // Remove expired timer from storage
                if (saveData) {
                    const updatedTimers = timerData.filter(t => t.id !== savedTimer.id);
                    localStorage.setItem('timerData', JSON.stringify(updatedTimers));
                }
            }
        });
    }
}
function playTimerRingtone() {
    const ringtoneSong = playlist.find(song => song.title === "timer-ringtone-venkataeswara-swamy-song");
    if (!ringtoneSong) {
        console.error("Ringtone not found in playlist!");
        respond("Error: Timer ringtone not found!");
        return;
    }

    audioPlayer.src = ringtoneSong.url;
    audioPlayer.loop = false;
    audioPlayer.play().then(() => {
        status.textContent = "Playing timer ringtone...";
        ringtoneTimeout = setTimeout(() => {
            stopRingtone();
            status.textContent = "Timer ringtone finished.";
        }, 30000); // 30 seconds
    }).catch(error => {
        console.error("Ringtone play error:", error);
        respond("Failed to play timer ringtone!");
    });
}

function stopRingtone() {
    if (ringtoneTimeout) {
        clearTimeout(ringtoneTimeout);
        ringtoneTimeout = null;
    }
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

// Helper functions
function createTimerDisplay(timer) {
    const existing = document.getElementById(`timer-${timer.id}`);
    if (!existing) {
        const timerDiv = document.createElement('div');
        timerDiv.id = `timer-${timer.id}`;
        timerDiv.dataset.name = timer.name;
        timerDiv.textContent = `${timer.name}: ${formatTimerDisplay(timer.remainingSeconds)}`;
        document.getElementById('timers-container').appendChild(timerDiv);
    }
}

// Improved timer display update
function updateSingleTimerDisplay(timer) {
    const timerDiv = document.getElementById(`timer-${timer.id}`);
    if (timerDiv) {
        const minutes = Math.floor(timer.remainingSeconds / 60);
        const seconds = timer.remainingSeconds % 60;
        timerDiv.textContent = `${timer.name}: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function updateTimerDisplay(totalSeconds) {
    // For compatibility with single-timer UI
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    let timeStr = '';
    if (h > 0) timeStr += `${h} hour${h > 1 ? 's' : ''} `;
    if (m > 0) timeStr += `${m} minute${m > 1 ? 's' : ''} `;
    if (s > 0) timeStr += `${s} second${s > 1 ? 's' : ''}`;
    return timeStr.trim();
}

function showNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: message });
            }
        });
    }
}














// Start/Resume Stopwatch
function startStopwatch() {
    if (!isRunning) return;

    const now = Date.now();
    const currentElapsed = now - stopwatchStartTime + elapsedTime; // Calculate current elapsed time
    minutes = Math.floor(currentElapsed / 60000);
    seconds = Math.floor((currentElapsed % 60000) / 1000);
    milliseconds = currentElapsed % 1000;

    updateDisplay();

    if (saveData) {
        localStorage.setItem('stopwatchData', JSON.stringify({
            elapsedTime: currentElapsed, // Save the current elapsed time
            isRunning: isRunning,
            stopwatchStartTime: stopwatchStartTime,
            lastUpdate: now
        }));
    }
}

// Load Stopwatch from Storage
function loadStopwatchFromStorage() {
    if (!saveData) return;

    const stopwatchData = JSON.parse(localStorage.getItem('stopwatchData'));
    if (stopwatchData) {
        elapsedTime = stopwatchData.elapsedTime || 0;
        isRunning = stopwatchData.isRunning || false;
        stopwatchStartTime = stopwatchData.stopwatchStartTime || null;
        const lastUpdate = stopwatchData.lastUpdate || Date.now();

        if (isRunning && stopwatchStartTime) {
            // If running, calculate additional time since last update
            const timeSinceLastUpdate = Date.now() - lastUpdate;
            elapsedTime += timeSinceLastUpdate;
            stopwatchStartTime = Date.now();
            timer = setInterval(startStopwatch, 10);
            startStopButton.textContent = 'Stop';
        } else {
            // If stopped, use the saved elapsed time
            minutes = Math.floor(elapsedTime / 60000);
            seconds = Math.floor((elapsedTime % 60000) / 1000);
            milliseconds = elapsedTime % 1000;
            updateDisplay();
            startStopButton.textContent = 'Start';
        }
    }
}

// Start/Stop Button Event Listener
startStopButton.addEventListener('click', () => {
    if (isRunning) {
        // Stop the stopwatch
        clearInterval(timer);
        elapsedTime += Date.now() - stopwatchStartTime; // Update elapsed time
        isRunning = false;
        startStopButton.textContent = 'Start';
        respond("Stopwatch stopped.");
    } else {
        // Start or resume the stopwatch
        stopwatchStartTime = Date.now();
        isRunning = true;
        timer = setInterval(startStopwatch, 10);
        startStopButton.textContent = 'Stop';
        respond("Stopwatch started.");
    }

    if (saveData) {
        localStorage.setItem('stopwatchData', JSON.stringify({
            elapsedTime: elapsedTime,
            isRunning: isRunning,
            stopwatchStartTime: stopwatchStartTime,
            lastUpdate: Date.now()
        }));
    }
});

// Reset Button Event Listener
resetButton.addEventListener('click', () => {
    clearInterval(timer);
    elapsedTime = 0;
    stopwatchStartTime = null;
    isRunning = false;
    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    startStopButton.textContent = 'Start';
    updateDisplay();
    if (saveData) localStorage.removeItem('stopwatchData');
    respond("Stopwatch reset.");
});

// Update Display Function
function updateDisplay() {
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    millisecondsDisplay.textContent = String(milliseconds).padStart(3, '0');
}

window.addEventListener('load', () => {
    saveData = localStorage.getItem('saveData') !== 'false';
    saveToggleBtn.textContent = `Save Data: ${saveData ? 'ON' : 'OFF'}`;
    ringtoneEnabled = localStorage.getItem('ringtoneEnabled') !== 'false';
    ringtoneToggleBtn.textContent = `Ringtone: ${ringtoneEnabled ? 'ON' : 'OFF'}`;
    preloadRingtone();
    checkExpiredTimersOnLoad(); // Check for expired timers first
    loadTimerFromStorage(); // Then load active timers
    loadStopwatchFromStorage();
});


// Mute button - Fixed version
// Fixed Mute Button Logic
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    status.textContent = isMuted ? 'Assistant muted' : 'Assistant unmuted';

    if (isMuted) {
        // Stop ongoing speech and clean up
        if (isSpeaking || window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            currentUtterance = null;
        }
        // Restart recognition
        try {
            recognition.start();
            console.log("Recognition restarted after muting");
        } catch (error) {
            console.error("Recognition restart failed on mute:", error);
        }
    } else {
        // Ensure speech works after unmuting
        window.speechSynthesis.cancel(); // Clear any stuck queue
        isSpeaking = false;
        currentUtterance = null;
        respond("Assistant unmuted"); // Should speak this
        console.log("Unmuted - should speak now");
    }
});






//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions

//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions
//Speech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctionsSpeech RecognitionFunctionsSpeechRecognitionFunctions






// Speech recognition
recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    heard.textContent = `Heard: ${transcript}`;
    console.log(`Processing command: "${transcript}"`); // Debug log

    if (transcript.includes("friday") && !isActive) {
        isActive = true;
        status.textContent = "I'm awake! How can I assist you?";
        const responses = ["friday is active. , at your sirvice  sir always", " Yes sir, I'm here to help!", " Hello sir, how can i help you sir?", " Yes sir, I'm listening."];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        return;
    }

    if (!isActive) return;

 // Stop ringtone command
 if (transcript.includes("ok friday") || transcript.includes("okay friday")) {
    stopRingtone();
    respond("Ringtone stopped.");
    return;
}

// Timer commands
if (transcript.includes('set a timer for')) {
    let totalSeconds = 0;
    const hoursMatch = transcript.match(/(\d+)\s*hour/);
    const minutesMatch = transcript.match(/(\d+)\s*minute/);
    const secondsMatch = transcript.match(/(\d+)\s*second/);
    const nameMatch = transcript.match(/called\s+(.+?)(?:\s+for|$)/i);

    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);

    const timerName = nameMatch ? nameMatch[1].trim() : "Unnamed";

    if (totalSeconds > 0) {
        // Check if timer with same name already exists
        const existingTimer = timers.find(t => t.name.toLowerCase() === timerName.toLowerCase());
        if (existingTimer) {
            respond(`There's already a timer named "${timerName}". Please use a different name.`);
        } else {
            setTimer(totalSeconds, timerName);
        }
    } else {
        respond('Please specify a valid time duration (hours, minutes, or seconds).');
    }
    return;
}
if (transcript.includes("clear all timers")) {
    clearAllTimers();
    return;
}

// Stopwatch commands (moved up for priority)
if (transcript.includes("start stopwatch")) {
    if (!isRunning) {
        startStopButton.click();
        respond("Stopwatch started.");
        stopwatchDisplay.style.display = 'block';
    } else {
        respond("Stopwatch is already running.");
    }
    calculator.classList.remove('active');
    return;
} else if (transcript.includes("stop stopwatch")) {
    if (isRunning) {
        startStopButton.click();
        respond("Stopwatch stopped.");
    } else {
        respond("Stopwatch is not running.");
    }
    calculator.classList.remove('active');
    return;
} else if (transcript.includes("reset stopwatch")) {
    resetButton.click();
    respond("Stopwatch reset.");
    return;
} else if (transcript.includes("stopwatch time") || transcript.includes("friday stopwatch time") ||
           transcript.includes("stopwatch status") || transcript.includes("friday stopwatch status")) {
    respond(`Current stopwatch time: ${minutes}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`);
    return;
} else if (transcript.includes("display stopwatch") || transcript.includes("show stopwatch") ||
           transcript.includes("friday show stopwatch") || transcript.includes("friday display stopwatch")) {
    const responses = ["Yes sir, displaying stopwatch", "ok sir displaying stopwatch for you sir", "alright sir, displaying stopwatch.", "yes sir, displaying stopwatch right now", "Here you go sir, displaying stopwatch!"];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    stopwatchDisplay.style.display = 'block';
    respond(randomResponse);
    return;
} else if (transcript.includes("hide stopwatch") || transcript.includes("remove stopwatch") ||
           transcript.includes("friday hide stopwatch") || transcript.includes("friday remove stopwatch")) {
    const responses = ["Yes sir, hiding stopwatch", "ok sir hiding the stopwatch for you sir", "alright sir, hiding stopwatch.", "yes sir, hiding stopwatch right now", "Here you go sir, hiding stopwatch!"];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    stopwatchDisplay.style.display = 'none';
    respond(randomResponse);
    return;

    
   //samajavaragamana
    } else if (transcript.includes("friday play s a m song") ||  transcript.includes("friday play sam song"),
     transcript.includes("play s a m song") || transcript.includes(" play sam song"),
    transcript.includes("friday play s a m") || transcript.includes("friday play sam"),
     transcript.includes("play s a m") || transcript.includes("play sam")) {
        respond("Yes sir, playing Samajavaragamana", () => {
            playSongByTitle("Samajavaragamana");
            
        });


        //deepavali song
} else if (transcript.includes("friday play  d i w song") || transcript.includes("friday play diw song"),
     transcript.includes("play d i w song") || transcript.includes("play diw song"),
    transcript.includes("friday play d i w") || transcript.includes("friday play diw"),
     transcript.includes("play d i w") || transcript.includes("play diw") || transcript.includes("friday play diwali song")) {
        respond("Yes sir, playing diwali song", () => {
            playSongByTitle("diwali song");
            return; // Add this to exit the handler
        });

    //bagundu bagundu
} else if (transcript.includes("friday play b a g song") || transcript.includes("friday play bag song"),
    transcript.includes("play b a g song") || transcript.includes("play bag song"),
    transcript.includes("friday play b a g") || transcript.includes("friday play bag"),
    transcript.includes("play b a g") || transcript.includes("play bag") ) {
    respond("Yes sir, now playing Bagundu Bagundu Song", () => {
        playSongByTitle("Bagundu Bagundu Song");
        return; // Add this to exit the handler
    });

    //mother song
} else if (transcript.includes("friday play mother song")) {
    respond("Yes boss, now playing mother song", () => {
        playSongByTitle("mother song");
    });

    //Aradhya song
} else if (transcript.includes("friday play a r a song") || transcript.includes("friday play ara song"),
  transcript.includes("play a r a song") || transcript.includes("play ara song"),
  transcript.includes("friday play a r a") || transcript.includes("friday play ara"),
  transcript.includes("play a r a") || transcript.includes("play ara") || transcript.includes("friday play aradhya song")) {
    respond("Yes boss, now playing Aradhya song", () => {
        playSongByTitle("Aradhya song");
        return; // Add this to exit the handler
    });

    //Bullettu-Bandi
} else if (transcript.includes("friday play b u l song") || transcript.includes("friday play bul song"),
     transcript.includes("play b u l song") || transcript.includes("play bul song"),
     transcript.includes("friday play b u l") || transcript.includes("friday play bul"), 
     transcript.includes("play b u l") || transcript.includes("play bul") || transcript.includes("friday play bullettu bandi song")) {
    respond("Yes boss, now playing Bullettu-Bandi", () => {
        playSongByTitle("Bullettu-Bandi");
        return; // Add this to exit the handler
    });

    //Sommasilli-Pothunnave
} else if (transcript.includes("friday play s o m song") || transcript.includes("friday play som song"),
     transcript.includes("play s o m song") || transcript.includes("play som song"),
     transcript.includes("friday play s o m") || transcript.includes("friday play som"),
     transcript.includes("play s o m") || transcript.includes("play som") || transcript.includes("friday play sommasilli song")) {
    respond("Yes boss, now playing Sommasilli-Pothunnave", () => {
        playSongByTitle("Sommasilli-Pothunnave");
        return; // Add this to exit the handler
    });

    //Sandalle-Sandalle
} else if (transcript.includes("friday play s a n song") || transcript.includes("friday play san song"),
     transcript.includes("play s a n song") || transcript.includes("play san song"),
     transcript.includes("friday play s a n") || transcript.includes("friday play san"),
     transcript.includes("play s a n") || transcript.includes("play san") || transcript.includes("friday play sandalle song")) {
    respond("Yes boss, now playing Sandalle-Sandalle", () => {
        playSongByTitle("Sandalle-Sandalle");
        return; // Add this to exit the handler
    });
    
    //Vachindamma
} else if (transcript.includes("friday play v a c song") || transcript.includes("friday play vac song"),

     transcript.includes("play v a c song") || transcript.includes("play vac song"),
     transcript.includes("friday play v a c") || transcript.includes("friday play vac"),
     transcript.includes("play v a c") || transcript.includes("play vac") || transcript.includes("friday play vachindamma song")) {
    respond("Yes boss, now playing Vachindamma", () => {
        playSongByTitle("Vachindamma");
        return; // Add this to exit the handler
    });

    //Selayeru-Paduthunte
} else if (transcript.includes("friday play s e l song") || transcript.includes("friday play sel song"),
     transcript.includes("play s e l song") || transcript.includes("play sel song"),
     transcript.includes("friday play s e l") || transcript.includes("friday play sel"),
     transcript.includes("play s e l") || transcript.includes("play sel") || transcript.includes("friday play selayeru song")) {
    respond("Yes boss, now playing Selayeru-Paduthunte", () => {
        playSongByTitle("Selayeru-Paduthunte");
        return; // Add this to exit the handler
    });





    // Play, Pause, Next, Previous, Repeat, Stop Commands
    
} else if (transcript.includes("friday play some songs") || transcript.includes("play some songs") || transcript.includes("friday play songs"),
 transcript.includes("play songs") || transcript.includes("friday play song") || transcript.includes("play song")) {
    playSong(currentSongIndex);
    respond(`.,., yes sir Playing "${playlist[currentSongIndex].title}"`);
    return; // Add this to exit the handler
    
    //for resume song
} else if (transcript.includes("friday resume") || transcript.includes("friday play") || transcript.includes("resume") || transcript.includes("play")) {
    resumeSong();
    respond(`yes sir now i Resuming "${playlist[currentSongIndex].title}"`);
    return; // Add this to exit the handler

    //next song
} else if (transcript.includes("friday next song") || transcript.includes("next song") ,
     transcript.includes("friday could you play next song") || transcript.includes("could you play next song"),
     transcript.includes("friday play next song") || transcript.includes("play next song")) {
    playNextSong();
    respond(`yes sir now Playing "${playlist[currentSongIndex].title}"`);
    return; // Add this to exit the handler

    //previous song
} else if (transcript.includes("friday previous song") || transcript.includes("previous song") || transcript.includes("friday play before song"),
  transcript.includes("play previous song") || transcript.includes("friday play previous song") ){
    playPreviousSong();
    respond(`yes now iam Playing "${playlist[currentSongIndex].title}"`);
    return; // Add this to exit the handler

    //repeat song
} else if (transcript.includes("friday repeat") || transcript.includes("repeat") ,
 transcript.includes("friday turn on the repeat mode song") || transcript.includes("turn on the repeat mode song"),
 transcript.includes("friday turn on the repeat mode fot this song") || transcript.includes("turn on the repeat mode for this song"),
 transcript.includes("friday turn on repeat mode") || transcript.includes("turn on repeat mode")) {
    toggleRepeat();
    respond(isRepeat ? "Repeat mode on" : "Repeat mode off");
return; // Add this to exit the handler

    // Mute/Unmute commands

    } else if (transcript.includes("mute") || transcript.includes("friday mute")) {
        document.getElementById("mute-btn").click();
         return;
     } else if (transcript.includes("unmute") || transcript.includes("friday unmute")) {
         document.getElementById("mute-btn").click();
         return;
        

    } else if (transcript.includes("friday sleep") || transcript.includes("sleep")) {
        const responses = ["..Ok sir, going to sleep mode.", ".. ok sir, sleep mode activated."];
        respond(responses[Math.floor(Math.random() * responses.length)]);
        isActive = false;
        pauseSong();
        return;

    } else if (transcript.includes("friday wait") || transcript.includes("wait")) {
               respond("Going back to sleep. Say 'Friday' to wake me!");
               isActive = false;
               return;

 } else if (transcript.includes("friday stop the song") || transcript.includes("stop the song")|| transcript.includes("stop")) {
     respond("Stopping the song.", stopSong);
     return;
   
   //fiendly friday 
   
    } else if (transcript.includes('hi friday')) {
        const responses = ["Hi sir, what can I do for you sir?", "Hello sir, how can I assist you?", "hi sir! do you Need any help sir?",
             "Hi sir, what’s on your mind sir did you want me to do something?"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);

    } else if (transcript.includes('who are you')) {
        respond("my name is friday iam an assistant created by mister hemanthravi. iam comes under k e h b m groups. i am integrated to open page.my name is friday. open page is also known as open page friday. because of me.");
        return; // Add this to exit the handler

    } else if (transcript.includes('lets go friday') || transcript.includes('friday lets go') || transcript.includes('friday let s go') || transcript.includes('friday let go')) {
        respond("ok sir");
        return; 





    //amazon
    } else if (transcript.includes("open amazon")) {
        const responses = [".,Yes sir, opening Amazon for you!", ".,yup opening amazon", "Ok sir, launching Amazon.", "Opening Amazon now, happy shopping sir!", ".,Here you go sir, Amazon is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://www.amazon.com", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler

        //flipkart
} else if (transcript.includes("open flipkart") || transcript.includes("friday open flipkart") || transcript.includes("i want to shop on flipkart") || transcript.includes("friday i want to shop on flipkart")) {
        const responses = ["Yes sir, opening flipkart for you!", "yup opening flipkart", "Ok sir, launching flipkart.", "Opening flipkart now", "Here you go sir, flipkart is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://www.flipkart.com/", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler

        //google search
    } else if (transcript.includes("open search bar")|| transcript.includes('friday open search bar') || transcript.includes('friday open search bar')) {
        const responses = ["Yes sir, opening google search for you!", "yup opening google", "Ok sir, launching google.", "Opening google now", "Here you go sir, google is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://www.google.com/", "_blank");

        calculator.classList.remove('active');
        return; // Add this to exit the handler

        //youtube
    } else if (transcript.includes("open youtube")) {
        const responses = ["Yes sir, opening youtube for you!", "yup opening youtube", "Ok sir, launching youtube.", "Opening youtube now", "Here you go sir, youtube is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://www.youtube.com/", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler

        //chat gpt
    } else if (transcript.includes("open chat gpt") || transcript.includes("friday open chat gpt") || transcript.includes("i want to chat with gpt") || transcript.includes("friday i want to chat with gpt")) {
        const responses = ["Yes sir, opening chat gpt for you!", "yup opening chat gpt", "Ok sir, launching chat gpt.", "yes sir opening chat gpt right now", "Here you go sir, chat gpt is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://chatgpt.com/", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler

        //maker bazar
    } else if (transcript.includes("open maker bazar") || transcript.includes("friday open maker bazar") || transcript.includes("i want to shop on maker bazar") || transcript.includes("friday i want to shop on maker bazar")) {
        const responses = ["Yes sir, opening maker bazar for you!", "yup opening maker bazar", "Ok sir, launching maker bazar.", "yes sir opening maker bazar right now", "Here you go sir, maker bazar is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://makerbazar.in/", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler

        //google translate
    } else if (transcript.includes("open google translate") || transcript.includes("friday open google translate") || 
       transcript.includes("i want to translate on google") || transcript.includes("friday i want to translate on google")||
       transcript.includes("open translate") || transcript.includes("friday open translate")) {

        const responses = ["Yes sir, opening google translate for you!", "yup opening google translate", "Ok sir, launching google translate.", 
        "yes sir opening google translate right now"];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://translate.google.com/", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler
        //google drive
    } else if (transcript.includes("open google drive") || transcript.includes("friday open google drive") ||
         transcript.includes("friday open drive") || transcript.includes("open drive")) {

        const responses = ["Yes sir, opening google drive for you!", "yup opening google drive", "Ok sir, launching google drive.", "yes sir opening google drive right now", "Here you go sir, google drive is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://drive.google.com/", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler
        //google meet
    } else if (transcript.includes("open google meet") || transcript.includes("friday open google meet") ||
        transcript.includes("friday open meet") || transcript.includes(" open meet")) {
        const responses = ["Yes sir, opening google meet for you!", "yup opening google meet", "Ok sir, launching google meet.", "yes sir opening google meet right now", "Here you go sir, google meet is loading!"];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        respond(randomResponse);
        window.open("https://meet.google.com/", "_blank");
        calculator.classList.remove('active');
        return; // Add this to exit the handler

        //google gemini
    } else if (transcript.includes("open google gemini") || transcript.includes("friday open google gemini") ||
    transcript.includes("friday open gemini") || transcript.includes(" open gemini")) {
    const responses = ["Yes sir, opening google gemini a i for you!", "yup opening google gemini", "Ok sir, launching google gemini.", "yes sir opening gemini a i right now", "Here you go sir, google gemini is loading!"];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    respond(randomResponse);
    window.open("https://gemini.google.com/app", "_blank");
    calculator.classList.remove('active');
    return; // Add this to exit the handler

} else if (transcript.includes("open google sheets") || transcript.includes("friday open google sheets") ||
transcript.includes("friday open sheets") || transcript.includes(" open sheets")) {
const responses = ["Yes sir, opening google sheets for you!", "yup opening google sheets", "Ok sir, launching google sheets.", "yes sir opening sheets right now", "Here you go sir, google sheets is loading!"];
const randomResponse = responses[Math.floor(Math.random() * responses.length)];
respond(randomResponse);
window.open("https://docs.google.com/spreadsheets/u/0/", "_blank");
calculator.classList.remove('active');
return; // Add this to exit the handler



    } else if (transcript.includes('friday who is') || transcript.includes('friday what is') || 
               transcript.includes('tell me about') || transcript.includes('who is') || 
               transcript.includes('what is')) {
        const query = transcript.replace(/friday who is|friday what is|tell me about|who is|what is/gi, '').trim();
        fetchWikipediaSummary(query);
        calculator.classList.remove('active');
        return; // Add this to exit the handler

    } if (transcript.includes('friday tell me time') || transcript.includes('tell me time') || 
               transcript.includes('friday time') || transcript.includes('friday whats the time now') || 
               transcript.includes('whats the time now') || transcript.includes('friday whats the time') || 
               transcript.includes('whats the time')) {
        tellTime();
        return; // Add this to exit the handler

    } else if (transcript.includes('tell me today date') || transcript.includes('friday tell me today date') || 
               transcript.includes('friday, today date') || transcript.includes('today date')) {
        tellDate();
        return; // Add this to exit the handler


    } else if (transcript.includes('friday hide calculator') || (transcript.includes('friday hide the maths') || 
    transcript.includes('hide the maths') || transcript.includes('hide calculator'))) {
        calculator.classList.remove('active');
        respond("Calculator hidden.");
        return; // Add this to exit the handler

    } else if (transcript.match(/friday (solve|calculate)\s+(.+)/i)) {
        const match = transcript.match(/friday (solve|calculate)\s+(.+)/i);
        if (match) {
            const expression = match[2].trim(); // Extract the expression after "solve" or "calculate"
            calculator.classList.add('active'); // Show calculator UI
            solveMathExpression(expression);
        }
        
    } else if (transcript.match(/friday (\d+)\s*(multiplies|times|x|\*|\+|plus|-|minus|divided by|\/)\s*(\d+)/)) {
        // Keep the old simple two-number logic as a fallback
        const match = transcript.match(/friday (\d+)\s*(multiplies|times|x|\*|\+|plus|-|minus|divided by|\/)\s*(\d+)/);
        if (match) {
            const a = parseInt(match[1]);
            const op = match[2].replace('multiplies', '*').replace('times', '*').replace('x', '*').replace('plus', '+').replace('minus', '-').replace('divided by', '/');
            const b = parseInt(match[3]);
            calculator.classList.add('active');
            solveMath(a, op, b); // Keep the old function for simple cases
        }


    } else if (transcript.includes('friday show calculator') || transcript.includes('show calculator')) {
        calculator.classList.add('active');
        respond("Calculator displayed.");
        
    } else {
        respond("I didn't understand that. Try again!");
        return;
    }


    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
    //responces responces responces responces responces responces responces responces responces responces responces responces responces responces responces  
};




recognition.onend = () => {
    if (startBtn.disabled && !isSpeaking) {
        setTimeout(() => {
            try {
                recognition.start();
                status.textContent = "Restarting listener... Say 'Friday' to activate!";
            } catch (error) {
                console.log("Recognition restart failed:", error);
            }
        }, 100);
    }
};

recognition.onerror = (event) => {
    status.textContent = "Error occurred: " + event.error;
    if ((event.error === "no-speech" || event.error === "aborted") && !isSpeaking) recognition.start();
};




startBtn.addEventListener('click', () => {
    recognition.start();
    startBtn.disabled = true;
});

playBtn.addEventListener('click', () => {
    if (audioPlayer.paused && audioPlayer.currentTime > 0) {
        resumeSong();
    } else {
        playSong(currentSongIndex);
    }
});
pauseBtn.addEventListener('click', pauseSong);
nextBtn.addEventListener('click', playNextSong);
prevBtn.addEventListener('click', playPreviousSong);
repeatBtn.addEventListener('click', toggleRepeat);

document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-value');
        if (value === '=') {
            calculate();
        } else if (value === 'C') {
            calcDisplay.value = '';
        } else {
            calcDisplay.value += value;
        }
    });
});

audioPlayer.addEventListener('ended', () => {
    if (isRepeat) {
        playSong(currentSongIndex);
    } else {
        playNextSong();
    }
});

audioPlayer.addEventListener('error', (e) => {
    status.textContent = "Error loading audio: " + e.target.error.message;
    console.error("Audio error:", e.target.error);
});

function respond(text, callback) {
    response.textContent = `Response: ${text}`;
    speak(text);
    if (callback) callback();
}



function speak(text) {
    if (!isMuted) {
        if (isSpeaking || window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // Clear any ongoing speech
        }
        currentUtterance = new SpeechSynthesisUtterance(text);
        isSpeaking = true;
        recognition.stop();
        currentUtterance.onend = () => {
            isSpeaking = false;
            currentUtterance = null;
            if (!isMuted) {
                try {
                    recognition.start();
                    console.log("Recognition restarted after speaking");
                } catch (error) {
                    console.error("Recognition restart failed after speech:", error);
                }
            }
        };
        window.speechSynthesis.speak(currentUtterance);
    } else {
        console.log("Speech skipped - assistant is muted");
    }
}




function playSong(index) {
    if (index >= 0 && index < playlist.length) {
        currentSongIndex = index;
        audioPlayer.src = playlist[currentSongIndex].url;
        audioPlayer.play().then(() => {
            status.textContent = `Playing "${playlist[currentSongIndex].title}"`;
            respond(`Playing ${playlist[currentSongIndex].title}`);
        }).catch((error) => {
            status.textContent = "Failed to play song: " + error.message;
            console.error("Play error:", error);
        });
    }
}

function pauseSong() {
    audioPlayer.pause();
    status.textContent = "Music paused";
    respond("Music paused");
}

function resumeSong() {
    audioPlayer.play().then(() => {
        status.textContent = `Resuming "${playlist[currentSongIndex].title}"`;
        respond(`Resuming ${playlist[currentSongIndex].title}`);
    }).catch((error) => {
        status.textContent = "Failed to resume song: " + error.message;
        console.error("Resume error:", error);
    });
}

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    playSong(currentSongIndex);
}

function playPreviousSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(currentSongIndex);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
    status.textContent = isRepeat ? "Repeat mode on" : "Repeat mode off";
    respond(isRepeat ? "Repeat mode on" : "Repeat mode off");
}

function openURL(url) {
    window.open(url, '_blank');
    respond(`Opening ${url.split('.')[1]}`);
}


function fetchWikipediaSummary(query) {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.extract) {
                const link = `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
                respond(data.extract);
                resultDisplay.innerHTML = `<p>${data.extract.substring(0, 200)}...</p><a href="${link}" target="_blank">Read more on Wikipedia</a>`;
            } else {
                respond("I couldn't find any information on that.");
            }
        })
        .catch(error => {
            console.error('Error fetching Wikipedia data:', error);
            respond("Sorry, I couldn't fetch the information.");
        });
}

function tellTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    respond(`The current time is ${timeString}.`);
}

function tellDate() {
    const now = new Date();
    const dateString = now.toDateString();
    respond(`Today's date is ${dateString}.`);
}

function solveMath(a, op, b) {
    let result;
    let steps = `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b} = `;
    switch (op) {
        case '+':
            result = a + b;
            steps += result;
            break;
        case '-':
            result = a - b;
            steps += result;
            break;
        case '*':
            result = a * b;
            steps += result;
            break;
        case '/':
            result = a / b;
            steps += result;
            break;
    }
    calcDisplay.value = steps;
    respond(`The result of ${a} ${op === '*' ? 'times' : op === '/' ? 'divided by' : op} ${b} is ${result}.`);
}

function solveMathExpression(expression) {
    try {
        expression = expression
            .replace(/multiplies|times|x/gi, '*')
            .replace(/divided by/gi, '/')
            .replace(/plus/gi, '+')
            .replace(/minus/gi, '-')
            .replace(/\s+/g, '');

        // Tokenize the expression
        const tokens = expression.match(/(\d+\.?\d*|[+\-*/])/g);
        if (!tokens || !/^[0-9+\-*/.]+$/.test(expression)) {
            throw new Error("Invalid expression");
        }

        // First pass: Handle multiplication and division
        let i = 0;
        while (i < tokens.length) {
            if (tokens[i] === '*' || tokens[i] === '/') {
                const a = parseFloat(tokens[i - 1]);
                const b = parseFloat(tokens[i + 1]);
                const result = tokens[i] === '*' ? a * b : a / b;
                tokens.splice(i - 1, 3, result);
                i--;
            }
            i++;
        }

        // Second pass: Handle addition and subtraction
        let result = parseFloat(tokens[0]);
        for (let i = 1; i < tokens.length; i += 2) {
            const op = tokens[i];
            const b = parseFloat(tokens[i + 1]);
            result = op === '+' ? result + b : result - b;
        }

        const steps = `${expression} = ${result}`;
        calcDisplay.value = steps;
        respond(`The result of ${expression.replace(/\*/g, ' times ').replace(/\//g, ' divided by ').replace(/\+/g, ' plus ').replace(/\-/g, ' minus ')} is ${result}.`);
        return result;
    } catch (error) {
        respond("Sorry, I couldn’t solve that. Please check the expression and try again!");
        calcDisplay.value = "Error";
        console.error("Math error:", error);
        return null;
    }
}



function calculate() {
    const expression = calcDisplay.value;
    const match = expression.match(/(\d+)\s*([+\-×÷*\/])\s*(\d+)/);
    if (match) {
        const a = parseInt(match[1]);
        const op = match[2].replace('×', '*').replace('÷', '/');
        const b = parseInt(match[3]);
        solveMath(a, op, b);
        speakAnswer(result);
    } else {
        respond("Invalid expression. Please use numbers and operators (+, -, ×, ÷).");
    }
}

// Updated Song Control Functions
function playSong(index) {
if (index >= 0 && index < playlist.length) {
    currentSongIndex = index;
    audioPlayer.src = playlist[currentSongIndex].url;
    audioPlayer.play().then(() => {
        status.textContent = `Playing "${playlist[currentSongIndex].title}"`;
    }).catch((error) => {
        status.textContent = "Failed to play song: " + error.message;
        console.error("Play error:", error);
    });
}
}

function playSongByTitle(title) {
const songIndex = playlist.findIndex(song => song.title.toLowerCase() === title.toLowerCase());
if (songIndex !== -1) {
    currentSongIndex = songIndex;
    playSong(currentSongIndex);
} else {
    respond("Song not found in the playlist!");
}
}

function stopSong() {
audioPlayer.pause();
audioPlayer.currentTime = 0;
status.textContent = "Stopped the song.";
}

function pauseSong() {
audioPlayer.pause();
status.textContent = "Music paused";
}

function resumeSong() {
audioPlayer.play().then(() => {
    status.textContent = `Resuming "${playlist[currentSongIndex].title}"`;
}).catch((error) => {
    status.textContent = "Failed to resume song: " + error.message;
    console.error("Resume error:", error);
});
}

function playNextSong() {
currentSongIndex = (currentSongIndex + 1) % playlist.length;
playSong(currentSongIndex);
}

function playPreviousSong() {
currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
playSong(currentSongIndex);
}

function toggleRepeat() {
isRepeat = !isRepeat;
repeatBtn.classList.toggle('active', isRepeat);
status.textContent = isRepeat ? "Repeat mode on" : "Repeat mode off";
}










//timer settings









// Helper functions
// Update Helper Functions
// Helper functions
function updateTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function createTimerDisplay(timer) {
    const existing = document.getElementById(`timer-${timer.id}`);
    if (!existing) {
        const timerDiv = document.createElement('div');
        timerDiv.id = `timer-${timer.id}`;
        timerDiv.dataset.name = timer.name; // Store name for display
        timerDiv.textContent = `${timer.name}: 00:00`;
        document.getElementById('timers-container').appendChild(timerDiv);
    }
}



function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    let timeStr = '';
    if (h > 0) timeStr += `${h} hour${h > 1 ? 's' : ''} `;
    if (m > 0) timeStr += `${m} minute${m > 1 ? 's' : ''} `;
    if (s > 0) timeStr += `${s} second${s > 1 ? 's' : ''}`;
    return timeStr.trim();
}

function showNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: message });
            }
        });
    }
}

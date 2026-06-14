// ===== 12-KEY MODULATION WORKOUT COMPANION APP =====

// 1. App configuration and State
const VIDEO_IDS = {
    minor: {
        slow: "zw8vYGlkZzg",
        medium: "LYqkw1UcR7g",
        fast: "0lAIsCrSzKk"
    },
    major: {
        slow: "1eeqr9FiEmc",
        medium: "zEiHCJZhF9M",
        fast: "2ukT_WA0Lmo"
    }
};

const BPM_MAP = {
    slow: 80,
    medium: 100,
    fast: 120
};

const START_OFFSETS = {
    slow: 3.0,
    medium: 2.4,
    fast: 2.0
};

// Key progressions data
const MINOR_KEYS = [
    { name: "A Minor", root: "A", chords: ["Am9", "Dm9", "G13", "Cmaj9"] },
    { name: "E Minor", root: "E", chords: ["Em9", "Am9", "D13", "Gmaj9"] },
    { name: "B Minor", root: "B", chords: ["Bm9", "Em9", "A13", "Dmaj9"] },
    { name: "F# Minor", root: "F#", chords: ["F#m9", "Bm9", "E13", "Amaj9"] },
    { name: "C# Minor", root: "C#", chords: ["C#m9", "F#m9", "B13", "Emaj9"] },
    { name: "G# Minor", root: "G#", chords: ["G#m9", "C#m9", "F#13", "Bmaj9"] },
    { name: "Eb Minor", root: "Eb", chords: ["Ebm9", "Abm9", "Db13", "Gbmaj9"] },
    { name: "Bb Minor", root: "Bb", chords: ["Bbm9", "Ebm9", "Ab13", "Dbmaj9"] },
    { name: "F Minor", root: "F", chords: ["Fm9", "Bbm9", "Eb13", "Abmaj9"] },
    { name: "C Minor", root: "C", chords: ["Cm9", "Fm9", "Bb13", "Ebmaj9"] },
    { name: "G Minor", root: "G", chords: ["Gm9", "Cm9", "F13", "Bbmaj9"] },
    { name: "D Minor", root: "D", chords: ["Dm9", "Gm9", "C13", "Fmaj9"] }
];

const MAJOR_KEYS = [
    { name: "C Major", root: "C", chords: ["Dm9", "G13", "Cmaj9", "A9"] },
    { name: "G Major", root: "G", chords: ["Am9", "D13", "Gmaj9", "E9"] },
    { name: "D Major", root: "D", chords: ["Em9", "A13", "Dmaj9", "B9"] },
    { name: "A Major", root: "A", chords: ["Bm9", "E13", "Amaj9", "F#9"] },
    { name: "E Major", root: "E", chords: ["F#m9", "B13", "Emaj9", "C#9"] },
    { name: "B Major", root: "B", chords: ["C#m9", "F#13", "Bmaj9", "G#9"] },
    { name: "Gb Major", root: "Gb", chords: ["Abm9", "Db13", "Gbmaj9", "Eb9"] },
    { name: "Db Major", root: "Db", chords: ["Ebm9", "Ab13", "Dbmaj9", "Bb9"] },
    { name: "Ab Major", root: "Ab", chords: ["Bbm9", "Eb13", "Abmaj9", "F9"] },
    { name: "Eb Major", root: "Eb", chords: ["Fm9", "Bb13", "Ebmaj9", "C9"] },
    { name: "Bb Major", root: "Bb", chords: ["Cm9", "F13", "Bbmaj9", "G9"] },
    { name: "F Major", root: "F", chords: ["Gm9", "C13", "Fmaj9", "D9"] }
];

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const NOTE_VALS = {
    "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11
};

// Guitar string open notes (1st string High E to 6th string Low E)
const STRINGS_OPEN = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E

// Global Application State
let appState = {
    mode: "minor",       // minor or major
    tempo: "slow",       // slow, medium, fast
    labelMode: "notes",  // notes or intervals
    activeKeyIndex: 0,
    activeChordIndex: 0,
    isPlaying: false
};

let player = null;
let updateInterval = null;

// 2. Initial Setup on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    initControls();
    initMobileNav();
    drawCircleOfFifths();
    drawFretboard();
    buildLeadSheet();
    updateUI();
    
    // Trigger fade-in animations with a staggered delay for a premium feel
    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add("visible");
        }, index * 80);
    });
});

// Mobile Nav Toggle
function initMobileNav() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

// 3. UI Control Initialization
function initControls() {
    // Mode Buttons
    const modeButtons = document.querySelectorAll("#mode-toggle button");
    modeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            modeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            appState.mode = btn.dataset.mode;
            document.body.setAttribute("data-active-mode", appState.mode);
            
            // Reload player, wheel, leadsheet
            drawCircleOfFifths();
            buildLeadSheet();
            if (player && typeof player.loadVideoById === "function") {
                player.loadVideoById(VIDEO_IDS[appState.mode][appState.tempo]);
            }
            updateUI();
        });
    });

    // Tempo Buttons
    const tempoButtons = document.querySelectorAll("#tempo-toggle button");
    tempoButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tempoButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            appState.tempo = btn.dataset.tempo;
            
            document.getElementById("bpm-display-label").innerText = `${BPM_MAP[appState.tempo]} BPM`;
            
            // Reload video
            if (player && typeof player.loadVideoById === "function") {
                player.loadVideoById(VIDEO_IDS[appState.mode][appState.tempo]);
            }
            updateUI();
        });
    });

    // Label Mode Buttons
    const labelButtons = document.querySelectorAll("#label-toggle button");
    labelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            labelButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            appState.labelMode = btn.dataset.label;
            
            drawFretboard();
        });
    });
    
    document.body.setAttribute("data-active-mode", appState.mode);
}

// 4. YouTube Player integration
// Called by YouTube Iframe API when ready
window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: VIDEO_IDS[appState.mode][appState.tempo],
        playerVars: {
            playsinline: 1,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onStateChange: onPlayerStateChange
        }
    });
};

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        appState.isPlaying = true;
        startUpdateTimer();
    } else {
        appState.isPlaying = false;
        stopUpdateTimer();
    }
}

function startUpdateTimer() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
        if (player && typeof player.getCurrentTime === "function") {
            const curTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            // Format time display
            document.getElementById("player-time-display").innerText = 
                `${formatTime(curTime)} / ${formatTime(duration)}`;
                
            syncPlaybackToMusic(curTime);
        }
    }, 100); // Update every 100ms
}

function stopUpdateTimer() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "00:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 5. Playback Synchronization Logic
function syncPlaybackToMusic(currentTime) {
    const bpm = BPM_MAP[appState.tempo];
    const offset = START_OFFSETS[appState.tempo];
    
    if (currentTime < offset) {
        // Count in phase
        appState.activeKeyIndex = 0;
        appState.activeChordIndex = -1; // special state
        updateUI();
        return;
    }
    
    const elapsed = currentTime - offset;
    const beatDuration = 60 / bpm;
    const currentBeat = elapsed / beatDuration;
    
    // Each key section has 16 beats (4 measures of 4 beats)
    const beatsPerKey = 16;
    const totalBeatsInLoop = beatsPerKey * 12; // 192 beats
    
    const beatInLoop = currentBeat % totalBeatsInLoop;
    const keyIndex = Math.floor(beatInLoop / beatsPerKey);
    const beatInKey = beatInLoop % beatsPerKey;
    const chordIndex = Math.floor(beatInKey / 4); // 4 beats per chord
    
    if (keyIndex !== appState.activeKeyIndex || chordIndex !== appState.activeChordIndex) {
        appState.activeKeyIndex = keyIndex;
        appState.activeChordIndex = chordIndex;
        updateUI();
    }
}

// 6. Draw Circle of Fifths Controller
function drawCircleOfFifths() {
    const sectorsGroup = document.getElementById("wheel-sectors-group");
    sectorsGroup.innerHTML = ""; // Clear existing
    
    const cx = 250;
    const cy = 250;
    const r_in = 100;
    const r_out = 230;
    const r_text = 165;
    
    const keysData = appState.mode === "minor" ? MINOR_KEYS : MAJOR_KEYS;
    
    for (let i = 0; i < 12; i++) {
        const key = keysData[i];
        
        // Calculate sector wedge angles
        // Center of slice i is at i * 30 degrees, 0 is at 12 o'clock (-90 degrees)
        const startDeg = -90 + (i * 30) - 15;
        const endDeg = -90 + (i * 30) + 15;
        
        const startRad = startDeg * Math.PI / 180;
        const endRad = endDeg * Math.PI / 180;
        
        const pathData = getDonutWedgePath(cx, cy, r_in, r_out, startRad, endRad);
        
        // Create SVG Path element
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", "wheel-sector");
        path.setAttribute("id", `sector-${i}`);
        path.setAttribute("fill", "var(--color-bg-primary)");
        path.setAttribute("stroke", "var(--color-border-glass)");
        path.setAttribute("stroke-width", "1");
        
        // Click handler to seek video to selected key center section
        path.addEventListener("click", () => {
            if (player && typeof player.seekTo === "function") {
                const bpm = BPM_MAP[appState.tempo];
                const offset = START_OFFSETS[appState.tempo];
                const beatDuration = 60 / bpm;
                
                // Seek to start of key segment i
                // (each segment is 16 beats)
                const targetTime = offset + (i * 16 * beatDuration) + 0.1;
                player.seekTo(targetTime, true);
                if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
                    player.playVideo();
                }
            }
        });
        
        sectorsGroup.appendChild(path);
        
        // Create Text Label for Sector
        const midRad = (-90 + (i * 30)) * Math.PI / 180;
        const tx = cx + r_text * Math.cos(midRad);
        const ty = cy + r_text * Math.sin(midRad) + 5; // tiny vertical offset to center
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", tx);
        text.setAttribute("y", ty);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("class", "sector-text");
        
        // Use shorter root names for cleaner display
        const displayLabel = key.name.replace(" Major", "").replace(" Minor", "m");
        text.textContent = displayLabel;
        
        sectorsGroup.appendChild(text);
    }
}

function getDonutWedgePath(cx, cy, r_in, r_out, startRad, endRad) {
    const x1_out = cx + r_out * Math.cos(startRad);
    const y1_out = cy + r_out * Math.sin(startRad);
    const x2_out = cx + r_out * Math.cos(endRad);
    const y2_out = cy + r_out * Math.sin(endRad);
    
    const x1_in = cx + r_in * Math.cos(startRad);
    const y1_in = cy + r_in * Math.sin(startRad);
    const x2_in = cx + r_in * Math.cos(endRad);
    const y2_in = cy + r_in * Math.sin(endRad);
    
    return `
        M ${x1_out} ${y1_out}
        A ${r_out} ${r_out} 0 0 1 ${x2_out} ${y2_out}
        L ${x2_in} ${y2_in}
        A ${r_in} ${r_in} 0 0 0 ${x1_in} ${y1_in}
        Z
    `;
}

// 7. Scrolling Lead Sheet builder
function buildLeadSheet() {
    const scroller = document.getElementById("chord-scroller");
    scroller.innerHTML = ""; // Clear existing
    
    const keysData = appState.mode === "minor" ? MINOR_KEYS : MAJOR_KEYS;
    const romanNumerals = appState.mode === "minor" ? ["i", "iv", "VII", "III"] : ["ii", "V", "I", "VI7"];
    
    let boxIndex = 0;
    
    for (let k = 0; k < 12; k++) {
        const key = keysData[k];
        for (let c = 0; c < 4; c++) {
            const chord = key.chords[c];
            
            const box = document.createElement("div");
            box.className = "chord-box";
            box.id = `chord-box-${boxIndex}`;
            
            const nameEl = document.createElement("div");
            nameEl.className = "chord-box-name";
            nameEl.innerText = chord;
            
            const romanEl = document.createElement("div");
            romanEl.className = "chord-box-roman";
            romanEl.innerText = `${romanNumerals[c]} (${key.name.replace(" Major", "").replace(" Minor", "m")})`;
            
            box.appendChild(nameEl);
            box.appendChild(romanEl);
            
            // Allow user to click directly on a chord box to seek there!
            box.addEventListener("click", () => {
                if (player && typeof player.seekTo === "function") {
                    const bpm = BPM_MAP[appState.tempo];
                    const offset = START_OFFSETS[appState.tempo];
                    const beatDuration = 60 / bpm;
                    
                    // Seek to exact chord beat (k * 16 beats + c * 4 beats)
                    const targetTime = offset + ((k * 16 + c * 4) * beatDuration) + 0.1;
                    player.seekTo(targetTime, true);
                    if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
                        player.playVideo();
                    }
                }
            });
            
            scroller.appendChild(box);
            boxIndex++;
        }
    }
}

// 8. Guitar Fretboard visualizer drawing
function drawFretboard() {
    const svg = document.getElementById("guitar-fretboard");
    svg.innerHTML = ""; // Clear existing
    
    const width = 1200;
    const height = 240;
    const numFrets = 15;
    
    const nutX = 60;
    const fretSpacing = 73; // spacing in px
    
    // A. Draw Neck Wood Background
    const neck = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    neck.setAttribute("x", nutX);
    neck.setAttribute("y", 20);
    neck.setAttribute("width", numFrets * fretSpacing);
    neck.setAttribute("height", 200);
    neck.setAttribute("class", "fretboard-neck");
    svg.appendChild(neck);
    
    // B. Draw Nut Line
    const nut = document.createElementNS("http://www.w3.org/2000/svg", "line");
    nut.setAttribute("x1", nutX);
    nut.setAttribute("y1", 20);
    nut.setAttribute("x2", nutX);
    nut.setAttribute("y2", 220);
    nut.setAttribute("stroke", "#ffffff"); // white nut
    nut.setAttribute("stroke-width", "6");
    svg.appendChild(nut);
    
    // C. Draw Inlay Dots (Frets 3, 5, 7, 9, 15, double at 12)
    const inlayFrets = [3, 5, 7, 9, 15];
    inlayFrets.forEach(f => {
        const fx = nutX + (f - 0.5) * fretSpacing;
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", fx);
        dot.setAttribute("cy", 120);
        dot.setAttribute("r", "8");
        dot.setAttribute("class", "inlay-dot");
        svg.appendChild(dot);
    });
    
    // Double inlay dot at fret 12
    const f12x = nutX + (12 - 0.5) * fretSpacing;
    const dot1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot1.setAttribute("cx", f12x);
    dot1.setAttribute("cy", 70);
    dot1.setAttribute("r", "8");
    dot1.setAttribute("class", "inlay-dot");
    svg.appendChild(dot1);
    
    const dot2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot2.setAttribute("cx", f12x);
    dot2.setAttribute("cy", 170);
    dot2.setAttribute("r", "8");
    dot2.setAttribute("class", "inlay-dot");
    svg.appendChild(dot2);
    
    // D. Draw Fretwires and numbers
    for (let f = 1; f <= numFrets; f++) {
        const fx = nutX + f * fretSpacing;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", fx);
        line.setAttribute("y1", 20);
        line.setAttribute("x2", fx);
        line.setAttribute("y2", 220);
        line.setAttribute("class", "fret-wire");
        svg.appendChild(line);
        
        // Fret numbers drawn below neck
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", fx - (fretSpacing / 2));
        label.setAttribute("y", 238);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("class", "fret-num");
        label.textContent = f;
        svg.appendChild(label);
    }
    
    // E. Draw Strings (from High E to Low E)
    const stringY = [35, 69, 103, 137, 171, 205];
    for (let s = 0; s < 6; s++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 20); // starts slightly before nut
        line.setAttribute("y1", stringY[s]);
        line.setAttribute("x2", nutX + numFrets * fretSpacing);
        line.setAttribute("y2", stringY[s]);
        line.setAttribute("class", `guitar-string string-${s+1}`);
        svg.appendChild(line);
    }
    
    // F. Populate Active Scale Notes & Chord Tones
    // Get active chord details
    const keysData = appState.mode === "minor" ? MINOR_KEYS : MAJOR_KEYS;
    const currentKey = keysData[appState.activeKeyIndex];
    
    // In count-in phase, activeChordIndex is -1. Use 0 as fallback
    const cIndex = appState.activeChordIndex >= 0 ? appState.activeChordIndex : 0;
    const chord = currentKey.chords[cIndex];
    
    const noteData = parseChordScale(chord, currentKey.root, appState.mode);
    if (!noteData) return;
    
    // Iterate all strings and frets (0 to 15) to place note markers
    for (let s = 0; s < 6; s++) {
        const openNote = STRINGS_OPEN[s];
        for (let f = 0; f <= numFrets; f++) {
            const noteVal = (openNote + f) % 12;
            
            // Check if note is in active scale
            if (noteData.scaleVals.includes(noteVal)) {
                // Determine marker category
                let category = "scale";
                if (noteVal === noteData.rootVal) {
                    category = "root";
                } else if (noteData.chordVals.includes(noteVal)) {
                    category = "chord";
                }
                
                // Position X coordinate
                let markerX = 0;
                if (f === 0) {
                    markerX = 35; // open note marker position
                } else {
                    markerX = nutX + (f - 0.5) * fretSpacing; // fretted position
                }
                
                const markerY = stringY[s];
                
                // SVG Circle
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", markerX);
                circle.setAttribute("cy", markerY);
                circle.setAttribute("r", f === 0 ? "11" : "12");
                circle.setAttribute("class", `note-marker note-marker-${category}`);
                svg.appendChild(circle);
                
                // SVG text label inside circle
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", markerX);
                text.setAttribute("y", markerY + 3.5); // vertical offset centering
                text.setAttribute("class", "note-marker-text");
                
                if (appState.labelMode === "notes") {
                    text.textContent = NOTE_NAMES[noteVal];
                } else {
                    text.textContent = getIntervalName(noteVal, noteData.rootVal);
                }
                svg.appendChild(text);
            }
        }
    }
}

// 9. Music Chord & Scale Parser
function parseChordScale(chordName, keyRoot, mode) {
    // Determine chord root
    let rootStr = "";
    if (chordName.startsWith("F#") || chordName.startsWith("C#") || chordName.startsWith("Eb") || chordName.startsWith("Bb") || chordName.startsWith("Ab") || chordName.startsWith("Db") || chordName.startsWith("Gb")) {
        rootStr = chordName.substring(0, 2);
    } else {
        rootStr = chordName.substring(0, 1);
    }
    
    const rootVal = NOTE_VALS[rootStr];
    if (rootVal === undefined) return null;
    
    let chordVals = [];
    let scaleVals = [];
    let scaleName = "";
    
    // Parse suffixes
    if (chordName.includes("m9")) {
        // Minor 9th: Root, b3, 5, b7, 9
        chordVals = getNotesFromIntervals(rootVal, [0, 3, 7, 10, 2]);
        // Dorian Scale: 1, 2, b3, 4, 5, 6, b7
        scaleVals = getNotesFromIntervals(rootVal, [0, 2, 3, 5, 7, 9, 10]);
        scaleName = `${rootStr} Dorian Scale`;
    } else if (chordName.includes("maj9")) {
        // Major 9th: Root, 3, 5, 7, 9
        chordVals = getNotesFromIntervals(rootVal, [0, 4, 7, 11, 2]);
        // Ionian Scale: 1, 2, 3, 4, 5, 6, 7
        scaleVals = getNotesFromIntervals(rootVal, [0, 2, 4, 5, 7, 9, 11]);
        scaleName = `${rootStr} Ionian Scale`;
    } else if (chordName.includes("13")) {
        // Dominant 13th: Root, 3, 5, b7, 9, 13
        chordVals = getNotesFromIntervals(rootVal, [0, 4, 7, 10, 2, 9]);
        // Mixolydian Scale: 1, 2, 3, 4, 5, 6, b7
        scaleVals = getNotesFromIntervals(rootVal, [0, 2, 4, 5, 7, 9, 10]);
        scaleName = `${rootStr} Mixolydian Scale`;
    } else if (chordName.includes("9")) {
        // Dominant 9th: Root, 3, 5, b7, 9
        chordVals = getNotesFromIntervals(rootVal, [0, 4, 7, 10, 2]);
        // Mixolydian Scale
        scaleVals = getNotesFromIntervals(rootVal, [0, 2, 4, 5, 7, 9, 10]);
        scaleName = `${rootStr} Mixolydian Scale`;
    }
    
    return {
        rootVal,
        chordVals,
        scaleVals,
        scaleName
    };
}

function getNotesFromIntervals(root, intervals) {
    return intervals.map(semitones => (root + semitones) % 12);
}

function getIntervalName(noteVal, rootVal) {
    const diff = (noteVal - rootVal + 12) % 12;
    const intervalsMap = {
        0: "R",
        1: "b9",
        2: "9",
        3: "b3",
        4: "3",
        5: "11",
        6: "#11",
        7: "5",
        8: "b13",
        9: "13",
        10: "b7",
        11: "7"
    };
    return intervalsMap[diff] || "";
}

// 10. Master UI State updates
function updateUI() {
    const keysData = appState.mode === "minor" ? MINOR_KEYS : MAJOR_KEYS;
    const currentKey = keysData[appState.activeKeyIndex];
    
    // Fallback if count-in
    const cIndex = appState.activeChordIndex >= 0 ? appState.activeChordIndex : 0;
    const activeChord = currentKey.chords[cIndex];
    
    // Update badge & center wheel label
    const displayKey = currentKey.name;
    document.getElementById("active-key-badge").innerText = 
        appState.activeChordIndex >= 0 ? `${activeChord} (${displayKey})` : "Count-In Phase";
        
    document.getElementById("center-active-label").textContent = displayKey.replace(" Major", "").replace(" Minor", "m");
    
    // Update Fretboard descriptor text
    const noteData = parseChordScale(activeChord, currentKey.root, appState.mode);
    if (noteData) {
        document.getElementById("fretboard-scale-name").innerText = noteData.scaleName;
        document.getElementById("fretboard-chord-name").innerText = activeChord;
    }
    
    // Highlight Circle of Fifths segment
    document.querySelectorAll(".wheel-sector").forEach(el => el.classList.remove("active"));
    const activeSector = document.getElementById(`sector-${appState.activeKeyIndex}`);
    if (activeSector) {
        activeSector.classList.add("active");
    }
    
    // Update Leadsheet chords scrolling highlight
    document.querySelectorAll(".chord-box").forEach(el => el.classList.remove("active"));
    
    if (appState.activeChordIndex >= 0) {
        const activeChordBoxIndex = appState.activeKeyIndex * 4 + appState.activeChordIndex;
        const activeBox = document.getElementById(`chord-box-${activeChordBoxIndex}`);
        if (activeBox) {
            activeBox.classList.add("active");
            
            // Auto-scroll the container to center active box
            const scroller = document.getElementById("chord-scroller");
            if (scroller) {
                const boxOffset = activeBox.offsetLeft;
                const containerWidth = scroller.clientWidth;
                const boxWidth = activeBox.clientWidth;
                
                scroller.scrollTo({
                    left: boxOffset - (containerWidth / 2) + (boxWidth / 2),
                    behavior: "smooth"
                });
            }
        }
    }
    
    // Update Fretboard note markers
    drawFretboard();
}

function countSyllables(word) {
    word = word.toLowerCase();
    word = word.replace(/[^a-zA-Z]/g, '');
    
    if (word.length <= 3) return 1;
    
    word = word.replace(/e$/, '');
    const vowels = word.match(/[aeiouy]+/g);
    
    if (!vowels) return 1;
    
    let syllableCount = vowels.length;
    syllableCount -= (word.match(/[aeiouy][aeiouy]/g) || []).length;
    
    if (word.match(/(?:es|ed)$/)) {
        syllableCount--;
    }
    
    return Math.max(1, syllableCount);
}

function getRhymeSound(word) {
    word = word.toLowerCase().trim();
    // Remove punctuation and numbers
    word = word.replace(/[^a-z]/g, '');
    
    if (word.length <= 3) {
        return word;
    }
    
    // Get the last syllable sound
    const vowelSounds = word.match(/[aeiouy]+[^aeiouy]*$/);
    if (vowelSounds) {
        return vowelSounds[0];
    }
    
    // Fallback to last 3 characters if no vowel sounds found
    return word.slice(-3);
}

function findRhymingWords(words) {
    const rhymeGroups = {};
    const cleanWords = words.map(word => word.replace(/[^a-zA-Z]/g, ''));
    
    // Group words by their rhyme sounds
    cleanWords.forEach((word, i) => {
        if (word.length < 2) return; // Skip very short words
        
        const rhymeSound = getRhymeSound(word);
        if (!rhymeGroups[rhymeSound]) {
            rhymeGroups[rhymeSound] = [];
        }
        rhymeGroups[rhymeSound].push(i);
    });
    
    // Only keep groups with multiple words
    return Object.entries(rhymeGroups)
        .filter(([_, indices]) => indices.length > 1)
        .reduce((acc, [sound, indices], groupIndex) => {
            indices.forEach(i => {
                acc[i] = groupIndex;
            });
            return acc;
        }, {});
}

function getColorForRhymeGroup(groupIndex) {
    const colors = [
        '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9',
        '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9',
        '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2'
    ];
    return colors[groupIndex % colors.length];
}

function updateResults() {
    const text = document.getElementById('textInput').value;
    const lines = text.split('\n');
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    
    // Process all words in the text
    const allWords = text.split(/\s+/);
    const rhymeGroups = findRhymingWords(allWords);
    
    lines.forEach(line => {
        if (line.trim()) {
            const words = line.trim().split(/\s+/);
            const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
            
            const lineDiv = document.createElement('div');
            lineDiv.className = 'line-result';
            
            // Create the line text with highlighted rhyming words
            const textSpan = document.createElement('span');
            let wordIndex = 0;
            
            words.forEach((word, i) => {
                const cleanWord = word.replace(/[^a-zA-Z]/g, '');
                const span = document.createElement('span');
                span.className = 'word';
                
                if (cleanWord && rhymeGroups.hasOwnProperty(wordIndex)) {
                    span.style.backgroundColor = getColorForRhymeGroup(rhymeGroups[wordIndex]);
                }
                
                span.textContent = word + (i < words.length - 1 ? ' ' : '');
                textSpan.appendChild(span);
                
                if (cleanWord) wordIndex++;
            });
            
            const syllableSpan = document.createElement('span');
            syllableSpan.className = 'syllable-count';
            syllableSpan.textContent = `${syllables} syllables`;
            
            lineDiv.appendChild(textSpan);
            lineDiv.appendChild(syllableSpan);
            resultDiv.appendChild(lineDiv);
        }
    });
}

document.getElementById('textInput').addEventListener('input', updateResults);
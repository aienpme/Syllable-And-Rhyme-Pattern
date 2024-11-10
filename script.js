// Syllable counting function with improved accuracy
function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return 0;

    // List of common exceptions
    const exceptions = {
        'area': 3, 'idea': 3, 'real': 2, 'theatre': 2, 'every': 3,
        'evening': 2, 'everything': 3, 'interesting': 3, 'deliberately': 5,
        'variable': 4, 'little': 2, 'business': 2
    };
    
    if (exceptions[word]) return exceptions[word];

    // Count basic syllables
    let count = 0;
    let vowels = word.match(/[aeiouy]+/g);
    
    if (!vowels) return 1;
    
    count = vowels.length;

    // Subtract for diphthongs and triphthongs
    count -= (word.match(/[aeiouy][aeiouy]+/g) || []).length;
    
    // Check for silent e
    if (word.match(/[^aeiou]e$/) && !word.match(/le$/)) count--;
    
    // Add for special endings
    if (word.match(/(?:ian|ial|ium|ius)$/)) count++;
    if (word.match(/[^aeiou]le$/)) count++;

    return Math.max(1, count);
}

// Enhanced rhyme sound extraction
function getRhymeSound(word) {
    word = word.toLowerCase().trim().replace(/[^a-z]/g, '');
    if (word.length < 2) return '';

    // Common suffixes that affect rhyming
    const suffixes = ['ing', 'ed', 'es', 's', 'ly'];
    let baseWord = word;
    for (let suffix of suffixes) {
        if (word.endsWith(suffix)) {
            baseWord = word.slice(0, -suffix.length);
            break;
        }
    }

    // Get the stressed syllable sound
    const vowelPattern = /[aeiouy]+/g;
    const consonantPattern = /[^aeiouy]+/g;
    let syllables = baseWord.match(new RegExp(`[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[aeiouy]))`, 'g')) || [];
    
    if (syllables.length === 0) return baseWord;
    
    // For words with multiple syllables, focus on the last stressed syllable
    let rhymeSound = syllables[syllables.length - 1];
    
    // Include preceding consonant cluster for better matching
    let precedingConsonants = baseWord.slice(0, -rhymeSound.length).match(/[^aeiouy]+$/);
    if (precedingConsonants) {
        rhymeSound = precedingConsonants[0] + rhymeSound;
    }

    return rhymeSound;
}

function findRhymingWords(words) {
    const rhymeGroups = {};
    const cleanWords = words.map(word => word.replace(/[^a-zA-Z]/g, ''));
    
    // Group words by their rhyme sounds
    cleanWords.forEach((word, i) => {
        if (word.length < 2) return;
        
        const rhymeSound = getRhymeSound(word);
        if (!rhymeGroups[rhymeSound]) {
            rhymeGroups[rhymeSound] = [];
        }
        rhymeGroups[rhymeSound].push(i);
    });

    // Filter out non-rhyming words and organize by strength of rhyme
    const strongRhymes = {};
    const weakRhymes = {};
    
    Object.entries(rhymeGroups).forEach(([sound, indices]) => {
        if (indices.length > 1) {
            // Check if it's a strong rhyme (sharing more phonetic features)
            if (sound.length >= 3) {
                strongRhymes[sound] = indices;
            } else {
                weakRhymes[sound] = indices;
            }
        }
    });

    // Combine and assign colors, prioritizing strong rhymes
    const finalGroups = {};
    let groupIndex = 0;

    Object.values(strongRhymes).forEach(indices => {
        indices.forEach(i => {
            finalGroups[i] = groupIndex;
        });
        groupIndex++;
    });

    Object.values(weakRhymes).forEach(indices => {
        indices.forEach(i => {
            if (!finalGroups.hasOwnProperty(i)) {
                finalGroups[i] = groupIndex;
            }
        });
        groupIndex++;
    });

    return finalGroups;
}

function getColorForRhymeGroup(groupIndex) {
    const colors = [
        '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9',
        '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9',
        '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2',
        '#ffccbc', '#d7ccc8', '#cfd8dc'
    ];
    return colors[groupIndex % colors.length];
}

function updateResults() {
    const text = document.getElementById('textInput').value;
    const lines = text.split('\n');
    const resultDiv = document.getElementById('result');
    const rhymeInfoDiv = document.getElementById('rhymeInfo');
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
            
            const textSpan = document.createElement('span');
            let wordIndex = 0;
            
            words.forEach((word, i) => {
                const cleanWord = word.replace(/[^a-zA-Z]/g, '');
                const span = document.createElement('span');
                span.className = 'word';
                
                if (cleanWord && rhymeGroups.hasOwnProperty(wordIndex)) {
                    const color = getColorForRhymeGroup(rhymeGroups[wordIndex]);
                    span.style.backgroundColor = color;
                    // Add hover effect to show rhyme group
                    span.setAttribute('data-rhyme-group', rhymeGroups[wordIndex]);
                    span.addEventListener('mouseover', (e) => {
                        const group = e.target.getAttribute('data-rhyme-group');
                        document.querySelectorAll(`[data-rhyme-group="${group}"]`).forEach(el => {
                            el.style.filter = 'brightness(0.8)';
                        });
                    });
                    span.addEventListener('mouseout', (e) => {
                        const group = e.target.getAttribute('data-rhyme-group');
                        document.querySelectorAll(`[data-rhyme-group="${group}"]`).forEach(el => {
                            el.style.filter = 'none';
                        });
                    });
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
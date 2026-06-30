const fs = require('fs');

const csv = fs.readFileSync('ml_scripts/bfp_augmented_500.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim().length > 0);
const headers = lines[0].split(',');

// Simple CSV parser that handles quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

const intents = {};

// Keep some base intents
const oldIntents = JSON.parse(fs.readFileSync('resources/js/lib/chatbot-intents.json', 'utf8'));
const keep = ['goodbye', 'greeting', 'about_berong', 'thanks', 'jokes', 'creator', 'unknown', 'weather'];
for (const k of keep) {
    if (oldIntents[k]) {
        intents[k] = oldIntents[k];
    }
}

// Process CSV
for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 7) continue;
    
    const id = row[0];
    const category = row[1];
    const user_question = row[5];
    const bot_answer = row[6];
    
    const intentKey = 'csv_' + id.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    if (!intents[intentKey]) {
        intents[intentKey] = {
            patterns: [],
            responses: [bot_answer]
        };
    }
    if (!intents[intentKey].patterns.includes(user_question)) {
        intents[intentKey].patterns.push(user_question);
    }
}

fs.writeFileSync('resources/js/lib/chatbot-intents.json', JSON.stringify(intents, null, 4));
console.log('Successfully generated new chatbot-intents.json with ' + Object.keys(intents).length + ' intents.');

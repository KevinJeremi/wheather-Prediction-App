#!/usr/bin/env node

/**
 * 🐛 DEBUG SCRIPT untuk AI Weather Assistant
 * Run: npm run debug-ai
 * 
 * Script ini membantu debug masalah context lokasi pada chatbot
 */

const fs = require('fs');
const path = require('path');

// Colors untuk console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, label, message) {
    console.log(`${color}[${label}]${colors.reset} ${message}`);
}

function checkFile(filePath, description) {
    try {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            const size = fs.statSync(fullPath).size;
            log(colors.green, '✅', `${description} exists (${(size / 1024).toFixed(2)}KB)`);
            return true;
        } else {
            log(colors.red, '❌', `${description} NOT FOUND at ${filePath}`);
            return false;
        }
    } catch (e) {
        log(colors.red, '❌', `Error checking ${description}: ${e.message}`);
        return false;
    }
}

function checkFileContent(filePath, searchStrings, description) {
    try {
        const fullPath = path.join(__dirname, filePath);
        if (!fs.existsSync(fullPath)) {
            log(colors.red, '❌', `${description} file not found`);
            return false;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        let allFound = true;

        searchStrings.forEach(str => {
            if (content.includes(str)) {
                log(colors.green, '✅', `${description}: Contains "${str.substring(0, 40)}..."`);
            } else {
                log(colors.red, '❌', `${description}: Missing "${str.substring(0, 40)}..."`);
                allFound = false;
            }
        });

        return allFound;
    } catch (e) {
        log(colors.red, '❌', `Error checking ${description}: ${e.message}`);
        return false;
    }
}

console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}🤖 AI WEATHER ASSISTANT - DEBUG CHECKER${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

// 1. Check files exist
console.log(`${colors.blue}📁 Step 1: Checking if all required files exist...${colors.reset}\n`);

const files = [
    ['src/context/WeatherContext.tsx', 'WeatherContext Provider'],
    ['src/components/AIReasoning.tsx', 'AIReasoning Component'],
    ['src/app/page.tsx', 'Main Page with Provider'],
    ['src/services/weatherContextChat.ts', 'Weather Context Chat Service'],
];

const filesOk = files.every(([path, desc]) => checkFile(path, desc));

// 2. Check content in critical files
console.log(`\n${colors.blue}📝 Step 2: Checking critical content in files...${colors.reset}\n`);

const pageChecks = [
    'WeatherProvider',
    'useWeatherContext',
    'contextValue'
];

const pageOk = checkFileContent('src/app/page.tsx', pageChecks, 'page.tsx');

const aiReasoningChecks = [
    'weatherDetailedContext',
    'buildWeatherContext',
    'handleSendMessage'
];

const aiReasoningOk = checkFileContent('src/components/AIReasoning.tsx', aiReasoningChecks, 'AIReasoning.tsx');

const contextChecks = [
    'WeatherProvider',
    'useWeatherContext',
    'useWeatherDetailedContext'
];

const contextOk = checkFileContent('src/context/WeatherContext.tsx', contextChecks, 'WeatherContext.tsx');

// 3. Summary
console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}📊 DEBUG SUMMARY${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

if (filesOk && pageOk && aiReasoningOk && contextOk) {
    log(colors.green, '✅', 'All checks passed! 🎉');
    console.log(`
${colors.green}✨ Your AI Weather Assistant is properly configured!

Next steps:
1. Test the application: npm run dev
2. Check browser console for debug logs
3. Try asking questions in the AI Reasoning chatbot
4. Verify that weather context is being sent to AI${colors.reset}
    `);
    process.exit(0);
} else {
    log(colors.red, '❌', 'Some checks failed. Please fix the issues above.');
    console.log(`
${colors.yellow}🔧 Common issues and fixes:

1. If WeatherProvider is not found:
   - Make sure page.tsx has WeatherProvider imported
   - Check that AIReasoning is rendered inside page content

2. If useWeatherContext is not working:
   - Verify AIReasoning component is within WeatherProvider
   - Check browser console for error messages

3. If weather context is not being sent:
   - Check that buildWeatherContext() is called
   - Verify weatherDetailedContext has data
   - Check if weather API is returning data

4. Debug tips:
   - Open browser DevTools Console
   - Look for console.log messages with ✅, ⚠️, ❌, 📨, 🌍 icons
   - Check network tab to see API requests
   - Check if Geolocation permission is granted${colors.reset}
    `);
    process.exit(1);
}

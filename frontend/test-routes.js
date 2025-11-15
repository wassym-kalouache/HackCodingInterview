#!/usr/bin/env node

/**
 * Test Next.js API routes locally
 * Make sure the dev server is running first: npm run dev
 * Run with: node test-routes.js
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if dev server is running
async function checkServer() {
  log('\n🔍 Checking if Next.js dev server is running...', 'blue');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
    }, (res) => {
      if (res.statusCode === 200) {
        log('✅ Dev server is running on http://localhost:3000', 'green');
        resolve(true);
      } else {
        log(`⚠️  Dev server responded with status ${res.statusCode}`, 'yellow');
        resolve(true);
      }
    });
    
    req.on('error', () => {
      log('❌ Dev server is not running', 'red');
      log('   Please start it with: npm run dev', 'yellow');
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      log('❌ Dev server is not responding', 'red');
      resolve(false);
    });
    
    req.end();
  });
}

// Test transcript API
async function testTranscriptAPI() {
  log('\n🧪 Testing /api/transcript endpoint...', 'blue');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/transcript',
      method: 'GET',
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (res.statusCode === 200) {
            log('✅ Transcript API is working!', 'green');
            log(`   Status: ${res.statusCode}`, 'green');
            log(`   Transcript length: ${parsed.transcript ? parsed.transcript.length : 0} characters`, 'green');
            resolve(true);
          } else if (res.statusCode === 404 && parsed.error === 'No conversations found') {
            log('⚠️  Transcript API is working, but no conversations found', 'yellow');
            log('   This is normal if you haven\'t conducted an interview yet', 'yellow');
            resolve(true);
          } else if (res.statusCode === 500 && parsed.error && parsed.error.includes('API key')) {
            log('❌ API key not configured', 'red');
            log(`   Error: ${parsed.error}`, 'red');
            log('   Please set ELEVEN_LABS_API_KEY in .env.local', 'yellow');
            resolve(false);
          } else {
            log('❌ Unexpected response', 'red');
            log(`   Status: ${res.statusCode}`, 'red');
            log(`   Response: ${JSON.stringify(parsed, null, 2)}`, 'red');
            resolve(false);
          }
        } catch (e) {
          log('❌ Failed to parse response', 'red');
          log(`   Response: ${data}`, 'red');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log('❌ Request failed', 'red');
      log(`   Error: ${error.message}`, 'red');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      log('❌ Request timed out', 'red');
      resolve(false);
    });
    
    req.end();
  });
}

// Test generate report API
async function testGenerateReportAPI() {
  log('\n🧪 Testing /api/generate-report endpoint...', 'blue');
  
  const testTranscript = `Interviewer: Hello! Let's start with a simple coding problem. Can you solve the Two Sum problem?

Candidate: Sure! The Two Sum problem asks us to find two numbers in an array that add up to a target value.

Interviewer: Great! How would you approach this?

Candidate: I would use a hash map to store the numbers we've seen. As we iterate through the array, we check if the complement exists in the hash map.

Interviewer: Excellent! Can you code this solution?

Candidate: Yes, let me write it out...

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

Interviewer: Perfect! What's the time complexity?

Candidate: The time complexity is O(n) and space complexity is O(n).

Interviewer: Great job! That's the optimal solution.`;

  return new Promise((resolve) => {
    const payload = JSON.stringify({ transcript: testTranscript });
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/generate-report',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (res.statusCode === 200 && parsed.report) {
            log('✅ Generate Report API is working!', 'green');
            log(`   Status: ${res.statusCode}`, 'green');
            log(`   Report generated with grades:`, 'green');
            if (parsed.report.grades) {
              log(`     - Coding Skills: ${parsed.report.grades.codingSkills?.score}/10`, 'green');
              log(`     - Communication: ${parsed.report.grades.communication?.score}/10`, 'green');
              log(`     - Algorithmic: ${parsed.report.grades.algorithmicThinking?.score}/10`, 'green');
            }
            log(`   Recommendation: ${parsed.report.recommendation}`, 'green');
            resolve(true);
          } else if (res.statusCode === 500 && parsed.error && parsed.error.includes('API key')) {
            log('❌ API key not configured', 'red');
            log(`   Error: ${parsed.error}`, 'red');
            log('   Please set ANTHROPIC_API_KEY in .env.local', 'yellow');
            resolve(false);
          } else {
            log('❌ Unexpected response', 'red');
            log(`   Status: ${res.statusCode}`, 'red');
            log(`   Response: ${JSON.stringify(parsed, null, 2)}`, 'red');
            resolve(false);
          }
        } catch (e) {
          log('❌ Failed to parse response', 'red');
          log(`   Response: ${data}`, 'red');
          log(`   Parse error: ${e.message}`, 'red');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log('❌ Request failed', 'red');
      log(`   Error: ${error.message}`, 'red');
      resolve(false);
    });
    
    req.setTimeout(30000, () => {
      log('❌ Request timed out (this API can take a while)', 'red');
      resolve(false);
    });
    
    req.write(payload);
    req.end();
  });
}

// Main function
async function main() {
  log('═══════════════════════════════════════════', 'blue');
  log('  API Routes Test Suite', 'blue');
  log('═══════════════════════════════════════════', 'blue');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('\n❌ Cannot proceed without dev server', 'red');
    process.exit(1);
  }
  
  const transcriptResult = await testTranscriptAPI();
  const reportResult = await testGenerateReportAPI();
  
  log('\n═══════════════════════════════════════════', 'blue');
  log('  Test Results Summary', 'blue');
  log('═══════════════════════════════════════════', 'blue');
  
  log(`${transcriptResult ? '✅' : '❌'} Transcript API`, transcriptResult ? 'green' : 'red');
  log(`${reportResult ? '✅' : '❌'} Generate Report API`, reportResult ? 'green' : 'red');
  
  if (transcriptResult && reportResult) {
    log('\n🎉 All API routes are working correctly!', 'green');
    log('You can now use the "Finish Interview" feature.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
  
  log('');
}

// Run the tests
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});


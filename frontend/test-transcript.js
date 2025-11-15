#!/usr/bin/env node

/**
 * Test script for ElevenLabs transcript fetching
 * Run with: node test-transcript.js
 */

// Load environment variables from .env file
require('dotenv').config();

const https = require('https');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get list of conversations
async function getConversations(agentId) {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  
  if (!apiKey) {
    log('❌ ELEVEN_LABS_API_KEY not found', 'red');
    return null;
  }
  
  log(`\n🔍 Fetching conversations for agent: ${agentId}`, 'blue');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/convai/conversations?agent_id=${agentId}`,
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            log(`✅ Found ${parsed.conversations ? parsed.conversations.length : 0} conversation(s)`, 'green');
            resolve(parsed);
          } catch (e) {
            log('❌ Failed to parse response', 'red');
            log(`   Response: ${data}`, 'red');
            resolve(null);
          }
        } else {
          log(`❌ API Error (${res.statusCode})`, 'red');
          log(`   Response: ${data}`, 'red');
          resolve(null);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`❌ Request failed: ${error.message}`, 'red');
      resolve(null);
    });
    
    req.end();
  });
}

// Get specific conversation transcript
async function getConversationTranscript(conversationId) {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  
  log(`\n📄 Fetching transcript for conversation: ${conversationId}`, 'blue');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/convai/conversations/${conversationId}`,
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            log(`✅ Transcript fetched successfully`, 'green');
            resolve(parsed);
          } catch (e) {
            log('❌ Failed to parse response', 'red');
            resolve(null);
          }
        } else {
          log(`❌ API Error (${res.statusCode})`, 'red');
          log(`   Response: ${data}`, 'red');
          resolve(null);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`❌ Request failed: ${error.message}`, 'red');
      resolve(null);
    });
    
    req.end();
  });
}

// List all conversations without agent filter
async function getAllConversations() {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  
  if (!apiKey) {
    log('❌ ELEVEN_LABS_API_KEY not found', 'red');
    return null;
  }
  
  log(`\n🔍 Fetching all conversations (no agent filter)`, 'blue');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/convai/conversations`,
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            log(`✅ Found ${parsed.conversations ? parsed.conversations.length : 0} conversation(s)`, 'green');
            resolve(parsed);
          } catch (e) {
            log('❌ Failed to parse response', 'red');
            log(`   Response: ${data}`, 'red');
            resolve(null);
          }
        } else {
          log(`❌ API Error (${res.statusCode})`, 'red');
          log(`   Response: ${data}`, 'red');
          resolve(null);
        }
      });
    });
    
    req.on('error', (error) => {
      log(`❌ Request failed: ${error.message}`, 'red');
      resolve(null);
    });
    
    req.end();
  });
}

// Main function
async function main() {
  log('═══════════════════════════════════════════', 'blue');
  log('  ElevenLabs Transcript Test', 'blue');
  log('═══════════════════════════════════════════', 'blue');
  
  // First, try to get all conversations
  const allConversations = await getAllConversations();
  
  if (!allConversations || !allConversations.conversations || allConversations.conversations.length === 0) {
    log('\n⚠️  No conversations found', 'yellow');
    log('   This means you haven\'t had any conversations with ElevenLabs agents yet.', 'yellow');
    log('   To test this feature:', 'yellow');
    log('   1. Run: npm run dev', 'yellow');
    log('   2. Open: http://localhost:3000', 'yellow');
    log('   3. Talk to the AI agent (widget at the bottom)', 'yellow');
    log('   4. Run this test again', 'yellow');
    return;
  }
  
  log('\n📋 Conversation List:', 'cyan');
  log('═══════════════════════════════════════════', 'cyan');
  
  allConversations.conversations.forEach((conv, index) => {
    const date = new Date(conv.start_time_unix_secs * 1000);
    log(`\n${index + 1}. Conversation ID: ${conv.conversation_id}`, 'cyan');
    log(`   Agent ID: ${conv.agent_id || 'N/A'}`, 'cyan');
    log(`   Start Time: ${date.toLocaleString()}`, 'cyan');
    log(`   Duration: ${conv.duration_secs ? conv.duration_secs + 's' : 'N/A'}`, 'cyan');
  });
  
  // Get the most recent conversation
  const sortedConversations = allConversations.conversations.sort(
    (a, b) => b.start_time_unix_secs - a.start_time_unix_secs
  );
  
  const latestConversation = sortedConversations[0];
  
  log('\n═══════════════════════════════════════════', 'cyan');
  log('  Fetching Latest Conversation Transcript', 'cyan');
  log('═══════════════════════════════════════════', 'cyan');
  
  const transcript = await getConversationTranscript(latestConversation.conversation_id);
  
  if (!transcript) {
    log('\n❌ Failed to fetch transcript', 'red');
    return;
  }
  
  log('\n📝 Transcript Data Structure:', 'cyan');
  log('═══════════════════════════════════════════', 'cyan');
  log(JSON.stringify(transcript, null, 2), 'reset');
  
  log('\n═══════════════════════════════════════════', 'blue');
  log('  Formatted Transcript', 'blue');
  log('═══════════════════════════════════════════', 'blue');
  
  // Format the transcript from the array
  if (transcript.transcript && Array.isArray(transcript.transcript)) {
    log('\n💬 Conversation:', 'green');
    transcript.transcript.forEach((turn) => {
      const speaker = turn.role === 'user' ? '👤 Candidate' : '🤖 Interviewer';
      const message = turn.message || 'N/A';
      log(`\n${speaker}:`, 'cyan');
      log(`${message}`, 'reset');
    });
    
    // Show additional info
    if (transcript.analysis?.transcript_summary) {
      log('\n─────────────────────────────────────────', 'yellow');
      log('📊 Summary:', 'yellow');
      log(transcript.analysis.transcript_summary, 'reset');
    }
    
    if (transcript.metadata?.call_duration_secs) {
      log('\n⏱️  Call Duration:', 'cyan');
      log(`${transcript.metadata.call_duration_secs} seconds`, 'reset');
    }
  } else if (transcript.messages && Array.isArray(transcript.messages)) {
    log('\n💬 Messages format:', 'green');
    transcript.messages.forEach((msg) => {
      const speaker = msg.role === 'user' ? '👤 Candidate' : '🤖 Interviewer';
      log(`\n${speaker}: ${msg.message || msg.content || msg.text || 'N/A'}`, 'reset');
    });
  } else {
    log('\n⚠️  Unknown transcript format. Showing raw data above.', 'yellow');
  }
  
  log('\n═══════════════════════════════════════════', 'green');
  log('  Test Complete!', 'green');
  log('═══════════════════════════════════════════', 'green');
}

// Run the test
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});


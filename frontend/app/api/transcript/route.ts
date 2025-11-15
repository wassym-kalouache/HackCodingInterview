import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Get the agent ID from query params
    const agentId = request.nextUrl.searchParams.get('agentId') || 'agent_2401ka3jvjf2f1bbfb3c60fcppg3';

    // Fetch conversation history from ElevenLabs
    // First, get the list of conversations for this agent
    const conversationsResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!conversationsResponse.ok) {
      const errorText = await conversationsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch conversations', details: errorText },
        { status: conversationsResponse.status }
      );
    }

    const conversationsData = await conversationsResponse.json();
    
    // Get the most recent conversation
    if (!conversationsData || !conversationsData.conversations || conversationsData.conversations.length === 0) {
      return NextResponse.json(
        { error: 'No conversations found' },
        { status: 404 }
      );
    }

    // Sort by date to get the latest one
    const sortedConversations = conversationsData.conversations.sort(
      (a: any, b: any) => new Date(b.start_time_unix_secs * 1000).getTime() - new Date(a.start_time_unix_secs * 1000).getTime()
    );
    
    const latestConversation = sortedConversations[0];
    const conversationId = latestConversation.conversation_id;

    // Now fetch the full transcript for this conversation
    const transcriptResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('ElevenLabs transcript API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch transcript', details: errorText },
        { status: transcriptResponse.status }
      );
    }

    const transcriptData = await transcriptResponse.json();
    
    // Format the transcript from the transcript array
    let formattedTranscript = '';
    
    if (transcriptData.transcript && Array.isArray(transcriptData.transcript)) {
      // ElevenLabs returns transcript as an array of turn objects
      formattedTranscript = transcriptData.transcript
        .map((turn: any) => {
          const speaker = turn.role === 'user' ? 'Candidate' : 'Interviewer';
          const message = turn.message || '';
          return `${speaker}: ${message}`;
        })
        .join('\n\n');
    } else if (transcriptData.messages && Array.isArray(transcriptData.messages)) {
      // Alternative format (if API changes)
      formattedTranscript = transcriptData.messages
        .map((msg: any) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.message}`)
        .join('\n\n');
    } else if (typeof transcriptData.transcript === 'string') {
      // Already a string
      formattedTranscript = transcriptData.transcript;
    }

    return NextResponse.json({
      transcript: formattedTranscript,
      conversationId: conversationId,
      startTime: latestConversation.start_time_unix_secs,
      summary: transcriptData.analysis?.transcript_summary || null,
      callDuration: transcriptData.metadata?.call_duration_secs || null,
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


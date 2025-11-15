import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const prompt = `You are an expert technical interviewer evaluating a coding interview. Based on the following interview transcript, please provide a comprehensive evaluation report.

Interview Transcript:
${transcript}

Please provide:

1. An overall summary of the candidate's performance (2-3 paragraphs)

2. Detailed grades for each of the following criteria (on a scale of 1-10):
   - Coding Skills: Evaluate their ability to write clean, functional code
   - Communication: Assess their ability to explain their thought process and ask clarifying questions
   - Algorithmic Thinking: Rate their problem-solving approach and ability to optimize solutions

3. Strengths: List 3-5 key strengths demonstrated during the interview

4. Areas for Improvement: List 3-5 areas where the candidate could improve

5. Overall Recommendation: Provide a final recommendation (Strong Hire, Hire, Maybe, No Hire)

IMPORTANT: You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON. Do not use markdown code blocks.

Use exactly this structure:
{
  "summary": "Overall summary text",
  "grades": {
    "codingSkills": { "score": 8, "feedback": "detailed feedback" },
    "communication": { "score": 9, "feedback": "detailed feedback" },
    "algorithmicThinking": { "score": 7, "feedback": "detailed feedback" }
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2", "area3"],
  "recommendation": "Hire",
  "recommendationReasoning": "explanation for the recommendation"
}

Respond with ONLY the JSON object, nothing else.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the response text
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('Claude response length:', responseText.length);
    console.log('Claude response preview:', responseText.substring(0, 500));
    
    // Parse the JSON response
    let report;
    try {
      // Try to extract JSON from the response if it's wrapped in markdown code blocks
      let jsonMatch = responseText.match(/```json\s*\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        jsonMatch = responseText.match(/```\s*\n([\s\S]*?)\n```/);
      }
      
      const jsonText = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      
      // Try to find JSON object in the text
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const extractedJson = jsonText.substring(jsonStart, jsonEnd + 1);
        console.log('Attempting to parse JSON:', extractedJson.substring(0, 200));
        report = JSON.parse(extractedJson);
      } else {
        throw new Error('No JSON object found in response');
      }
      
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      console.error('Full response:', responseText);
      
      return NextResponse.json(
        { 
          error: 'Failed to parse report', 
          details: 'Claude did not return valid JSON',
          rawResponse: responseText.substring(0, 1000) // First 1000 chars for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ report });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate report', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}


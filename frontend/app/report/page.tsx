"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSessionId } from '@/lib/session';

interface Grade {
  score: number;
  feedback: string;
}

interface Report {
  summary: string;
  grades: {
    codingSkills: Grade;
    communication: Grade;
    algorithmicThinking: Grade;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendation: string;
  recommendationReasoning: string;
}

export default function ReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Getting the conversation...');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Get session ID on client side
    setIsMounted(true);
    const id = getSessionId() || '';
    setSessionId(id);
    
    // Start generating report
    generateReport(id);
  }, []);

  const generateReport = async (currentSessionId?: string) => {
    try {
      const sid = currentSessionId || sessionId;
      
      // Step 1: Fetch the code from the session
      setLoadingMessage('Getting your code...');
      let codeData = null;
      
      if (sid) {
        const codeResponse = await fetch(`/api/webhook/code-update?sessionId=${sid}`);
        if (codeResponse.ok) {
          codeData = await codeResponse.json();
          console.log('Code retrieved:', codeData);
        } else {
          console.warn('No code found for this session');
        }
      }

      // Step 2: Fetch transcript
      setLoadingMessage('Getting the conversation...');
      const transcriptResponse = await fetch('/api/transcript');
      
      if (!transcriptResponse.ok) {
        throw new Error('Failed to fetch transcript');
      }

      const transcriptData = await transcriptResponse.json();
      
      if (!transcriptData.transcript) {
        throw new Error('No transcript available');
      }

      // Step 3: Generate report with both transcript and code
      setLoadingMessage('Generating report...');
      
      // Build context for the report
      let fullContext = transcriptData.transcript;
      
      if (codeData && codeData.code) {
        fullContext += `\n\n--- Code Written During Interview ---\nLanguage: ${codeData.language}\n\n${codeData.code}`;
      }
      
      const reportResponse = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript: fullContext,
          sessionId: sid,
          codeData: codeData ? {
            code: codeData.code,
            language: codeData.language,
            timestamp: codeData.timestamp
          } : null
        }),
      });

      if (!reportResponse.ok) {
        throw new Error('Failed to generate report');
      }

      const reportData = await reportResponse.json();
      setReport(reportData.report);
      setLoading(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation === 'Strong Hire') return 'bg-green-100 text-green-800 border-green-300';
    if (recommendation === 'Hire') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (recommendation === 'Maybe') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">{loadingMessage}</h2>
          <p className="text-muted-foreground">Please wait while we process your interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CI</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">Interview Report</h1>
              {isMounted && sessionId && (
                <div className="text-xs text-muted-foreground font-mono">
                  Session: {sessionId.slice(-8)}
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => router.push('/')} variant="outline">
            New Interview
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Recommendation Banner */}
          <Card className={`p-6 border-2 ${getRecommendationColor(report.recommendation)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Overall Recommendation</h2>
                <p className="text-lg font-semibold">{report.recommendation}</p>
              </div>
              <div className="text-5xl">
                {report.recommendation === 'Strong Hire' && '🌟'}
                {report.recommendation === 'Hire' && '✅'}
                {report.recommendation === 'Maybe' && '🤔'}
                {report.recommendation === 'No Hire' && '❌'}
              </div>
            </div>
            <p className="mt-4 text-sm">{report.recommendationReasoning}</p>
          </Card>

          {/* Summary */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{report.summary}</p>
          </Card>

          {/* Grades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coding Skills */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coding Skills</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(report.grades.codingSkills.score / 10) * 351.86} 351.86`}
                      className={getScoreBackground(report.grades.codingSkills.score)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(report.grades.codingSkills.score)}`}>
                      {report.grades.codingSkills.score}/10
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{report.grades.codingSkills.feedback}</p>
            </Card>

            {/* Communication */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Communication</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(report.grades.communication.score / 10) * 351.86} 351.86`}
                      className={getScoreBackground(report.grades.communication.score)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(report.grades.communication.score)}`}>
                      {report.grades.communication.score}/10
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{report.grades.communication.feedback}</p>
            </Card>

            {/* Algorithmic Thinking */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Algorithmic Thinking</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(report.grades.algorithmicThinking.score / 10) * 351.86} 351.86`}
                      className={getScoreBackground(report.grades.algorithmicThinking.score)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(report.grades.algorithmicThinking.score)}`}>
                      {report.grades.algorithmicThinking.score}/10
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{report.grades.algorithmicThinking.feedback}</p>
            </Card>
          </div>

          {/* Strengths and Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💪</span>
                Strengths
              </h2>
              <ul className="space-y-3">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 font-bold mt-1">✓</span>
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Areas for Improvement */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Areas for Improvement
              </h2>
              <ul className="space-y-3">
                {report.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">→</span>
                    <span className="text-muted-foreground">{area}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ProblemViewer from '@/components/ProblemViewer';
import CodeEditor from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { getOrCreateSessionId } from '@/lib/session';

export default function Home() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Only run on client side after mount
  React.useEffect(() => {
    setIsMounted(true);
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);
  const problem = {
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]"
      }
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists."
    ],
    followUp: "Can you come up with an algorithm that is less than O(n²) time complexity?"
  };

  const handleFinishInterview = async () => {
    // Close the ElevenLabs agent
    const convaiElement = document.querySelector('elevenlabs-convai');
    if (convaiElement) {
      // Remove the element to close the agent
      convaiElement.remove();
    }

    // Navigate to report page
    router.push('/report');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CI</span>
            </div>
            <h1 className="text-xl font-bold">Coding Interview</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Live Session
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            {isMounted && sessionId && (
              <div className="text-xs text-muted-foreground font-mono">
                ID: {sessionId.slice(-8)}
              </div>
            )}
          </div>
          <Button 
            onClick={handleFinishInterview}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Finish Interview
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={45} minSize={30}>
            <div className="h-full border-r bg-background">
              <ProblemViewer problem={problem} />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-blue-500 transition-colors cursor-col-resize" />
          
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full bg-background">
              <CodeEditor />
            </div>
          </Panel>
        </PanelGroup>
      </main>

      {/* ElevenLabs Conversational AI Widget */}
      <elevenlabs-convai agent-id="agent_2401ka3jvjf2f1bbfb3c60fcppg3"></elevenlabs-convai>
    </div>
  );
}

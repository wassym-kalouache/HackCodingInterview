"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createDebouncedWebhook, generateSessionId, type WebhookPayload } from '@/lib/webhook';
import { webhookConfig, WEBHOOK_DEBOUNCE_DELAY } from '@/lib/webhook-config';

export default function CodeEditor() {
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Write your code here
  
}`);

  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  
  // Session ID for tracking this coding session
  const sessionIdRef = useRef<string>(generateSessionId());
  
  // Create debounced webhook function
  const debouncedWebhookRef = useRef(createDebouncedWebhook(webhookConfig, WEBHOOK_DEBOUNCE_DELAY));

  // Send code updates via webhook
  useEffect(() => {
    if (!webhookConfig.enabled) return;

    const payload: WebhookPayload = {
      code,
      language,
      timestamp: new Date().toISOString(),
      sessionId: sessionIdRef.current,
    };

    // Send the webhook
    debouncedWebhookRef.current(payload);
    
    // Update status asynchronously
    const sendingTimer = setTimeout(() => setWebhookStatus('sending'), 0);
    const sentTimer = setTimeout(() => setWebhookStatus('sent'), WEBHOOK_DEBOUNCE_DELAY + 500);
    const idleTimer = setTimeout(() => setWebhookStatus('idle'), WEBHOOK_DEBOUNCE_DELAY + 1500);

    return () => {
      clearTimeout(sendingTimer);
      clearTimeout(sentTimer);
      clearTimeout(idleTimer);
    };
  }, [code, language]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    // Simulate code execution
    setTimeout(() => {
      try {
        // This is a simplified simulation
        setOutput('Output:\n\nTest Case 1: [0, 1]\nTest Case 2: [1, 2]\nTest Case 3: [0, 1]\n\nAll test cases passed! ✓');
        setIsRunning(false);
      } catch (error) {
        setOutput(`Error: ${error}`);
        setIsRunning(false);
      }
    }, 1000);
  };

  const handleReset = () => {
    setCode(`function twoSum(nums, target) {
  // Write your code here
  
}`);
    setOutput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          
          {/* Webhook Status Indicator */}
          {webhookConfig.enabled && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted text-xs">
              <div className={`w-2 h-2 rounded-full ${
                webhookStatus === 'sending' ? 'bg-yellow-500 animate-pulse' :
                webhookStatus === 'sent' ? 'bg-green-500' :
                webhookStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
              <span className="text-muted-foreground">
                {webhookStatus === 'sending' ? 'Saving...' :
                 webhookStatus === 'sent' ? 'Saved' :
                 webhookStatus === 'error' ? 'Error' :
                 'Auto-save'}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="code" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-2 w-auto">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="flex-1 m-0 p-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </TabsContent>
          
          <TabsContent value="output" className="flex-1 m-0 p-4">
            <Card className="h-full p-4 bg-muted/50">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {output || 'Click "Run Code" to see the output here...'}
              </pre>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


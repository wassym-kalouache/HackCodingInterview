"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProblemViewerProps {
  problem: {
    title: string;
    difficulty: string;
    description: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    constraints: string[];
    followUp?: string;
  };
}

export default function ProblemViewer({ problem }: ProblemViewerProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              problem.difficulty === 'Easy' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : problem.difficulty === 'Medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problem Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {problem.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {problem.examples.map((example, index) => (
              <div key={index} className="space-y-2">
                <p className="font-semibold text-sm">Example {index + 1}:</p>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">Input:</span> {example.input}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Output:</span> {example.output}
                  </p>
                  {example.explanation && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Explanation:</span> {example.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {problem.constraints.map((constraint, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="mr-2">•</span>
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {problem.followUp && (
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-lg text-blue-600 dark:text-blue-400">
                Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{problem.followUp}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


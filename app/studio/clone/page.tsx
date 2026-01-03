"use client";

import { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { DNA_OPTIONS, DEFAULT_DNA } from '@/lib/visualDNA';
import { convertDNAToPrompt } from '@/lib/dnaToPrompt';
import { AVAILABLE_MODELS } from '@/lib/modelMapper';
import { v4 as uuidv4 } from 'uuid';
import { Scan, Sparkles, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ClonePage() {
  const { 
    cloneInputText, 
    setCloneInput, 
    visualDNA, 
    setVisualDNA,
    addJobs 
  } = useStudioStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const handleAnalyze = async () => {
    if (!cloneInputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        body: JSON.stringify({ description: cloneInputText }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      
      const data = await res.json();
      if (data.dna) {
        setVisualDNA(data.dna);
        const prompt = convertDNAToPrompt(data.dna, "Recreated scene matching structural DNA");
        setGeneratedPrompt(prompt);
      }
    } catch (e) {
      setError("Failed to analyze visual structure. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateClone = () => {
      const finalPrompt = generatedPrompt || convertDNAToPrompt(visualDNA, "Recreated scene");
      const modelId = 'runway'; // Defaulting for clone mode

      const newJob = {
          id: uuidv4(),
          createdAt: Date.now(),
          status: 'pending' as const,
          topicId: 'clone',
          templateId: 'dna-replication',
          modelId,
          finalPrompt
      };
      
      addJobs([newJob]);
      
      // Mock start
      fetch('/api/generate-video', {
        method: 'POST',
        body: JSON.stringify({ jobId: newJob.id, prompt: finalPrompt, model: modelId })
      });

      alert("Clone job started!");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 border-b border-studio-700 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Scan className="text-purple-500" />
            Visual DNA Clone
        </h1>
        <p className="text-gray-400 mt-2">
            Replicate the <i>structure</i> and <i>feel</i> of a video without copying pixels.
            <br />
            <span className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1 mt-1">
                <AlertTriangle size={12} /> Legal Safe: No frame extraction used.
            </span>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <div className="space-y-6">
            <div className="bg-studio-800 p-6 rounded-xl border border-studio-700">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Describe the video style & structure
                </label>
                <textarea
                    value={cloneInputText}
                    onChange={(e) => setCloneInput(e.target.value)}
                    placeholder="E.g. A slow pan across a futuristic city at night, heavy neon lighting, cinematic depth of field, 24fps..."
                    className="w-full h-40 bg-studio-900 border border-studio-600 rounded-lg p-4 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !cloneInputText}
                    className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-studio-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <span className="animate-pulse">Analyzing Structure...</span>
                    ) : (
                        <>
                            <Sparkles size={18} /> Extract Visual DNA
                        </>
                    )}
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
        </div>

        <div className="bg-studio-800 p-6 rounded-xl border border-studio-700">
            <h3 className="text-lg font-bold text-white mb-4">DNA Signature</h3>
            
            <div className="space-y-4">
                {Object.entries(visualDNA).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center border-b border-studio-700 pb-2">
                        <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-purple-300 font-mono text-sm">{value as string}</span>
                    </div>
                ))}
            </div>

            {generatedPrompt && (
                <div className="mt-6 p-4 bg-studio-900 rounded border border-studio-700">
                    <span className="text-xs text-gray-500 uppercase">Generated Divergent Prompt</span>
                    <p className="text-sm text-gray-300 mt-1">{generatedPrompt}</p>
                </div>
            )}

            <button
                disabled={!generatedPrompt}
                onClick={handleCreateClone}
                className="mt-6 w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-studio-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all"
            >
                Generate Clone
            </button>
        </div>

      </div>
    </div>
  );
}
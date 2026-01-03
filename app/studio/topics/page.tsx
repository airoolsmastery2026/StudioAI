"use client";

import { useState, useEffect } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { TOPIC_LIBRARY, getTemplateById } from '@/lib/topicLibrary';
import { getCompatibleModelsForTemplate } from '@/lib/modelMapper';
import { generateSafePrompt } from '@/lib/promptEngine';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle, Play, Star, History, RotateCcw, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TopicsPage() {
  const { 
    selectedTopicId, 
    selectedTemplateId, 
    selectedModelId,
    setTopic,
    setTemplate,
    setModel,
    addJobs
  } = useStudioStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [isAutoSelected, setIsAutoSelected] = useState(false);

  // Prompt Versioning State
  const [editablePrompt, setEditablePrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<Array<{id: string, text: string, timestamp: number}>>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const currentTopic = TOPIC_LIBRARY.find(t => t.id === selectedTopicId);
  const currentTemplate = selectedTemplateId && selectedTopicId ? getTemplateById(selectedTopicId, selectedTemplateId) : null;
  const compatibleModels = currentTemplate ? getCompatibleModelsForTemplate(currentTemplate.compatibleModels) : [];

  // Reset prompt and history when template changes
  useEffect(() => {
    if (currentTemplate) {
        setEditablePrompt(currentTemplate.basePrompt);
        setPromptHistory([{
            id: 'v1 (Default)',
            text: currentTemplate.basePrompt,
            timestamp: Date.now()
        }]);
        setIsHistoryOpen(false);
    }
  }, [currentTemplate?.id]);

  const handleTemplateSelect = (templateId: string) => {
    setTemplate(templateId);
    
    // Auto-select the "best" model (first in the compatible list)
    if (currentTopic) {
        const template = currentTopic.templates.find(t => t.id === templateId);
        
        // The first model in the compatibleModels array is considered the "best" / default
        if (template && template.compatibleModels.length > 0) {
            const bestModelId = template.compatibleModels[0];
            setModel(bestModelId);
            setIsAutoSelected(true);
        }
    }
  };

  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    setIsAutoSelected(false);
  };

  const handleTopicSelect = (topicId: string) => {
    setTopic(topicId);
    setIsAutoSelected(false);
  };

  const handleGenerate = async () => {
    if (!currentTopic || !currentTemplate || !selectedModelId) return;

    // Save version if changed from the latest history entry
    const currentLatest = promptHistory[0];
    if (editablePrompt && (!currentLatest || currentLatest.text !== editablePrompt)) {
        const newVersion = {
            id: `v${promptHistory.length + 1}`,
            text: editablePrompt,
            timestamp: Date.now()
        };
        setPromptHistory([newVersion, ...promptHistory]);
    }

    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
        // Use the user's editable prompt instead of the static template base prompt
        const finalPrompt = generateSafePrompt(editablePrompt);
        
        const newJob = {
            id: uuidv4(),
            createdAt: Date.now(),
            status: 'pending' as const,
            topicId: currentTopic.id,
            templateId: currentTemplate.id,
            modelId: selectedModelId,
            finalPrompt
        };

        addJobs([newJob]);
        setLastJobId(newJob.id);
        
        // Auto-trigger the "mock" API
        fetch('/api/generate-video', {
            method: 'POST',
            body: JSON.stringify({ jobId: newJob.id, prompt: finalPrompt, model: selectedModelId })
        }).then(res => res.json()).then(data => {
            console.log("Job queued:", data);
        });

        setIsGenerating(false);
    }, 1000);
  };

  const handleRestoreVersion = (version: { id: string, text: string }) => {
    setEditablePrompt(version.text);
    setIsHistoryOpen(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 border-b border-studio-700 pb-6">
        <h1 className="text-3xl font-bold text-white">Topic Studio</h1>
        <p className="text-gray-400 mt-2">Select a topic and template to generate professional video content.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Controls */}
        <div className="space-y-8">
          
          {/* 1. Select Topic */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">1. Select Topic</h3>
            <div className="grid grid-cols-2 gap-3">
              {TOPIC_LIBRARY.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTopicId === topic.id 
                    ? 'bg-blue-600/20 border-blue-500 text-white' 
                    : 'bg-studio-800 border-studio-700 text-gray-400 hover:border-studio-600'
                  }`}
                >
                  <div className="font-bold">{topic.name}</div>
                  <div className="text-xs opacity-70 mt-1 truncate">{topic.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* 2. Select Template */}
          <section>
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">2. Select Template</h3>
             {!selectedTopicId ? (
                <div className="text-gray-500 italic text-sm p-4 border border-dashed border-studio-700 rounded">Please select a topic first.</div>
             ) : (
                 <div className="space-y-3">
                    {currentTopic?.templates.map(tpl => (
                         <button
                         key={tpl.id}
                         onClick={() => handleTemplateSelect(tpl.id)}
                         className={`w-full p-4 rounded-lg border text-left transition-all ${
                           selectedTemplateId === tpl.id 
                           ? 'bg-purple-600/20 border-purple-500 text-white' 
                           : 'bg-studio-800 border-studio-700 text-gray-400 hover:border-studio-600'
                         }`}
                       >
                         <div className="flex justify-between items-center mb-1">
                             <span className="font-bold">{tpl.label}</span>
                             <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-400">{tpl.id}</span>
                         </div>
                         <div className="text-sm opacity-80">{tpl.intent}</div>
                       </button>
                    ))}
                 </div>
             )}
          </section>

          {/* 3. Select Model */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                3. Select Model
                {selectedModelId && isAutoSelected && (
                  <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-800 animate-in fade-in">
                    <CheckCircle size={10}/> Auto-selected Best Match
                  </span>
                )}
            </h3>
            {!selectedTemplateId ? (
                 <div className="text-gray-500 italic text-sm p-4 border border-dashed border-studio-700 rounded">Please select a template first.</div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {compatibleModels.map((model, idx) => (
                         <button
                         key={model.id}
                         onClick={() => handleModelSelect(model.id)}
                         className={`p-3 rounded-lg border text-left transition-all relative ${
                           selectedModelId === model.id 
                           ? 'bg-green-600/20 border-green-500 text-white' 
                           : 'bg-studio-800 border-studio-700 text-gray-400 hover:border-studio-600'
                         }`}
                       >
                         {/* Index 0 is guaranteed to be the 'best' due to sorting in modelMapper.ts */}
                         {idx === 0 && (
                             <div className="absolute -top-2 -right-2">
                                 <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-lg">
                                     <Star size={8} className="mr-1 fill-black" /> BEST
                                 </span>
                             </div>
                         )}
                         <div className="font-medium text-sm">{model.name}</div>
                         <div className="text-xs text-gray-500 mt-1">Max {model.maxDuration}s</div>
                       </button>
                    ))}
                </div>
            )}
          </section>

        </div>

        {/* Right Column: Preview & Action */}
        <div className="bg-studio-800 rounded-xl border border-studio-700 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6">Output Configuration</h3>
            
            <div className="flex-1 space-y-6">
                
                {/* PROMPT EDITOR & HISTORY */}
                <div className="bg-studio-900 rounded-lg border border-studio-700 overflow-hidden flex flex-col h-64 relative group">
                    <div className="flex items-center justify-between p-3 border-b border-studio-700 bg-studio-800/50">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold flex items-center gap-2">
                            Prompt Engineering
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                disabled={!currentTemplate}
                                className={`p-1.5 rounded hover:bg-studio-700 transition-colors flex items-center gap-1.5 ${isHistoryOpen ? 'text-blue-400 bg-studio-700' : 'text-gray-400'}`}
                                title="Version History"
                            >
                                <History size={14} />
                                <span className="text-[10px] font-medium hidden md:inline">History ({promptHistory.length})</span>
                            </button>
                            <button 
                                onClick={() => setEditablePrompt(currentTemplate?.basePrompt || '')}
                                disabled={!currentTemplate}
                                className="p-1.5 rounded hover:bg-studio-700 text-gray-400 hover:text-white transition-colors"
                                title="Reset to Template Default"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative flex-1">
                        {!currentTemplate ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                                Select a template to edit prompt...
                            </div>
                        ) : isHistoryOpen ? (
                            <div className="absolute inset-0 overflow-y-auto bg-studio-900 p-2 space-y-2 animate-in fade-in slide-in-from-right-4">
                                {promptHistory.map((version, index) => (
                                    <button
                                        key={version.id}
                                        onClick={() => handleRestoreVersion(version)}
                                        className={`w-full text-left p-3 rounded border transition-colors group ${
                                            index === 0 ? 'bg-studio-800/80 border-blue-900/50' : 'bg-studio-800 border-studio-700 hover:border-blue-500'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-bold ${index === 0 ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>
                                                {version.id} {index === 0 && '(Latest)'}
                                            </span>
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(version.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2 font-mono">{version.text}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                             <textarea
                                value={editablePrompt}
                                onChange={(e) => setEditablePrompt(e.target.value)}
                                className="w-full h-full bg-transparent p-4 text-sm text-gray-300 focus:outline-none resize-none font-mono focus:bg-studio-800/30 transition-colors placeholder-gray-600"
                                placeholder="Customize your prompt here..."
                             />
                        )}
                    </div>
                    {/* Safety Status Footer */}
                    <div className="px-3 py-1 bg-black/20 border-t border-studio-700 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500">Base Prompt Editor</span>
                        <span className="text-[10px] text-green-500/80 flex items-center gap-1">
                            <CheckCircle size={10} /> Safety Filters Active
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Resolution</span>
                        <span className="text-white">1080p (Upscaled)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Frame Rate</span>
                        <span className="text-white">24 fps</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Safety Check</span>
                        <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Active</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    disabled={!selectedTopicId || !selectedTemplateId || !selectedModelId || isGenerating}
                    onClick={handleGenerate}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-studio-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? 'Processing...' : (
                        <>
                            <Play size={20} fill="currentColor" />
                            Generate Video
                        </>
                    )}
                </button>
                {lastJobId && (
                     <div className="mt-4 text-center">
                         <Link href="/studio/jobs" className="text-blue-400 hover:underline text-sm">
                             View job status in queue &rarr;
                         </Link>
                     </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
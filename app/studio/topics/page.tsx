
"use client";

import { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { TOPIC_LIBRARY, getTemplateById } from '@/lib/topicLibrary';
import { getCompatibleModelsForTemplate } from '@/lib/modelMapper';
import { generateSafePrompt } from '@/lib/promptEngine';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle, Play, Star, Lock, Sliders, ShieldCheck, Gauge, Zap, Layers, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function TopicsPage() {
  const { 
    selectedTopicId, 
    selectedTemplateId, 
    selectedModelId,
    generationSettings,
    setTopic,
    setTemplate,
    setModel,
    setQuality,
    setMotionIntensity,
    setRenderPriority,
    addJobs
  } = useStudioStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [isAutoSelected, setIsAutoSelected] = useState(false);

  const currentTopic = TOPIC_LIBRARY.find(t => t.id === selectedTopicId);
  const currentTemplate = selectedTemplateId && selectedTopicId ? getTemplateById(selectedTopicId, selectedTemplateId) : null;
  const compatibleModels = currentTemplate ? getCompatibleModelsForTemplate(currentTemplate.compatibleModels) : [];

  const handleTemplateSelect = (templateId: string) => {
    setTemplate(templateId);
    if (currentTopic) {
        const template = currentTopic.templates.find(t => t.id === templateId);
        if (template && template.compatibleModels.length > 0) {
            // AUTO-SELECT LOGIC: Pick the first model in the compatible list
            const bestModelId = template.compatibleModels[0];
            setModel(bestModelId);
            setIsAutoSelected(true);
            
            // Clear the "Auto-selected" badge after a few seconds
            setTimeout(() => setIsAutoSelected(false), 3000);
        }
    }
  };

  const handleGenerate = async () => {
    if (!currentTopic || !currentTemplate || !selectedModelId) return;

    setIsGenerating(true);
    
    // STRICT RULE: Use internal template prompt only. No user input.
    const finalPrompt = generateSafePrompt(currentTemplate.basePrompt);
    
    const newJob = {
        id: uuidv4(),
        createdAt: Date.now(),
        status: 'pending' as const,
        topicId: currentTopic.id,
        templateId: currentTemplate.id,
        modelId: selectedModelId,
        finalPrompt,
        settings: { ...generationSettings }
    };

    // Simulate Network Delay
    setTimeout(() => {
        addJobs([newJob]);
        setLastJobId(newJob.id);
        
        // Mock API Call
        fetch('/api/generate-video', {
            method: 'POST',
            body: JSON.stringify({ 
                jobId: newJob.id, 
                prompt: finalPrompt, 
                model: selectedModelId,
                settings: generationSettings
            })
        });

        setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b border-studio-700 pb-6">
        <h1 className="text-3xl font-bold text-white">Topic Studio</h1>
        <p className="text-gray-400 mt-2">Select a certified topic and template. Free-text prompting is disabled for quality assurance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration (8 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Select Topic */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">1. Select Environment</h3>
            <div className="grid grid-cols-2 gap-3">
              {TOPIC_LIBRARY.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setTopic(topic.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTopicId === topic.id 
                    ? 'bg-blue-600/20 border-blue-500 text-white' 
                    : 'bg-studio-800 border-studio-700 text-gray-400 hover:border-studio-600'
                  }`}
                  disabled={topic.id === 'clone'} // Hide system topics if rendered
                >
                  <div className="font-bold">{topic.name}</div>
                  <div className="text-xs opacity-70 mt-1 truncate">{topic.description}</div>
                </button>
              )).filter(t => t.key !== 'clone')}
            </div>
          </section>

          {/* 2. Select Template */}
          <section>
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">2. Select Aesthetic Template</h3>
             {!selectedTopicId ? (
                <div className="text-gray-500 italic text-sm p-4 border border-dashed border-studio-700 rounded bg-studio-800/50">
                    Select an environment above to view certified templates.
                </div>
             ) : (
                 <div className="grid grid-cols-1 gap-3">
                    {currentTopic?.templates.map(tpl => (
                         <button
                         key={tpl.id}
                         onClick={() => handleTemplateSelect(tpl.id)}
                         className={`w-full p-4 rounded-lg border text-left transition-all flex justify-between items-center ${
                           selectedTemplateId === tpl.id 
                           ? 'bg-purple-600/20 border-purple-500 text-white' 
                           : 'bg-studio-800 border-studio-700 text-gray-400 hover:border-studio-600'
                         }`}
                       >
                         <div>
                             <div className="font-bold flex items-center gap-2">
                                 {tpl.label}
                                 {selectedTemplateId === tpl.id && <CheckCircle size={14} className="text-purple-400"/>}
                             </div>
                             <div className="text-sm opacity-80 mt-1">{tpl.intent}</div>
                         </div>
                         <div className="text-xs bg-black/30 px-3 py-1.5 rounded-full font-mono text-gray-500 border border-white/5">
                            {tpl.id.toUpperCase()}
                         </div>
                       </button>
                    ))}
                 </div>
             )}
          </section>

          {/* 3. Select Model */}
          <section>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    3. Render Pipeline
                </h3>
                {isAutoSelected && (
                    <span className="text-xs text-green-400 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                        <Sparkles size={12} /> Auto-Optimized
                    </span>
                )}
            </div>
            {!selectedTemplateId ? (
                 <div className="text-gray-500 italic text-sm p-4 border border-dashed border-studio-700 rounded bg-studio-800/50">
                    Select a template to view compatible render engines.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {compatibleModels.map((model, idx) => (
                         <button
                         key={model.id}
                         onClick={() => { setModel(model.id); setIsAutoSelected(false); }}
                         className={`p-3 rounded-lg border text-left transition-all relative ${
                           selectedModelId === model.id 
                           ? 'bg-green-600/20 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                           : 'bg-studio-800 border-studio-700 text-gray-400 hover:border-studio-600'
                         }`}
                       >
                         {idx === 0 && (
                             <div className="absolute -top-2 -right-2 z-10">
                                 <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-lg">
                                     <Star size={8} className="mr-1 fill-black" /> BEST
                                 </span>
                             </div>
                         )}
                         <div className="font-medium text-sm">{model.name}</div>
                         <div className="text-xs text-gray-500 mt-1">Cap: {model.capabilities.slice(0, 2).join(', ')}</div>
                       </button>
                    ))}
                </div>
            )}
          </section>

          {/* 4. Pro Studio Settings */}
          {selectedModelId && (
            <section className="bg-studio-800/40 p-5 rounded-xl border border-studio-700/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2">
                    <Sliders size={16} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pro Studio Controls</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quality Tier */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <Layers size={12}/> Quality Tier
                        </label>
                        <div className="flex bg-studio-900 rounded p-1 border border-studio-700">
                            {(['Standard', 'Pro', 'Ultra'] as const).map(tier => (
                                <button
                                    key={tier}
                                    onClick={() => setQuality(tier)}
                                    className={`flex-1 text-xs py-1.5 rounded transition-all ${
                                        generationSettings.quality === tier 
                                        ? 'bg-studio-700 text-white shadow-sm font-medium' 
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Motion Intensity */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <Zap size={12}/> Motion Intensity
                        </label>
                        <div className="flex bg-studio-900 rounded p-1 border border-studio-700">
                            {(['Low', 'Medium', 'High'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setMotionIntensity(level)}
                                    className={`flex-1 text-xs py-1.5 rounded transition-all ${
                                        generationSettings.motion === level 
                                        ? 'bg-studio-700 text-white shadow-sm font-medium' 
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Render Priority */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <Gauge size={12}/> Priority
                        </label>
                        <div className="flex bg-studio-900 rounded p-1 border border-studio-700">
                            {(['Speed', 'Quality'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setRenderPriority(p)}
                                    className={`flex-1 text-xs py-1.5 rounded transition-all ${
                                        generationSettings.priority === p 
                                        ? 'bg-studio-700 text-white shadow-sm font-medium' 
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
          )}

        </div>

        {/* Right Column: Preview & Action (4 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
            <div className="bg-studio-800 rounded-xl border border-studio-700 p-6 flex-1 flex flex-col sticky top-6">
                <div className="flex items-center gap-2 mb-6 border-b border-studio-700 pb-4">
                    <Sliders size={20} className="text-blue-500"/>
                    <h3 className="text-lg font-bold text-white">Production Manifest</h3>
                </div>
                
                <div className="flex-1 space-y-6">
                    {/* Read Only Prompt View */}
                    <div className="bg-black/30 rounded-lg p-4 border border-studio-700/50 relative group">
                        <div className="absolute top-3 right-3">
                            <Lock size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" title="Prompt Editing Locked"/>
                        </div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Internal Prompt Logic</h4>
                        {currentTemplate ? (
                            <p className="text-sm text-gray-300 font-mono leading-relaxed opacity-70">
                                {currentTemplate.basePrompt}
                                <span className="text-studio-500"> [Safe: Locked Camera, No Text, Cinematic]</span>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600 italic">Configuration pending...</p>
                        )}
                        
                        {currentTemplate && (
                            <div className="mt-3 flex gap-2">
                                <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                                    <ShieldCheck size={10} /> Safety Layer Active
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                            <span className="text-gray-500">Resolution</span>
                            <span className="text-gray-200">1920x1080 (HD)</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                            <span className="text-gray-500">Duration</span>
                            <span className="text-gray-200">{compatibleModels.find(m => m.id === selectedModelId)?.maxDuration || '-'}s</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                            <span className="text-gray-500">Model Provider</span>
                            <span className="text-blue-400 font-medium">{compatibleModels.find(m => m.id === selectedModelId)?.provider || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                            <span className="text-gray-500">Config</span>
                            <span className="text-purple-400 font-medium text-xs">
                                {generationSettings.quality} / {generationSettings.motion} Motion
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-studio-700">
                    <button
                        disabled={!selectedTopicId || !selectedTemplateId || !selectedModelId || isGenerating}
                        onClick={handleGenerate}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-studio-700 disabled:to-studio-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">Orchestrating API...</span>
                        ) : (
                            <>
                                <Play size={20} fill="currentColor" />
                                Generate Video
                            </>
                        )}
                    </button>
                    {lastJobId && (
                         <div className="mt-4 text-center animate-in fade-in slide-in-from-bottom-2">
                             <Link href="/studio/jobs" className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium flex items-center justify-center gap-1">
                                 Job #{lastJobId.substring(0,6)} Queued &rarr;
                             </Link>
                         </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

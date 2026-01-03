
"use client";

import { useStudioStore } from '@/store/studioStore';
import { TOPIC_LIBRARY, getTemplateById } from '@/lib/topicLibrary';
import { getCompatibleModelsForTemplate } from '@/lib/modelMapper';
import { createBatchJobs } from '@/lib/batchEngine';
import { generateSafePrompt } from '@/lib/promptEngine';
import { Layers, PlayCircle, Sliders, Zap, Gauge } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BatchPage() {
  const router = useRouter();
  const { 
    selectedTopicId, 
    selectedTemplateId, 
    selectedModelId,
    batchSize,
    generationSettings,
    setTopic,
    setTemplate,
    setModel,
    setBatchSize,
    setQuality,
    setMotionIntensity,
    setRenderPriority,
    addJobs
  } = useStudioStore();

  const currentTopic = TOPIC_LIBRARY.find(t => t.id === selectedTopicId);
  const currentTemplate = selectedTemplateId && selectedTopicId ? getTemplateById(selectedTopicId, selectedTemplateId) : null;
  const compatibleModels = currentTemplate ? getCompatibleModelsForTemplate(currentTemplate.compatibleModels) : [];

  const handleLaunchBatch = () => {
    if (!currentTopic || !currentTemplate || !selectedModelId) return;

    const basePrompt = generateSafePrompt(currentTemplate.basePrompt);
    const jobs = createBatchJobs(batchSize, currentTopic.id, currentTemplate.id, selectedModelId, basePrompt);
    
    // Attach settings to each job
    const jobsWithSettings = jobs.map(j => ({
        ...j,
        settings: { ...generationSettings }
    }));
    
    addJobs(jobsWithSettings);
    router.push('/studio/jobs');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
       <header className="mb-8 border-b border-studio-700 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Layers className="text-green-500" />
            Batch Engine
        </h1>
        <p className="text-gray-400 mt-2">
            Configure mass production runs. Optimized for 10-50 simultaneous generations.
        </p>
      </header>

      <div className="bg-studio-800 border border-studio-700 rounded-xl p-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Topic</label>
                <select 
                    className="w-full bg-studio-900 border border-studio-600 rounded px-3 py-2 text-white"
                    value={selectedTopicId || ''}
                    onChange={(e) => setTopic(e.target.value)}
                >
                    <option value="">Select Topic</option>
                    {TOPIC_LIBRARY.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Template</label>
                <select 
                    className="w-full bg-studio-900 border border-studio-600 rounded px-3 py-2 text-white"
                    value={selectedTemplateId || ''}
                    onChange={(e) => setTemplate(e.target.value)}
                    disabled={!selectedTopicId}
                >
                    <option value="">Select Template</option>
                    {currentTopic?.templates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Model</label>
                <select 
                    className="w-full bg-studio-900 border border-studio-600 rounded px-3 py-2 text-white"
                    value={selectedModelId || ''}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!selectedTemplateId}
                >
                    <option value="">Select Model</option>
                    {compatibleModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>
        </div>

        {/* Global Settings for Batch */}
        <div className="bg-studio-900/50 p-6 rounded-xl border border-studio-700/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sliders size={16} className="text-green-500" /> Batch Job Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Quality</label>
                    <div className="flex bg-studio-800 rounded p-1 border border-studio-700">
                        {(['Standard', 'Pro', 'Ultra'] as const).map(tier => (
                            <button
                                key={tier}
                                onClick={() => setQuality(tier)}
                                className={`flex-1 text-xs py-1.5 rounded transition-all ${
                                    generationSettings.quality === tier ? 'bg-studio-600 text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Motion</label>
                    <div className="flex bg-studio-800 rounded p-1 border border-studio-700">
                        {(['Low', 'Medium', 'High'] as const).map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setMotionIntensity(lvl)}
                                className={`flex-1 text-xs py-1.5 rounded transition-all ${
                                    generationSettings.motion === lvl ? 'bg-studio-600 text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Priority</label>
                    <div className="flex bg-studio-800 rounded p-1 border border-studio-700">
                        {(['Speed', 'Quality'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setRenderPriority(p)}
                                className={`flex-1 text-xs py-1.5 rounded transition-all ${
                                    generationSettings.priority === p ? 'bg-studio-600 text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-400 mb-4">Batch Size: <span className="text-white font-bold">{batchSize}</span></label>
            <input 
                type="range" 
                min="1" 
                max="50" 
                value={batchSize} 
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full h-2 bg-studio-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1</span>
                <span>25</span>
                <span>50</span>
            </div>
        </div>

        <div className="bg-studio-900 p-4 rounded border border-studio-700 text-sm text-gray-300">
            <h4 className="font-bold text-white mb-2">Batch Manifest</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Total Jobs: {batchSize}</li>
                <li>Est. Time: {batchSize * 0.5} minutes (Parallel)</li>
                <li>Naming: <code>YYYY-MM-DD_{"{index}"}_{currentTemplate?.id || 'tpl'}_{selectedModelId || 'model'}.mp4</code></li>
            </ul>
        </div>

        <button
            onClick={handleLaunchBatch}
            disabled={!selectedTopicId || !selectedTemplateId || !selectedModelId}
            className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-studio-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
        >
            <PlayCircle size={20} /> Launch Batch Process
        </button>

      </div>
    </div>
  );
}

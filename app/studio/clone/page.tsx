"use client";

import { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';
import { DEFAULT_DNA } from '@/lib/visualDNA';
import { convertDNAToPrompt } from '@/lib/dnaToPrompt';
import { v4 as uuidv4 } from 'uuid';
import { Scan, Sparkles, AlertTriangle, Info, X, Monitor, Sun, Zap, Palette, Ratio, ChevronRight, Gauge, Check } from 'lucide-react';

// Enhanced Guide Data with State Mapping
const DNA_GUIDE_DATA = [
  {
    id: 'camera',
    dnaKey: 'cameraType',
    label: 'Camera',
    icon: Monitor,
    description: 'How the observer moves in the scene',
    items: [
      { name: 'Static Tripod', desc: 'Fixed position. Great for interviews or focusing on subject motion.' },
      { name: 'Slow Pan', desc: 'Rotates horizontally. Reveals scale and environment.' },
      { name: 'Dolly In', desc: 'Moves forward physically. Increases intimacy or tension.' },
      { name: 'Handheld', desc: 'Shaky, organic movement. Adds realism or chaos.' },
      { name: 'Drone Hover', desc: 'Aerial stability. Establishes location.' }
    ]
  },
  {
    id: 'lighting',
    dnaKey: 'lightingFlow',
    label: 'Lighting',
    icon: Sun,
    description: 'Atmosphere and shadow interaction',
    items: [
      { name: 'Natural Day', desc: 'Soft sunlight, realistic shadows.', color: 'bg-[#fdfbd4] border-yellow-100' },
      { name: 'Golden Hour', desc: 'Warm, low-angle sun. Romantic/Nostalgic.', color: 'bg-orange-300 border-orange-400' },
      { name: 'Cinematic Night', desc: 'Blue tones, deep blacks, high contrast.', color: 'bg-slate-900 border-slate-700' },
      { name: 'Studio High-Key', desc: 'Bright, even, no harsh shadows.', color: 'bg-white border-gray-200' }
    ]
  },
  {
    id: 'motion',
    dnaKey: 'motionStyle',
    label: 'Motion',
    icon: Zap,
    description: 'Energy within the frame',
    items: [
      { name: 'Subtle', desc: 'Micro-movements: breathing, wind, blinking.', anim: 'hover:scale-[1.01] transition-transform' },
      { name: 'Dynamic', desc: 'High energy: running, falling, fast action.', anim: 'hover:translate-x-1 transition-transform' },
      { name: 'Slow Motion', desc: 'Expanded time. Emphasizes emotional weight.', anim: 'hover:opacity-75 transition-opacity duration-700' }
    ]
  },
  {
    id: 'pacing',
    dnaKey: 'pacing',
    label: 'Pacing',
    icon: Gauge,
    description: 'Speed of the edit or action flow',
    items: [
      { name: 'Slow', desc: 'Meditative, lingering shots.', visual: 'w-1/3' },
      { name: 'Medium', desc: 'Standard narrative flow.', visual: 'w-2/3' },
      { name: 'Fast', desc: 'Rapid, energetic, chaotic.', visual: 'w-full' }
    ]
  },
  {
    id: 'color',
    dnaKey: 'colorGrade',
    label: 'Color',
    icon: Palette,
    description: 'Artistic color grading',
    items: [
      { name: 'Neutral', desc: 'True-to-life.', gradient: 'from-gray-200 to-gray-300' },
      { name: 'Warm', desc: 'Comforting, heated.', gradient: 'from-orange-200 to-red-300' },
      { name: 'Cool', desc: 'Clinical, detached.', gradient: 'from-blue-200 to-cyan-300' },
      { name: 'Cyberpunk', desc: 'Neon, futuristic.', gradient: 'from-purple-500 via-pink-500 to-cyan-500' },
      { name: 'Vintage', desc: 'Faded, nostalgic.', gradient: 'from-yellow-200 to-stone-400' }
    ]
  },
  {
    id: 'ratio',
    dnaKey: 'aspectRatio',
    label: 'Aspect Ratio',
    icon: Ratio,
    description: 'Frame dimensions',
    items: [
      { name: '16:9', desc: 'Standard Widescreen', aspect: 'aspect-video w-16' },
      { name: '9:16', desc: 'Vertical / Mobile', aspect: 'aspect-[9/16] h-10' },
      { name: '1:1', desc: 'Square', aspect: 'aspect-square w-10' },
      { name: '2.35:1', desc: 'Cinematic Anamorphic', aspect: 'aspect-[21/9] w-20' }
    ]
  }
];

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
  
  // Guide State
  const [showGuide, setShowGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('camera');

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
      
      if (data) {
        const mergedDNA = { ...DEFAULT_DNA, ...data };
        setVisualDNA(mergedDNA);
        const prompt = convertDNAToPrompt(mergedDNA, "Recreated scene matching structural DNA");
        setGeneratedPrompt(prompt);
      }
    } catch (e) {
      setError("Failed to analyze visual structure. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualDnaSelect = (key: string, value: string) => {
    const newDNA = { ...visualDNA, [key]: value };
    setVisualDNA(newDNA);
    // Auto-update prompt if it exists, otherwise leave it blank until generate
    if (generatedPrompt) {
        setGeneratedPrompt(convertDNAToPrompt(newDNA, cloneInputText || "Manually configured scene"));
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
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Scan className="text-purple-500" />
                    Visual DNA Clone
                </h1>
                <p className="text-gray-400 mt-2">
                    Replicate the <i>structure</i> and <i>feel</i> of a video without copying pixels.
                </p>
                <span className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1 mt-1">
                    <AlertTriangle size={12} /> Legal Safe: No frame extraction used.
                </span>
            </div>
            <button 
                onClick={() => setShowGuide(!showGuide)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showGuide ? 'bg-purple-600 border-purple-500 text-white' : 'bg-studio-800 border-studio-700 text-gray-400 hover:text-white'}`}
            >
                {showGuide ? <X size={18} /> : <Info size={18} />}
                {showGuide ? 'Close Guide' : 'Interactive Guide'}
            </button>
        </div>
      </header>

      {/* INTERACTIVE GUIDE SECTION */}
      {showGuide && (
          <div className="mb-12 bg-studio-800 rounded-xl border border-studio-700 overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="flex border-b border-studio-700 bg-studio-900/50 overflow-x-auto">
                  {DNA_GUIDE_DATA.map((cat) => (
                      <button
                          key={cat.id}
                          onClick={() => setActiveGuideTab(cat.id)}
                          className={`flex-1 py-4 px-4 min-w-[100px] flex flex-col items-center justify-center gap-2 transition-colors border-b-2 ${
                              activeGuideTab === cat.id 
                              ? 'border-purple-500 text-white bg-studio-800' 
                              : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-studio-800/50'
                          }`}
                      >
                          <cat.icon size={20} />
                          <span className="text-xs font-bold uppercase">{cat.label}</span>
                      </button>
                  ))}
              </div>
              <div className="p-6">
                  {DNA_GUIDE_DATA.map((cat) => (
                      <div key={cat.id} className={activeGuideTab === cat.id ? 'block' : 'hidden'}>
                          <div className="mb-4">
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                  <cat.icon className="text-purple-500" size={24}/>
                                  {cat.label} Parameters
                              </h3>
                              <p className="text-gray-400 text-sm">{cat.description}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {cat.items.map((item, idx) => {
                                  const isSelected = (visualDNA as any)[cat.dnaKey] === item.name;
                                  return (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleManualDnaSelect(cat.dnaKey, item.name)}
                                        className={`text-left p-4 rounded-lg border flex gap-4 items-center transition-all group relative ${
                                            isSelected
                                            ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                            : 'bg-studio-900 border-studio-700 hover:border-studio-500 hover:bg-studio-900/80'
                                        }`}
                                    >
                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 text-purple-400">
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                        )}

                                        {/* Visual Cues */}
                                        <div className="shrink-0 w-16 h-16 rounded bg-studio-800 flex items-center justify-center overflow-hidden border border-studio-700">
                                            {cat.id === 'ratio' && 'aspect' in item && (
                                                <div className={`${item.aspect} bg-gray-500 rounded-sm border border-gray-400`} />
                                            )}
                                            {cat.id === 'color' && 'gradient' in item && (
                                                <div className={`w-full h-full bg-gradient-to-br ${item.gradient}`} />
                                            )}
                                            {cat.id === 'lighting' && 'color' in item && (
                                                <div className={`w-10 h-10 rounded-full shadow-lg border ${item.color}`} />
                                            )}
                                            {cat.id === 'pacing' && 'visual' in item && (
                                                <div className="w-12 h-2 bg-studio-700 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-green-500 ${item.visual}`} />
                                                </div>
                                            )}
                                            {cat.id === 'camera' && <Monitor className={`text-gray-600 ${isSelected ? 'text-purple-400' : ''}`} />}
                                            {cat.id === 'motion' && (
                                                <Zap className={`text-gray-600 ${isSelected ? 'text-purple-400' : ''} ${'anim' in item ? item.anim : ''}`} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${isSelected ? 'text-purple-300' : 'text-white'}`}>{item.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </button>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

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
            
            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg flex gap-3 text-sm text-blue-200">
                <Info className="shrink-0 mt-0.5" size={16} />
                <p>
                    <strong>Tip:</strong> You can click on the items in the Interactive Guide above to manually fine-tune the extracted DNA values.
                </p>
            </div>
        </div>

        <div className="bg-studio-800 p-6 rounded-xl border border-studio-700 flex flex-col h-full">
            <h3 className="text-lg font-bold text-white mb-4">DNA Signature</h3>
            
            <div className="space-y-0 flex-1">
                {Object.entries(visualDNA).map(([key, value]) => {
                     // Find icon for this key
                     const guideItem = DNA_GUIDE_DATA.find(g => g.dnaKey === key);
                     const Icon = guideItem ? guideItem.icon : Scan;
                     
                     return (
                        <div key={key} className="flex justify-between items-center border-b border-studio-700 py-3 last:border-0 group hover:bg-studio-700/30 px-2 rounded transition-colors cursor-default">
                            <span className="text-gray-400 capitalize flex items-center gap-3">
                                <Icon size={16} className="text-studio-500 group-hover:text-purple-400 transition-colors"/>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-purple-300 font-mono text-sm text-right bg-studio-900 px-2 py-1 rounded border border-studio-700">
                                {value as string}
                            </span>
                        </div>
                     );
                })}
            </div>

            {generatedPrompt && (
                <div className="mt-6 p-4 bg-studio-900 rounded border border-studio-700">
                    <span className="text-xs text-gray-500 uppercase flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-yellow-500"/>
                        Generated Divergent Prompt
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed">{generatedPrompt}</p>
                </div>
            )}

            <button
                disabled={!generatedPrompt}
                onClick={handleCreateClone}
                className="mt-6 w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-studio-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-900/20"
            >
                Generate Clone
            </button>
        </div>

      </div>
    </div>
  );
}
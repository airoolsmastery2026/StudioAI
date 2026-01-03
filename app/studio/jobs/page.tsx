"use client";

import { useStudioStore } from '@/store/studioStore';
import { Job, JobStatus } from '@/types';
import { useEffect } from 'react';
import { RefreshCw, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { generateVideoFilename } from '@/lib/fileNaming';

const StatusIcon = ({ status }: { status: JobStatus }) => {
    switch (status) {
        case 'done': return <CheckCircle className="text-green-500" size={18} />;
        case 'processing': return <RefreshCw className="text-blue-500 animate-spin" size={18} />;
        case 'error': return <AlertCircle className="text-red-500" size={18} />;
        default: return <Clock className="text-gray-500" size={18} />;
    }
};

export default function JobsPage() {
    const { jobs, updateJobStatus } = useStudioStore();

    // Simulation of a job processor worker that picks up pending jobs
    useEffect(() => {
        const pendingJobs = jobs.filter(j => j.status === 'pending');
        
        if (pendingJobs.length > 0) {
            const timer = setTimeout(() => {
                // Process 1 job at a time for demo
                const jobToProcess = pendingJobs[0];
                updateJobStatus(jobToProcess.id, 'processing');
                
                // Call API
                fetch('/api/generate-video', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        jobId: jobToProcess.id, 
                        prompt: jobToProcess.finalPrompt, 
                        model: jobToProcess.modelId 
                    })
                })
                .then(res => res.json())
                .then(data => {
                    // Simulate completion delay
                    setTimeout(() => {
                        updateJobStatus(jobToProcess.id, 'done', data.url);
                    }, 3000);
                })
                .catch(err => {
                    updateJobStatus(jobToProcess.id, 'error', undefined, 'API Error');
                });

            }, 500);
            return () => clearTimeout(timer);
        }
    }, [jobs, updateJobStatus]);

    const sortedJobs = [...jobs].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Production Queue</h1>
                    <p className="text-gray-400 mt-1">Real-time status of video generation jobs.</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono text-white">{jobs.filter(j => j.status === 'done').length} / {jobs.length}</div>
                    <div className="text-xs text-gray-500 uppercase">Completed</div>
                </div>
            </header>

            <div className="bg-studio-800 border border-studio-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-studio-700 text-gray-300">
                        <tr>
                            <th className="p-4">Status</th>
                            <th className="p-4">ID</th>
                            <th className="p-4">Template/Intent</th>
                            <th className="p-4">Model</th>
                            <th className="p-4">Created</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-studio-700 text-gray-300">
                        {sortedJobs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500 italic">No jobs in queue. Start a project.</td>
                            </tr>
                        ) : (
                            sortedJobs.map((job, idx) => (
                                <tr key={job.id} className="hover:bg-studio-700/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 capitalize">
                                            <StatusIcon status={job.status} />
                                            {job.status}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs opacity-70">{job.id.substring(0, 8)}...</td>
                                    <td className="p-4">{job.templateId}</td>
                                    <td className="p-4 text-blue-300">{job.modelId}</td>
                                    <td className="p-4 text-xs">{new Date(job.createdAt).toLocaleTimeString()}</td>
                                    <td className="p-4 text-right">
                                        {job.status === 'done' && (
                                            <a 
                                                href={job.resultUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                download={generateVideoFilename(idx, job.templateId, job.modelId)}
                                                className="inline-flex items-center gap-1 text-green-400 hover:text-green-300"
                                            >
                                                <Download size={16} /> Save
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
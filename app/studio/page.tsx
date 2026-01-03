"use client";

import { useStudioStore } from '@/store/studioStore';
import { ArrowRight, Activity, HardDrive, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const jobs = useStudioStore((state) => state.jobs);
  const completedJobs = jobs.filter(j => j.status === 'done').length;
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">Studio Overview</h2>
        <p className="text-gray-400">Welcome back. System is ready for production.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-studio-800 p-6 rounded-xl border border-studio-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Jobs</p>
              <h3 className="text-2xl font-bold text-white">{jobs.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-studio-800 p-6 rounded-xl border border-studio-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
              <HardDrive size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed Output</p>
              <h3 className="text-2xl font-bold text-white">{completedJobs}</h3>
            </div>
          </div>
        </div>

        <div className="bg-studio-800 p-6 rounded-xl border border-studio-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">System Status</p>
              <h3 className="text-2xl font-bold text-white">Online</h3>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/studio/topics" className="group block bg-gradient-to-br from-studio-800 to-studio-900 p-6 rounded-xl border border-studio-700 hover:border-blue-500 transition-all">
          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">New Topic Project</h4>
          <p className="text-gray-400 text-sm mb-4">Start a new single-video generation using predefined architectural topics.</p>
          <div className="flex items-center text-blue-500 text-sm font-medium">
            Start Creating <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/studio/clone" className="group block bg-gradient-to-br from-studio-800 to-studio-900 p-6 rounded-xl border border-studio-700 hover:border-purple-500 transition-all">
          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Visual DNA Clone</h4>
          <p className="text-gray-400 text-sm mb-4">Analyze video structure text and replicate the style safely.</p>
          <div className="flex items-center text-purple-500 text-sm font-medium">
            Analyze DNA <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/studio/batch" className="group block bg-gradient-to-br from-studio-800 to-studio-900 p-6 rounded-xl border border-studio-700 hover:border-green-500 transition-all">
          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Batch Processing</h4>
          <p className="text-gray-400 text-sm mb-4">Queue up 10-50 variations for mass production.</p>
          <div className="flex items-center text-green-500 text-sm font-medium">
            Configure Batch <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
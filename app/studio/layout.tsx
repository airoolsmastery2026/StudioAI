import Link from 'next/link';
import { MonitorPlay, Copy, Layers, LayoutGrid, Settings, Share2 } from 'lucide-react';
import React from 'react';

const SidebarItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
  <Link 
    href={href}
    className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-studio-700 rounded-lg transition-colors"
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-studio-800 border-r border-studio-700 flex flex-col">
        <div className="p-6 border-b border-studio-700">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MonitorPlay className="text-blue-500" />
            StudioAI
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem href="/studio" icon={LayoutGrid} label="Dashboard" />
          <SidebarItem href="/studio/topics" icon={Layers} label="Topic Studio" />
          <SidebarItem href="/studio/clone" icon={Copy} label="Clone & DNA" />
          <SidebarItem href="/studio/batch" icon={Settings} label="Batch Engine" />
          <SidebarItem href="/studio/publish" icon={Share2} label="Social Publish" />
        </nav>
        
        <div className="p-4 border-t border-studio-700 text-xs text-gray-500">
          <p>v1.0.0 Production</p>
          <p>Desktop First</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-studio-900 relative">
        {children}
      </main>
    </div>
  );
}
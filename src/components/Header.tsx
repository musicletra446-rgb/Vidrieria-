import React from 'react';
import { ModuleTab } from '../types/logistics';
import { Layers, Warehouse, Boxes, ShoppingCart, Truck, Play } from 'lucide-react';

interface HeaderProps {
  activeTab: ModuleTab;
  onTabChange: (tab: ModuleTab) => void;
  onRunSimulation: () => void;
  hasBlockage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunSimulation,
  hasBlockage,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-lg shadow-inner">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                  Vidriería La Primera
                </span>
                <span className="text-[11px] font-medium text-cyan-400/90 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 hidden sm:inline-block">
                  Buga · Valle del Cauca
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Sistema Logístico · Tompkins · Ballou · Chopra
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => onTabChange('resumen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'resumen'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => onTabChange('almacenamiento')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 relative ${
                activeTab === 'almacenamiento'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Almacenamiento (Tompkins)</span>
              {hasBlockage && (
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" title="Bloqueo detectado" />
              )}
            </button>

            <button
              onClick={() => onTabChange('inventarios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'inventarios'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Inventarios (Ballou)</span>
            </button>

            <button
              onClick={() => onTabChange('abastecimiento')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'abastecimiento'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Abastecimiento (Chopra)</span>
            </button>

            <button
              onClick={() => onTabChange('distribucion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'distribucion'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Distribución (Ballou)</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRunSimulation}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
              title="Ejecutar simulación de eventos logísticos en tiempo real"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Simular Operación</span>
              <span className="sm:hidden">Simular</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

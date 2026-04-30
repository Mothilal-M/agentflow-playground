import { Handle, Position } from '@xyflow/react';
import { Play, Square, Cpu, Wrench, FileText, Zap, ChevronRight, Activity } from 'lucide-react';
import React from 'react';

const getIcon = (typeLabel) => {
  const lower = (typeLabel || '').toLowerCase();
  if (lower.includes('start')) return <Play className="w-[14px] h-[14px]" />;
  if (lower.includes('end')) return <Square className="w-[14px] h-[14px]" />;
  if (lower.includes('agent')) return <Cpu className="w-[14px] h-[14px]" />;
  if (lower.includes('tool')) return <Wrench className="w-[14px] h-[14px]" />;
  return <FileText className="w-[14px] h-[14px]" />;
};

const CustomNode = ({ data, selected, targetPosition = Position.Top, sourcePosition = Position.Bottom }) => {
  const { _color, _typeLabel, label } = data;

  return (
    <div
      className={`group relative flex w-[280px] flex-col rounded-2xl transition-all duration-300 
      backdrop-blur-md bg-white/90 dark:bg-[#0f111a]/90
      border border-slate-200/50 dark:border-white/5
      ${
        selected 
          ? 'scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-transparent dark:border-transparent' 
          : 'hover:shadow-xl hover:border-slate-300/50 dark:hover:border-white/10 shadow-sm'
      }`}
      style={{
        boxShadow: selected ? `0 0 0 1px ${_color}, 0 10px 40px -10px ${_color}50` : undefined
      }}
    >
      {/* 
        PREMIUM TOUCH: A subtle, glowing top gradient that mimics a glass-neon edge.
        This immediately signals "cutting-edge technology" to the user/marketer. 
      */}
      <div 
        className="absolute inset-x-0 top-0 h-[2px] w-full rounded-t-2xl opacity-80" 
        style={{
          background: `linear-gradient(90deg, transparent, ${_color}, transparent)`
        }} 
      />

      <Handle type="target" position={targetPosition} className="opacity-0" />

      {/* Node Header - Sleek & Minimal */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          {/* Glowing Icon Container */}
          <div 
            className="flex items-center justify-center p-[5px] rounded-lg bg-slate-50 dark:bg-[#1a1d27] border border-slate-200/50 dark:border-white/5" 
            style={{ color: _color, boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.05)` }}
          >
            {getIcon(_typeLabel)}
          </div>
          <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400">
            {_typeLabel}
          </span>
        </div>
        
        {/* High-End Status Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/50 dark:bg-[#161925] border border-slate-200/50 dark:border-white/5">
          <Activity className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span className="text-[9px] font-mono font-medium tracking-wider text-slate-500 dark:text-slate-400">
            IDLE
          </span>
        </div>
      </div>

      {/* Main Content Body - Typography Focus */}
      <div className="flex flex-col px-4 pb-4 pt-1 relative z-10 min-h-[70px]">
        {/* 
          Typography Trick: Negative tracking (-0.02em) on sans-serif makes it look 
          like Inter/San Francisco, giving it an "Apple" or "Stripe" premium aesthetic. 
        */}
        <div className="flex flex-col">
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-snug truncate" title={label}>
            {label}
          </h3>
          <p className="text-[12px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 truncate tracking-wide">
            {data.action || "Execute operation"}
          </p>
        </div>
        
        {/* Hover-revealed interaction cue */}
        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <Handle type="source" position={sourcePosition} className="opacity-0" />
    </div>
  );
};

export default React.memo(CustomNode);
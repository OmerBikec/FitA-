
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'brand' | 'blue' | 'emerald' | 'orange' | 'pink' | 'purple' | 'cyan';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon,
  subValue,
  trend,
  trendValue,
  color = 'brand'
}) => {
  
  // Crystal & Neon Theme Configuration
  const styles = {
    brand:  { 
        text: 'text-indigo-400', 
        gradientText: 'from-white via-indigo-200 to-indigo-400',
        border: 'border-indigo-500/30', 
        shadow: 'shadow-indigo-500/10',
        iconBg: 'bg-indigo-500/20',
        iconColor: 'text-indigo-300',
        line: 'bg-indigo-500' 
    },
    blue:   { 
        text: 'text-blue-400', 
        gradientText: 'from-white via-blue-200 to-blue-400',
        border: 'border-blue-500/30', 
        shadow: 'shadow-blue-500/10',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-300',
        line: 'bg-blue-500' 
    },
    emerald:{ 
        text: 'text-emerald-400', 
        gradientText: 'from-white via-emerald-200 to-emerald-400',
        border: 'border-emerald-500/30', 
        shadow: 'shadow-emerald-500/10',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-300',
        line: 'bg-emerald-500' 
    },
    orange: { 
        text: 'text-orange-400', 
        gradientText: 'from-white via-orange-200 to-orange-400',
        border: 'border-orange-500/30', 
        shadow: 'shadow-orange-500/10',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-300',
        line: 'bg-orange-500' 
    },
    pink:   { text: 'text-pink-400', gradientText: 'from-white via-pink-200 to-pink-400', border: 'border-pink-500/30', shadow: 'shadow-pink-500/10', iconBg: 'bg-pink-500/20', iconColor: 'text-pink-300', line: 'bg-pink-500' },
    purple: { text: 'text-purple-400', gradientText: 'from-white via-purple-200 to-purple-400', border: 'border-purple-500/30', shadow: 'shadow-purple-500/10', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-300', line: 'bg-purple-500' },
    cyan:   { text: 'text-cyan-400', gradientText: 'from-white via-cyan-200 to-cyan-400', border: 'border-cyan-500/30', shadow: 'shadow-cyan-500/10', iconBg: 'bg-cyan-500/20', iconColor: 'text-cyan-300', line: 'bg-cyan-500' },
  };

  const style = styles[color] || styles.brand;

  return (
    <div className={`
      group relative overflow-hidden rounded-[32px] p-6 
      bg-[#0f172a]/60 dark:bg-[#0f172a]/40 backdrop-blur-2xl
      border border-white/5 ${style.border} 
      shadow-2xl ${style.shadow}
      transition-all duration-500
      hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]
    `}>
      
      {/* Prismatic Top Border */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${style.line} opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.5)]`}></div>

      {/* Internal Glass Reflection */}
      <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>

      {/* Background Mesh/Glow */}
      <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${style.iconBg} blur-[80px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity`}></div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-6">
           {/* 3D Glass Icon Container */}
           <div className={`
             relative w-14 h-14 rounded-2xl flex items-center justify-center 
             bg-gradient-to-br from-white/10 to-transparent border border-white/10
             shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md
             group-hover:scale-110 group-hover:rotate-3 transition-all duration-500
           `}>
             <div className={`absolute inset-0 rounded-2xl ${style.iconBg} blur-md opacity-50`}></div>
             <Icon size={26} className={`${style.iconColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10`} />
           </div>

           {/* Trend Pill */}
           {trend && (
             <div className={`
               flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide
               bg-black/30 border border-white/5 backdrop-blur-sm shadow-inner
             `}>
                {trend === 'up' ? <TrendingUp size={14} className="text-emerald-400"/> : 
                 trend === 'down' ? <TrendingDown size={14} className="text-rose-400"/> : 
                 <Minus size={14} className="text-slate-400"/>}
                <span className={trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}>
                  {trendValue}
                </span>
             </div>
           )}
        </div>

        <div>
           <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.25em] mb-2 opacity-70">{title}</div>
           <div className="flex items-end gap-3">
              <span className={`text-4xl md:text-5xl font-black bg-gradient-to-b ${style.gradientText} bg-clip-text text-transparent tracking-tighter drop-shadow-sm`}>
                {value}
              </span>
              {subValue && (
                <span className="text-xs font-bold text-slate-500 mb-2.5 py-0.5 px-2 rounded-md bg-white/5 border border-white/5">{subValue}</span>
              )}
           </div>
        </div>

        {/* Action Indicator */}
        <div className={`
            absolute right-6 bottom-6 w-8 h-8 rounded-full 
            flex items-center justify-center 
            border border-white/10 bg-white/5 
            translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100
            transition-all duration-500 cursor-pointer hover:bg-white/20
        `}>
           <ArrowRight size={14} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

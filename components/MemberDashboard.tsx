
import React, { useState, useEffect, useRef } from 'react';
import { User, WorkoutPlan, MeasurementLog, FoodItem } from '../types';
import { 
  Home, BrainCircuit, Activity, Heart, LogOut, ChevronRight, ChevronLeft, 
  Clock, Dumbbell, Menu, X, Flame, Utensils, Target, Trophy, Sparkles, 
  CheckCircle2, User as UserIcon, Scale, Ruler, Play, Plus, TrendingDown, 
  Salad, Send, Zap, Apple, ChefHat, Trash2, PieChart as PieIcon, ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { generateAIWorkoutPlan, chatWithAI, analyzeFoodIntake } from '../services/geminiService';

interface MemberDashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeSection, setActiveSection] = useState('panel');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Health States
  const [healthTab, setHealthTab] = useState<'tracker' | 'ai-coach'>('tracker');
  const [foodInput, setFoodInput] = useState('');
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [dailyMacros, setDailyMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Chat
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    {role: 'model', text: 'Merhaba! Bugün ne yediğini merak ediyorum. Beslenme günlüğüne ekleme yaptıysan onları analiz edebilirim.'}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const GOALS = { calories: 2500, protein: 180, carbs: 250, fat: 80 };

  useEffect(() => {
    if (user.dailyFoodLog) {
        const totals = user.dailyFoodLog.reduce((acc, curr) => ({
            calories: acc.calories + curr.calories,
            protein: acc.protein + curr.protein,
            carbs: acc.carbs + curr.carbs,
            fat: acc.fat + curr.fat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setDailyMacros(totals);
    }
  }, [user.dailyFoodLog]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAddFood = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!foodInput.trim()) return;
      setIsAnalyzingFood(true);
      const food = await analyzeFoodIntake(foodInput);
      setIsAnalyzingFood(false);
      if (food) {
          const newLog = user.dailyFoodLog ? [...user.dailyFoodLog, food] : [food];
          onUpdateUser({ ...user, dailyFoodLog: newLog });
          setFoodInput('');
      }
  };

  const handleRemoveFood = (id: string) => {
      onUpdateUser({ ...user, dailyFoodLog: user.dailyFoodLog?.filter(f => f.id !== id) });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      const userMsg = chatInput;
      setChatMessages(prev => [...prev, {role: 'user', text: userMsg}]);
      setChatInput('');
      setIsChatTyping(true);
      const response = await chatWithAI(userMsg, chatMessages, user.dailyFoodLog);
      setChatMessages(prev => [...prev, {role: 'model', text: response.text}]);
      setIsChatTyping(false);
  };

  const navItems = [
    { id: 'panel', label: 'Ana Sayfa', icon: Home },
    { id: 'profile', label: 'Profilim', icon: UserIcon },
    { id: 'workouts', label: 'Programım', icon: Dumbbell },
    { id: 'health', label: 'Sağlık & Beslenme', icon: Utensils },
    { id: 'ai', label: 'AI Koç', icon: BrainCircuit },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'health':
        return (
          <div className="space-y-8 page-transition pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-[#1B2436]">Sağlık & Beslenme</h2>
                <div className="flex bg-white p-1 rounded-2xl shadow-soft border border-slate-100">
                    <button onClick={() => setHealthTab('tracker')} className={`px-4 py-2 rounded-xl text-xs font-bold ${healthTab === 'tracker' ? 'bg-[#1B2436] text-white' : 'text-slate-400'}`}>Günlük Takip</button>
                    <button onClick={() => setHealthTab('ai-coach')} className={`px-4 py-2 rounded-xl text-xs font-bold ${healthTab === 'ai-coach' ? 'bg-[#1B2436] text-white' : 'text-slate-400'}`}>AI Analizi</button>
                </div>
              </div>

              {healthTab === 'tracker' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleAddFood} className="bg-white p-2 rounded-[32px] shadow-soft border border-white flex items-center gap-2 pl-6">
                        <Apple className="text-rose-500" size={20}/>
                        <input value={foodInput} onChange={e => setFoodInput(e.target.value)} type="text" placeholder="Ne yedin? AI analiz etsin..." className="flex-1 bg-transparent border-none text-sm font-bold outline-none h-12"/>
                        <button type="submit" disabled={isAnalyzingFood} className="px-6 py-3 bg-[#1B2436] text-white rounded-2xl font-bold text-xs uppercase flex items-center gap-2">
                           {isAnalyzingFood ? 'Analiz...' : <><Sparkles size={16}/> Ekle</>}
                        </button>
                    </form>

                    <div className="bg-white rounded-[40px] shadow-soft border border-white overflow-hidden">
                        <div className="p-6 border-b border-slate-50 font-black text-slate-400 uppercase text-[10px] tracking-widest">Bugünkü Öğünler</div>
                        <div className="p-4 space-y-3">
                            {user.dailyFoodLog?.map(food => (
                              <div key={food.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm font-black text-xs">
                                          {food.calories}<br/><span className="text-[8px] font-normal opacity-60">kcal</span>
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-[#1B2436] text-sm">{food.name}</h4>
                                          <div className="flex gap-2 mt-1">
                                              <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">P: {food.protein}g</span>
                                              <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">C: {food.carbs}g</span>
                                          </div>
                                      </div>
                                  </div>
                                  <button onClick={() => handleRemoveFood(food.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                              </div>
                            ))}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray={`${Math.min(100, (dailyMacros.calories/GOALS.calories)*100)}, 100`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black">{Math.round(dailyMacros.calories)}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Hedef: {GOALS.calories}</span>
                            </div>
                        </div>
                        <h4 className="text-sm font-black text-[#1B2436] uppercase tracking-widest">Kalori Dengesi</h4>
                    </div>

                    <div className="bg-[#1B2436] p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Protein Alımı</h4>
                            <div className="text-3xl font-black mb-2">{Math.round(dailyMacros.protein)}g</div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full rounded-full" style={{width: `${Math.min(100, (dailyMacros.protein/GOALS.protein)*100)}%`}}></div>
                            </div>
                            <p className="text-[10px] mt-2 text-slate-400">Hedef: {GOALS.protein}g protein</p>
                        </div>
                        <Zap size={80} className="absolute -bottom-5 -right-5 text-white/5 rotate-12"/>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] shadow-soft border border-white h-[600px] flex flex-col overflow-hidden">
                   <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center"><BrainCircuit size={20}/></div>
                      <div>
                        <h3 className="text-sm font-black text-[#1B2436]">Beslenme Analiz Asistanı</h3>
                        <p className="text-[10px] text-slate-400 font-medium">Yediğin her şeyin gelişimine etkisini sorabilirsin.</p>
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold ${m.role === 'user' ? 'bg-[#1B2436] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none shadow-sm'}`}>
                              {m.text}
                           </div>
                        </div>
                      ))}
                      <div ref={chatEndRef}/>
                   </div>
                   <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-50 flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} type="text" placeholder="Protein alımım yeterli mi?" className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"/>
                      <button type="submit" className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors"><Send size={18}/></button>
                   </form>
                </div>
              )}
          </div>
        );
      case 'panel':
        return (
          <div className="space-y-8 page-transition">
              <div className="relative w-full rounded-[48px] overflow-hidden min-h-[380px] flex items-center shadow-2xl bg-[#1B2436]">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                   <div className="relative z-10 p-12 w-full md:w-2/3">
                        <h1 className="text-5xl font-black text-white leading-tight mb-4">Hazır Mısın, <br/><span className="text-blue-400">{user.name.split(' ')[0]}?</span></h1>
                        <p className="text-slate-300 mb-8 font-medium">Hedeflerin için bugün yeni bir adım atma zamanı.</p>
                        {/* Fix: Added missing ArrowRight icon from lucide-react */}
                        <button onClick={() => setActiveSection('workouts')} className="h-14 px-8 bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-blue-500/20">Programım <ArrowRight size={20}/></button>
                   </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Kalori', value: Math.round(dailyMacros.calories), icon: Flame, color: 'text-orange-500' },
                   { label: 'Protein', value: `${Math.round(dailyMacros.protein)}g`, icon: Activity, color: 'text-blue-500' },
                   { label: 'Ölçümler', value: user.measurements?.length || 0, icon: Ruler, color: 'text-rose-500' },
                   { label: 'Başarı', value: '-', icon: Trophy, color: 'text-emerald-500' },
                 ].map((s, i) => (
                   <div key={i} className="bg-white p-6 rounded-[32px] shadow-soft border border-slate-100 flex flex-col items-center gap-1">
                      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${s.color} mb-2`}><s.icon size={20}/></div>
                      <div className="text-xl font-black">{s.value}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                   </div>
                 ))}
              </div>
          </div>
        );
      default:
        return <div className="p-10 font-black text-slate-300">Bu modül yakında sizlerle.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F9] flex overflow-x-hidden">
       <aside className={`fixed z-[70] lg:top-6 lg:left-6 lg:bottom-6 top-0 bottom-0 left-0 bg-white/90 backdrop-blur-2xl border border-white/40 shadow-sidebar flex flex-col transition-all duration-700 ${isSidebarCollapsed ? 'lg:w-[100px]' : 'lg:w-[280px]'} ${isMobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="pt-10 px-8 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#1B2436] flex items-center justify-center text-white"><Activity size={24} /></div>
             {!isSidebarCollapsed && <h1 className="text-xl font-black text-[#1B2436]">FitPulse.</h1>}
          </div>
          <div className="flex-1 px-4 mt-10 space-y-1">
             {navItems.map(item => (
                <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeSection === item.id ? 'bg-[#1B2436] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                   <item.icon size={20} />
                   {!isSidebarCollapsed && <span className="text-sm font-bold">{item.label}</span>}
                </button>
             ))}
          </div>
          <div className="p-6">
             <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><LogOut size={20}/> {!isSidebarCollapsed && <span className="text-sm font-bold">Çıkış</span>}</button>
          </div>
       </aside>
       <main className={`flex-1 p-6 md:p-12 transition-all duration-700 ${isSidebarCollapsed ? 'lg:ml-[130px]' : 'lg:ml-[300px]'}`}>
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-white rounded-xl shadow-soft mb-6"><Menu size={24}/></button>
          {renderContent()}
       </main>
    </div>
  );
};

export default MemberDashboard;

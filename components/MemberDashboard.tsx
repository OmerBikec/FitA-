
import React, { useState, useEffect, useRef } from 'react';
import { User, WorkoutPlan, MeasurementLog, FoodItem } from '../types';
import { 
  Home, Calendar, MessageSquare, BrainCircuit, Activity, Heart, LogOut, 
  ChevronRight, ChevronLeft, Clock, Dumbbell, Menu, X, Flame, Smartphone, 
  Utensils, Search, Bell, Settings, Target, Trophy, Sparkles, CheckCircle2, User as UserIcon, Scale, Ruler, Play, ClipboardCheck, Plus, TrendingUp, TrendingDown, ArrowRight, Salad, Send, Zap, Apple, ChefHat, Trash2, PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RePie, Pie, Cell } from 'recharts';
import { generateAIWorkoutPlan, generateNutritionPlan, chatWithAI, analyzeFoodIntake } from '../services/geminiService';

interface MemberDashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeSection, setActiveSection] = useState('panel');
  const [workoutTab, setWorkoutTab] = useState<'active' | 'assigned'>('active');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Track completed exercises
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);

  // Profile Modal
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [newMeasure, setNewMeasure] = useState<Partial<MeasurementLog>>({
      weight: undefined, bodyFat: undefined, waist: undefined, arm: undefined, chest: undefined
  });

  // Health & Diet State
  const [healthTab, setHealthTab] = useState<'tracker' | 'plan'>('tracker');
  const [dietPlan, setDietPlan] = useState<string>('');
  const [dietCalories, setDietCalories] = useState('2200');
  const [dietGoal, setDietGoal] = useState('Dengeli beslenme, protein ağırlıklı.');
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  
  // Food Tracker State
  const [foodInput, setFoodInput] = useState('');
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [dailyMacros, setDailyMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string, workoutPlan?: WorkoutPlan}[]>([
      {role: 'model', text: 'Merhaba! Ben FitPulse AI koçun. Antrenman programı oluşturabilirim, beslenme tavsiyesi verebilirim veya sadece sohbet edebiliriz. Sana nasıl yardımcı olayım?'}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('Tünaydın');
    else setGreeting('İyi Akşamlar');
  }, []);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    // Calculate daily totals whenever food log changes
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

  const toggleExercise = (index: number) => {
    if (completedExercises.includes(index)) {
      setCompletedExercises(completedExercises.filter(i => i !== index));
    } else {
      setCompletedExercises([...completedExercises, index]);
    }
  };

  const handleApplyTemplate = (template: WorkoutPlan) => {
      const updatedUser = {
          ...user,
          workoutPlan: { ...template, assignedAt: new Date().toISOString() }, 
      };
      onUpdateUser(updatedUser);
      setWorkoutTab('active');
      setActiveSection('workouts'); // Redirect to workouts
      setCompletedExercises([]); 
      alert('Yeni programın aktif hale getirildi!');
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMeasure.weight) return;

      const log: MeasurementLog = {
          date: new Date().toISOString().split('T')[0],
          weight: newMeasure.weight,
          bodyFat: newMeasure.bodyFat,
          waist: newMeasure.waist,
          arm: newMeasure.arm,
          chest: newMeasure.chest,
          leg: newMeasure.leg
      };

      const updatedMeasurements = user.measurements ? [...user.measurements, log] : [log];
      updatedMeasurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      onUpdateUser({ 
          ...user, 
          measurements: updatedMeasurements,
          weight: newMeasure.weight.toString() 
      });
      setIsMeasurementModalOpen(false);
      setNewMeasure({});
  };

  const handleGenerateDiet = async () => {
      setIsGeneratingDiet(true);
      const plan = await generateNutritionPlan(dietCalories, dietGoal);
      setDietPlan(plan);
      setIsGeneratingDiet(false);
  };

  const handleAddFood = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!foodInput.trim()) return;

      setIsAnalyzingFood(true);
      const analyzedFood = await analyzeFoodIntake(foodInput);
      setIsAnalyzingFood(false);

      if (analyzedFood) {
          const newLog = user.dailyFoodLog ? [...user.dailyFoodLog, analyzedFood] : [analyzedFood];
          onUpdateUser({
              ...user,
              dailyFoodLog: newLog
          });
          setFoodInput('');
      } else {
          alert("Yiyecek analiz edilemedi. Lütfen tekrar deneyin.");
      }
  };

  const handleRemoveFood = (id: string) => {
      if (!user.dailyFoodLog) return;
      const newLog = user.dailyFoodLog.filter(f => f.id !== id);
      onUpdateUser({ ...user, dailyFoodLog: newLog });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!chatInput.trim()) return;

      const userMsg = chatInput;
      const currentHistory = [...chatMessages]; 

      setChatMessages(prev => [...prev, {role: 'user', text: userMsg}]);
      setChatInput('');
      setIsChatTyping(true);

      try {
          const response = await chatWithAI(userMsg, currentHistory);
          setChatMessages(prev => [...prev, {role: 'model', text: response.text, workoutPlan: response.workoutPlan}]);
      } catch (error) {
          setChatMessages(prev => [...prev, {role: 'model', text: "Üzgünüm, şu an cevap veremiyorum."}]);
      }
      setIsChatTyping(false);
  };

  const navItems = [
    { id: 'panel', label: 'Ana Sayfa', icon: Home },
    { id: 'profile', label: 'Profilim', icon: UserIcon },
    { id: 'workouts', label: 'Programım', icon: Dumbbell },
    { id: 'health', label: 'Sağlık', icon: Utensils },
    { id: 'ai', label: 'AI Koç', icon: BrainCircuit },
  ];

  // Goals for demo purposes
  const GOALS = { calories: 2400, protein: 160, carbs: 250, fat: 70 };

  const renderContent = () => {
    switch (activeSection) {
      case 'panel':
        return (
          <div key="panel" className="space-y-8 page-transition">
              <div className="relative w-full rounded-[48px] overflow-hidden min-h-[380px] flex items-center shadow-2xl group border border-white/5 bg-[#1B2436]">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[3s] group-hover:scale-105 opacity-40"></div>
                   <div className="absolute inset-0 bg-gradient-to-r from-[#1B2436] via-[#1B2436]/80 to-transparent"></div>

                   <div className="relative z-10 p-8 md:p-16 w-full md:w-2/3">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-8 shadow-lg">
                            <Flame size={14} className="text-[#0ea5e9] fill-[#0ea5e9] animate-pulse"/>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Antrenman Özeti</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                           {greeting}, <br/>
                           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">{user.name.split(' ')[0]}!</span>
                        </h1>
                        <p className="text-lg text-slate-300 mb-8 max-w-lg font-light leading-relaxed">
                            Bugünkü antrenman programını kontrol etmek için hazır mısın?
                        </p>
                        <button 
                           onClick={() => setActiveSection('workouts')}
                           className="h-14 px-8 bg-[#0ea5e9] text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-blue-500/20"
                        >
                            <span>Programımı Görüntüle</span>
                            <ChevronRight size={20}/>
                        </button>
                   </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                   {[
                       { label: 'Süre', value: '-', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                       { label: 'Kalori', value: user.dailyFoodLog ? Math.round(dailyMacros.calories) : '-', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                       { label: 'Kalp Ritmi', value: '-', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                       { label: 'Başarı', value: '-', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                   ].map((stat, i) => (
                       <div key={i} className="bg-white p-6 rounded-[32px] shadow-soft flex flex-col items-center text-center gap-2 hover:translate-y-[-4px] transition-all border border-white/50">
                           <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} mb-2`}>
                               <stat.icon size={24} />
                           </div>
                           <div className="text-2xl font-black text-[#1B2436]">{stat.value}</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                       </div>
                   ))}
              </div>
          </div>
        );

      case 'profile':
         // ... Profile Code (Unchanged) ...
         return (
             <div key="profile" className="space-y-8 page-transition pb-20">
                 <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-[#1B2436] tracking-tight">Kişisel Bilgilerim</h2>
                    <button onClick={() => setIsMeasurementModalOpen(true)} className="bg-[#1B2436] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
                        <Plus size={16}/> Ölçüm Ekle
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-[#1B2436] to-slate-800 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                         <div className="absolute top-0 right-0 p-12 opacity-10"><UserIcon size={200}/></div>
                         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                             <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-5xl font-black shadow-2xl">
                                {user.name.charAt(0)}
                             </div>
                             <div className="text-center md:text-left">
                                 <h3 className="text-3xl font-black">{user.name}</h3>
                                 <p className="text-slate-400 font-medium mb-4">{user.email}</p>
                                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                                     <Sparkles size={14} className="text-amber-400"/>
                                     <span className="text-xs font-bold uppercase tracking-widest">{user.membershipType || 'Standart'} Üyelik</span>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Stats Cards */}
                     <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white/50 flex flex-col items-center justify-center gap-2">
                         <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-2"><Calendar size={28}/></div>
                         <h4 className="text-3xl font-black text-[#1B2436]">{user.age || '-'}</h4>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Yaş</p>
                     </div>
                     <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white/50 flex flex-col items-center justify-center gap-2">
                         <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-2"><Ruler size={28}/></div>
                         <h4 className="text-3xl font-black text-[#1B2436]">{user.height ? `${user.height} cm` : '-'}</h4>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Boy</p>
                     </div>
                     <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white/50 flex flex-col items-center justify-center gap-2">
                         <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-2"><Scale size={28}/></div>
                         <h4 className="text-3xl font-black text-[#1B2436]">{user.weight ? `${user.weight} kg` : '-'}</h4>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kilo</p>
                     </div>

                     {/* Goal Section */}
                     <div className="col-span-1 md:col-span-3 bg-white p-10 rounded-[40px] shadow-soft border border-white/50 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -mr-10 -mt-10 transition-all group-hover:scale-110"></div>
                         <div className="relative z-10">
                             <h4 className="text-lg font-black text-[#1B2436] flex items-center gap-2 mb-4"><Target className="text-rose-500"/> SPOR HEDEFİ</h4>
                             <p className="text-2xl font-medium text-slate-500 leading-relaxed mb-6">
                                "{user.goal || 'Henüz bir hedef belirlenmedi. Antrenörünle görüşerek hedefini belirle.'}"
                             </p>
                             
                             <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                                 <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full w-[0%] shadow-lg"></div>
                             </div>
                             <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                 <span>Başlangıç</span>
                                 <span className="text-indigo-500">%0 Tamamlandı</span>
                                 <span>Hedef</span>
                             </div>
                         </div>
                     </div>

                     {/* Charts Section */}
                     <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-[40px] shadow-soft border border-white/50 min-h-[350px] flex flex-col">
                        <h4 className="text-lg font-black text-[#1B2436] mb-6 flex items-center gap-2"><TrendingDown className="text-emerald-500"/> Kilo Değişimi</h4>
                        <div className="flex-1 w-full h-full min-h-[250px]">
                            {user.measurements && user.measurements.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={user.measurements}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(str) => new Date(str).toLocaleDateString('tr-TR', {month: 'short'})}/>
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}}/>
                                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                                        <Area type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium italic">Henüz yeterli veri yok.</div>
                            )}
                        </div>
                     </div>

                     <div className="col-span-1 bg-white p-8 rounded-[40px] shadow-soft border border-white/50 min-h-[350px] flex flex-col">
                        <h4 className="text-lg font-black text-[#1B2436] mb-6 flex items-center gap-2"><Activity className="text-rose-500"/> Vücut Yağ %</h4>
                        <div className="flex-1 w-full h-full min-h-[250px]">
                            {user.measurements && user.measurements.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={user.measurements}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(str) => new Date(str).toLocaleDateString('tr-TR', {month: 'short'})}/>
                                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                                        <Line type="monotone" dataKey="bodyFat" stroke="#f43f5e" strokeWidth={3} dot={{r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff'}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium italic">Henüz yeterli veri yok.</div>
                            )}
                        </div>
                     </div>
                 </div>
             </div>
         );
      
      case 'health':
          return (
              <div key="health" className="space-y-8 page-transition pb-20">
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-[20px] shadow-soft w-fit border border-slate-100 mb-6">
                     <button onClick={() => setHealthTab('tracker')} className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${healthTab === 'tracker' ? 'bg-[#1B2436] text-white shadow-lg' : 'text-slate-400 hover:text-[#1B2436]'}`}>
                        Günlük Takip
                     </button>
                     <button onClick={() => setHealthTab('plan')} className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${healthTab === 'plan' ? 'bg-[#1B2436] text-white shadow-lg' : 'text-slate-400 hover:text-[#1B2436]'}`}>
                        Diyet Planı
                     </button>
                 </div>

                  {healthTab === 'tracker' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Macro Circular Progress */}
                            <div className="col-span-1 lg:col-span-4 bg-white p-8 rounded-[40px] shadow-soft border border-white/50">
                                <h3 className="text-xl font-black text-[#1B2436] mb-6 flex items-center gap-2"><Activity className="text-rose-500"/> Günlük Özet</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Kalori', current: dailyMacros.calories, target: GOALS.calories, color: '#f43f5e', unit: 'kcal' },
                                        { label: 'Protein', current: dailyMacros.protein, target: GOALS.protein, color: '#3b82f6', unit: 'g' },
                                        { label: 'Karb', current: dailyMacros.carbs, target: GOALS.carbs, color: '#eab308', unit: 'g' },
                                        { label: 'Yağ', current: dailyMacros.fat, target: GOALS.fat, color: '#10b981', unit: 'g' },
                                    ].map((macro, idx) => {
                                        const percent = Math.min(100, (macro.current / macro.target) * 100);
                                        return (
                                            <div key={idx} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden">
                                                <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={macro.color} strokeWidth="3" strokeDasharray={`${percent}, 100`} className="animate-[spin_1s_ease-out_reverse]" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-xs font-black text-[#1B2436]">{Math.round(macro.current)}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">/ {macro.target}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 uppercase">{macro.label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Add Food Input */}
                            <div className="col-span-1 lg:col-span-4">
                                <form onSubmit={handleAddFood} className="bg-white p-2 rounded-[32px] shadow-soft border border-white/50 flex items-center gap-2 pl-6">
                                    <Apple className="text-slate-400" size={20}/>
                                    <input 
                                        type="text" 
                                        value={foodInput}
                                        onChange={(e) => setFoodInput(e.target.value)}
                                        placeholder="Ne yedin? Örn: 2 yumurta ve 1 dilim tam buğday ekmeği" 
                                        className="flex-1 bg-transparent border-none text-sm font-bold text-[#1B2436] placeholder-slate-400 outline-none h-12"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isAnalyzingFood || !foodInput.trim()}
                                        className="px-6 py-3 bg-[#1B2436] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAnalyzingFood ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Sparkles size={16}/>
                                        )}
                                        Ekle
                                    </button>
                                </form>
                            </div>

                            {/* Food Log List */}
                            <div className="col-span-1 lg:col-span-4 bg-white rounded-[40px] shadow-soft border border-white/50 overflow-hidden">
                                <div className="p-8 border-b border-slate-50">
                                    <h3 className="text-xl font-black text-[#1B2436]">Bugünekü Öğünler</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    {user.dailyFoodLog && user.dailyFoodLog.length > 0 ? (
                                        user.dailyFoodLog.map((food, idx) => (
                                            <div key={food.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm font-black text-xs">
                                                        {Math.round(food.calories)} <br/><span className="text-[8px] text-slate-400 font-normal">kcal</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#1B2436] text-sm">{food.name}</h4>
                                                        <div className="flex gap-3 mt-1">
                                                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">P: {food.protein}g</span>
                                                            <span className="text-[10px] font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md">C: {food.carbs}g</span>
                                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">F: {food.fat}g</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-slate-400 hidden sm:block">{new Date(food.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                                                    <button onClick={() => handleRemoveFood(food.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 text-sm font-medium italic flex flex-col items-center">
                                            <ChefHat size={32} className="mb-3 opacity-30"/>
                                            Henüz bir öğün girmedin.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {healthTab === 'plan' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                          <div className="col-span-1 md:col-span-3 bg-white p-8 rounded-[40px] shadow-soft border border-white/50">
                              <div className="flex flex-col md:flex-row gap-6 items-end">
                                  <div className="flex-1 space-y-4 w-full">
                                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Günlük Kalori Hedefi</label>
                                      <input type="number" value={dietCalories} onChange={(e) => setDietCalories(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1B2436] focus:ring-2 focus:ring-emerald-100 outline-none" placeholder="2200" />
                                  </div>
                                  <div className="flex-[2] space-y-4 w-full">
                                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Beslenme Tercihleri / Notlar</label>
                                      <input type="text" value={dietGoal} onChange={(e) => setDietGoal(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1B2436] focus:ring-2 focus:ring-emerald-100 outline-none" placeholder="Örn: Glutensiz, Yüksek Protein..." />
                                  </div>
                                  <button onClick={handleGenerateDiet} disabled={isGeneratingDiet} className="w-full md:w-auto bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                      {isGeneratingDiet ? <span className="animate-pulse">Hazırlanıyor...</span> : <><Salad size={18}/> Plan Oluştur</>}
                                  </button>
                              </div>
                          </div>
                          
                          <div className="col-span-1 md:col-span-3">
                              {dietPlan ? (
                                  <div className="bg-white p-10 rounded-[40px] shadow-soft border border-white/50 prose prose-slate max-w-none">
                                      <div dangerouslySetInnerHTML={{ __html: dietPlan.replace(/\n/g, '<br/>') }} />
                                  </div>
                              ) : (
                                  <div className="bg-white p-12 rounded-[40px] shadow-soft border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center text-slate-400">
                                      <Salad size={48} className="mb-4 opacity-50"/>
                                      <p className="font-medium">Henüz bir beslenme planı oluşturulmadı. Yukarıdaki bilgileri doldurup "Plan Oluştur" butonuna tıkla.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}
              </div>
          );

      case 'ai':
          return (
              <div key="ai" className="h-[calc(100vh-140px)] flex flex-col page-transition">
                  <div className="mb-6">
                      <h2 className="text-3xl font-black text-[#1B2436] tracking-tight">AI Fitness Koçu</h2>
                      <p className="text-slate-500 font-medium">Sohbet et, tavsiye al ve anında program oluştur.</p>
                  </div>

                  <div className="flex-1 bg-white rounded-[40px] shadow-soft border border-white/50 overflow-hidden flex flex-col relative">
                      {/* Messages Area */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                          {chatMessages.map((msg, idx) => (
                              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                  <div className={`max-w-[80%] p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#1B2436] text-white rounded-tr-none' : 'bg-white text-slate-600 rounded-tl-none border border-slate-100'}`}>
                                      {msg.text}
                                  </div>
                                  
                                  {/* Workout Plan Preview Card inside Chat */}
                                  {msg.workoutPlan && (
                                      <div className="mt-3 w-full max-w-[300px] bg-white rounded-2xl border border-indigo-100 shadow-lg overflow-hidden">
                                          <div className="bg-indigo-500 p-4 text-white">
                                              <div className="flex items-center gap-2 mb-1">
                                                  <Zap size={16} className="text-yellow-300"/>
                                                  <span className="text-xs font-bold uppercase tracking-widest">Önerilen Program</span>
                                              </div>
                                              <h4 className="font-black text-lg">{msg.workoutPlan.title}</h4>
                                          </div>
                                          <div className="p-4 space-y-2">
                                              <div className="flex justify-between text-xs font-bold text-slate-500">
                                                  <span>{msg.workoutPlan.focus}</span>
                                                  <span>{msg.workoutPlan.difficulty}</span>
                                              </div>
                                              <div className="text-xs text-slate-400 italic">
                                                  {msg.workoutPlan.exercises.length} Egzersiz
                                              </div>
                                              <button 
                                                  onClick={() => handleApplyTemplate(msg.workoutPlan!)}
                                                  className="w-full mt-2 py-2.5 bg-[#1B2436] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                              >
                                                  <Play size={14}/> Programı Uygula
                                              </button>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          ))}
                          {isChatTyping && (
                              <div className="flex justify-start">
                                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-100"></div>
                                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-200"></div>
                                  </div>
                              </div>
                          )}
                          <div ref={chatEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="p-4 bg-white border-t border-slate-100">
                          <form onSubmit={handleSendMessage} className="flex gap-3">
                              <input 
                                  type="text" 
                                  value={chatInput} 
                                  onChange={(e) => setChatInput(e.target.value)} 
                                  placeholder="Bir soru sor... (Örn: Bana bir göğüs antrenmanı hazırla)" 
                                  className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-[#1B2436] focus:ring-2 focus:ring-blue-100 outline-none"
                              />
                              <button type="submit" disabled={!chatInput.trim() || isChatTyping} className="bg-blue-500 text-white p-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                  <Send size={20}/>
                              </button>
                          </form>
                      </div>
                  </div>
              </div>
          );
      
      case 'workouts':
        return (
          <div key="workouts" className="space-y-8 page-transition pb-20">
             <div className="flex items-center gap-2 bg-white p-1.5 rounded-[20px] shadow-soft w-fit border border-slate-100 mb-6">
                 <button 
                    onClick={() => setWorkoutTab('active')} 
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${workoutTab === 'active' ? 'bg-[#1B2436] text-white shadow-lg' : 'text-slate-400 hover:text-[#1B2436]'}`}
                 >
                    Aktif Programım
                 </button>
                 <button 
                    onClick={() => setWorkoutTab('assigned')} 
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${workoutTab === 'assigned' ? 'bg-[#1B2436] text-white shadow-lg' : 'text-slate-400 hover:text-[#1B2436]'}`}
                 >
                    Uzman Programları 
                    {user.assignedTemplates && user.assignedTemplates.length > 0 && <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">{user.assignedTemplates.length}</span>}
                 </button>
             </div>

             {workoutTab === 'active' ? (
                 <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                        <h2 className="text-3xl font-black text-[#1B2436] tracking-tight">Günlük Antrenmanım</h2>
                        <p className="text-slate-500 font-medium">{user.workoutPlan ? user.workoutPlan.title : 'Eğitmenin program hazırladığında burada görünecek.'}</p>
                        </div>
                        {user.workoutPlan && (
                        <div className="px-4 py-2 bg-white rounded-2xl shadow-soft border border-white flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Atanma: {new Date(user.workoutPlan.assignedAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {user.workoutPlan ? user.workoutPlan.exercises.map((ex, i) => {
                        const isCompleted = completedExercises.includes(i);
                        return (
                            <div key={i} className={`p-8 rounded-[48px] shadow-soft border relative overflow-hidden group transition-all duration-300 ${isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-white hover:border-blue-100'}`}>
                                {isCompleted && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-bl-[60px] -mr-6 -mt-6 flex items-end justify-start p-5">
                                    <CheckCircle2 className="text-emerald-500" size={24}/>
                                </div>
                                )}
                                <div className="relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mb-6 shadow-lg text-sm transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-[#1B2436] text-white'}`}>{i+1}</div>
                                <h3 className={`text-xl md:text-2xl font-black mb-6 transition-colors ${isCompleted ? 'text-emerald-900' : 'text-[#1B2436]'}`}>{ex.name}</h3>
                                <div className="grid grid-cols-3 gap-3 border-t border-black/5 pt-6">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase">SET</p>
                                        <p className={`text-lg font-black ${isCompleted ? 'text-emerald-700' : 'text-[#1B2436]'}`}>{ex.sets}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase">TEKRAR</p>
                                        <p className={`text-lg font-black ${isCompleted ? 'text-emerald-700' : 'text-[#1B2436]'}`}>{ex.reps}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase">DİNLENME</p>
                                        <p className={`text-lg font-black ${isCompleted ? 'text-emerald-600' : 'text-blue-500'}`}>{ex.rest || '60s'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleExercise(i)}
                                    className={`w-full mt-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                    isCompleted 
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-slate-50 text-slate-500 hover:bg-[#1B2436] hover:text-white'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <> <CheckCircle2 size={16}/> TAMAMLANDI </>
                                    ) : (
                                        <> <Activity size={16}/> TAMAMLA </>
                                    )}
                                </button>
                                </div>
                            </div>
                        );
                        }) : (
                        <div className="col-span-full py-20 bg-white rounded-[56px] shadow-soft border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 font-bold italic p-8 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-100 mb-6"><Dumbbell size={48}/></div>
                            <p>Henüz aktif bir programın bulunmuyor.</p>
                        </div>
                        )}
                    </div>
                 </>
             ) : (
                 <div className="space-y-6">
                     <h2 className="text-2xl font-black text-[#1B2436]">Bana Özel Tavsiyeler</h2>
                     {user.assignedTemplates && user.assignedTemplates.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {user.assignedTemplates.map(template => (
                                 <div key={template.id} className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative group overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-5"><ClipboardCheck size={100}/></div>
                                     <div className="relative z-10">
                                         <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Sparkles size={24}/></div>
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{template.difficulty}</span>
                                         </div>
                                         <h3 className="text-xl font-black text-[#1B2436] mb-2">{template.title}</h3>
                                         <p className="text-slate-400 text-sm font-medium mb-6 flex items-center gap-2"><Target size={14}/> Odak: {template.focus}</p>
                                         <div className="space-y-3 mb-8">
                                             {template.exercises.slice(0, 3).map((ex, i) => (
                                                 <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                     {ex.name}
                                                 </div>
                                             ))}
                                             {template.exercises.length > 3 && <p className="text-[10px] text-slate-400 italic">+ {template.exercises.length - 3} egzersiz daha...</p>}
                                         </div>
                                         <button onClick={() => handleApplyTemplate(template)} className="w-full py-4 bg-[#1B2436] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10">
                                             <Play size={16}/> Kendi Programıma Ekle
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="py-20 bg-white rounded-[40px] shadow-soft border-2 border-dashed border-slate-100 text-center text-slate-400">
                             <p>Şu anda eğitmenlerin tarafından atanmış bir alternatif program bulunmuyor.</p>
                         </div>
                     )}
                 </div>
             )}
          </div>
        );

      default:
        return <div className="p-10 text-slate-400 font-bold">Geliştiriliyor...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F9] flex selection:bg-blue-100 overflow-x-hidden">
       {isMobileMenuOpen && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}></div>
       )}

       <aside className={`
            fixed z-[70] lg:top-6 lg:left-6 lg:bottom-6 top-0 bottom-0 left-0 bg-white/80 backdrop-blur-2xl border border-white/40 shadow-sidebar flex flex-col transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
            ${isMobileMenuOpen ? 'translate-x-0 w-[280px] rounded-r-3xl lg:rounded-[40px]' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarCollapsed ? 'lg:w-[100px]' : 'lg:w-[280px]'}
          `}>
          <div className={`pt-8 md:pt-10 px-8 flex items-center gap-4 ${isSidebarCollapsed ? 'lg:flex-col lg:justify-center lg:px-2' : ''}`}>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#1B2436] flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-all duration-500">
                <Activity size={24} strokeWidth={3} />
             </div>
             <div className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'lg:max-w-0 lg:opacity-0 pointer-events-none invisible' : 'max-w-[200px] opacity-100'}`}>
                <h1 className="text-xl font-extrabold text-[#1B2436] leading-none tracking-tight">FitPulse.</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">MEMBER PRO</p>
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden ml-auto p-2 text-slate-300"><X size={24}/></button>
          </div>

          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex absolute -right-5 top-14 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-50 items-center justify-center text-slate-400 hover:text-blue-500 transition-all z-50">
             {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <div className="flex-1 overflow-y-auto px-5 md:px-6 mt-10 space-y-2 no-scrollbar">
             {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-[20px] transition-all duration-500 relative group
                      ${isSidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                      ${isActive ? 'bg-[#1B2436] text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:text-[#1B2436] hover:bg-slate-50'}`}>
                     <item.icon size={20} className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110" />
                     <span className={`font-bold text-sm whitespace-nowrap transition-all duration-500 overflow-hidden ${isSidebarCollapsed ? 'lg:max-w-0 lg:opacity-0 pointer-events-none' : 'max-w-[200px] opacity-100'}`}>
                        {item.label}
                     </span>
                     {isActive && !isSidebarCollapsed && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"></div>}
                  </button>
                );
             })}
          </div>

          <div className="p-6">
             <div className={`flex items-center gap-3 p-3 rounded-[24px] bg-slate-50/80 border border-slate-100 transition-all duration-500 ${isSidebarCollapsed ? 'lg:justify-center lg:p-0 lg:bg-transparent lg:border-none' : ''}`}>
                <div className="w-10 h-10 rounded-full border-[2.5px] border-[#a855f7] p-0.5 bg-white">
                    <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">{user.name.charAt(0)}</div>
                </div>
                <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isSidebarCollapsed ? 'lg:max-w-0 lg:opacity-0 pointer-events-none' : 'max-w-[200px] opacity-100 flex-1'}`}>
                   <span className="font-extrabold text-[#1B2436] text-sm truncate">{user.name.split(' ')[0]}</span>
                   <span className="text-[10px] font-bold text-slate-400">Üye</span>
                </div>
                <button onClick={onLogout} className={`text-slate-300 hover:text-rose-500 transition-colors ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}><LogOut size={18} /></button>
             </div>
          </div>
       </aside>

       <main className={`flex-1 transition-all duration-700 p-4 sm:p-6 md:p-10 lg:p-12 w-full min-w-0 ${isSidebarCollapsed ? 'lg:ml-[130px]' : 'lg:ml-[320px]'}`}>
          <div className="flex justify-between items-center mb-6 lg:hidden">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-white rounded-2xl shadow-soft text-[#1B2436]"><Menu size={24} /></button>
             <h1 className="text-xl font-black text-[#1B2436]">FitPulse.</h1>
             <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-soft flex items-center justify-center text-blue-600 font-bold text-sm uppercase">{user.name.charAt(0)}</div>
          </div>
          {renderContent()}
       </main>

       {/* Add Measurement Modal ... Unchanged ... */}
       {isMeasurementModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
               <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scaleIn relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-[#1B2436]"></div>
                   <button onClick={() => setIsMeasurementModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1B2436] transition-colors"><X size={20}/></button>
                   
                   <h3 className="text-2xl font-black text-[#1B2436] mb-6">Yeni Ölçüm Ekle</h3>
                   
                   <form onSubmit={handleSaveMeasurement} className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Kilo (kg)</label>
                               <input type="number" step="0.1" required value={newMeasure.weight || ''} onChange={e => setNewMeasure({...newMeasure, weight: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Yağ Oranı (%)</label>
                               <input type="number" step="0.1" value={newMeasure.bodyFat || ''} onChange={e => setNewMeasure({...newMeasure, bodyFat: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Bel (cm)</label>
                               <input type="number" step="0.1" value={newMeasure.waist || ''} onChange={e => setNewMeasure({...newMeasure, waist: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Kol (cm)</label>
                               <input type="number" step="0.1" value={newMeasure.arm || ''} onChange={e => setNewMeasure({...newMeasure, arm: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                           </div>
                       </div>
                       
                       <button type="submit" className="w-full py-4 bg-[#1B2436] text-white rounded-xl font-bold text-sm shadow-xl hover:scale-[1.01] transition-all mt-4">Kaydet</button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default MemberDashboard;

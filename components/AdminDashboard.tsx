
import React, { useState, useEffect } from 'react';
import { User, WorkoutPlan, Exercise, DashboardStats, Trainer } from '../types';
import { 
  Users2, Layout, LogOut, ChevronRight, Plus, Activity, Search, Bell, Menu, X, 
  ChevronLeft, Settings, Trash2, Sparkles, CheckCircle2, Dumbbell as WorkoutIcon, 
  Zap, Scan, DoorOpen, DoorClosed, ShieldCheck, UserCheck, CreditCard, Filter, 
  MoreHorizontal, CalendarDays, DollarSign, Shield, Target, Save, Ruler, Weight, Calendar,
  ArrowUpRight, ChevronDown, Clock, BarChart3, Mail, Award, BrainCircuit, Share2, Layers, Star, Phone, FileText, Download, Edit2, History, Send, Lock, Utensils
} from 'lucide-react';
import { analyzeBusinessStats, generateAIWorkoutPlan } from '../services/geminiService';

interface AdminDashboardProps {
  user: User;
  members?: User[]; 
  workoutTemplates?: WorkoutPlan[];
  onUpdateMember?: (user: User) => void;
  onAddMember?: (user: Partial<User>) => void;
  onAddTemplate?: (template: WorkoutPlan) => void;
  onAssignTemplate?: (memberId: string, template: WorkoutPlan) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, members = [], workoutTemplates = [], 
  onUpdateMember, onAddMember, onAddTemplate, onAssignTemplate, 
  onLogout 
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Panel', icon: Layout },
    { id: 'members', label: 'Tüm Üyeler', icon: Users2 },
    { id: 'workouts', label: 'Program Havuzu', icon: WorkoutIcon },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleUpdateProfile = (field: keyof User, value: string) => {
     if (!selectedMember || !onUpdateMember) return;
     const updated = { ...selectedMember, [field]: value };
     onUpdateMember(updated);
     setSelectedMember(updated);
  };

  const handleGenerateAIPlan = async () => {
    if (!selectedMember || !onUpdateMember) return;
    setIsGeneratingPlan(true);
    const plan = await generateAIWorkoutPlan(selectedMember);
    setIsGeneratingPlan(false);
    if (plan) {
      const updated = { ...selectedMember, workoutPlan: plan };
      onUpdateMember(updated);
      setSelectedMember(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F9] flex overflow-x-hidden">
       {isMobileMenuOpen && <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setIsMobileMenuOpen(false)}></div>}

       <aside className={`fixed z-[70] lg:top-6 lg:left-6 lg:bottom-6 top-0 bottom-0 left-0 bg-white shadow-sidebar flex flex-col transition-all duration-500 ${isSidebarCollapsed ? 'lg:w-[100px]' : 'lg:w-[280px]'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="pt-10 px-8 flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-[#1B2436] flex items-center justify-center text-white"><Activity size={20} /></div>
             {!isSidebarCollapsed && <h1 className="text-xl font-black">FitPulse.</h1>}
          </div>
          <div className="flex-1 px-4 mt-10 space-y-1">
             {sidebarItems.map(item => (
                <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeSection === item.id ? 'bg-[#1B2436] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
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
          <div className="flex justify-between items-center mb-10">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-white rounded-xl shadow-soft"><Menu size={24}/></button>
             <h2 className="text-2xl font-black text-[#1B2436] capitalize">{activeSection}</h2>
             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-black text-[#1B2436]">{user.name}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Yönetici</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black">{user.name.charAt(0)}</div>
             </div>
          </div>

          {activeSection === 'members' && (
             <div className="space-y-6 page-transition">
                <div className="bg-white p-4 rounded-[32px] shadow-soft border border-white flex items-center gap-3">
                   <Search className="text-slate-300" size={20}/>
                   <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Üye ara..." className="flex-1 bg-transparent border-none text-sm font-bold outline-none"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredMembers.map(m => (
                      <div key={m.id} onClick={() => { setSelectedMember(m); setIsDetailOpen(true); }} className="bg-white p-6 rounded-[32px] shadow-soft border border-white hover:border-blue-100 transition-all cursor-pointer group">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg font-black">{m.name.charAt(0)}</div>
                            <div>
                               <h4 className="font-black text-[#1B2436]">{m.name}</h4>
                               <p className="text-xs text-slate-400 font-bold">{m.email}</p>
                            </div>
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                            <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">{m.membershipType || 'Standart'}</span>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"/>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeSection === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 page-transition">
                  <div className="bg-[#1B2436] p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden col-span-2">
                      <h3 className="text-4xl font-black mb-4">FitPulse Pro Dashboard</h3>
                      <p className="text-slate-400 max-w-md">Sistemdeki tüm üyeleri, onların antrenmanlarını ve beslenme verilerini buradan yönetebilirsiniz.</p>
                      <Sparkles className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12"/>
                  </div>
                  <div className="bg-white p-10 rounded-[48px] shadow-soft border border-white flex flex-col justify-center text-center">
                      <Users2 size={48} className="mx-auto text-blue-500 mb-4"/>
                      <h4 className="text-3xl font-black">{members.length}</h4>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Toplam Üye</p>
                  </div>
              </div>
          )}
       </main>

       {isDetailOpen && selectedMember && (
          <>
             <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={() => setIsDetailOpen(false)}></div>
             <div className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white z-[110] shadow-2xl p-8 overflow-y-auto animate-slideInRight">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black">Üye Detayları</h3>
                   <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={24}/></button>
                </div>

                <div className="space-y-10">
                   <div className="bg-slate-50 p-8 rounded-[40px] text-center border border-slate-100">
                      <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center text-2xl font-black text-blue-500 shadow-sm">{selectedMember.name.charAt(0)}</div>
                      <h4 className="text-xl font-black">{selectedMember.name}</h4>
                      <p className="text-xs font-bold text-slate-400">{selectedMember.email}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={handleGenerateAIPlan} disabled={isGeneratingPlan} className="bg-blue-500 text-white p-6 rounded-[32px] font-black text-xs uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-blue-600 transition-all">
                         {isGeneratingPlan ? 'Oluşturuluyor...' : <><Zap size={24}/> AI Program Ata</>}
                      </button>
                      <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex flex-col items-center gap-3">
                         <div className="text-emerald-500"><Utensils size={24}/></div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-emerald-600 uppercase">Beslenme</p>
                            <p className="text-sm font-black text-emerald-800">{selectedMember.dailyFoodLog?.length || 0} Öğün</p>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Üye Hedefi & Profil</h5>
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-[9px] font-black text-slate-300 uppercase">Boy</label>
                               <input value={selectedMember.height || ''} onChange={e => handleUpdateProfile('height', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-xs font-black outline-none" placeholder="cm"/>
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-slate-300 uppercase">Kilo</label>
                               <input value={selectedMember.weight || ''} onChange={e => handleUpdateProfile('weight', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-xs font-black outline-none" placeholder="kg"/>
                            </div>
                         </div>
                         <div className="space-y-2">
                             <label className="text-[9px] font-black text-slate-300 uppercase">Aktif Hedef</label>
                             <input value={selectedMember.goal || ''} onChange={e => handleUpdateProfile('goal', e.target.value)} className="w-full bg-slate-50 rounded-xl p-3 text-xs font-black outline-none" placeholder="Örn: Kas Kütlesi"/>
                         </div>
                      </div>
                   </div>

                   {selectedMember.dailyFoodLog && selectedMember.dailyFoodLog.length > 0 && (
                      <div>
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Beslenme Günlüğü</h5>
                         <div className="space-y-2">
                            {selectedMember.dailyFoodLog.map(f => (
                               <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                  <span className="text-xs font-black">{f.name}</span>
                                  <span className="text-[10px] font-bold text-blue-500">{f.calories} kcal / {f.protein}g P</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </>
       )}
    </div>
  );
};

export default AdminDashboard;

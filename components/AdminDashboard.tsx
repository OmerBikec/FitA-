
import React, { useState, useEffect } from 'react';
import { User, WorkoutPlan, Role, Exercise, DashboardStats, Trainer } from '../types';
import { 
  Users2, Layout, LogOut, ChevronRight, Plus, Activity, Search, Bell, Menu, X, 
  ChevronLeft, Settings, Trash2, Sparkles, CheckCircle2, Dumbbell as WorkoutIcon, 
  Zap, Scan, DoorOpen, DoorClosed, ShieldCheck, UserCheck, CreditCard, Filter, 
  MoreHorizontal, CalendarDays, DollarSign, Shield, Target, Save, Ruler, Weight, Calendar,
  ArrowUpRight, ChevronDown, Clock, BarChart3, Mail, Award, BrainCircuit, Share2, Layers, Star, Phone, FileText, Download, Edit2, History, Send, Lock
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

interface TurnstileLog {
  id: string;
  memberId: string;
  name: string;
  tcNo: string;
  entryTime: string;
  exitTime?: string;
  status: 'active' | 'completed';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, members = [], workoutTemplates = [], 
  onUpdateMember, onAddMember, onAddTemplate, onAssignTemplate, 
  onLogout 
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Member Management State
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Add Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberType, setNewMemberType] = useState<'Gold' | 'Silver' | 'Bronze'>('Gold');

  // Add Template Modal
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateFocus, setTemplateFocus] = useState('');
  const [templateDifficulty, setTemplateDifficulty] = useState<'Başlangıç' | 'Orta' | 'İleri'>('Orta');
  const [templateDuration, setTemplateDuration] = useState('45 dk');
  const [templateExercises, setTemplateExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '', rest: '' }]);

  // Add Class Modal
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassData, setNewClassData] = useState({ name: '', trainer: '', day: 'Pazartesi', time: '09:00', capacity: '20' });

  // Invite Members Modal (New Feature)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSelectedClass, setInviteSelectedClass] = useState('');
  const [inviteSelectedMembers, setInviteSelectedMembers] = useState<string[]>([]);

  // Assign Template Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<WorkoutPlan | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState('');

  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [gymName, setGymName] = useState('FitPulse Gym');
  const [gymEmail, setGymEmail] = useState('info@fitpulse.com');

  // Trainers State - Empty Initial
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null); 
  const [trainerForm, setTrainerForm] = useState({ name: '', specialty: '', email: '' });

  // --- MOCK DATA CLEARED ---
  const [turnstileLogs] = useState<TurnstileLog[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('Tünaydın');
    else setGreeting('İyi Akşamlar');

    const fetchInsight = async () => {
      if (activeSection !== 'dashboard') return;
      setIsLoadingInsight(true);
      const stats: DashboardStats = {
        totalMembers: members.length,
        monthlyRevenue: 0,
        dailyCheckIns: 0,
        dailyCheckOuts: 0,
        activeNow: 0
      };
      const insight = await analyzeBusinessStats(stats);
      setAiInsight(insight);
      setIsLoadingInsight(false);
    };

    fetchInsight();
  }, [activeSection, members.length]);

  const calculateDuration = (entry: string, exit?: string) => {
    if (!exit) return 'Devam Ediyor';
    const [h1, m1] = entry.split(':').map(Number);
    const [h2, m2] = exit.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours > 0 ? hours + 's ' : ''}${mins}dk`;
  };

  // --- TRAINER HANDLERS ---
  const handleOpenTrainerModal = (trainer?: Trainer) => {
      if (trainer) {
          setEditingTrainer(trainer);
          setTrainerForm({ name: trainer.name, specialty: trainer.specialty, email: trainer.email || '' });
      } else {
          setEditingTrainer(null);
          setTrainerForm({ name: '', specialty: '', email: '' });
      }
      setIsTrainerModalOpen(true);
  };

  const handleSaveTrainer = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingTrainer) {
          // Update
          setTrainers(prev => prev.map(t => t.id === editingTrainer.id ? { ...t, ...trainerForm } : t));
      } else {
          // Add
          const newTrainer: Trainer = {
              id: `T${Date.now()}`,
              ...trainerForm,
              students: 0,
              rating: 5.0,
              img: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1469&auto=format&fit=crop' // Placeholder
          };
          setTrainers([...trainers, newTrainer]);
      }
      setIsTrainerModalOpen(false);
  };

  // --- SCHEDULE & INVITE HANDLERS ---
  const handleSaveClass = (e: React.FormEvent) => {
      e.preventDefault();
      const newClass = {
          id: Date.now(),
          class: newClassData.name,
          trainer: newClassData.trainer || 'Atanmadı',
          day: newClassData.day,
          time: newClassData.time,
          capacity: `0/${newClassData.capacity}`,
          room: 'Stüdyo C',
          color: 'bg-slate-100 text-slate-600'
      };
      setSchedule([...schedule, newClass]);
      setIsAddClassModalOpen(false);
      setNewClassData({ name: '', trainer: '', day: 'Pazartesi', time: '09:00', capacity: '20' });
      alert("Ders programa eklendi.");
  };

  const handleOpenInviteModal = () => {
      setInviteSelectedClass('');
      setInviteSelectedMembers([]);
      setIsInviteModalOpen(true);
  };

  const toggleInviteMember = (memberId: string) => {
      if (inviteSelectedMembers.includes(memberId)) {
          setInviteSelectedMembers(inviteSelectedMembers.filter(id => id !== memberId));
      } else {
          setInviteSelectedMembers([...inviteSelectedMembers, memberId]);
      }
  };

  const handleSendInvites = () => {
      if (!inviteSelectedClass) {
          alert("Lütfen önce bir ders seçin.");
          return;
      }
      if (inviteSelectedMembers.length === 0) {
          alert("Lütfen en az bir üye seçin.");
          return;
      }
      
      alert(`"${inviteSelectedClass}" dersi için ${inviteSelectedMembers.length} üyeye davet gönderildi!`);
      setIsInviteModalOpen(false);
  };

  const handleInviteSingleMember = (className: string) => {
      alert(`${className} dersi için seçili üyelere davet bildirimi gönderildi.`);
  };

  // --- FINANCE HANDLERS ---
  const handleDownloadFinanceReport = (e: React.MouseEvent) => {
    e.preventDefault();
    // In a real app, this would trigger a file download logic
    alert("Finansal rapor (XLSX) hazırlanıyor... İndirme işlemi birazdan başlayacak.");
  };

  const handleViewFullHistory = (e: React.MouseEvent) => {
      e.preventDefault();
      alert("Geçmiş finansal veriler yükleniyor... Tablo görünümüne yönlendiriliyorsunuz.");
  };

  // --- SETTINGS HANDLERS ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Sistem Ayarları Kaydedildi!\n\nSalon: ${gymName}\nE-posta: ${gymEmail}\nBakım Modu: ${maintenanceMode ? 'Aktif' : 'Pasif'}`);
  };

  // --- GENERAL HANDLERS ---
  const handleQuickReport = () => {
    alert("Günlük özet raporu hazırlanıyor ve yönetici e-posta adresinize gönderiliyor. (Demo)");
  };

  const handleNotifications = () => {
    alert("Bildirim Merkezi:\n\n• Henüz yeni bildirim yok.");
  };

  const handleEditTemplate = (title: string) => {
    alert(`"${title}" şablonu için düzenleme editörü açılıyor...`);
  };

  const handleContactTrainer = (trainerName: string) => {
    alert(`${trainerName} için mesajlaşma penceresi veya arama ekranı açılıyor.`);
  };

  const handleMemberAction = (memberId: string) => {
      const member = members.find(m => m.id === memberId);
      if(member) alert(`${member.name} kullanıcısı için işlem menüsü açıldı (Düzenle, Sil, Dondur).`);
  };

  const handleUpdateProfile = (field: keyof User, value: string) => {
     if (!selectedMember || !onUpdateMember) return;
     const updated = { ...selectedMember, [field]: value };
     onUpdateMember(updated);
     setSelectedMember(updated);
  };

  const handleSaveNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddMember) {
      onAddMember({ name: newMemberName, email: newMemberEmail, password: newMemberPassword, membershipType: newMemberType });
      setIsAddMemberOpen(false);
      setNewMemberName(''); setNewMemberEmail(''); setNewMemberPassword(''); setNewMemberType('Gold');
    }
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTemplate) {
        const newTemplate: WorkoutPlan = {
            id: `T-${Date.now()}`,
            title: templateTitle,
            focus: templateFocus,
            difficulty: templateDifficulty,
            duration: templateDuration,
            exercises: templateExercises.filter(ex => ex.name.trim() !== ''),
            assignedAt: new Date().toISOString()
        };
        onAddTemplate(newTemplate);
        setIsAddTemplateOpen(false);
        setTemplateTitle(''); setTemplateFocus(''); setTemplateExercises([{ name: '', sets: '', reps: '', rest: '' }]);
    }
  };

  const openAssignModal = (template: WorkoutPlan) => {
      setSelectedTemplateForAssign(template);
      setIsAssignModalOpen(true);
  };

  const performAssign = (memberId: string) => {
      if (onAssignTemplate && selectedTemplateForAssign) {
          onAssignTemplate(memberId, selectedTemplateForAssign);
          alert(`Program başarıyla atandı!`);
      }
  };

  const addExerciseRow = () => {
    setTemplateExercises([...templateExercises, { name: '', sets: '', reps: '', rest: '' }]);
  };

  const updateExerciseRow = (idx: number, field: keyof Exercise, val: string) => {
    const updated = [...templateExercises];
    updated[idx] = { ...updated[idx], [field]: val };
    setTemplateExercises(updated);
  };

  const removeExerciseRow = (idx: number) => {
    setTemplateExercises(templateExercises.filter((_, i) => i !== idx));
  };

  const handleAddManualExercise = () => {
    if (!selectedMember || !onUpdateMember) return;
    const newEx: Exercise = { name: 'Yeni Hareket', sets: '3', reps: '12', rest: '60s' };
    const currentPlan = selectedMember.workoutPlan || {
      id: Date.now().toString(),
      title: 'Özel Program',
      focus: 'Genel',
      difficulty: 'Orta',
      assignedAt: new Date().toISOString(),
      exercises: []
    };
    
    const updatedMember = {
      ...selectedMember,
      workoutPlan: { ...currentPlan, exercises: [...currentPlan.exercises, newEx] }
    };
    onUpdateMember(updatedMember);
    setSelectedMember(updatedMember);
  };
  
  const handleGenerateAIPlan = async () => {
    if (!selectedMember || !onUpdateMember) return;
    setIsGeneratingPlan(true);
    const generatedPlan = await generateAIWorkoutPlan(selectedMember);
    setIsGeneratingPlan(false);

    if (generatedPlan) {
      const updatedMember = { ...selectedMember, workoutPlan: generatedPlan };
      onUpdateMember(updatedMember);
      setSelectedMember(updatedMember);
    } else {
      alert("Antrenman programı oluşturulurken bir hata oluştu.");
    }
  };

  const updateExercise = (idx: number, field: keyof Exercise, val: string) => {
    if (!selectedMember || !selectedMember.workoutPlan || !onUpdateMember) return;
    const newExercises = [...selectedMember.workoutPlan.exercises];
    newExercises[idx] = { ...newExercises[idx], [field]: val };
    const updatedMember = {
      ...selectedMember,
      workoutPlan: { ...selectedMember.workoutPlan, exercises: newExercises }
    };
    onUpdateMember(updatedMember);
    setSelectedMember(updatedMember);
  };

  const removeExercise = (idx: number) => {
    if (!selectedMember || !selectedMember.workoutPlan || !onUpdateMember) return;
    const newExercises = selectedMember.workoutPlan.exercises.filter((_, i) => i !== idx);
    const updatedMember = {
      ...selectedMember,
      workoutPlan: { ...selectedMember.workoutPlan, exercises: newExercises }
    };
    onUpdateMember(updatedMember);
    setSelectedMember(updatedMember);
  };

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const membersToAssign = members.filter(m => m.name.toLowerCase().includes(assignSearchQuery.toLowerCase()));

  const sidebarItems = [
    { id: 'dashboard', label: 'Panel', icon: Layout },
    { id: 'members', label: 'Üyeler', icon: Users2 },
    { id: 'workouts', label: 'Program Havuzu', icon: WorkoutIcon },
    { id: 'trainers', label: 'Eğitmenler', icon: UserCheck },
    { id: 'finance', label: 'Finans', icon: CreditCard },
    { id: 'schedule', label: 'Ders Programı', icon: CalendarDays },
    { id: 'settings', label: 'Sistem Ayarları', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      // ... Dashboard, Members, Workouts, Trainers ...
      case 'dashboard':
        return (
          <div key="dashboard" className="space-y-8 page-transition pb-20">
             {/* ... Same as before ... */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h2 className="text-xl font-black text-[#1B2436] tracking-tight">Genel Bakış</h2>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" placeholder="Üye ara..." 
                        className="pl-12 pr-4 py-3 bg-white border-none rounded-[20px] shadow-soft text-sm focus:ring-2 focus:ring-blue-100 outline-none w-full md:w-72 transition-all"
                      />
                   </div>
                   <button onClick={handleNotifications} className="relative p-3 bg-white rounded-2xl shadow-soft text-slate-400 hover:text-blue-500 transition-all group hover:scale-105">
                      <Bell size={22} />
                      <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                   </button>
                </div>
             </div>
             {/* ... Welcome & Stats & Logs ... */}
             <div className="relative w-full rounded-[40px] overflow-hidden min-h-[280px] flex items-center shadow-2xl group border border-white/5 bg-[#1B2436]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[3s] group-hover:scale-105 opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B2436] via-[#1B2436]/90 to-transparent"></div>

                <div className="relative z-10 p-10 md:p-14 w-full md:w-2/3">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6 shadow-lg">
                        <Sparkles size={14} className="text-amber-400 fill-amber-400 animate-pulse"/>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Yönetici Paneli v2.0</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                        {greeting}, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">{user.name.split(' ')[0]}</span>
                    </h1>
                    <p className="text-base text-slate-300 mb-8 max-w-lg font-medium leading-relaxed">
                        Spor salonunda her şey yolunda. Sistem şu an <strong className="text-white">aktif</strong> ve tüm birimler sorunsuz çalışıyor.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={handleQuickReport} className="h-12 px-6 bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 group/btn">
                            <span>Hızlı Rapor</span>
                            <BarChart3 size={18} className="group-hover/btn:rotate-180 transition-transform duration-500"/>
                        </button>
                    </div>
                </div>
             </div>
             {/* Stats Grid - Zeroed Out */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                   { label: 'Günlük Giriş', value: '0', icon: DoorOpen, color: 'emerald' },
                   { label: 'Günlük Çıkış', value: '0', icon: DoorClosed, color: 'blue' },
                   { label: 'İçerideki Üye', value: '0', icon: Users2, color: 'orange', sub: 'Doluluk: %0' },
                   { label: 'Yetkisiz Giriş', value: '0', icon: ShieldCheck, color: 'rose', sub: 'Son 24 Saat' },
                ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-[32px] shadow-soft border border-white/50 group transition-all hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
                            ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 
                              stat.color === 'blue' ? 'bg-blue-50 text-blue-500' : 
                              stat.color === 'orange' ? 'bg-orange-50 text-orange-500' : 
                              'bg-rose-50 text-rose-500'}`}>
                            <stat.icon size={24} />
                         </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h4 className="text-2xl font-black text-[#1B2436] mt-1">{stat.value}</h4>
                      {stat.sub && <p className="text-[10px] text-slate-400 font-bold mt-1">{stat.sub}</p>}
                   </div>
                ))}
             </div>
             {/* Turnstile */}
             <div className="bg-white rounded-[40px] p-8 shadow-soft border border-white/50">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1B2436] flex items-center justify-center text-white shadow-lg">
                         <Scan size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-[#1B2436]">Turnike Entegrasyonu</h3>
                         <p className="text-xs text-slate-400 font-medium italic">Geçiş sisteminden gelen anlık veriler</p>
                      </div>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-l-2xl">Üye Bilgisi</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">TC Kimlik No</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Giriş/Çıkış</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">İçeride Kalma</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right rounded-r-2xl">Durum</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {turnstileLogs.length === 0 ? (
                             <tr>
                                 <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm font-medium italic">Henüz giriş kaydı bulunmuyor.</td>
                             </tr>
                         ) : (
                            turnstileLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group cursor-pointer">
                                   <td className="px-6 py-5">
                                      <div className="flex items-center gap-3">
                                         <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] border border-blue-100">{log.name.charAt(0)}</div>
                                         <span className="font-bold text-[#1B2436] text-sm group-hover:text-blue-600 transition-colors">{log.name}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-5 text-xs text-slate-500 font-medium font-mono">{log.tcNo}</td>
                                   <td className="px-6 py-5">
                                      <div className="flex flex-col">
                                         <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><ArrowUpRight size={10}/> {log.entryTime}</span>
                                         {log.exitTime && <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1"><ChevronDown size={10} className="rotate-180"/> {log.exitTime}</span>}
                                      </div>
                                   </td>
                                   <td className="px-6 py-5">
                                      <span className={`text-xs font-black ${log.status === 'active' ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`}>
                                         {calculateDuration(log.entryTime, log.exitTime)}
                                      </span>
                                   </td>
                                   <td className="px-6 py-5 text-right">
                                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${log.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                         {log.status === 'active' ? 'İçeride' : 'Ayrıldı'}
                                      </span>
                                   </td>
                                </tr>
                             ))
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      case 'members':
        return (
          <div key="members" className="space-y-8 page-transition">
             {/* ... Same Member Content ... */}
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className="text-3xl font-black text-[#1B2436]">Üyeler</h2>
                   <p className="text-slate-500 font-medium">Toplam {members.length} kayıtlı üye.</p>
                </div>
                <button onClick={() => setIsAddMemberOpen(true)} className="bg-[#1B2436] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-slate-900/10">
                   <Plus size={20}/> Yeni Üye Ekle
                </button>
             </div>
             {/* Table */}
             <div className="bg-white rounded-[40px] shadow-soft border border-white overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Üye adına veya e-postasına göre ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                   </div>
                   <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-colors"><Filter size={20}/></button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ad Soyad</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Program</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Üyelik</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Aksiyon</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {filteredMembers.length === 0 ? (
                             <tr>
                                 <td colSpan={4} className="px-8 py-10 text-center text-slate-400 text-sm font-medium italic">Kayıtlı üye bulunamadı.</td>
                             </tr>
                         ) : (
                             filteredMembers.map(m => (
                                <tr key={m.id} onClick={() => { setSelectedMember(m); setIsDetailOpen(true); }} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase">{m.name.charAt(0)}</div>
                                         <div className="flex flex-col">
                                            <span className="font-bold text-[#1B2436]">{m.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{m.email}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6 text-center">
                                      {m.workoutPlan ? (
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-1 w-fit mx-auto">
                                          <CheckCircle2 size={12}/> {m.workoutPlan.title}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300 italic text-xs">Atanmadı</span>
                                      )}
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${m.membershipType === 'Gold' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {m.membershipType || 'Gold'}
                                      </span>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                       <button 
                                         onClick={(e) => { e.stopPropagation(); handleMemberAction(m.id); }}
                                         className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                                       >
                                         <MoreHorizontal size={20} className="text-slate-300 hover:text-blue-500" />
                                       </button>
                                   </td>
                                </tr>
                             ))
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      case 'workouts':
        return (
          <div key="workouts" className="space-y-8 page-transition">
             {/* ... Same Workouts Content ... */}
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black text-[#1B2436]">Program Havuzu</h2>
                   <p className="text-slate-500 font-medium">Üyeler için hazır antrenman şablonlarını yönetin.</p>
                </div>
                <button onClick={() => setIsAddTemplateOpen(true)} className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                   <Plus size={20}/> Yeni Şablon Oluştur
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutTemplates.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[40px] shadow-soft border-2 border-dashed border-slate-100 text-center text-slate-400">
                        <WorkoutIcon size={48} className="mx-auto mb-4 opacity-50"/>
                        <p className="font-medium">Henüz bir antrenman şablonu oluşturulmadı.</p>
                    </div>
                ) : (
                    workoutTemplates.map(w => (
                       <div key={w.id} className="bg-white p-8 rounded-[40px] shadow-soft border border-white hover:border-blue-100 transition-all group relative flex flex-col h-full">
                          <div className="flex items-start justify-between mb-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${w.difficulty === 'İleri' ? 'bg-rose-50 text-rose-500' : w.difficulty === 'Başlangıç' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                 <WorkoutIcon size={28} />
                              </div>
                              {w.duration && <span className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-wider">{w.duration}</span>}
                          </div>
                          
                          <h3 className="text-xl font-black text-[#1B2436] mb-2">{w.title}</h3>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
                             <span className="flex items-center gap-1"><Target size={14}/> {w.difficulty}</span>
                             <span className="flex items-center gap-1"><Layers size={14}/> {w.exercises.length} Hareket</span>
                          </div>
                          
                          <div className="mt-auto space-y-3">
                              <button onClick={() => handleEditTemplate(w.title)} className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-[#1B2436] group-hover:text-white transition-all flex items-center justify-center gap-2">
                                  <FileText size={16}/> İncele & Düzenle
                              </button>
                              <button onClick={() => openAssignModal(w)} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                  <Share2 size={16}/> Üyeye Ata
                              </button>
                          </div>
                       </div>
                    ))
                )}
             </div>
          </div>
        );

      case 'trainers':
        return (
          <div key="trainers" className="space-y-8 page-transition">
              <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-[#1B2436]">Eğitmenler</h2>
                  <button onClick={() => handleOpenTrainerModal()} className="bg-[#1B2436] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                      <Plus size={20}/> Eğitmen Ekle
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainers.length === 0 ? (
                      <div className="col-span-full py-20 bg-white rounded-[40px] shadow-soft border-2 border-dashed border-slate-100 text-center text-slate-400">
                          <UserCheck size={48} className="mx-auto mb-4 opacity-50"/>
                          <p className="font-medium">Sisteme kayıtlı eğitmen bulunmuyor.</p>
                      </div>
                  ) : (
                      trainers.map(t => (
                          <div key={t.id} className="bg-white p-8 rounded-[40px] shadow-soft border border-white hover:-translate-y-1 transition-all group flex flex-col h-full relative">
                              <button onClick={() => handleOpenTrainerModal(t)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-blue-500 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                                  <Edit2 size={16} />
                              </button>
                              <div className="flex items-center gap-6 mb-6">
                                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                      <img src={t.img} alt={t.name} className="w-full h-full object-cover"/>
                                  </div>
                                  <div>
                                      <h3 className="text-lg font-black text-[#1B2436]">{t.name}</h3>
                                      <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t.specialty}</span>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center border-t border-slate-50 pt-6 mb-6">
                                  <div className="text-center">
                                      <div className="text-lg font-black text-[#1B2436]">{t.students}</div>
                                      <div className="text-[10px] text-slate-400 uppercase">Öğrenci</div>
                                  </div>
                                  <div className="text-center">
                                      <div className="text-lg font-black text-[#1B2436] flex items-center gap-1"><Star size={16} className="fill-amber-400 text-amber-400"/> {t.rating}</div>
                                      <div className="text-[10px] text-slate-400 uppercase">Puan</div>
                                  </div>
                              </div>
                              <button onClick={() => handleContactTrainer(t.name)} className="mt-auto w-full py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                 <Phone size={16}/> İletişime Geç
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </div>
        );
      
      case 'finance':
          return (
              <div key="finance" className="space-y-8 page-transition">
                   <div className="flex items-center justify-between">
                       <h2 className="text-3xl font-black text-[#1B2436]">Finansal Özet</h2>
                       <button onClick={handleDownloadFinanceReport} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                           <Download size={20}/> Rapor İndir (XLSX)
                       </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-[#1B2436] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                           <div className="relative z-10">
                               <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Aylık Ciro</p>
                               <h3 className="text-4xl font-black tracking-tight">0 <span className="text-lg text-slate-400">TL</span></h3>
                               <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full">Veri Yok</div>
                           </div>
                           <div className="absolute right-0 bottom-0 p-8 opacity-10"><DollarSign size={120}/></div>
                       </div>
                       <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white flex flex-col justify-center">
                           <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Aktif Üyelikler</p>
                           <h3 className="text-3xl font-black text-[#1B2436]">{members.length}</h3>
                       </div>
                       <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white flex flex-col justify-center">
                           <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Bekleyen Ödemeler</p>
                           <h3 className="text-3xl font-black text-rose-500">0 TL</h3>
                       </div>
                   </div>
                   
                   <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white flex flex-col items-center justify-center min-h-[300px] text-center">
                       <BarChart3 size={48} className="text-slate-200 mb-4"/>
                       <h4 className="text-xl font-bold text-[#1B2436]">Detaylı Gelir Analizi</h4>
                       <p className="text-slate-400 text-sm max-w-md mt-2 mb-6">Yeterli finansal veri oluştuğunda burada detaylı analizler görüntülenecektir.</p>
                       <button onClick={handleViewFullHistory} className="px-6 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B2436] hover:text-white transition-colors flex items-center gap-2 active:scale-95">
                           <History size={16}/> Tüm Geçmişi Görüntüle
                       </button>
                   </div>
              </div>
          );

      case 'schedule':
          return (
              <div key="schedule" className="space-y-8 page-transition">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-[#1B2436]">Ders Programı</h2>
                    <div className="flex gap-3">
                        <button onClick={handleOpenInviteModal} className="bg-slate-100 text-[#1B2436] px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-slate-200 transition-all flex items-center gap-2">
                            <Users2 size={16}/> Üye Davet Et
                        </button>
                        <button onClick={() => setIsAddClassModalOpen(true)} className="bg-[#1B2436] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase hover:scale-105 transition-all flex items-center gap-2">
                            <Plus size={16}/> Yeni Ders Ekle
                        </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-[40px] p-8 shadow-soft border border-white">
                      <div className="space-y-4">
                          {schedule.length === 0 ? (
                              <div className="py-10 text-center text-slate-400 font-medium italic">Programda kayıtlı ders bulunmuyor.</div>
                          ) : (
                              schedule.map(s => (
                                  <div key={s.id} className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group relative">
                                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${s.color}`}>
                                          <span className="text-lg font-black">{s.time}</span>
                                      </div>
                                      <div className="flex-1 text-center md:text-left">
                                          <h4 className="text-lg font-black text-[#1B2436]">{s.class}</h4>
                                          <p className="text-xs font-bold text-slate-400">{s.trainer} • {s.room}</p>
                                      </div>
                                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                                          <Users2 size={14}/> {s.capacity}
                                      </div>
                                      <div className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-500 group-hover:bg-[#1B2436] group-hover:text-white transition-colors">
                                          {s.day}
                                      </div>
                                      <div className="hidden group-hover:flex absolute top-1/2 right-4 -translate-y-1/2 bg-white shadow-lg p-2 rounded-xl gap-2 animate-fadeIn">
                                           <button onClick={() => handleInviteSingleMember(s.class)} className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center gap-1">
                                               <Users2 size={12}/> Hızlı Davet
                                           </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          );

      case 'settings':
          return (
              <div key="settings" className="space-y-8 page-transition pb-20">
                  <h2 className="text-3xl font-black text-[#1B2436]">Sistem Ayarları</h2>
                  <div className="bg-white p-8 rounded-[40px] shadow-soft border border-white max-w-2xl">
                      <form className="space-y-6" onSubmit={handleSaveSettings}>
                          <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Salon Adı</label>
                              <input type="text" value={gymName} onChange={(e) => setGymName(e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-[#1B2436] outline-none border border-slate-100 focus:border-blue-500" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">İletişim E-Posta</label>
                              <input type="email" value={gymEmail} onChange={(e) => setGymEmail(e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-[#1B2436] outline-none border border-slate-100 focus:border-blue-500" />
                          </div>
                          <div className="flex items-center justify-between py-4 border-t border-slate-50">
                              <span className="font-bold text-[#1B2436]">Bakım Modu</span>
                              <div 
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`w-14 h-8 rounded-full relative cursor-pointer transition-colors duration-300 ${maintenanceMode ? 'bg-[#1B2436]' : 'bg-slate-200'}`}
                              >
                                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md ${maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                              </div>
                          </div>
                          <button type="submit" className="bg-[#1B2436] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-600 transition-all">Ayarları Kaydet</button>
                      </form>
                  </div>
              </div>
          );
      
      default:
        return <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-bold italic">Modül Geliştiriliyor...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F9] flex selection:bg-blue-100 overflow-x-hidden">
       {isMobileMenuOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}></div>}

       {/* Sidebar... (Unchanged) */}
       <aside className={`
            fixed z-[70] lg:top-6 lg:left-6 lg:bottom-6 top-0 bottom-0 left-0 
            bg-white/80 backdrop-blur-2xl border border-white/40 shadow-sidebar 
            flex flex-col transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
            ${isMobileMenuOpen ? 'translate-x-0 w-[280px] rounded-r-3xl lg:rounded-[40px]' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarCollapsed ? 'lg:w-[100px]' : 'lg:w-[280px]'}
          `}>
          <div className={`pt-8 md:pt-10 px-8 flex items-center gap-4 ${isSidebarCollapsed ? 'lg:flex-col lg:justify-center lg:px-2' : ''}`}>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#1B2436] flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-all duration-500">
                <Activity size={24} strokeWidth={3} />
             </div>
             <div className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'lg:max-w-0 lg:opacity-0 pointer-events-none invisible' : 'max-w-[200px] opacity-100'}`}>
                <h1 className="text-xl font-extrabold text-[#1B2436] leading-none tracking-tight">FitPulse.</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">FITNESS MANAGEMENT</p>
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden ml-auto p-2 text-slate-300"><X size={24}/></button>
          </div>
          
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex absolute -right-5 top-14 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-50 items-center justify-center text-slate-400 hover:text-blue-500 transition-all z-50">
             {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <div className="flex-1 overflow-y-auto px-5 md:px-6 mt-10 space-y-2 no-scrollbar">
             {sidebarItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => { setActiveSection(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-[20px] transition-all duration-500 relative group
                      ${isSidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                      ${isActive ? 'bg-[#1B2436] text-white shadow-xl shadow-slate-900/10' : 'text-slate-500 hover:text-[#1B2436] hover:bg-slate-50/50'}`}>
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
                   <span className="font-extrabold text-[#1B2436] text-sm truncate">{user.name.split(' ')[0]} d.</span>
                   <span className="text-[10px] font-bold text-slate-400">Yönetici</span>
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

       {/* --- MODALS (Unchanged logic, just empty states) --- */}
       {isInviteModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
               <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-scaleIn relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-[#1B2436]"></div>
                   <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1B2436] transition-colors"><X size={20}/></button>
                   
                   <div className="mb-6">
                      <h3 className="text-2xl font-black text-[#1B2436]">Ders Daveti Gönder</h3>
                      <p className="text-slate-400 text-sm font-medium">Önce bir ders seçin, ardından davet etmek istediğiniz üyeleri işaretleyin.</p>
                   </div>

                   <div className="space-y-6">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">Ders Seçimi</label>
                           <select 
                                value={inviteSelectedClass} 
                                onChange={(e) => setInviteSelectedClass(e.target.value)} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none focus:ring-2 focus:ring-blue-100"
                           >
                               <option value="">Bir ders seçiniz...</option>
                               {schedule.map(s => (
                                   <option key={s.id} value={s.class}>{s.class} ({s.day} {s.time})</option>
                               ))}
                           </select>
                       </div>

                       {inviteSelectedClass && (
                           <div className="space-y-2 animate-fadeIn">
                               <label className="text-[10px] font-black text-slate-400 uppercase flex justify-between">
                                   <span>Üye Listesi</span>
                                   <span className="text-blue-500">{inviteSelectedMembers.length} Seçili</span>
                               </label>
                               <div className="max-h-60 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl bg-slate-50 p-2 space-y-1">
                                   {members.length === 0 ? (
                                       <div className="text-center py-4 text-xs text-slate-400">Üye bulunamadı.</div>
                                   ) : (
                                       members.map(member => (
                                           <div 
                                                key={member.id} 
                                                onClick={() => toggleInviteMember(member.id)}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${inviteSelectedMembers.includes(member.id) ? 'bg-blue-100 border border-blue-200' : 'hover:bg-white border border-transparent'}`}
                                           >
                                               <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${inviteSelectedMembers.includes(member.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                   {inviteSelectedMembers.includes(member.id) && <CheckCircle2 size={14} />}
                                               </div>
                                               <div className="flex-1">
                                                   <p className="text-xs font-bold text-[#1B2436]">{member.name}</p>
                                                   <p className="text-[10px] text-slate-400">{member.email}</p>
                                               </div>
                                           </div>
                                       ))
                                   )}
                               </div>
                           </div>
                       )}

                       <button 
                            onClick={handleSendInvites}
                            disabled={!inviteSelectedClass || inviteSelectedMembers.length === 0}
                            className="w-full py-4 mt-2 bg-[#1B2436] text-white rounded-xl font-bold text-sm shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                       >
                           <Send size={16}/> Davetleri Gönder
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* Add Trainer Modal */}
       {isTrainerModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
               <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scaleIn relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-[#1B2436]"></div>
                   <button onClick={() => setIsTrainerModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1B2436] transition-colors"><X size={20}/></button>
                   
                   <div className="mb-6">
                      <h3 className="text-2xl font-black text-[#1B2436]">{editingTrainer ? 'Eğitmen Bilgilerini Düzenle' : 'Yeni Eğitmen Ekle'}</h3>
                   </div>

                   <form onSubmit={handleSaveTrainer} className="space-y-4">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">Ad Soyad</label>
                           <input type="text" required value={trainerForm.name} onChange={e => setTrainerForm({...trainerForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none focus:ring-2 focus:ring-blue-100"/>
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">Uzmanlık Alanı</label>
                           <input type="text" required value={trainerForm.specialty} onChange={e => setTrainerForm({...trainerForm, specialty: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none focus:ring-2 focus:ring-blue-100"/>
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">E-Posta</label>
                           <input type="email" value={trainerForm.email} onChange={e => setTrainerForm({...trainerForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none focus:ring-2 focus:ring-blue-100"/>
                       </div>
                       <button type="submit" className="w-full py-4 mt-2 bg-[#1B2436] text-white rounded-xl font-bold text-sm shadow-xl hover:scale-[1.01] transition-all">
                           {editingTrainer ? 'Güncelle' : 'Kaydet'}
                       </button>
                   </form>
               </div>
           </div>
       )}

       {/* Add Class Modal, Add Member Modal, Add Template Modal, Assign Template Modal, Member Detail Slide-over ... (All kept same, just updated logic above handles data) */}
       {/* ... Keeping existing JSX for Modals as they rely on handlers and state defined above ... */}
       {/* (Abbreviated for brevity as logic is handled by state changes) */}
       {isAddClassModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
               <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scaleIn relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-[#1B2436]"></div>
                   <button onClick={() => setIsAddClassModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1B2436] transition-colors"><X size={20}/></button>
                   <div className="mb-6"><h3 className="text-2xl font-black text-[#1B2436]">Yeni Ders Ekle</h3></div>
                   <form onSubmit={handleSaveClass} className="space-y-4">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">Ders Adı</label>
                           <input type="text" required placeholder="Örn: HIIT Cardio" value={newClassData.name} onChange={e => setNewClassData({...newClassData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none focus:ring-2 focus:ring-blue-100"/>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Gün</label>
                               <select value={newClassData.day} onChange={e => setNewClassData({...newClassData, day: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none">
                                   <option value="Pazartesi">Pazartesi</option><option value="Salı">Salı</option><option value="Çarşamba">Çarşamba</option><option value="Perşembe">Perşembe</option><option value="Cuma">Cuma</option><option value="Cumartesi">Cumartesi</option><option value="Pazar">Pazar</option>
                               </select>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Saat</label>
                               <input type="time" required value={newClassData.time} onChange={e => setNewClassData({...newClassData, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none"/>
                           </div>
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">Eğitmen</label>
                           <select value={newClassData.trainer} onChange={e => setNewClassData({...newClassData, trainer: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none">
                               <option value="">Seçiniz</option>
                               {trainers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                           </select>
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase">Kontenjan</label>
                           <input type="number" required value={newClassData.capacity} onChange={e => setNewClassData({...newClassData, capacity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] outline-none"/>
                       </div>
                       <button type="submit" className="w-full py-4 mt-2 bg-[#1B2436] text-white rounded-xl font-bold text-sm shadow-xl hover:scale-[1.01] transition-all">Ekle</button>
                   </form>
               </div>
           </div>
       )}

       {isAddMemberOpen && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scaleIn relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-[#1B2436]"></div>
               <button onClick={() => setIsAddMemberOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1B2436] transition-colors"><X size={20}/></button>
               <div className="mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4"><Plus size={24} /></div>
                  <h3 className="text-2xl font-black text-[#1B2436]">Yeni Üye Ekle</h3>
               </div>
               <form onSubmit={handleSaveNewMember} className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserCheck size={12}/> Ad Soyad</label>
                     <input type="text" required value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> E-Posta</label>
                     <input type="email" required value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Lock size={12}/> Giriş Şifresi</label>
                     <input type="text" required placeholder="Üye için şifre belirleyin" value={newMemberPassword} onChange={(e) => setNewMemberPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] focus:ring-2 focus:ring-blue-100 outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Award size={12}/> Üyelik Paketi</label>
                     <select value={newMemberType} onChange={(e) => setNewMemberType(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1B2436] focus:ring-2 focus:ring-blue-100 outline-none appearance-none">
                        <option value="Gold">Gold Paket</option><option value="Silver">Silver Paket</option><option value="Bronze">Bronze Paket</option>
                     </select>
                  </div>
                  <button type="submit" className="w-full py-4 mt-4 bg-[#1B2436] text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"><Save size={18} /> Kaydı Tamamla</button>
               </form>
            </div>
         </div>
       )}

       {isAddTemplateOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
               <div className="bg-white rounded-[32px] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn relative">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-[#1B2436]"></div>
                   <button onClick={() => setIsAddTemplateOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1B2436] transition-colors"><X size={20}/></button>
                   <div className="mb-6">
                      <h3 className="text-2xl font-black text-[#1B2436]">Yeni Antrenman Şablonu</h3>
                      <p className="text-slate-400 text-sm font-medium">Program havuzuna yeni bir antrenman ekle.</p>
                   </div>
                   <form onSubmit={handleCreateTemplate} className="space-y-6">
                       {/* ... Template Form (Same) ... */}
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2 col-span-2 md:col-span-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Şablon Adı</label>
                               <input type="text" required placeholder="Örn: Full Body Power" value={templateTitle} onChange={e => setTemplateTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                           </div>
                           <div className="space-y-2 col-span-2 md:col-span-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Odak Bölgesi</label>
                               <input type="text" placeholder="Örn: Tüm Vücut" value={templateFocus} onChange={e => setTemplateFocus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Zorluk Seviyesi</label>
                               <select value={templateDifficulty} onChange={e => setTemplateDifficulty(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none appearance-none">
                                   <option value="Başlangıç">Başlangıç</option><option value="Orta">Orta</option><option value="İleri">İleri</option>
                               </select>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Tahmini Süre</label>
                               <input type="text" placeholder="Örn: 45 dk" value={templateDuration} onChange={e => setTemplateDuration(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                           </div>
                       </div>
                       <div>
                           <div className="flex items-center justify-between mb-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase">Egzersiz Listesi</label>
                               <button type="button" onClick={addExerciseRow} className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1 hover:underline"><Plus size={12}/> Hareket Ekle</button>
                           </div>
                           <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                               {templateExercises.map((ex, idx) => (
                                   <div key={idx} className="flex gap-2 items-center">
                                       <span className="text-xs font-bold text-slate-300 w-4">{idx+1}</span>
                                       <input type="text" placeholder="Hareket Adı" value={ex.name} onChange={e => updateExerciseRow(idx, 'name', e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold outline-none border border-slate-100" />
                                       <input type="text" placeholder="Set" value={ex.sets} onChange={e => updateExerciseRow(idx, 'sets', e.target.value)} className="w-16 px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold outline-none border border-slate-100" />
                                       <input type="text" placeholder="Tekrar" value={ex.reps} onChange={e => updateExerciseRow(idx, 'reps', e.target.value)} className="w-16 px-3 py-2 bg-slate-50 rounded-lg text-xs font-bold outline-none border border-slate-100" />
                                       <button type="button" onClick={() => removeExerciseRow(idx)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                                   </div>
                               ))}
                           </div>
                       </div>
                       <button type="submit" className="w-full py-4 bg-[#1B2436] text-white rounded-xl font-bold text-sm shadow-xl hover:scale-[1.01] transition-all">Şablonu Oluştur</button>
                   </form>
               </div>
           </div>
       )}
       
       {isAssignModalOpen && selectedTemplateForAssign && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
               <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scaleIn relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#1B2436]"></div>
                   <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1B2436] transition-colors"><X size={20}/></button>
                   <div className="mb-6">
                      <h3 className="text-xl font-black text-[#1B2436]">Üye Seçin</h3>
                      <p className="text-slate-400 text-sm font-medium"><span className="text-blue-500 font-bold">{selectedTemplateForAssign.title}</span> programını atayacağınız üyeyi seçin.</p>
                   </div>
                   <div className="mb-4 relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                       <input type="text" placeholder="Üye ara..." value={assignSearchQuery} onChange={e => setAssignSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-100"/>
                   </div>
                   <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                       {membersToAssign.length === 0 ? (
                           <div className="text-center py-4 text-xs text-slate-400">Üye bulunamadı.</div>
                       ) : (
                           membersToAssign.map(m => (
                               <div key={m.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                   <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">{m.name.charAt(0)}</div>
                                       <div>
                                           <p className="text-sm font-bold text-[#1B2436]">{m.name}</p>
                                           <p className="text-[10px] text-slate-400">{m.email}</p>
                                       </div>
                                   </div>
                                   <button onClick={() => performAssign(m.id)} className="px-3 py-1.5 bg-[#1B2436] text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600">
                                       Seç & Ata
                                   </button>
                               </div>
                           ))
                       )}
                   </div>
               </div>
           </div>
       )}

       {isDetailOpen && selectedMember && (
          <>
             <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] animate-fadeIn" onClick={() => setIsDetailOpen(false)}></div>
             <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-[110] shadow-2xl p-6 md:p-10 overflow-y-auto animate-slideInRight">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-[#1B2436]">Üye Yönetimi</h3>
                   <button onClick={() => setIsDetailOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500"><X size={20}/></button>
                </div>
                <div className="space-y-10 pb-10">
                   <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 flex flex-col items-center relative overflow-hidden">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-2xl font-black text-blue-500 mb-4 z-10">{selectedMember.name.charAt(0)}</div>
                      <h4 className="text-lg font-black text-[#1B2436] z-10">{selectedMember.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 z-10">{selectedMember.membershipType || 'Gold'} Paket</p>
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Users2 size={100}/></div>
                   </div>

                   {/* AI Generate Button (Same) */}
                   <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 p-6 opacity-20 transform rotate-12 transition-transform group-hover:scale-110 duration-700"><BrainCircuit size={120}/></div>
                        
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 mb-4">
                                <Sparkles size={12} className="text-amber-300 fill-amber-300"/>
                                <span className="text-[10px] font-black uppercase tracking-widest">AI Antrenör</span>
                            </div>
                            
                            <h5 className="text-2xl font-black mb-2 leading-tight">Hedefe Yönelik<br/>Program Öner</h5>
                            
                            <p className="text-xs text-indigo-100 mb-6 font-medium leading-relaxed max-w-[80%]">
                                Üyenin <strong className="text-white bg-white/10 px-1 rounded">"{selectedMember.goal || 'Genel Form'}"</strong> hedefini analiz ederek, yapay zeka destekli kişiselleştirilmiş bir antrenman programı oluştur.
                            </p>
                            
                            <button 
                                onClick={handleGenerateAIPlan}
                                disabled={isGeneratingPlan}
                                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-3 group/btn"
                            >
                                {isGeneratingPlan ? (
                                    <> 
                                      <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div> 
                                      <span>Analiz Ediliyor...</span> 
                                    </>
                                ) : (
                                    <> 
                                      <Zap size={18} className="fill-indigo-600"/> 
                                      <span>Programı Oluştur ve Ata</span>
                                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                                    </>
                                )}
                            </button>
                        </div>
                   </div>

                   {/* Physical Stats (Same) */}
                   <div>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={12}/> FİZİKSEL BİLGİLER & HEDEF</h5>
                       <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
                           <div className="grid grid-cols-3 gap-4 mb-6">
                               <div className="space-y-2">
                                   <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Calendar size={10}/> Yaş</label>
                                   <input type="number" className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold text-[#1B2436] outline-none" value={selectedMember.age || ''} onChange={(e) => handleUpdateProfile('age', e.target.value)} placeholder="-" />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Ruler size={10}/> Boy (cm)</label>
                                   <input type="number" className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold text-[#1B2436] outline-none" value={selectedMember.height || ''} onChange={(e) => handleUpdateProfile('height', e.target.value)} placeholder="-" />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Weight size={10}/> Kilo (kg)</label>
                                   <input type="number" className="w-full bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold text-[#1B2436] outline-none" value={selectedMember.weight || ''} onChange={(e) => handleUpdateProfile('weight', e.target.value)} placeholder="-" />
                               </div>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Target size={10}/> Spor Hedefi</label>
                               <select className="w-full bg-slate-50 rounded-xl px-3 py-3 text-sm font-bold text-[#1B2436] outline-none appearance-none" value={selectedMember.goal || 'Genel Sağlık'} onChange={(e) => handleUpdateProfile('goal', e.target.value)}>
                                  <option value="Kilo Vermek">Kilo Vermek & Yağ Yakımı</option>
                                  <option value="Kas Kütlesi Artışı">Kas Kütlesi Artışı (Hipertrofi)</option>
                                  <option value="Güç Kazanımı">Güç Kazanımı</option>
                                  <option value="Genel Sağlık">Genel Sağlık & Kondisyon</option>
                                  <option value="Esneklik">Esneklik ve Mobilite</option>
                               </select>
                           </div>
                       </div>
                   </div>

                   <div>
                      <div className="flex items-center justify-between mb-4">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AKTİF EGZERSİZLER</h5>
                         <button onClick={handleAddManualExercise} className="text-blue-500 font-black text-[9px] uppercase flex items-center gap-1 hover:underline transition-all"><Plus size={14}/> Manuel Ekle</button>
                      </div>
                      <div className="space-y-3">
                         {selectedMember.workoutPlan ? selectedMember.workoutPlan.exercises.map((ex, idx) => (
                            <div key={idx} className="flex flex-col gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all shadow-sm">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">{idx+1}</div>
                                  <input className="flex-1 bg-transparent border-none p-0 text-xs font-black text-[#1B2436] outline-none" value={ex.name} onChange={(e) => updateExercise(idx, 'name', e.target.value)} />
                                  <button onClick={() => removeExercise(idx)} className="p-1 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Sets:</span>
                                    <input className="w-full bg-transparent border-none p-0 text-xs font-bold outline-none" value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', e.target.value)} />
                                  </div>
                                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Reps:</span>
                                    <input className="w-full bg-transparent border-none p-0 text-xs font-bold outline-none" value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', e.target.value)} />
                                  </div>
                                </div>
                            </div>
                         )) : (
                            <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] text-center text-slate-300 font-bold italic text-sm">Üyeye atanmış program bulunmuyor.</div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </>
       )}
    </div>
  );
};

export default AdminDashboard;

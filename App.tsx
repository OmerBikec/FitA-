
import React, { useState, useEffect } from 'react';
import { Role, User, AppView, WorkoutPlan, Exercise, MeasurementLog } from './types';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import LandingPage from './components/LandingPage';
import { Dumbbell, Zap, Activity } from 'lucide-react';

function App() {
  // Varsayılan açılış sayfası LANDING olarak değiştirildi
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSecretAdminEntry, setIsSecretAdminEntry] = useState(false);

  // Başlangıç Şablonları (Boş)
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutPlan[]>([]);

  // Merkezi Üye Listesi (Boş) ve Varsayılan Admin (Boş)
  // Demo amaçlı ilk yöneticiye bir şifre atadık: 'admin123'
  const [members, setMembers] = useState<User[]>([
      { id: 'admin_def', name: 'Sistem Yöneticisi', email: 'admin@fitpulse.com', password: 'admin123', role: Role.ADMIN, joinDate: new Date().toISOString() }
  ]);

  // Üye güncelleme fonksiyonu
  const updateMember = (updatedMember: User) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (currentUser && currentUser.id === updatedMember.id) {
        setCurrentUser(updatedMember);
    }
  };

  // Yeni Şablon Ekleme
  const addTemplate = (template: WorkoutPlan) => {
    setWorkoutTemplates(prev => [...prev, template]);
  };

  // Şablonu Üyeye Atama (Öneri olarak ekler)
  const assignTemplateToMember = (memberId: string, template: WorkoutPlan) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
        const newAssigned = member.assignedTemplates ? [...member.assignedTemplates, template] : [template];
        const updatedMember = { ...member, assignedTemplates: newAssigned };
        updateMember(updatedMember);
    }
  };

  // Yeni Üye Ekleme Fonksiyonu (Yönetici Paneli İçin)
  const addMember = (newMemberData: Partial<User>) => {
    const newMember: User = {
      id: Math.random().toString(36).substr(2, 9),
      joinDate: new Date().toISOString(),
      role: Role.MEMBER,
      name: newMemberData.name || 'Yeni Üye',
      email: newMemberData.email || 'uye@fitpulse.com',
      password: newMemberData.password || '123456', // Varsayılan şifre (admin girmezse)
      membershipType: newMemberData.membershipType || 'Bronze',
      assignedTemplates: [],
      measurements: [],
      ...newMemberData
    } as User;
    
    setMembers(prev => [newMember, ...prev]);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (role: Role, email: string, password?: string) => {
    // Tüm roller için (Admin veya Üye) members listesinde arama yapıyoruz.
    const user = members.find(m => m.email.toLowerCase() === email.toLowerCase() && m.role === role);
    
    if (user) {
        // Şifre kontrolü
        if (password && user.password && user.password !== password) {
            alert("Hatalı şifre!");
            return;
        }
        
        // Eğer kullanıcının şifresi yoksa (eski veri) veya doğruysa giriş yap
        setCurrentUser(user);
        setCurrentView(role === Role.ADMIN ? AppView.ADMIN_DASHBOARD : AppView.MEMBER_DASHBOARD);
    } else {
        alert("Giriş başarısız. E-posta adresi veya rol hatalı.");
    }
  };

  const handleRegister = (role: Role, email: string, name: string, password?: string) => {
     // Sadece Gizli Yönetici Girişi ile yeni Admin oluşturulabilir.
     if (role !== Role.ADMIN) return;

     const existing = members.find(m => m.email.toLowerCase() === email.toLowerCase());
     if (existing) {
         alert("Bu e-posta adresi zaten kullanımda.");
         return;
     }

     const newAdmin: User = {
         id: `admin_${Date.now()}`,
         name: name,
         email: email,
         password: password || 'admin123',
         role: Role.ADMIN,
         joinDate: new Date().toISOString()
     };

     setMembers(prev => [...prev, newAdmin]);
     setCurrentUser(newAdmin);
     setCurrentView(AppView.ADMIN_DASHBOARD);
     alert("Yönetici hesabı başarıyla oluşturuldu.");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.LOGIN);
    setIsSecretAdminEntry(false); // Reset secret mode on logout
  };

  const handleAdminAccess = () => {
      setIsSecretAdminEntry(true);
      setCurrentView(AppView.LOGIN);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING:
        return (
          <LandingPage 
            onLoginClick={() => { setIsSecretAdminEntry(false); setCurrentView(AppView.LOGIN); }} 
            onAdminAccess={handleAdminAccess}
          />
        );
      case AppView.LOGIN:
        return (
          <Auth 
            onLogin={handleLogin} 
            onRegister={handleRegister}
            isSecretAdminEntry={isSecretAdminEntry}
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
          />
        );
      case AppView.ADMIN_DASHBOARD:
        if (!currentUser) return null;
        return (
          <AdminDashboard 
            user={currentUser} 
            members={members.filter(m => m.role === Role.MEMBER)} // Sadece üyeleri gönder
            workoutTemplates={workoutTemplates}
            onUpdateMember={updateMember}
            onAddMember={addMember}
            onAddTemplate={addTemplate}
            onAssignTemplate={assignTemplateToMember}
            onLogout={handleLogout} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
          />
        );
      case AppView.MEMBER_DASHBOARD:
        if (!currentUser) return null;
        return (
          <MemberDashboard 
            user={members.find(m => m.id === currentUser.id) || currentUser} 
            onLogout={handleLogout} 
            onUpdateUser={updateMember}
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
          />
        );
      default:
        return <Auth onLogin={handleLogin} onRegister={handleRegister} isSecretAdminEntry={isSecretAdminEntry} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }
  };

  return (
    <div className="antialiased font-sans text-slate-900 dark:text-slate-100 selection:bg-brand-500/30 transition-colors duration-500">
      {renderView()}
    </div>
  );
}

export default App;

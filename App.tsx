
import React, { useState, useEffect } from 'react';
import { Role, User, AppView, WorkoutPlan } from './types';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import LandingPage from './components/LandingPage';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSecretAdminEntry, setIsSecretAdminEntry] = useState(false);

  // Verileri LocalStorage'dan yükle veya varsayılan admin ile başlat
  const [members, setMembers] = useState<User[]>(() => {
    const savedMembers = localStorage.getItem('fitpulse_members');
    if (savedMembers) {
      try {
        return JSON.parse(savedMembers);
      } catch (e) {
        console.error("Veri yükleme hatası:", e);
      }
    }
    // Varsayılan yönetici hesabı
    return [
      { 
        id: 'admin_def', 
        name: 'Sistem Yöneticisi', 
        email: 'admin@fitpulse.com', 
        password: 'admin123', 
        role: Role.ADMIN, 
        joinDate: new Date().toISOString() 
      }
    ];
  });

  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutPlan[]>(() => {
    const savedTemplates = localStorage.getItem('fitpulse_templates');
    if (savedTemplates) {
      try {
        return JSON.parse(savedTemplates);
      } catch (e) {
        console.error("Şablon yükleme hatası:", e);
      }
    }
    return [];
  });

  // Veri her değiştiğinde LocalStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('fitpulse_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('fitpulse_templates', JSON.stringify(workoutTemplates));
  }, [workoutTemplates]);

  const updateMember = (updatedMember: User) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (currentUser && currentUser.id === updatedMember.id) {
        setCurrentUser(updatedMember);
    }
  };

  const addTemplate = (template: WorkoutPlan) => {
    setWorkoutTemplates(prev => [...prev, template]);
  };

  const assignTemplateToMember = (memberId: string, template: WorkoutPlan) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
        const newAssigned = member.assignedTemplates ? [...member.assignedTemplates, template] : [template];
        const updatedMember = { ...member, assignedTemplates: newAssigned };
        updateMember(updatedMember);
    }
  };

  const addMember = (newMemberData: Partial<User>) => {
    const newMember: User = {
      id: Math.random().toString(36).substr(2, 9),
      joinDate: new Date().toISOString(),
      role: Role.MEMBER,
      name: newMemberData.name || 'Yeni Üye',
      email: newMemberData.email || 'uye@fitpulse.com',
      password: newMemberData.password || '123456',
      membershipType: newMemberData.membershipType || 'Bronze',
      assignedTemplates: [],
      measurements: [],
      dailyFoodLog: [],
      ...newMemberData
    } as User;
    setMembers(prev => [newMember, ...prev]);
  };

  const handleLogin = (role: Role, email: string, password?: string) => {
    const user = members.find(m => m.email.toLowerCase() === email.toLowerCase() && m.role === role);
    if (user) {
        if (password && user.password && user.password !== password) {
            alert("Hatalı şifre!");
            return;
        }
        setCurrentUser(user);
        setCurrentView(role === Role.ADMIN ? AppView.ADMIN_DASHBOARD : AppView.MEMBER_DASHBOARD);
    } else {
        alert("Giriş başarısız. Bilgilerinizi kontrol edin veya kayıtlı olduğunuzdan emin olun.");
    }
  };

  const handleRegister = (role: Role, email: string, name: string, password?: string) => {
     if (role !== Role.ADMIN) {
         alert("Sadece yöneticiler bu panelden kayıt olabilir.");
         return;
     }
     if (members.find(m => m.email.toLowerCase() === email.toLowerCase())) {
         alert("Bu e-posta kullanımda.");
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.LOGIN);
    setIsSecretAdminEntry(false);
  };

  return (
    <div className="antialiased font-sans transition-colors duration-500">
      {currentView === AppView.LANDING && (
        <LandingPage 
          onLoginClick={() => { setIsSecretAdminEntry(false); setCurrentView(AppView.LOGIN); }} 
          onAdminAccess={() => { setIsSecretAdminEntry(true); setCurrentView(AppView.LOGIN); }}
        />
      )}
      {currentView === AppView.LOGIN && (
        <Auth onLogin={handleLogin} onRegister={handleRegister} isSecretAdminEntry={isSecretAdminEntry} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      )}
      {currentView === AppView.ADMIN_DASHBOARD && currentUser && (
        <AdminDashboard 
          user={currentUser} 
          members={members.filter(m => m.role === Role.MEMBER)} 
          workoutTemplates={workoutTemplates}
          onUpdateMember={updateMember}
          onAddMember={addMember}
          onAddTemplate={addTemplate}
          onAssignTemplate={assignTemplateToMember}
          onLogout={handleLogout} 
          isDarkMode={isDarkMode} 
          toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        />
      )}
      {currentView === AppView.MEMBER_DASHBOARD && currentUser && (
        <MemberDashboard 
          user={members.find(m => m.id === currentUser.id) || currentUser} 
          onLogout={handleLogout} 
          onUpdateUser={updateMember}
          isDarkMode={isDarkMode} 
          toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        />
      )}
    </div>
  );
}

export default App;

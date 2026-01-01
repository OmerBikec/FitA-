
import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import { User, Lock, ArrowRight, Activity, Sparkles, KeyRound } from 'lucide-react';

interface AuthProps {
  onLogin: (role: Role, email: string, password?: string) => void;
  onRegister: (role: Role, email: string, name: string, password?: string) => void;
  isSecretAdminEntry: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, isSecretAdminEntry }) => {
  const [activeRole, setActiveRole] = useState<Role>(Role.MEMBER); 
  const [view, setView] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSecretAdminEntry) {
      setActiveRole(Role.ADMIN);
    }
  }, [isSecretAdminEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Yönetici Doğrulama Kontrolü (Hem Giriş hem Kayıt için)
    if (activeRole === Role.ADMIN) {
        if (verificationCode !== 'wasd123wasd') {
            alert("Hatalı yönetici doğrulama kodu!");
            setIsLoading(false);
            return;
        }
    }

    setTimeout(() => {
        setIsLoading(false);
        if (view === 'register') {
            onRegister(activeRole, email, name, password);
        } else {
            // Login işlemine şifreyi de gönderiyoruz
            onLogin(activeRole, email, password);
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F3F6F9] relative overflow-hidden font-sans">
       
       {/* Ambient Background Glows */}
       <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px]"></div>
       </div>

       {/* Main Card */}
       <div className="w-full max-w-[1100px] bg-white rounded-[48px] shadow-sidebar border border-white/50 overflow-hidden flex relative z-10 transition-all duration-500">
          
          {/* Left Side (Form) */}
          <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
              <div className="mb-10">
                 <div className="inline-flex items-center gap-3 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-[#1B2436] shadow-xl flex items-center justify-center text-white">
                        <Activity size={24} strokeWidth={3} />
                     </div>
                     <span className="text-2xl font-black text-[#1B2436] tracking-tighter">FitPulse.</span>
                 </div>

                 <h1 className="text-4xl font-black text-[#1B2436] mb-3 tracking-tight">
                    {view === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
                 </h1>
                 <p className="text-slate-400 font-medium">
                    {activeRole === Role.ADMIN && isSecretAdminEntry 
                        ? 'Güvenli yönetici paneli erişimi.' 
                        : 'Lütfen devam etmek için giriş yapınız.'}
                 </p>
              </div>

              {!isSecretAdminEntry && (
                  <div className="bg-slate-50 p-1.5 rounded-[22px] flex mb-8 border border-slate-100">
                     <button 
                        type="button"
                        onClick={() => setActiveRole(Role.MEMBER)}
                        className={`flex-1 py-3 rounded-[18px] text-xs font-black uppercase tracking-wider transition-all duration-500 ${activeRole === Role.MEMBER ? 'bg-white text-[#1B2436] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-[#1B2436]'}`}
                     >
                        Üye Girişi
                     </button>
                     <button 
                        type="button"
                        onClick={() => setActiveRole(Role.ADMIN)}
                        className={`flex-1 py-3 rounded-[18px] text-xs font-black uppercase tracking-wider transition-all duration-500 ${activeRole === Role.ADMIN ? 'bg-white text-[#1B2436] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-[#1B2436]'}`}
                     >
                        Yönetici Girişi
                     </button>
                  </div>
              )}

              {/* Secret Admin Mode Indicator */}
              {isSecretAdminEntry && (
                  <div className="mb-8 p-3 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-100">
                      <Lock size={16}/> Gizli Yönetici Modu Aktif
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                 {view === 'register' && (
                    <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                        <input 
                           type="text" placeholder="Ad Soyad"
                           name="name"
                           autoComplete="name"
                           value={name} onChange={(e) => setName(e.target.value)}
                           required={view === 'register'}
                           className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1B2436] font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                 )}
                 <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">@</span>
                     <input 
                        type="email" placeholder="E-Posta Adresi"
                        name="email"
                        autoComplete="email"
                        required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1B2436] font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                     />
                 </div>
                 <div className="relative">
                     <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                     <input 
                        type="password" placeholder="Şifre"
                        name="password"
                        autoComplete={view === 'login' ? "current-password" : "new-password"}
                        required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1B2436] font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                     />
                 </div>

                 {/* Verification Code for Admin (Login & Register) */}
                 {activeRole === Role.ADMIN && (
                     <div className="relative animate-fadeIn">
                         <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300" size={18}/>
                         <input 
                            type="password" placeholder="Yönetici Doğrulama Kodu"
                            name="verificationCode"
                            autoComplete="off"
                            required
                            value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                         />
                     </div>
                 )}

                 <button type="submit" className="w-full bg-[#1B2436] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 mt-6 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10">
                     {isLoading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        <>
                           <span>{view === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</span>
                           <ArrowRight size={18} />
                        </>
                     )}
                 </button>
              </form>
              
              <div className="mt-6 text-center">
                  {!isSecretAdminEntry ? (
                    <p className="text-xs text-slate-400 font-medium">
                        Hesabınız yok mu? Lütfen salon yönetimi ile iletişime geçin.
                    </p>
                  ) : (
                    <button type="button" onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-xs font-bold text-slate-400 hover:text-[#1B2436] transition-colors">
                        {view === 'login' ? (
                            <span>Yönetici hesabı yok mu? <span className="text-blue-500 font-black">Hesap Oluştur</span></span>
                        ) : (
                            <span>Zaten hesabın var mı? <span className="text-blue-500 font-black">Giriş Yap</span></span>
                        )}
                    </button>
                  )}
              </div>
          </div>

          {/* Right Side (Visual) */}
          <div className="hidden lg:block lg:w-1/2 relative bg-[#1B2436]">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale-[0.5]"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-[#1B2436] via-[#1B2436]/40 to-transparent"></div>
             
             <div className="absolute bottom-16 left-16 right-16 text-white z-20">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-6">
                    <Sparkles size={14} className="text-blue-300 fill-blue-300"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Profesyonel Yönetim</span>
                </div>
                <h2 className="text-5xl font-black leading-tight mb-4 tracking-tighter">
                   Limitleri<br/>Zorlayan Güç.
                </h2>
                <p className="text-slate-300 font-medium leading-relaxed opacity-80 max-w-xs">
                   Yapay zeka ve biyometrik verilerle spor salonunuzu geleceğe taşıyın.
                </p>
             </div>
          </div>

       </div>
    </div>
  );
};

export default Auth;

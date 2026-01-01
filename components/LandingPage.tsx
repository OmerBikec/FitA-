
import React from 'react';
import { Activity, ArrowRight, BrainCircuit, BarChart3, ShieldCheck, Users, Smartphone, Zap, CheckCircle2, Star } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onAdminAccess: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onAdminAccess }) => {
  return (
    <div className="min-h-screen bg-[#F3F6F9] font-sans selection:bg-blue-100 text-[#1B2436]">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#1B2436] flex items-center justify-center text-white shadow-lg">
               <Activity size={20} strokeWidth={3} />
            </div>
            <span className="text-xl font-black text-[#1B2436] tracking-tight">FitPulse.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLoginClick} className="bg-[#1B2436] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-slate-900/10">
              Giriş Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-100 shadow-sm px-4 py-1.5 rounded-full mb-8 animate-fadeIn">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Yapay Zeka Destekli V2.0 Yayında</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#1B2436] leading-[1.1] mb-6 tracking-tight">
            Spor Salonu Yönetimini <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Geleceğe Taşıyın.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            FitPulse, üyeleriniz için kişiselleştirilmiş AI antrenmanları sunarken, işletmeniz için detaylı finansal ve operasyonel analizler sağlar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onLoginClick} className="h-14 px-8 bg-[#1B2436] text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-slate-900/20 group">
                <span>Üye Girişi</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </button>
            <button onClick={onLoginClick} className="h-14 px-8 bg-white text-[#1B2436] border border-slate-200 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-50 transition-colors shadow-sm">
                <span>Yönetici Girişi</span>
            </button>
          </div>

          {/* Hero Image / Dashboard Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
             <div className="relative bg-white rounded-[40px] shadow-2xl border border-slate-100 p-2 md:p-4 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" 
                  alt="Dashboard Preview" 
                  className="rounded-[32px] w-full h-auto object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none rounded-[32px]"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms] hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><BrainCircuit size={20}/></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">AI Analiz</p>
                            <p className="text-sm font-black text-[#1B2436]">%12 Büyüme</p>
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-10 right-10 bg-[#1B2436] text-white p-4 rounded-2xl shadow-xl animate-pulse hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-emerald-400"><Activity size={20}/></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase">Anlık Durum</p>
                            <p className="text-sm font-black">482 Aktif Üye</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-[#1B2436] mb-4">Neden FitPulse?</h2>
                <p className="text-slate-500 font-medium max-w-xl mx-auto">Modern bir spor salonunun ihtiyaç duyduğu tüm araçlar tek bir platformda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: BrainCircuit, title: 'AI Fitness Koçu', desc: 'Üyeleriniz için kişiselleştirilmiş antrenman ve beslenme programlarını saniyeler içinde oluşturun.', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { icon: BarChart3, title: 'Gelişmiş Finansal Raporlar', desc: 'Gelir, gider ve üye devamlılık oranlarını detaylı grafiklerle analiz edin.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { icon: ShieldCheck, title: 'Turnike ve Geçiş Sistemi', desc: 'QR kod ve biyometrik verilerle entegre güvenli giriş çıkış takibi.', color: 'text-blue-500', bg: 'bg-blue-50' },
                    { icon: Users, title: 'Üye CRM Yönetimi', desc: 'Üye profilleri, sağlık geçmişi ve iletişim bilgilerini tek merkezden yönetin.', color: 'text-orange-500', bg: 'bg-orange-50' },
                    { icon: Smartphone, title: 'Mobil Üye Paneli', desc: 'Üyeleriniz kendi gelişimlerini, programlarını ve ödemelerini ceplerinden takip etsin.', color: 'text-pink-500', bg: 'bg-pink-50' },
                    { icon: Zap, title: 'Hızlı Ders Planlama', desc: 'Grup derslerini ve özel antrenman randevularını kolayca organize edin.', color: 'text-yellow-500', bg: 'bg-yellow-50' },
                ].map((feature, i) => (
                    <div key={i} className="p-8 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                            <feature.icon size={28} />
                        </div>
                        <h3 className="text-xl font-black text-[#1B2436] mb-3">{feature.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Pricing / Membership Packages Section */}
      <section className="py-24 bg-[#1B2436] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-6">
                      <Star size={14} className="text-yellow-400 fill-yellow-400 animate-spin-slow"/>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Premium Deneyim</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Sınırları Zorlamaya <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Hazır Mısın?</span></h2>
                  <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
                      FitPulse Gym olarak, 3000 m² ferah antrenman alanı, en son teknoloji Technogym ekipmanları, 
                      yarı olimpik yüzme havuzu ve uzman antrenör kadromuzla size sadece bir spor salonu değil, 
                      yepyeni bir yaşam tarzı sunuyoruz.
                  </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                      { 
                          month: '1 AYLIK', 
                          price: '1.750 ₺', 
                          desc: 'Esnek Başlangıç', 
                          features: ['Fitness Alanı Erişimi', 'Duş ve Dolap Kullanımı', 'Ücretsiz WiFi', 'Mobil Uygulama'],
                          highlight: false
                      },
                      { 
                          month: '3 AYLIK', 
                          price: '4.500 ₺', 
                          desc: 'İstikrarlı Gelişim', 
                          features: ['Tüm Alanlara Erişim', 'Ücretsiz Vücut Analizi', '1 Adet PT Dersi Hediye', 'Grup Dersleri (%50 İndirimli)'],
                          highlight: false
                      },
                      { 
                          month: '6 AYLIK', 
                          price: '8.000 ₺', 
                          desc: 'Güçlü Değişim', 
                          features: ['Tüm Alanlara Sınırsız Erişim', 'Aylık Vücut Analizi', '3 Adet PT Dersi Hediye', 'Tüm Grup Dersleri Ücretsiz'],
                          highlight: false
                      },
                      { 
                          month: '12 AYLIK', 
                          price: '14.000 ₺', 
                          desc: 'Tam Dönüşüm', 
                          features: ['VIP Üyelik Statüsü', 'Sınırsız Misafir Hakkı', 'Özel Diyetisyen Desteği', 'Spa & Havuz Sınırsız Erişim'],
                          highlight: true 
                      }
                  ].map((plan, i) => (
                      <div key={i} className={`relative rounded-[32px] p-8 border backdrop-blur-md flex flex-col transition-all duration-300 group hover:-translate-y-2 ${plan.highlight ? 'bg-gradient-to-b from-blue-600/20 to-emerald-600/20 border-emerald-500/50 shadow-2xl shadow-emerald-500/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          {plan.highlight && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                  En Avantajlı
                              </div>
                          )}
                          
                          <div className="mb-6">
                              <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{plan.month}</h3>
                              <div className="flex items-end gap-1 mb-2">
                                  <span className="text-3xl font-black text-white">{plan.price}</span>
                              </div>
                              <p className={`text-sm font-bold ${plan.highlight ? 'text-emerald-400' : 'text-blue-400'}`}>{plan.desc}</p>
                          </div>

                          <div className="space-y-4 mb-8 flex-1">
                              {plan.features.map((feat, idx) => (
                                  <div key={idx} className="flex items-start gap-3 text-slate-300 text-xs font-medium">
                                      <CheckCircle2 size={16} className={`flex-shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-blue-500'}`}/>
                                      <span className="leading-tight">{feat}</span>
                                  </div>
                              ))}
                          </div>

                          <button onClick={onLoginClick} className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-lg ${plan.highlight ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-white text-[#1B2436] hover:bg-blue-50'}`}>
                              Hemen Başla
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <button 
                  onClick={onAdminAccess}
                  className="flex items-center gap-2 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all"
                  title="Yönetici Hesap Oluştur"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1B2436] flex items-center justify-center text-white group-hover:bg-blue-500 transition-colors">
                   <Activity size={16} strokeWidth={3} />
                </div>
                <span className="text-lg font-black text-[#1B2436]">FitPulse.</span>
              </button>
              <div className="text-slate-400 text-sm font-medium">
                  © 2024 FitPulse Inc. Tüm hakları saklıdır.
              </div>
              <div className="flex gap-6">
                  <a href="#" className="text-slate-400 hover:text-[#1B2436] transition-colors"><Smartphone size={20}/></a>
                  <a href="#" className="text-slate-400 hover:text-[#1B2436] transition-colors"><Users size={20}/></a>
                  <a href="#" className="text-slate-400 hover:text-[#1B2436] transition-colors"><ShieldCheck size={20}/></a>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;

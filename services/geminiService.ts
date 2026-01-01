
import { GoogleGenAI } from "@google/genai";
import { DashboardStats, User, WorkoutPlan, FoodItem } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});.
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIWorkoutPlan = async (user: User): Promise<WorkoutPlan | null> => {
  try {
    const userProfile = `
      Yaş: ${user.age || 'Belirtilmemiş'}
      Boy: ${user.height || 'Belirtilmemiş'} cm
      Kilo: ${user.weight || 'Belirtilmemiş'} kg
      Hedef: ${user.goal || 'Genel Sağlık'}
      Cinsiyet/Durum: Genel üye
    `;

    const prompt = `
      Sen profesyonel bir kişisel antrenörsün (Personal Trainer).
      Aşağıdaki profil bilgilerine sahip üye için "Exercise" veri yapısına uygun, kişiselleştirilmiş tek günlük bir antrenman programı oluştur.
      
      Üye Profili:
      ${userProfile}

      Çıktı KURALLARI:
      1. Sadece SAF JSON formatında cevap ver. Markdown, code block (\`\`\`) veya açıklama metni EKLEME.
      2. JSON şu şemaya tam olarak uymalıdır:
      {
        "title": "Program Başlığı (Örn: Hipertrofi Başlangıç A)",
        "focus": "Odak Bölgesi (Örn: Tüm Vücut veya İtiş)",
        "difficulty": "Başlangıç" | "Orta" | "İleri",
        "exercises": [
          {
            "name": "Hareket Adı",
            "sets": "Set Sayısı (sadece sayı veya aralık)",
            "reps": "Tekrar Sayısı",
            "rest": "Dinlenme Süresi (sn veya dk)"
          }
        ]
      }
      3. En az 4, en fazla 7 hareket ekle.
      4. Hareket isimleri Türkçe olsun.
    `;

    // Use gemini-3-flash-preview for Basic Text Tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const textResponse = response.text || "";
    
    // Temizleme işlemi (Markdown formatından arındırma)
    const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const generatedData = JSON.parse(jsonString);

    // ID ve Tarih ekleyerek döndür
    return {
      id: `ai-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      ...generatedData
    } as WorkoutPlan;

  } catch (error) {
    console.error("Gemini Workout Generation Error:", error);
    return null;
  }
};

export const chatWithAI = async (message: string, history: {role: 'user' | 'model', text: string}[]): Promise<{ text: string, workoutPlan?: WorkoutPlan }> => {
  try {
    // Sohbet geçmişini metne dök
    const historyText = history.map(msg => 
        `${msg.role === 'user' ? 'Kullanıcı' : 'AI Koç'}: ${msg.text}`
    ).join('\n');

    const prompt = `
      Sen "FitPulse" spor salonu uygulamasının yardımcı yapay zeka asistanısın.
      Kullanıcı ile samimi, motive edici ve Türkçe konuş.
      Geçmiş sohbetleri analiz ederek bağlama uygun cevaplar ver.
      
      Sohbet Geçmişi:
      ${historyText}
      
      Son Kullanıcı Mesajı: "${message}"
      
      ÖNEMLİ KURAL:
      Eğer kullanıcı açıkça yeni bir "antrenman programı", "program oluştur", "spor listesi hazırla" gibi bir talepte bulunursa:
      Cevabının içine ŞU FORMATTA gizli bir JSON bloğu ekle (bloğun başına ve sonuna üç tane ters tırnak ve json yazma, sadece saf JSON verisini ||JSON_START|| ve ||JSON_END|| etiketleri arasına koy):
      
      ||JSON_START||
      {
        "title": "Program Adı",
        "focus": "Odak",
        "difficulty": "Orta",
        "exercises": [
           { "name": "Hareket", "sets": "3", "reps": "12", "rest": "60s" }
        ]
      }
      ||JSON_END||
      
      Normal sohbet metnini JSON bloğunun dışına yaz. JSON bloğu sadece program istendiğinde olsun.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const fullText = response.text || "Üzgünüm, şu an cevap veremiyorum.";
    
    // JSON bloğunu ayıkla
    const jsonMatch = fullText.match(/\|\|JSON_START\|\|([\s\S]*?)\|\|JSON_END\|\|/);
    
    let workoutPlan: WorkoutPlan | undefined;
    let displayText = fullText;

    if (jsonMatch && jsonMatch[1]) {
        try {
            const planData = JSON.parse(jsonMatch[1]);
            workoutPlan = {
                id: `ai-chat-${Date.now()}`,
                assignedAt: new Date().toISOString(),
                duration: '45-60 dk',
                ...planData
            };
            // JSON kısmını metinden çıkar
            displayText = fullText.replace(jsonMatch[0], '').trim();
        } catch (e) {
            console.error("JSON Parse Error inside Chat:", e);
        }
    }

    return { text: displayText, workoutPlan };

  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "Bağlantı hatası oluştu." };
  }
};

export const generateNutritionPlan = async (calories: string, info: string): Promise<string> => {
  try {
    const prompt = `
      Sen uzman bir diyetisyensin. Aşağıdaki bilgilere göre bir günlük örnek beslenme planı hazırla.
      
      Günlük Kalori Hedefi: ${calories}
      Tercihler/Bilgiler: ${info}
      
      Çıktıyı HTML formatında (liste, kalın yazı vb. kullanarak) ver. 
      Kahvaltı, Öğle, Akşam ve Ara öğünleri içersin.
      Ayrıca her öğünün yaklaşık makro değerlerini (Protein, Karbonhidrat, Yağ) parantez içinde belirt.
      Motive edici kısa bir not ekle. Türkçe cevap ver.
    `;

    // Use gemini-3-flash-preview for Basic Text Tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Beslenme planı oluşturulamadı.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Beslenme planı servisi şu anda çalışmıyor.";
  }
};

export const analyzeFoodIntake = async (foodText: string): Promise<FoodItem | null> => {
    try {
        const prompt = `
            Kullanıcı şu yemeği yediğini belirtti: "${foodText}"
            
            Bu metni analiz et ve aşağıdaki JSON formatında yaklaşık besin değerlerini döndür.
            Sadece SAF JSON verisi döndür, markdown veya açıklama ekleme.

            Format:
            {
                "name": "Yemeğin kısa, anlaşılır adı (Örn: Tavuklu Salata)",
                "calories": 350 (sadece sayı),
                "protein": 25 (gram cinsinden sadece sayı),
                "carbs": 10 (gram cinsinden sadece sayı),
                "fat": 15 (gram cinsinden sadece sayı)
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        const textResponse = response.text || "";
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        return {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...data
        } as FoodItem;

    } catch (error) {
        console.error("Food Analysis Error:", error);
        return null;
    }
};

export const analyzeBusinessStats = async (stats: DashboardStats): Promise<string> => {
  try {
    const prompt = `
      Sen uzman bir spor salonu işletme danışmanısın. Aşağıdaki günlük verilere dayanarak kısa, vurucu ve motive edici bir iş analizi yap.
      Önerilerde bulun.
      
      Veriler:
      Toplam Üye: ${stats.totalMembers}
      Aylık Ciro: ${stats.monthlyRevenue} TL
      Bugünkü Giriş: ${stats.dailyCheckIns}
      Anlık İçerideki Üye: ${stats.activeNow}
      
      Cevabı Türkçe ver, 2-3 cümlelik bir özet ve 2 maddelik aksiyon planı olsun.
    `;

    // Use gemini-3-flash-preview for Basic Text Tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analiz yapılamadı.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "İş analizi şu anda kullanılamıyor.";
  }
};

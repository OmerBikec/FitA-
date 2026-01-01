
import { GoogleGenAI } from "@google/genai";
import { DashboardStats, User, WorkoutPlan, FoodItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIWorkoutPlan = async (user: User): Promise<WorkoutPlan | null> => {
  try {
    const userProfile = `
      Yaş: ${user.age || 'Belirtilmemiş'}
      Boy: ${user.height || 'Belirtilmemiş'} cm
      Kilo: ${user.weight || 'Belirtilmemiş'} kg
      Hedef: ${user.goal || 'Genel Sağlık'}
    `;

    const prompt = `
      Sen profesyonel bir kişisel antrenörsün.
      Aşağıdaki profil bilgilerine sahip üye için "Exercise" veri yapısına uygun, kişiselleştirilmiş bir antrenman programı oluştur.
      
      Üye Profili:
      ${userProfile}

      Çıktı KURALLARI:
      1. Sadece SAF JSON formatında cevap ver.
      2. JSON şeması: { "title": "...", "focus": "...", "difficulty": "Başlangıç/Orta/İleri", "exercises": [{ "name": "...", "sets": "...", "reps": "...", "rest": "..." }] }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const jsonString = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "";
    const generatedData = JSON.parse(jsonString);

    return {
      id: `ai-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      ...generatedData
    } as WorkoutPlan;
  } catch (error) {
    console.error("Gemini Workout Error:", error);
    return null;
  }
};

export const chatWithAI = async (
  message: string, 
  history: {role: 'user' | 'model', text: string}[],
  foodLog?: FoodItem[]
): Promise<{ text: string, workoutPlan?: WorkoutPlan }> => {
  try {
    const historyText = history.map(msg => `${msg.role === 'user' ? 'Kullanıcı' : 'AI Koç'}: ${msg.text}`).join('\n');
    
    // Beslenme bilgisini bağlama ekle
    const nutritionContext = foodLog && foodLog.length > 0 
      ? `\nKullanıcının bugünkü beslenme günlüğü:\n${foodLog.map(f => `- ${f.name}: ${f.calories} kcal, ${f.protein}g Protein`).join('\n')}`
      : "\nKullanıcı bugün henüz bir şey yemedi.";

    const prompt = `
      Sen FitPulse AI Koçusun. Kullanıcının hem spor hem sağlık asistanısın.
      ${nutritionContext}
      
      Sohbet Geçmişi:
      ${historyText}
      
      Son Mesaj: "${message}"
      
      Kullanıcı beslenme veya protein hakkında soru sorarsa mevcut günlüğüne göre tavsiye ver. 
      Eğer program istiyorsa ||JSON_START|| ... ||JSON_END|| içine programı koy.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const fullText = response.text || "Şu an cevap veremiyorum.";
    const jsonMatch = fullText.match(/\|\|JSON_START\|\|([\s\S]*?)\|\|JSON_END\|\|/);
    
    let workoutPlan: WorkoutPlan | undefined;
    let displayText = fullText;

    if (jsonMatch) {
        try {
            workoutPlan = JSON.parse(jsonMatch[1]);
            displayText = fullText.replace(jsonMatch[0], '').trim();
        } catch (e) {}
    }

    return { text: displayText, workoutPlan };
  } catch (error) {
    return { text: "Bağlantı hatası." };
  }
};

export const analyzeFoodIntake = async (foodText: string): Promise<FoodItem | null> => {
    try {
        const prompt = `
            Kullanıcı yediği yemeği belirtti: "${foodText}"
            Besin değerlerini (Kalori, Protein, Karbonhidrat, Yağ) tahmin et ve JSON olarak döndür.
            Format: { "name": "Yemek Adı", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        const jsonString = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "";
        const data = JSON.parse(jsonString);

        return {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...data
        } as FoodItem;
    } catch (error) {
        return null;
    }
};

export const analyzeBusinessStats = async (stats: DashboardStats): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Spor salonu verilerini analiz et: ${JSON.stringify(stats)}. Kısa özet ve 2 öneri ver.`,
  });
  return response.text || "Analiz hazır değil.";
};

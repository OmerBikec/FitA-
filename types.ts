
export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest?: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  focus: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  duration?: string; // Tahmini süre eklendi
  exercises: Exercise[];
  assignedAt: string;
}

export interface MeasurementLog {
  date: string;
  weight: number;
  bodyFat?: number; // Yüzde olarak
  waist?: number; // cm
  arm?: number; // cm
  chest?: number; // cm
  leg?: number; // cm
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  students: number;
  rating: number;
  img: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Giriş için şifre alanı eklendi
  role: Role;
  avatarUrl?: string;
  joinDate: string;
  membershipType?: 'Gold' | 'Silver' | 'Bronze';
  workoutPlan?: WorkoutPlan; // Aktif ana program
  assignedTemplates?: WorkoutPlan[]; // Eğitmenin önerdiği/gönderdiği alternatif programlar
  
  // Kişisel Bilgiler & Ölçümler
  age?: string;
  height?: string;
  weight?: string;
  goal?: string;
  measurements?: MeasurementLog[]; // Geçmiş ölçüm kayıtları
  
  // Beslenme Logu
  dailyFoodLog?: FoodItem[];
  nutritionGoal?: {
      calories: number;
      protein: number; // gram
      carbs: number; // gram
      fat: number; // gram
  };
}

export interface DashboardStats {
  totalMembers: number;
  monthlyRevenue: number;
  dailyCheckIns: number;
  dailyCheckOuts: number;
  activeNow: number;
}

export enum AppView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  MEMBER_DASHBOARD = 'MEMBER_DASHBOARD'
}

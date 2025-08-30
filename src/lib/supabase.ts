import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          name: string;
          description: string;
          duration: number;
          price: number;
          image: string;
          features: string[];
          level: string;
          instructor: string;
          category: string;
          start_date: string;
          max_students: number;
          enrolled_students: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          duration: number;
          price: number;
          image: string;
          features: string[];
          level?: string;
          instructor: string;
          category: string;
          start_date: string;
          max_students?: number;
          enrolled_students?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          duration?: number;
          price?: number;
          image?: string;
          features?: string[];
          level?: string;
          instructor?: string;
          category?: string;
          start_date?: string;
          max_students?: number;
          enrolled_students?: number;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          course_id: string;
          course_name: string;
          student_name: string;
          student_email: string;
          student_phone: string;
          enrollment_date: string;
          status: string;
          price: number;
          progress: number;
          notes: string;
          experience: string;
          goals: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          course_name: string;
          student_name: string;
          student_email: string;
          student_phone: string;
          enrollment_date?: string;
          status?: string;
          price: number;
          progress?: number;
          notes?: string;
          experience?: string;
          goals?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          course_name?: string;
          student_name?: string;
          student_email?: string;
          student_phone?: string;
          enrollment_date?: string;
          status?: string;
          price?: number;
          progress?: number;
          notes?: string;
          experience?: string;
          goals?: string;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          total_courses: number;
          member_since: string;
          last_activity: string;
          completed_courses: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          total_courses?: number;
          member_since?: string;
          last_activity?: string;
          completed_courses?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          total_courses?: number;
          member_since?: string;
          last_activity?: string;
          completed_courses?: number;
          created_at?: string;
        };
      };
    };
  };
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: number; // in weeks
  price: number;
  image: string;
  features: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  category: string;
  startDate: string;
  maxStudents: number;
  enrolledStudents: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  enrollmentDate: string;
  status: 'enrolled' | 'completed' | 'dropped' | 'pending';
  price: number;
  progress: number; // percentage
  notes?: string;
  experience?: string;
  goals?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalCourses: number;
  memberSince: string;
  lastActivity?: string;
  completedCourses: number;
}

interface AppContextType {
  courses: Course[];
  enrollments: Enrollment[];
  students: Student[];
  loading: boolean;
  addEnrollment: (enrollment: Omit<Enrollment, 'id'>) => Promise<void>;
  updateEnrollment: (id: string, updates: Partial<Enrollment>) => Promise<void>;
  cancelEnrollment: (id: string) => Promise<void>;
  getStudentEnrollments: (email: string) => Enrollment[];
  getCourseById: (id: string) => Course | undefined;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedCourses: Course[] = data.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        price: course.price,
        image: course.image,
        features: course.features,
        level: course.level as 'Beginner' | 'Intermediate' | 'Advanced',
        instructor: course.instructor,
        category: course.category,
        startDate: course.start_date,
        maxStudents: course.max_students,
        enrolledStudents: course.enrolled_students
      }));

      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEnrollments: Enrollment[] = data.map(enrollment => ({
        id: enrollment.id,
        courseId: enrollment.course_id,
        courseName: enrollment.course_name,
        studentName: enrollment.student_name,
        studentEmail: enrollment.student_email,
        studentPhone: enrollment.student_phone,
        enrollmentDate: enrollment.enrollment_date,
        status: enrollment.status as 'enrolled' | 'completed' | 'dropped' | 'pending',
        price: enrollment.price,
        progress: enrollment.progress,
        notes: enrollment.notes,
        experience: enrollment.experience,
        goals: enrollment.goals
      }));

      setEnrollments(formattedEnrollments);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStudents: Student[] = data.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        totalCourses: student.total_courses,
        memberSince: student.member_since,
        lastActivity: student.last_activity,
        completedCourses: student.completed_courses
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([loadCourses(), loadEnrollments(), loadStudents()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEnrollment = async (enrollmentData: Omit<Enrollment, 'id'>) => {
    try {
      // Insert enrollment
      const { data: enrollmentResult, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          course_id: enrollmentData.courseId,
          course_name: enrollmentData.courseName,
          student_name: enrollmentData.studentName,
          student_email: enrollmentData.studentEmail,
          student_phone: enrollmentData.studentPhone,
          enrollment_date: enrollmentData.enrollmentDate,
          status: enrollmentData.status,
          price: enrollmentData.price,
          progress: enrollmentData.progress,
          notes: enrollmentData.notes,
          experience: enrollmentData.experience,
          goals: enrollmentData.goals
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Check if student exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('*')
        .eq('email', enrollmentData.studentEmail)
        .single();

      if (existingStudent) {
        // Update existing student
        await supabase
          .from('students')
          .update({
            total_courses: existingStudent.total_courses + 1,
            last_activity: new Date().toISOString()
          })
          .eq('email', enrollmentData.studentEmail);
      } else {
        // Create new student
        await supabase
          .from('students')
          .insert({
            name: enrollmentData.studentName,
            email: enrollmentData.studentEmail,
            phone: enrollmentData.studentPhone,
            total_courses: 1,
            member_since: new Date().toISOString().split('T')[0],
            last_activity: new Date().toISOString(),
            completed_courses: 0
          });
      }

      // Update course enrolled count
      const course = courses.find(c => c.id === enrollmentData.courseId);
      if (course) {
        await supabase
          .from('courses')
          .update({
            enrolled_students: course.enrolledStudents + 1
          })
          .eq('id', enrollmentData.courseId);
      }

      // Refresh data
      await refreshData();
    } catch (error) {
      console.error('Error adding enrollment:', error);
      throw error;
    }
  };

  const updateEnrollment = async (id: string, updates: Partial<Enrollment>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('enrollments')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // If marking as completed, update student's completed courses count
      if (updates.status === 'completed') {
        const enrollment = enrollments.find(e => e.id === id);
        if (enrollment) {
          const student = students.find(s => s.email === enrollment.studentEmail);
          if (student) {
            await supabase
              .from('students')
              .update({
                completed_courses: student.completedCourses + 1
              })
              .eq('email', enrollment.studentEmail);
          }
        }
      }

      await refreshData();
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  };

  const cancelEnrollment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'dropped' })
        .eq('id', id);

      if (error) throw error;

      await refreshData();
    } catch (error) {
      console.error('Error canceling enrollment:', error);
      throw error;
    }
  };

  const getStudentEnrollments = (email: string) => {
    return enrollments.filter(enr => enr.studentEmail === email);
  };

  const getCourseById = (id: string) => {
    return courses.find(course => course.id === id);
  };

  return (
    <AppContext.Provider value={{
      courses,
      enrollments,
      students,
      loading,
      addEnrollment,
      updateEnrollment,
      cancelEnrollment,
      getStudentEnrollments,
      getCourseById,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};
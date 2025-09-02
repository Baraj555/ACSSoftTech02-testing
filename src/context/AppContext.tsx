import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
    
    if (isSupabaseConfigured()) {
      await Promise.all([loadCourses(), loadEnrollments(), loadStudents()]);
    } else {
      // Load sample data when Supabase is not configured
      loadSampleData();
    }
    
    setLoading(false);
  };

  const loadSampleData = () => {
    // Sample courses data
    const sampleCourses: Course[] = [
      {
        id: '1',
        name: 'Full Stack Web Development',
        description: 'Complete web development bootcamp covering HTML, CSS, JavaScript, React, Node.js, and databases.',
        duration: 12,
        price: 20000,
        image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
        features: ['HTML5 & CSS3', 'JavaScript ES6+', 'React & Redux', 'Node.js & Express', 'SQL', 'Project Portfolio'],
        level: 'Beginner',
        instructor: 'Srikanth',
        category: 'Web Development',
        startDate: '2025-10-15',
        maxStudents: 25,
        enrolledStudents: 18
      },
      {
        id: '2',
        name: 'Data Engineer',
        description: 'Comprehensive Python course from basics to advanced topics including data engineering and automation.',
        duration: 12,
        price: 30000,
        image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
        features: ['Python Fundamentals', 'Data Structures', 'Web Scraping', 'Automation Scripts', 'SQL', 'Big Data Tools', 'Real Projects', 'Databricks', 'Azure Data Factory'],
        level: 'Beginner',
        instructor: 'Venkaiah Naidu',
        category: 'Programming',
        startDate: '2025-09-01',
        maxStudents: 10,
        enrolledStudents: 7
      },
      {
        id: '3',
        name: 'Cloud Computing & DevOps',
        description: 'Learn cloud platforms, containerization, CI/CD, and modern DevOps practices for scalable applications.',
        duration: 12,
        price: 25000,
        image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg',
        features: ['AWS/Azure/GCP', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Infrastructure as Code', 'Monitoring & Logging', 'Security Best Practices'],
        level: 'Advanced',
        instructor: 'VasuDeva',
        category: 'Cloud & DevOps',
        startDate: '2025-09-15',
        maxStudents: 10,
        enrolledStudents: 3
      },
      {
        id: '4',
        name: 'Medical Coding',
        description: 'Ensure accurate healthcare billing, insurance claims, and compliance by translating medical diagnoses and procedures into standardized universal codes.',
        duration: 12,
        price: 30000,
        image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
        features: ['3M CodeFinder / 3M 360 Encompass', 'Optum EncoderPro.com', 'AHIMA CLiNQ', 'Medicode / SuperCoder (AAPC)', 'Find-A-Code'],
        level: 'Intermediate',
        instructor: 'Dr. Ravi Prathap',
        category: 'Medical Coding',
        startDate: '2025-09-15',
        maxStudents: 15,
        enrolledStudents: 12
      }
    ];
    
    setCourses(sampleCourses);
    setEnrollments([]);
    setStudents([]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEnrollment = async (enrollmentData: Omit<Enrollment, 'id'>) => {
    try {
      if (isSupabaseConfigured()) {
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
      } else {
        // Fallback to local storage when Supabase is not configured
        const newEnrollment: Enrollment = {
          ...enrollmentData,
          id: Date.now().toString()
        };
        
        setEnrollments(prev => [...prev, newEnrollment]);
        
        // Update course enrolled count
        setCourses(prev => prev.map(course => 
          course.id === enrollmentData.courseId 
            ? { ...course, enrolledStudents: course.enrolledStudents + 1 }
            : course
        ));
        
        // Add or update student
        const existingStudent = students.find(s => s.email === enrollmentData.studentEmail);
        if (existingStudent) {
          setStudents(prev => prev.map(student =>
            student.email === enrollmentData.studentEmail
              ? { ...student, totalCourses: student.totalCourses + 1, lastActivity: new Date().toISOString() }
              : student
          ));
        } else {
          const newStudent: Student = {
            id: Date.now().toString(),
            name: enrollmentData.studentName,
            email: enrollmentData.studentEmail,
            phone: enrollmentData.studentPhone,
            totalCourses: 1,
            memberSince: new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString(),
            completedCourses: 0
          };
          setStudents(prev => [...prev, newStudent]);
        }
      }
    } catch (error) {
      console.error('Error adding enrollment:', error);
      throw error;
    }
  };

  const updateEnrollment = async (id: string, updates: Partial<Enrollment>) => {
    try {
      if (isSupabaseConfigured()) {
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
      } else {
        // Fallback to local state
        setEnrollments(prev => prev.map(enrollment =>
          enrollment.id === id ? { ...enrollment, ...updates } : enrollment
        ));
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  };

  const cancelEnrollment = async (id: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('enrollments')
          .update({ status: 'dropped' })
          .eq('id', id);

        if (error) throw error;

        await refreshData();
      } else {
        // Fallback to local state
        setEnrollments(prev => prev.map(enrollment =>
          enrollment.id === id ? { ...enrollment, status: 'dropped' } : enrollment
        ));
      }
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
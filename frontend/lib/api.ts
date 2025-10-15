/**
 * API client for communicating with the FastAPI backend.
 * Provides typed functions for all API endpoints.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  grade_level?: string;
  student_id: string;
  created_at: string;
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  grade_level?: string;
  subject?: string;
  curriculum_standards?: any;
  created_at: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  assignment_type: string;
  max_points: number;
  rubric?: any;
  due_date?: string;
  created_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  content: string;
  submitted_at: string;
  score?: number;
  feedback?: string;
  rubric_scores?: any;
  ai_graded: boolean;
  graded_at?: string;
}

export interface LessonPlan {
  id: number;
  course_id: number;
  title: string;
  objectives: string[];
  content: string;
  activities: any[];
  materials: string[];
  duration: number;
  standards_aligned?: string[];
  created_at: string;
}

export interface Quiz {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  time_limit?: number;
  passing_score: number;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  question_type: string;
  options?: string[];
  correct_answer: string;
  points: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  student_id: number;
  answers: any;
  score: number;
  started_at: string;
  completed_at?: string;
}

export interface StudentAnalytics {
  student_id: number;
  student_name: string;
  average_score: number;
  total_submissions: number;
  total_quizzes: number;
  completion_rate: number;
  recent_trend: string;
}

export interface CourseAnalytics {
  course_id: number;
  course_name: string;
  total_students: number;
  average_score: number;
  completion_rate: number;
  assignment_count: number;
}

// API Functions

// Students
export const getStudents = async (): Promise<Student[]> => {
  const response = await api.get('/api/students');
  return response.data;
};

export const getStudent = async (id: number): Promise<Student> => {
  const response = await api.get(`/api/students/${id}`);
  return response.data;
};

export const createStudent = async (student: Omit<Student, 'id' | 'created_at'>): Promise<Student> => {
  const response = await api.post('/api/students', student);
  return response.data;
};

export const getStudentAnalytics = async (id: number): Promise<StudentAnalytics> => {
  const response = await api.get(`/api/students/${id}/analytics`);
  return response.data;
};

// Courses
export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get('/api/courses');
  return response.data;
};

export const getCourse = async (id: number): Promise<Course> => {
  const response = await api.get(`/api/courses/${id}`);
  return response.data;
};

export const createCourse = async (course: Omit<Course, 'id' | 'created_at'>): Promise<Course> => {
  const response = await api.post('/api/courses', course);
  return response.data;
};

export const getCourseAnalytics = async (id: number): Promise<CourseAnalytics> => {
  const response = await api.get(`/api/courses/${id}/analytics`);
  return response.data;
};

// Assignments
export const getAssignments = async (courseId?: number): Promise<Assignment[]> => {
  const url = courseId ? `/api/assignments?course_id=${courseId}` : '/api/assignments';
  const response = await api.get(url);
  return response.data;
};

export const getAssignment = async (id: number): Promise<Assignment> => {
  const response = await api.get(`/api/assignments/${id}`);
  return response.data;
};

export const createAssignment = async (assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> => {
  const response = await api.post('/api/assignments', assignment);
  return response.data;
};

// Submissions
export const submitAssignment = async (submission: {
  assignment_id: number;
  student_id: number;
  content: string;
}): Promise<Submission> => {
  const response = await api.post('/api/assignments/submissions', submission);
  return response.data;
};

export const getSubmission = async (id: number): Promise<Submission> => {
  const response = await api.get(`/api/assignments/submissions/${id}`);
  return response.data;
};

export const getStudentSubmissions = async (studentId: number): Promise<Submission[]> => {
  const response = await api.get(`/api/assignments/submissions/student/${studentId}`);
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId: number): Promise<Submission[]> => {
  const response = await api.get(`/api/assignments/submissions/assignment/${assignmentId}`);
  return response.data;
};

export const generateQuestionsForAssignment = async (assignmentId: number, numQuestions: number = 5): Promise<any> => {
  const response = await api.post(`/api/assignments/${assignmentId}/generate-questions?num_questions=${numQuestions}`);
  return response.data;
};

// Lesson Plans
export const generateLessonPlan = async (request: {
  course_id: number;
  topic: string;
  grade_level: string;
  duration: number;
  learning_objectives?: string[];
}): Promise<LessonPlan> => {
  const response = await api.post('/api/lesson-plans/generate', request);
  return response.data;
};

export const getLessonPlans = async (courseId?: number): Promise<LessonPlan[]> => {
  const url = courseId ? `/api/lesson-plans?course_id=${courseId}` : '/api/lesson-plans';
  const response = await api.get(url);
  return response.data;
};

export const getLessonPlan = async (id: number): Promise<LessonPlan> => {
  const response = await api.get(`/api/lesson-plans/${id}`);
  return response.data;
};

// Quizzes
export const generateQuiz = async (request: {
  course_id: number;
  topic: string;
  num_questions: number;
  difficulty: string;
}): Promise<Quiz> => {
  const response = await api.post('/api/quizzes/generate', request);
  return response.data;
};

export const getQuizzes = async (courseId?: number): Promise<Quiz[]> => {
  const url = courseId ? `/api/quizzes?course_id=${courseId}` : '/api/quizzes';
  const response = await api.get(url);
  return response.data;
};

export const getQuiz = async (id: number): Promise<Quiz> => {
  const response = await api.get(`/api/quizzes/${id}`);
  return response.data;
};

export const submitQuizAttempt = async (attempt: {
  quiz_id: number;
  student_id: number;
  answers: any;
}): Promise<QuizAttempt> => {
  const response = await api.post('/api/quizzes/attempts', attempt);
  return response.data;
};

export const getStudentQuizAttempts = async (studentId: number): Promise<QuizAttempt[]> => {
  const response = await api.get(`/api/quizzes/attempts/student/${studentId}`);
  return response.data;
};

export default api;




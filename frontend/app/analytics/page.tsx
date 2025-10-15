/**
 * Analytics page - Student progress tracking and course analytics.
 */

'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Award, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Card';
import StatCard from '@/components/StatCard';
import { getStudents, getCourses, getStudentAnalytics, getCourseAnalytics, type Student, type Course } from '@/lib/api';
import toast from 'react-hot-toast';
import { getScoreColor, getLetterGrade } from '@/lib/utils';

export default function AnalyticsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'students' | 'courses'>('students');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, coursesData] = await Promise.all([
        getStudents(),
        getCourses(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track student progress and course performance with comprehensive analytics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Courses"
          value={courses.length}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Class Average"
          value="85%"
          icon={Award}
          color="purple"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Completion Rate"
          value="92%"
          icon={TrendingUp}
          color="orange"
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* View Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedView('students')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedView === 'students'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Student Analytics
        </button>
        <button
          onClick={() => setSelectedView('courses')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedView === 'courses'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Course Analytics
        </button>
      </div>

      {/* Content */}
      {selectedView === 'students' ? (
        <StudentAnalyticsView students={students} />
      ) : (
        <CourseAnalyticsView courses={courses} />
      )}
    </div>
  );
}

function StudentAnalyticsView({ students }: { students: Student[] }) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadStudentAnalytics = async (studentId: number) => {
    setLoading(true);
    try {
      const data = await getStudentAnalytics(studentId);
      setAnalytics(data);
      setSelectedStudent(studentId);
    } catch (error) {
      toast.error('Failed to load student analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Select a student to view detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => loadStudentAnalytics(student.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedStudent === student.id
                    ? 'bg-primary-100 text-primary-900'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">
                  {student.first_name} {student.last_name}
                </div>
                <div className="text-sm text-gray-500">{student.student_id}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Details */}
      <div className="lg:col-span-2 space-y-6">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {!loading && !analytics && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Student Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a student from the list to view their analytics.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && analytics && (
          <>
            {/* Performance Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-gray-600">Average Score</div>
                  <div className={`mt-2 text-3xl font-bold ${getScoreColor(analytics.average_score)}`}>
                    {analytics.average_score}%
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Grade: {getLetterGrade(analytics.average_score)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-gray-600">Completion Rate</div>
                  <div className="mt-2 text-3xl font-bold text-primary-600">
                    {analytics.completion_rate}%
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {analytics.total_submissions} submissions
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend and Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Recent Trend</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      analytics.recent_trend === 'improving'
                        ? 'bg-green-100 text-green-800'
                        : analytics.recent_trend === 'declining'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {analytics.recent_trend === 'improving' && '↑ Improving'}
                      {analytics.recent_trend === 'declining' && '↓ Declining'}
                      {analytics.recent_trend === 'stable' && '→ Stable'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Assignments</span>
                    <span className="text-sm text-gray-900">{analytics.total_submissions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Quizzes Taken</span>
                    <span className="text-sm text-gray-900">{analytics.total_quizzes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum Standards Alignment */}
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Standards Progress</CardTitle>
                <CardDescription>Alignment with educational standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <StandardProgressBar
                    standard="CCSS.ELA-LITERACY.RL.9-10.1"
                    description="Cite textual evidence"
                    progress={85}
                  />
                  <StandardProgressBar
                    standard="CCSS.ELA-LITERACY.RL.9-10.2"
                    description="Determine themes or central ideas"
                    progress={78}
                  />
                  <StandardProgressBar
                    standard="CCSS.ELA-LITERACY.W.9-10.1"
                    description="Write arguments to support claims"
                    progress={92}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function CourseAnalyticsView({ courses }: { courses: Course[] }) {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadCourseAnalytics = async (courseId: number) => {
    setLoading(true);
    try {
      const data = await getCourseAnalytics(courseId);
      setAnalytics(data);
      setSelectedCourse(courseId);
    } catch (error) {
      toast.error('Failed to load course analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Select a course to view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => loadCourseAnalytics(course.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCourse === course.id
                    ? 'bg-primary-100 text-primary-900'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{course.name}</div>
                <div className="text-sm text-gray-500">{course.subject}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {!loading && !analytics && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Course Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a course from the list to view analytics.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && analytics && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-gray-600">Class Average</div>
                  <div className={`mt-2 text-3xl font-bold ${getScoreColor(analytics.average_score)}`}>
                    {analytics.average_score}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-gray-600">Enrolled Students</div>
                  <div className="mt-2 text-3xl font-bold text-primary-600">
                    {analytics.total_students}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Assignments</span>
                    <span className="text-sm text-gray-900">{analytics.assignment_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="text-sm text-gray-900">{analytics.completion_rate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StandardProgressBar({ 
  standard, 
  description, 
  progress 
}: { 
  standard: string; 
  description: string; 
  progress: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-sm font-medium text-gray-900">{standard}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
        <span className="text-sm font-semibold text-gray-900">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            progress >= 80 ? 'bg-green-500' : progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}




/**
 * Dashboard homepage - provides overview of the platform.
 */

'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, FileText, TrendingUp, Award, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { getStudents, getCourses, getAssignments } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    averageScore: 85,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [students, courses, assignments] = await Promise.all([
        getStudents(),
        getCourses(),
        getAssignments(),
      ]);

      setStats({
        totalStudents: students.length,
        totalCourses: courses.length,
        totalAssignments: assignments.length,
        averageScore: 85, // Would calculate from actual submissions
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to EduAI Companion - Your AI-powered teaching assistant
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Assignments"
          value={stats.totalAssignments}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={Award}
          color="orange"
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={FileText}
          title="AI-Powered Grading"
          description="Automatically grade essays and assignments with detailed feedback using advanced AI."
          href="/assignments"
          color="blue"
        />
        <FeatureCard
          icon={BookOpen}
          title="Lesson Plans"
          description="Generate personalized, standards-aligned lesson plans in seconds."
          href="/lesson-plans"
          color="green"
        />
        <FeatureCard
          icon={TrendingUp}
          title="Student Analytics"
          description="Track student progress with comprehensive analytics and insights."
          href="/analytics"
          color="purple"
        />
        <FeatureCard
          icon={Award}
          title="Interactive Quizzes"
          description="Create and manage quizzes with automatic grading capabilities."
          href="/quizzes"
          color="orange"
        />
        <FeatureCard
          icon={Clock}
          title="Save Time"
          description="Reduce grading time by up to 80% while providing better feedback."
          href="/assignments"
          color="red"
        />
        <FeatureCard
          icon={Users}
          title="Student Management"
          description="Easily manage student information and track their progress."
          href="/students"
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton href="/students" label="Add Student" />
            <QuickActionButton href="/courses" label="Create Course" />
            <QuickActionButton href="/assignments" label="New Assignment" />
            <QuickActionButton href="/lesson-plans" label="Generate Lesson Plan" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  color 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  href: string; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card hoverable className="cursor-pointer" onClick={() => window.location.href = href}>
      <CardContent className="p-6">
        <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <button
      onClick={() => window.location.href = href}
      className="px-4 py-3 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
    >
      {label}
    </button>
  );
}




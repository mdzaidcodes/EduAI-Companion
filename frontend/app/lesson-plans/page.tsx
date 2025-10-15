/**
 * Lesson Plans page - AI-generated lesson plans.
 */

'use client';

import { useEffect, useState } from 'react';
import { Plus, BookOpen, Sparkles, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Card';
import Button from '@/components/Button';
import { Input, Textarea, Select } from '@/components/Input';
import { getLessonPlans, generateLessonPlan, getCourses, type LessonPlan, type Course } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LessonPlansPage() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, coursesData] = await Promise.all([
        getLessonPlans(),
        getCourses(),
      ]);
      setLessonPlans(plansData);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load lesson plans');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lesson Plans</h1>
          <p className="mt-2 text-gray-600">Generate comprehensive, standards-aligned lesson plans with AI</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)}>
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Lesson Plan
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <Sparkles className="h-6 w-6 text-green-600 mt-1" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Lesson Planning</h3>
            <p className="mt-1 text-sm text-gray-700">
              Create detailed, curriculum-aligned lesson plans in minutes. Each plan includes learning objectives, 
              activities, materials, differentiation strategies, and assessment methods.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonPlans.map((plan) => (
          <LessonPlanCard key={plan.id} plan={plan} courses={courses} />
        ))}
      </div>

      {lessonPlans.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lesson plans found</h3>
          <p className="mt-1 text-sm text-gray-500">Generate your first lesson plan using AI.</p>
          <div className="mt-6">
            <Button onClick={() => setShowGenerateModal(true)}>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Lesson Plan
            </Button>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <GenerateLessonPlanModal
          courses={courses}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => {
            setShowGenerateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function LessonPlanCard({ plan, courses }: { plan: LessonPlan; courses: Course[] }) {
  const course = courses.find(c => c.id === plan.course_id);
  
  return (
    <Card hoverable onClick={() => window.location.href = `/lesson-plans/${plan.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{plan.title}</CardTitle>
            <CardDescription className="mt-1">
              {course?.name || 'Unknown Course'}
            </CardDescription>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {plan.duration} minutes
          </div>
          <div className="text-sm text-gray-600">
            {plan.objectives?.length || 0} Learning Objectives
          </div>
          <div className="text-sm text-gray-600">
            {plan.activities?.length || 0} Activities
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateLessonPlanModal({ 
  courses, 
  onClose, 
  onSuccess 
}: { 
  courses: Course[]; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    course_id: courses[0]?.id || 0,
    topic: '',
    grade_level: '',
    duration: 45,
    learning_objectives: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const objectives = formData.learning_objectives
        .split('\n')
        .filter(obj => obj.trim())
        .map(obj => obj.trim());

      await generateLessonPlan({
        course_id: Number(formData.course_id),
        topic: formData.topic,
        grade_level: formData.grade_level,
        duration: formData.duration,
        learning_objectives: objectives.length > 0 ? objectives : undefined,
      });
      
      toast.success('Lesson plan generated successfully! This may take a moment...');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate lesson plan');
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(c => ({
    value: c.id.toString(),
    label: c.name,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl mx-4 my-8">
        <CardHeader>
          <CardTitle>Generate Lesson Plan with AI</CardTitle>
          <CardDescription>Create a comprehensive lesson plan instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Course"
              required
              options={courseOptions}
              value={formData.course_id.toString()}
              onChange={(e) => setFormData({ ...formData, course_id: Number(e.target.value) })}
            />
            <Input
              label="Topic"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Introduction to Quadratic Equations"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Grade Level"
                required
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                placeholder="e.g., 10th Grade"
              />
              <Input
                label="Duration (minutes)"
                type="number"
                min="30"
                max="180"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
            <Textarea
              label="Learning Objectives (optional)"
              value={formData.learning_objectives}
              onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
              rows={4}
              placeholder="Enter learning objectives, one per line..."
              helperText="Leave blank to have AI generate appropriate objectives"
            />

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button type="submit" loading={loading} fullWidth>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Lesson Plan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




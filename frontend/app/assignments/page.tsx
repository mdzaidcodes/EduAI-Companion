/**
 * Assignments page - AI grading and submission management.
 */

'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Clock, Award, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Card';
import Button from '@/components/Button';
import { Input, Textarea, Select } from '@/components/Input';
import { getAssignments, createAssignment, getCourses, type Assignment, type Course } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, getScoreColor, getLetterGrade } from '@/lib/utils';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, coursesData] = await Promise.all([
        getAssignments(),
        getCourses(),
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load assignments');
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
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-2 text-gray-600">Create assignments and let AI grade them automatically</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* AI Grading Info Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start">
          <Award className="h-6 w-6 text-primary-600 mt-1" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Grading</h3>
            <p className="mt-1 text-sm text-gray-700">
              Submissions are automatically graded using advanced AI with detailed feedback. 
              Save up to 80% of your grading time while providing comprehensive, personalized feedback to students.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} courses={courses} />
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first assignment to get started.</p>
          <div className="mt-6">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Assignment
            </Button>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddAssignmentModal
          courses={courses}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function AssignmentCard({ assignment, courses }: { assignment: Assignment; courses: Course[] }) {
  const course = courses.find(c => c.id === assignment.course_id);
  
  return (
    <Card hoverable onClick={() => window.location.href = `/assignments/${assignment.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription className="mt-1">
              {course?.name || 'Unknown Course'}
            </CardDescription>
          </div>
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {assignment.description || 'No description'}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 capitalize">{assignment.assignment_type}</span>
            <span className="font-semibold text-gray-900">{assignment.max_points} pts</span>
          </div>
          {assignment.due_date && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Due {formatDate(assignment.due_date)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddAssignmentModal({ 
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
    title: '',
    description: '',
    assignment_type: 'essay',
    max_points: 100,
    due_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        course_id: Number(formData.course_id),
        rubric: {
          content: { weight: 0.4, description: 'Content quality and accuracy' },
          organization: { weight: 0.2, description: 'Structure and flow' },
          grammar: { weight: 0.2, description: 'Grammar and mechanics' },
          analysis: { weight: 0.2, description: 'Critical thinking and analysis' },
        },
      };
      
      await createAssignment(submitData);
      toast.success('Assignment created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create assignment');
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
          <CardTitle>Create Assignment</CardTitle>
          <CardDescription>AI will automatically grade submissions</CardDescription>
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
              label="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Character Analysis Essay"
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Assignment instructions..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                required
                options={[
                  { value: 'essay', label: 'Essay' },
                  { value: 'short_answer', label: 'Short Answer (Auto-Questions)' },
                  { value: 'questions', label: 'Question & Answer (Auto-Questions)' },
                  { value: 'problem_solving', label: 'Problem Solving (Auto-Questions)' },
                  { value: 'project', label: 'Project' },
                ]}
                value={formData.assignment_type}
                onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
              />
              <Input
                label="Max Points"
                type="number"
                required
                value={formData.max_points}
                onChange={(e) => setFormData({ ...formData, max_points: Number(e.target.value) })}
              />
            </div>
            
            {['short_answer', 'questions', 'problem_solving'].includes(formData.assignment_type) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900">AI Question Generation</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Questions will be automatically generated based on your title and description.
                      Students submit answer sheets, and AI will intelligently match answers to questions for grading.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Input
              label="Due Date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button type="submit" loading={loading} fullWidth>
                Create Assignment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




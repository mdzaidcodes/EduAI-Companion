/**
 * Quizzes page - AI-generated interactive quizzes.
 */

'use client';

import { useEffect, useState } from 'react';
import { Plus, ListChecks, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Card';
import Button from '@/components/Button';
import { Input, Select } from '@/components/Input';
import { getQuizzes, generateQuiz, getCourses, type Quiz, type Course } from '@/lib/api';
import toast from 'react-hot-toast';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [quizzesData, coursesData] = await Promise.all([
        getQuizzes(),
        getCourses(),
      ]);
      setQuizzes(quizzesData);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load quizzes');
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
          <h1 className="text-3xl font-bold text-gray-900">Interactive Quizzes</h1>
          <p className="mt-2 text-gray-600">Create AI-generated quizzes with automatic grading</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)}>
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Quiz
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start">
          <Sparkles className="h-6 w-6 text-purple-600 mt-1" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Quiz Generation</h3>
            <p className="mt-1 text-sm text-gray-700">
              Generate comprehensive quizzes on any topic in seconds. The AI creates diverse question types 
              with automatic grading, saving you hours of preparation time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} courses={courses} />
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
          <p className="mt-1 text-sm text-gray-500">Generate your first quiz using AI.</p>
          <div className="mt-6">
            <Button onClick={() => setShowGenerateModal(true)}>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Quiz
            </Button>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <GenerateQuizModal
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

function QuizCard({ quiz, courses }: { quiz: Quiz; courses: Course[] }) {
  const course = courses.find(c => c.id === quiz.course_id);
  
  return (
    <Card hoverable onClick={() => window.location.href = `/quizzes/${quiz.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription className="mt-1">
              {course?.name || 'Unknown Course'}
            </CardDescription>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <ListChecks className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{quiz.questions?.length || 0} Questions</span>
            <span className="text-gray-500">{quiz.time_limit} min</span>
          </div>
          <div className="text-sm text-gray-600">
            Passing Score: <span className="font-semibold">{quiz.passing_score}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateQuizModal({ 
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
    num_questions: 10,
    difficulty: 'medium',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await generateQuiz({
        ...formData,
        course_id: Number(formData.course_id),
      });
      toast.success('Quiz generated successfully! This may take a moment...');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(c => ({
    value: c.id.toString(),
    label: c.name,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Generate Quiz with AI</CardTitle>
          <CardDescription>Create a quiz on any topic instantly</CardDescription>
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
              placeholder="e.g., Photosynthesis, The Great Gatsby, World War II"
            />
            <Input
              label="Number of Questions"
              type="number"
              min="5"
              max="30"
              required
              value={formData.num_questions}
              onChange={(e) => setFormData({ ...formData, num_questions: Number(e.target.value) })}
            />
            <Select
              label="Difficulty"
              required
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            />

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button type="submit" loading={loading} fullWidth>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Quiz
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




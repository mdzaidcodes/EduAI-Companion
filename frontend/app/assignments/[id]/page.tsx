/**
 * Assignment detail page with submissions and AI grading.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Sparkles, Clock, FileText, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Card';
import Button from '@/components/Button';
import { Textarea, Select } from '@/components/Input';
import {
  getAssignment,
  getAssignmentSubmissions,
  submitAssignment,
  getStudents,
  generateQuestionsForAssignment,
  type Assignment,
  type Submission,
  type Student,
} from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDateTime, getScoreColor, getLetterGrade } from '@/lib/utils';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = Number(params.id);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  const loadData = async () => {
    try {
      const [assignmentData, submissionsData, studentsData] = await Promise.all([
        getAssignment(assignmentId),
        getAssignmentSubmissions(assignmentId),
        getStudents(),
      ]);
      setAssignment(assignmentData);
      setSubmissions(submissionsData);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to load assignment data');
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

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Assignment not found</h3>
      </div>
    );
  }

  const averageScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.filter(s => s.score).length
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="mt-1 text-gray-600 capitalize">{assignment.assignment_type} • {assignment.max_points} points</p>
        </div>
        <Button onClick={() => setShowSubmitModal(true)}>
          <Upload className="h-5 w-5 mr-2" />
          Submit Work
        </Button>
      </div>

      {/* AI Grading Info */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start">
          <Sparkles className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Grading Enabled</h3>
            <p className="mt-1 text-sm text-gray-700">
              Submissions are automatically graded by AI with detailed feedback. Grading typically takes 30-60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Submissions</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{submissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <p className={`mt-2 text-3xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore > 0 ? `${averageScore.toFixed(1)}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Graded</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {submissions.filter(s => s.score !== null).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {submissions.filter(s => s.score === null).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Description</h4>
                <p className="mt-1 text-gray-600">
                  {assignment.description || 'No description provided'}
                </p>
              </div>
              {assignment.due_date && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Due Date
                  </h4>
                  <p className="mt-1 text-gray-600">{formatDateTime(assignment.due_date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <QuestionsPanel assignment={assignment} onQuestionsGenerated={loadData} />
      </div>

      {/* Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({submissions.length})</CardTitle>
          <CardDescription>Student work and AI feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const student = students.find(s => s.id === submission.student_id);
                return (
                  <SubmissionCard key={submission.id} submission={submission} student={student} />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showSubmitModal && (
        <SubmitAssignmentModal
          assignment={assignment}
          students={students}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function SubmissionCard({ submission, student }: { submission: Submission; student?: Student }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
          </p>
          <p className="text-sm text-gray-500">{formatDateTime(submission.submitted_at)}</p>
        </div>
        {submission.score !== null && submission.score !== undefined ? (
          <div className="text-right">
            <p className={`text-2xl font-bold ${getScoreColor(submission.score)}`}>
              {submission.score.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">{getLetterGrade(submission.score)}</p>
          </div>
        ) : (
          <div className="flex items-center text-yellow-600">
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            <span className="text-sm font-medium">Grading...</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {expanded ? 'Hide Details' : 'View Details'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Submission</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {submission.content}
            </p>
          </div>

          {submission.feedback && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Feedback</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                {submission.feedback}
              </p>
            </div>
          )}

          {submission.rubric_scores && Object.keys(submission.rubric_scores).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Rubric Scores</h4>
              <div className="space-y-2">
                {Object.entries(submission.rubric_scores).map(([criterion, data]: [string, any]) => (
                  <div key={criterion} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">{criterion}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {data.score || 'N/A'}
                      </span>
                    </div>
                    {data.feedback && (
                      <p className="text-xs text-gray-600">{data.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmitAssignmentModal({
  assignment,
  students,
  onClose,
  onSuccess,
}: {
  assignment: Assignment;
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    student_id: students[0]?.id || 0,
    content: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitAssignment({
        assignment_id: assignment.id,
        student_id: Number(formData.student_id),
        content: formData.content,
      });
      toast.success('Submission successful! AI grading in progress...');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const studentOptions = students.map(s => ({
    value: s.id.toString(),
    label: `${s.first_name} ${s.last_name}`,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl mx-4 my-8">
        <CardHeader>
          <CardTitle>Submit Assignment</CardTitle>
          <CardDescription>AI will automatically grade this submission</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Student"
              required
              options={studentOptions}
              value={formData.student_id.toString()}
              onChange={(e) => setFormData({ ...formData, student_id: Number(e.target.value) })}
            />
            
            {assignment.rubric?.grading_type === 'answer_sheet' && assignment.rubric?.questions ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900">Answer Sheet Format</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This assignment has {assignment.rubric.questions.length} questions. 
                      Paste the student's answer sheet below. The AI will automatically match answers to questions and grade them.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Tip: Students can format answers as "Q1: [answer]" or "1. [answer]" or just write answers in order.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            
            <Textarea
              label={assignment.rubric?.grading_type === 'answer_sheet' ? "Answer Sheet" : "Submission Content"}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              placeholder={
                assignment.rubric?.grading_type === 'answer_sheet' 
                  ? "Paste the student's answer sheet here...\n\nExample:\nQ1: [answer to question 1]\nQ2: [answer to question 2]\n..."
                  : "Paste or type the student's work here..."
              }
              helperText={
                assignment.rubric?.grading_type === 'answer_sheet'
                  ? "AI will automatically parse and match answers to questions"
                  : "The AI will analyze this content and provide detailed feedback"
              }
            />

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button type="submit" loading={loading} fullWidth>
                <Sparkles className="h-5 w-5 mr-2" />
                Submit & Grade with AI
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionsPanel({ assignment, onQuestionsGenerated }: { assignment: Assignment; onQuestionsGenerated: () => void }) {
  const [generating, setGenerating] = useState(false);
  const questions = assignment.rubric?.questions || [];
  const hasQuestions = questions.length > 0;

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      await generateQuestionsForAssignment(assignment.id, 5);
      toast.success('Questions generated successfully!');
      onQuestionsGenerated();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assignment Questions</CardTitle>
          {!hasQuestions && (
            <Button size="sm" onClick={handleGenerateQuestions} loading={generating}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasQuestions ? (
          <div className="space-y-4">
            {questions.map((q: any, index: number) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Question {q.question_number || index + 1}
                  </h4>
                  <span className="text-xs text-green-700 font-medium">
                    {q.points || 10} pts
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{q.question_text}</p>
                {q.key_points && q.key_points.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">Key Points:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                      {q.key_points.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Questions:</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Grading Method:</span>
                <span className="font-semibold text-green-600">AI Answer Sheet Parsing</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Questions Yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate questions with AI to enable intelligent answer sheet grading.
            </p>
            <div className="mt-4">
              <Button onClick={handleGenerateQuestions} loading={generating}>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Questions with AI
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


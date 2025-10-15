/**
 * Individual student detail page.
 * Shows student information, submissions, and progress.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Award, TrendingUp, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/Card';
import Button from '@/components/Button';
import { 
  getStudent, 
  getStudentAnalytics, 
  getStudentSubmissions,
  type Student, 
  type StudentAnalytics,
  type Submission
} from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDateTime, getScoreColor, getLetterGrade } from '@/lib/utils';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.id);

  const [student, setStudent] = useState<Student | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      const [studentData, analyticsData, submissionsData] = await Promise.all([
        getStudent(studentId),
        getStudentAnalytics(studentId),
        getStudentSubmissions(studentId),
      ]);
      setStudent(studentData);
      setAnalytics(analyticsData);
      setSubmissions(submissionsData);
    } catch (error) {
      toast.error('Failed to load student data');
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

  if (!student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Student not found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {student.first_name} {student.last_name}
          </h1>
          <p className="mt-1 text-gray-600 flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            {student.email}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className={`mt-2 text-3xl font-bold ${getScoreColor(analytics.average_score)}`}>
                    {analytics.average_score}%
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Grade: {getLetterGrade(analytics.average_score)}
                  </p>
                </div>
                <Award className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submissions</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {analytics.total_submissions}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {analytics.completion_rate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trend</p>
                  <p className={`mt-2 text-lg font-semibold ${
                    analytics.recent_trend === 'improving' ? 'text-green-600' :
                    analytics.recent_trend === 'declining' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {analytics.recent_trend === 'improving' && '↑ Improving'}
                    {analytics.recent_trend === 'declining' && '↓ Declining'}
                    {analytics.recent_trend === 'stable' && '→ Stable'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Curriculum Standards Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Standards Alignment</CardTitle>
          <CardDescription>Progress towards educational standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <StandardProgress
              code="CCSS.ELA-LITERACY.RL.9-10.1"
              name="Cite strong and thorough textual evidence"
              progress={85}
              mastered={true}
            />
            <StandardProgress
              code="CCSS.ELA-LITERACY.RL.9-10.2"
              name="Determine a theme or central idea of a text"
              progress={78}
              mastered={false}
            />
            <StandardProgress
              code="CCSS.ELA-LITERACY.W.9-10.1"
              name="Write arguments to support claims"
              progress={92}
              mastered={true}
            />
            <StandardProgress
              code="CCSS.ELA-LITERACY.W.9-10.2"
              name="Write informative/explanatory texts"
              progress={65}
              mastered={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest graded work</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/assignments/${submission.assignment_id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Assignment #{submission.assignment_id}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(submission.submitted_at)}</p>
                  </div>
                  {submission.score !== null && submission.score !== undefined ? (
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(submission.score)}`}>
                        {submission.score}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {getLetterGrade(submission.score)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Grading...</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StandardProgress({ 
  code, 
  name, 
  progress, 
  mastered 
}: { 
  code: string; 
  name: string; 
  progress: number; 
  mastered: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-gray-900">{code}</p>
            {mastered && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                Mastered
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{name}</p>
        </div>
        <span className="text-lg font-bold text-gray-900">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${
            progress >= 80 ? 'bg-green-500' : progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}




/**
 * Lesson plan detail page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, BookOpen, Target, Package, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import Button from '@/components/Button';
import { getLessonPlan, type LessonPlan } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LessonPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonPlanId = Number(params.id);

  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonPlanId) {
      loadLessonPlan();
    }
  }, [lessonPlanId]);

  const loadLessonPlan = async () => {
    try {
      const data = await getLessonPlan(lessonPlanId);
      setLessonPlan(data);
    } catch (error) {
      toast.error('Failed to load lesson plan');
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

  if (!lessonPlan) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Lesson plan not found</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">{lessonPlan.title}</h1>
          <p className="mt-1 text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {lessonPlan.duration} minutes
          </p>
        </div>
        <Button onClick={() => window.print()}>Print Lesson Plan</Button>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Target className="h-5 w-5 text-primary-600 mr-2" />
            <CardTitle>Learning Objectives</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {lessonPlan.objectives?.map((objective, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Package className="h-5 w-5 text-green-600 mr-2" />
            <CardTitle>Required Materials</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {lessonPlan.materials?.map((material, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{material}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
            <CardTitle>Lesson Activities</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lessonPlan.activities?.map((activity, index) => (
              <div
                key={index}
                className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {activity.duration} min
                  </div>
                </div>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-200 text-purple-800 rounded mb-2 capitalize">
                  {activity.type}
                </span>
                <p className="text-sm text-gray-700 mt-2">{activity.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson Content & Teaching Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {lessonPlan.content && !lessonPlan.content.includes('{') ? (
              <p className="text-gray-700 whitespace-pre-wrap">{lessonPlan.content}</p>
            ) : lessonPlan.content && lessonPlan.content.includes('{') ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800">
                  This lesson plan was generated with an older format. The detailed content is already shown in the sections above.
                </p>
              </div>
            ) : (
              <p className="text-gray-600 italic">
                See detailed teaching notes and strategies in the sections above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Standards */}
      {lessonPlan.standards_aligned && lessonPlan.standards_aligned.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-orange-600 mr-2" />
              <CardTitle>Curriculum Standards Alignment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lessonPlan.standards_aligned.map((standard, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full"
                >
                  {standard}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}




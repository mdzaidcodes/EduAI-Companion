"""
Pydantic schemas for request/response validation.
Defines data structures for API endpoints.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# Student Schemas
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    grade_level: Optional[str] = None
    student_id: str


class StudentCreate(StudentBase):
    pass


class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Course Schemas
class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None
    grade_level: Optional[str] = None
    subject: Optional[str] = None
    curriculum_standards: Optional[Dict[str, Any]] = None


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Assignment Schemas
class AssignmentBase(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    assignment_type: str
    max_points: float = 100.0
    rubric: Optional[Dict[str, Any]] = None
    due_date: Optional[datetime] = None


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentResponse(AssignmentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Submission Schemas
class SubmissionBase(BaseModel):
    assignment_id: int
    student_id: int
    content: str


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionResponse(SubmissionBase):
    id: int
    submitted_at: datetime
    score: Optional[float] = None
    feedback: Optional[str] = None
    rubric_scores: Optional[Dict[str, Any]] = None
    ai_graded: bool
    graded_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Grading Request
class GradeSubmissionRequest(BaseModel):
    submission_id: int


class GradeSubmissionResponse(BaseModel):
    submission_id: int
    score: float
    feedback: str
    rubric_scores: Dict[str, Any]


# Lesson Plan Schemas
class LessonPlanBase(BaseModel):
    course_id: int
    title: str
    objectives: List[str]
    content: str
    activities: List[Dict[str, Any]]
    materials: List[str]
    duration: int
    standards_aligned: Optional[List[str]] = None


class LessonPlanCreate(BaseModel):
    course_id: int
    topic: str
    grade_level: str
    duration: int
    learning_objectives: Optional[List[str]] = None


class LessonPlanResponse(LessonPlanBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Quiz Schemas
class QuizQuestion(BaseModel):
    question: str
    question_type: str  # "multiple_choice", "true_false", "short_answer"
    options: Optional[List[str]] = None
    correct_answer: str
    points: float = 1.0


class QuizBase(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    questions: List[QuizQuestion]
    time_limit: Optional[int] = None
    passing_score: float = 70.0


class QuizCreate(BaseModel):
    course_id: int
    topic: str
    num_questions: int = 10
    difficulty: str = "medium"


class QuizResponse(QuizBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuizAttemptCreate(BaseModel):
    quiz_id: int
    student_id: int
    answers: Dict[int, str]  # question_index: answer


class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    score: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Analytics Schemas
class StudentAnalytics(BaseModel):
    student_id: int
    student_name: str
    average_score: float
    total_submissions: int
    total_quizzes: int
    completion_rate: float
    recent_trend: str  # "improving", "declining", "stable"


class CourseAnalytics(BaseModel):
    course_id: int
    course_name: str
    total_students: int
    average_score: float
    completion_rate: float
    assignment_count: int




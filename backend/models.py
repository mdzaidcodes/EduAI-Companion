"""
Database models for the EduAI Companion platform.
Defines all SQLAlchemy ORM models for students, assignments, grades, etc.
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Student(Base):
    """Student model - stores student information."""
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    grade_level = Column(String(20))  # e.g., "9th Grade", "10th Grade"
    student_id = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    submissions = relationship("Submission", back_populates="student")
    quiz_attempts = relationship("QuizAttempt", back_populates="student")
    progress_records = relationship("StudentProgress", back_populates="student")


class Course(Base):
    """Course model - represents a subject/class."""
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    grade_level = Column(String(20))
    subject = Column(String(100))  # e.g., "Mathematics", "English"
    curriculum_standards = Column(JSON)  # Store standards as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    assignments = relationship("Assignment", back_populates="course")
    lesson_plans = relationship("LessonPlan", back_populates="course")
    quizzes = relationship("Quiz", back_populates="course")


class Assignment(Base):
    """Assignment model - represents homework/essays."""
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    assignment_type = Column(String(50))  # "essay", "short_answer", "project"
    max_points = Column(Float, default=100.0)
    rubric = Column(JSON)  # Grading rubric as JSON
    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")


class Submission(Base):
    """Submission model - student's submitted work."""
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    content = Column(Text, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Grading information
    score = Column(Float)
    feedback = Column(Text)
    rubric_scores = Column(JSON)  # Detailed scoring per rubric criteria
    ai_graded = Column(Boolean, default=True)
    graded_at = Column(DateTime(timezone=True))
    
    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")


class LessonPlan(Base):
    """Lesson plan model - AI-generated lesson plans."""
    __tablename__ = "lesson_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(300), nullable=False)
    objectives = Column(JSON)  # Learning objectives
    content = Column(Text)  # Lesson content
    activities = Column(JSON)  # List of activities
    materials = Column(JSON)  # Required materials
    duration = Column(Integer)  # Duration in minutes
    standards_aligned = Column(JSON)  # Curriculum standards
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="lesson_plans")


class Quiz(Base):
    """Quiz model - interactive quizzes."""
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    questions = Column(JSON)  # Array of question objects
    time_limit = Column(Integer)  # Time limit in minutes
    passing_score = Column(Float, default=70.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz")


class QuizAttempt(Base):
    """Quiz attempt model - tracks student quiz attempts."""
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    answers = Column(JSON)  # Student's answers
    score = Column(Float)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("Student", back_populates="quiz_attempts")


class StudentProgress(Base):
    """Student progress tracking model."""
    __tablename__ = "student_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    metric_name = Column(String(100))  # e.g., "average_score", "completion_rate"
    metric_value = Column(Float)
    period = Column(String(50))  # e.g., "week", "month", "semester"
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    extra_data = Column(JSON)  # Additional context
    
    # Relationships
    student = relationship("Student", back_populates="progress_records")



"""
Student management API routes.
Handles CRUD operations for students.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Student, StudentProgress
from schemas import StudentCreate, StudentResponse, StudentAnalytics
import sqlalchemy as sa

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student."""
    # Check if student ID already exists
    existing = db.query(Student).filter(Student.student_id == student.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    # Check if email already exists
    existing = db.query(Student).filter(Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.get("/", response_model=List[StudentResponse])
def list_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all students with pagination."""
    students = db.query(Student).offset(skip).limit(limit).all()
    return students


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/{student_id}/analytics", response_model=StudentAnalytics)
def get_student_analytics(student_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific student."""
    from models import Submission, QuizAttempt
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate analytics
    submissions = db.query(Submission).filter(
        Submission.student_id == student_id,
        Submission.score.isnot(None)
    ).all()
    
    quiz_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == student_id,
        QuizAttempt.score.isnot(None)
    ).all()
    
    total_submissions = len(submissions)
    total_quizzes = len(quiz_attempts)
    
    # Calculate average score
    all_scores = [s.score for s in submissions] + [q.score for q in quiz_attempts]
    average_score = sum(all_scores) / len(all_scores) if all_scores else 0
    
    # Calculate completion rate (submissions vs total assignments)
    from models import Assignment
    total_assignments = db.query(Assignment).count()
    completion_rate = (total_submissions / total_assignments * 100) if total_assignments > 0 else 0
    
    # Determine trend (simple: last 5 vs previous 5)
    recent_scores = all_scores[-5:] if len(all_scores) >= 5 else all_scores
    previous_scores = all_scores[-10:-5] if len(all_scores) >= 10 else []
    
    if previous_scores and recent_scores:
        recent_avg = sum(recent_scores) / len(recent_scores)
        previous_avg = sum(previous_scores) / len(previous_scores)
        if recent_avg > previous_avg + 5:
            trend = "improving"
        elif recent_avg < previous_avg - 5:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"
    
    return StudentAnalytics(
        student_id=student.id,
        student_name=f"{student.first_name} {student.last_name}",
        average_score=round(average_score, 2),
        total_submissions=total_submissions,
        total_quizzes=total_quizzes,
        completion_rate=round(completion_rate, 2),
        recent_trend=trend
    )


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}




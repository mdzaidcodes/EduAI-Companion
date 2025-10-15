"""
Quiz and quiz attempt management API routes.
Handles quiz creation, taking quizzes, and automatic grading.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import Quiz, QuizAttempt, Course, Student
from schemas import QuizCreate, QuizResponse, QuizAttemptCreate, QuizAttemptResponse
from ollama_service import ollama_service

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])


@router.post("/generate", response_model=QuizResponse)
def generate_quiz(request: QuizCreate, db: Session = Depends(get_db)):
    """Generate a new quiz using AI."""
    # Verify course exists
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    try:
        # Generate quiz questions using Ollama
        questions = ollama_service.generate_quiz(
            topic=request.topic,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
        
        # Create quiz in database
        db_quiz = Quiz(
            course_id=request.course_id,
            title=f"Quiz: {request.topic}",
            description=f"A {request.difficulty} level quiz on {request.topic}",
            questions=questions,
            time_limit=request.num_questions * 2,  # 2 minutes per question
            passing_score=70.0
        )
        
        db.add(db_quiz)
        db.commit()
        db.refresh(db_quiz)
        
        return db_quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")


@router.get("/", response_model=List[QuizResponse])
def list_quizzes(
    course_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all quizzes, optionally filtered by course."""
    query = db.query(Quiz)
    if course_id:
        query = query.filter(Quiz.course_id == course_id)
    
    quizzes = query.offset(skip).limit(limit).all()
    return quizzes


@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get a specific quiz by ID."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.post("/attempts", response_model=QuizAttemptResponse)
def submit_quiz_attempt(attempt: QuizAttemptCreate, db: Session = Depends(get_db)):
    """Submit a quiz attempt and grade it automatically."""
    # Verify quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Verify student exists
    student = db.query(Student).filter(Student.id == attempt.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Grade the quiz
    total_points = 0
    earned_points = 0
    
    questions = quiz.questions
    for idx, question in enumerate(questions):
        total_points += question.get("points", 1.0)
        
        # Get student's answer
        student_answer = attempt.answers.get(str(idx), "").strip().lower()
        correct_answer = question.get("correct_answer", "").strip().lower()
        
        # Check if answer is correct
        if question.get("question_type") in ["multiple_choice", "true_false"]:
            if student_answer == correct_answer:
                earned_points += question.get("points", 1.0)
        else:
            # For short answer, use basic matching (could be enhanced with AI)
            if student_answer and correct_answer and student_answer in correct_answer:
                earned_points += question.get("points", 1.0)
    
    # Calculate percentage score
    score = (earned_points / total_points * 100) if total_points > 0 else 0
    
    # Create quiz attempt
    db_attempt = QuizAttempt(
        quiz_id=attempt.quiz_id,
        student_id=attempt.student_id,
        answers=attempt.answers,
        score=score,
        completed_at=datetime.now()
    )
    
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    
    return db_attempt


@router.get("/attempts/student/{student_id}", response_model=List[QuizAttemptResponse])
def get_student_quiz_attempts(student_id: int, db: Session = Depends(get_db)):
    """Get all quiz attempts for a specific student."""
    attempts = db.query(QuizAttempt).filter(QuizAttempt.student_id == student_id).all()
    return attempts


@router.get("/attempts/quiz/{quiz_id}", response_model=List[QuizAttemptResponse])
def get_quiz_attempts(quiz_id: int, db: Session = Depends(get_db)):
    """Get all attempts for a specific quiz."""
    attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id).all()
    return attempts


@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Delete a quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}




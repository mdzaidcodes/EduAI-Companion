"""
Lesson plan generation API routes.
Handles AI-powered lesson plan creation.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import LessonPlan, Course
from schemas import LessonPlanCreate, LessonPlanResponse
from ollama_service import ollama_service

router = APIRouter(prefix="/api/lesson-plans", tags=["Lesson Plans"])


@router.post("/generate", response_model=LessonPlanResponse)
def generate_lesson_plan(request: LessonPlanCreate, db: Session = Depends(get_db)):
    """Generate a new lesson plan using AI."""
    # Verify course exists
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    try:
        # Generate lesson plan using Ollama
        result = ollama_service.generate_lesson_plan(
            topic=request.topic,
            grade_level=request.grade_level,
            duration=request.duration,
            learning_objectives=request.learning_objectives
        )
        
        # Create lesson plan in database
        db_lesson_plan = LessonPlan(
            course_id=request.course_id,
            title=result.get("title", f"Lesson: {request.topic}"),
            objectives=result.get("objectives", []),
            content=result.get("content", ""),
            activities=result.get("activities", []),
            materials=result.get("materials", []),
            duration=request.duration,
            standards_aligned=result.get("standards_aligned", [])
        )
        
        db.add(db_lesson_plan)
        db.commit()
        db.refresh(db_lesson_plan)
        
        return db_lesson_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating lesson plan: {str(e)}")


@router.get("/", response_model=List[LessonPlanResponse])
def list_lesson_plans(
    course_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all lesson plans, optionally filtered by course."""
    query = db.query(LessonPlan)
    if course_id:
        query = query.filter(LessonPlan.course_id == course_id)
    
    lesson_plans = query.offset(skip).limit(limit).all()
    return lesson_plans


@router.get("/{lesson_plan_id}", response_model=LessonPlanResponse)
def get_lesson_plan(lesson_plan_id: int, db: Session = Depends(get_db)):
    """Get a specific lesson plan by ID."""
    lesson_plan = db.query(LessonPlan).filter(LessonPlan.id == lesson_plan_id).first()
    if not lesson_plan:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    return lesson_plan


@router.delete("/{lesson_plan_id}")
def delete_lesson_plan(lesson_plan_id: int, db: Session = Depends(get_db)):
    """Delete a lesson plan."""
    lesson_plan = db.query(LessonPlan).filter(LessonPlan.id == lesson_plan_id).first()
    if not lesson_plan:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    
    db.delete(lesson_plan)
    db.commit()
    return {"message": "Lesson plan deleted successfully"}




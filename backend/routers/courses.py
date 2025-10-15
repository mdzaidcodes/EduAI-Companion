"""
Course management API routes.
Handles CRUD operations for courses.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Course
from schemas import CourseCreate, CourseResponse, CourseAnalytics

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.post("/", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    """Create a new course."""
    db_course = Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@router.get("/", response_model=List[CourseResponse])
def list_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all courses with pagination."""
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a specific course by ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/analytics", response_model=CourseAnalytics)
def get_course_analytics(course_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific course."""
    from models import Assignment, Submission, Student
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get all assignments for this course
    assignments = db.query(Assignment).filter(Assignment.course_id == course_id).all()
    assignment_count = len(assignments)
    
    # Get all submissions for these assignments
    assignment_ids = [a.id for a in assignments]
    submissions = db.query(Submission).filter(
        Submission.assignment_id.in_(assignment_ids),
        Submission.score.isnot(None)
    ).all()
    
    # Calculate average score
    scores = [s.score for s in submissions]
    average_score = sum(scores) / len(scores) if scores else 0
    
    # Get unique students
    student_ids = set(s.student_id for s in submissions)
    total_students = len(student_ids)
    
    # Calculate completion rate
    expected_submissions = total_students * assignment_count
    completion_rate = (len(submissions) / expected_submissions * 100) if expected_submissions > 0 else 0
    
    return CourseAnalytics(
        course_id=course.id,
        course_name=course.name,
        total_students=total_students,
        average_score=round(average_score, 2),
        completion_rate=round(completion_rate, 2),
        assignment_count=assignment_count
    )


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, course: CourseCreate, db: Session = Depends(get_db)):
    """Update a course."""
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for key, value in course.model_dump().items():
        setattr(db_course, key, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    """Delete a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}




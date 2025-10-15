"""
Assignment and submission management API routes.
Handles assignment creation, submissions, and AI grading.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import Assignment, Submission, Student
from schemas import (
    AssignmentCreate, AssignmentResponse,
    SubmissionCreate, SubmissionResponse,
    GradeSubmissionRequest, GradeSubmissionResponse
)
from ollama_service import ollama_service

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])


@router.post("/", response_model=AssignmentResponse)
def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    """Create a new assignment with auto-generated questions."""
    assignment_data = assignment.model_dump()
    
    # Auto-generate questions if requested
    if assignment_data.get("assignment_type") in ["questions", "short_answer", "problem_solving"]:
        try:
            # Generate questions using AI
            questions = ollama_service.generate_assignment_questions(
                topic=assignment_data["title"],
                description=assignment_data.get("description", ""),
                num_questions=5,  # Default to 5 questions
                question_type=assignment_data["assignment_type"]
            )
            
            # Store questions in the assignment
            assignment_data["rubric"] = {
                "questions": questions,
                "grading_type": "answer_sheet"
            }
            
        except Exception as e:
            # Log error but continue with assignment creation
            print(f"Error generating questions: {str(e)}")
    
    db_assignment = Assignment(**assignment_data)
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.get("/", response_model=List[AssignmentResponse])
def list_assignments(
    course_id: int = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """List all assignments, optionally filtered by course."""
    query = db.query(Assignment)
    if course_id:
        query = query.filter(Assignment.course_id == course_id)
    
    assignments = query.offset(skip).limit(limit).all()
    return assignments


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(assignment_id: int, db: Session = Depends(get_db)):
    """Get a specific assignment by ID."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


@router.post("/{assignment_id}/generate-questions")
def generate_questions_for_assignment(
    assignment_id: int,
    num_questions: int = 5,
    db: Session = Depends(get_db)
):
    """Generate questions for an existing assignment."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    try:
        # Generate questions using AI
        questions = ollama_service.generate_assignment_questions(
            topic=assignment.title,
            description=assignment.description or "",
            num_questions=num_questions,
            question_type=assignment.assignment_type
        )
        
        # Update assignment rubric with questions
        current_rubric = assignment.rubric or {}
        current_rubric["questions"] = questions
        current_rubric["grading_type"] = "answer_sheet"
        assignment.rubric = current_rubric
        
        db.commit()
        db.refresh(assignment)
        
        return {
            "message": "Questions generated successfully",
            "questions": questions,
            "assignment_id": assignment_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")


@router.post("/submissions", response_model=SubmissionResponse)
def submit_assignment(
    submission: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit an assignment for grading."""
    # Verify assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Verify student exists
    student = db.query(Student).filter(Student.id == submission.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Create submission
    db_submission = Submission(**submission.model_dump())
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Grade in background
    background_tasks.add_task(grade_submission_task, db_submission.id, db)
    
    return db_submission


def grade_submission_task(submission_id: int, db: Session):
    """Background task to grade a submission using AI."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        return
    
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        return
    
    try:
        # Check if this is an answer sheet format (with questions)
        rubric = assignment.rubric or {}
        questions = rubric.get("questions", [])
        
        if questions and rubric.get("grading_type") == "answer_sheet":
            # Use intelligent answer sheet parsing and grading
            result = ollama_service.parse_and_grade_answer_sheet(
                answer_sheet=submission.content,
                questions=questions,
                max_points=assignment.max_points
            )
            
            # Calculate score as percentage
            percentage = result.get("percentage", 0)
            score = (percentage / 100) * assignment.max_points
            
            # Build detailed feedback
            feedback_parts = []
            feedback_parts.append(result.get("overall_feedback", ""))
            
            if result.get("strengths"):
                feedback_parts.append("\n\n**Strengths:**")
                for strength in result["strengths"]:
                    feedback_parts.append(f"• {strength}")
            
            if result.get("areas_for_improvement"):
                feedback_parts.append("\n\n**Areas for Improvement:**")
                for area in result["areas_for_improvement"]:
                    feedback_parts.append(f"• {area}")
            
            if result.get("parsed_answers"):
                feedback_parts.append("\n\n**Question-by-Question Feedback:**")
                for ans in result["parsed_answers"]:
                    feedback_parts.append(
                        f"\nQuestion {ans['question_number']}: {ans['score']}/{ans['max_score']} points"
                    )
                    feedback_parts.append(f"  {ans['feedback']}")
            
            feedback = "\n".join(feedback_parts)
            
        else:
            # Use traditional essay grading
            result = ollama_service.grade_essay(
                essay=submission.content,
                rubric=rubric,
                max_points=assignment.max_points
            )
            score = result["score"]
            feedback = result["feedback"]
        
        # Update submission with grading results
        submission.score = score
        submission.feedback = feedback
        submission.rubric_scores = result.get("rubric_scores", {})
        submission.graded_at = datetime.now()
        
        db.commit()
    except Exception as e:
        print(f"Error grading submission {submission_id}: {str(e)}")


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    """Get a specific submission by ID."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.get("/submissions/student/{student_id}", response_model=List[SubmissionResponse])
def get_student_submissions(student_id: int, db: Session = Depends(get_db)):
    """Get all submissions for a specific student."""
    submissions = db.query(Submission).filter(Submission.student_id == student_id).all()
    return submissions


@router.get("/submissions/assignment/{assignment_id}", response_model=List[SubmissionResponse])
def get_assignment_submissions(assignment_id: int, db: Session = Depends(get_db)):
    """Get all submissions for a specific assignment."""
    submissions = db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
    return submissions


@router.post("/grade", response_model=GradeSubmissionResponse)
def grade_submission_manual(request: GradeSubmissionRequest, db: Session = Depends(get_db)):
    """Manually trigger grading for a submission."""
    submission = db.query(Submission).filter(Submission.id == request.submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    try:
        result = ollama_service.grade_essay(
            essay=submission.content,
            rubric=assignment.rubric or {},
            max_points=assignment.max_points
        )
        
        submission.score = result["score"]
        submission.feedback = result["feedback"]
        submission.rubric_scores = result["rubric_scores"]
        submission.graded_at = datetime.now()
        
        db.commit()
        
        return GradeSubmissionResponse(
            submission_id=submission.id,
            score=result["score"],
            feedback=result["feedback"],
            rubric_scores=result["rubric_scores"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error grading submission: {str(e)}")




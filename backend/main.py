"""
Main FastAPI application for EduAI Companion.
Central entry point that configures and runs the API server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import students, courses, assignments, lesson_plans, quizzes
from models import Student, Course, Assignment
from sqlalchemy import inspect
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """
    Initialize database on first run.
    Creates tables if they don't exist and seeds sample data if database is empty.
    """
    try:
        # Check if tables exist
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        if not existing_tables:
            logger.info("No tables found. Initializing database...")
            Base.metadata.create_all(bind=engine)
            logger.info("✓ Database tables created")
            
            # Seed sample data
            seed_sample_data()
        else:
            logger.info(f"Database already initialized with {len(existing_tables)} tables")
            
            # Check if we need to seed data
            db = SessionLocal()
            try:
                student_count = db.query(Student).count()
                if student_count == 0:
                    logger.info("Database is empty. Seeding sample data...")
                    seed_sample_data()
            finally:
                db.close()
                
    except Exception as e:
        logger.error(f"Error during database initialization: {str(e)}")


def seed_sample_data():
    """Seed the database with sample data."""
    db = SessionLocal()
    try:
        # Create sample course
        course = Course(
            name="English Literature 101",
            description="Introduction to English Literature",
            grade_level="10th Grade",
            subject="English",
            curriculum_standards={
                "standards": ["CCSS.ELA-LITERACY.RL.9-10.1", "CCSS.ELA-LITERACY.RL.9-10.2"]
            }
        )
        db.add(course)
        db.commit()
        
        # Create sample students
        students_data = [
            {
                "first_name": "Alice",
                "last_name": "Johnson",
                "email": "alice.johnson@school.edu",
                "grade_level": "10th Grade",
                "student_id": "STU001"
            },
            {
                "first_name": "Bob",
                "last_name": "Smith",
                "email": "bob.smith@school.edu",
                "grade_level": "10th Grade",
                "student_id": "STU002"
            },
            {
                "first_name": "Carol",
                "last_name": "Williams",
                "email": "carol.williams@school.edu",
                "grade_level": "10th Grade",
                "student_id": "STU003"
            }
        ]
        
        for student_data in students_data:
            student = Student(**student_data)
            db.add(student)
        
        db.commit()
        
        # Create sample assignment
        assignment = Assignment(
            course_id=course.id,
            title="Essay: Character Analysis",
            description="Write a 500-word essay analyzing the main character",
            assignment_type="essay",
            max_points=100.0,
            rubric={
                "thesis": {
                    "weight": 0.25,
                    "description": "Clear and compelling thesis statement"
                },
                "evidence": {
                    "weight": 0.25,
                    "description": "Strong textual evidence and examples"
                },
                "analysis": {
                    "weight": 0.30,
                    "description": "Deep analysis and interpretation"
                },
                "organization": {
                    "weight": 0.10,
                    "description": "Logical structure and flow"
                },
                "grammar": {
                    "weight": 0.10,
                    "description": "Grammar, spelling, and mechanics"
                }
            }
        )
        db.add(assignment)
        db.commit()
        
        logger.info("✓ Sample data seeded successfully (3 students, 1 course, 1 assignment)")
        
    except Exception as e:
        logger.error(f"Error seeding data: {str(e)}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for FastAPI.
    Runs on startup and shutdown.
    """
    # Startup: Initialize database
    logger.info("Starting EduAI Companion API...")
    init_database()
    logger.info("API ready to accept requests")
    
    yield
    
    # Shutdown: Cleanup if needed
    logger.info("Shutting down EduAI Companion API...")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="EduAI Companion API",
    description="Teacher Assistant Platform with AI-powered grading and lesson planning",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(assignments.router)
app.include_router(lesson_plans.router)
app.include_router(quizzes.router)


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "message": "EduAI Companion API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "ollama"
    }


# Allow running with: python main.py
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server with python main.py...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )



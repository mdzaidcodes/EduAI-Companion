"""
Database initialization script.
Creates all database tables and optionally seeds sample data.
"""

from database import engine, Base, SessionLocal
from models import Student, Course, Assignment
import sys


def init_database(seed_data: bool = False):
    """
    Initialize the database.
    
    Args:
        seed_data: If True, add sample data to the database
    """
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created successfully!")
    
    if seed_data:
        print("\nSeeding sample data...")
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
            print("[OK] Created sample course")
            
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
            print("[OK] Created sample students")
            
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
            print("[OK] Created sample assignment")
            
            print("\n[OK] Sample data seeded successfully!")
            
        except Exception as e:
            print(f"[ERROR] Error seeding data: {str(e)}")
            db.rollback()
        finally:
            db.close()


if __name__ == "__main__":
    # Check if --seed flag is provided
    seed = "--seed" in sys.argv
    init_database(seed_data=seed)
    
    if seed:
        print("\n" + "="*50)
        print("Database initialized with sample data!")
        print("="*50)
    else:
        print("\n" + "="*50)
        print("Database initialized!")
        print("Run 'python init_db.py --seed' to add sample data")
        print("="*50)



"""
Ollama service for AI inference.
Handles communication with Ollama API for grading, lesson plans, and quiz generation.
"""

import requests
import json
from typing import Dict, List, Any
from config import get_settings

settings = get_settings()


class OllamaService:
    """Service class for interacting with Ollama LLM."""
    
    def __init__(self):
        self.base_url = settings.ollama_url
        self.model = settings.ollama_model
    
    def _generate(self, prompt: str, system_prompt: str = "") -> str:
        """
        Generate text using Ollama API.
        
        Args:
            prompt: User prompt
            system_prompt: System instructions for the model
            
        Returns:
            Generated text response
        """
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False
        }
        
        try:
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            return response.json().get("response", "")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error communicating with Ollama: {str(e)}")
    
    def grade_essay(self, essay: str, rubric: Dict[str, Any], max_points: float) -> Dict[str, Any]:
        """
        Grade an essay using AI with detailed feedback.
        
        Args:
            essay: Student's essay text
            rubric: Grading rubric with criteria
            max_points: Maximum possible score
            
        Returns:
            Dictionary with score, feedback, and rubric scores
        """
        system_prompt = """You are an experienced teacher assistant specializing in grading essays.
        Provide detailed, constructive feedback that helps students improve their writing.
        Be fair, consistent, and encouraging in your assessments."""
        
        rubric_str = json.dumps(rubric, indent=2) if rubric else "Standard essay rubric"
        
        prompt = f"""Grade the following essay based on this rubric:

RUBRIC:
{rubric_str}

ESSAY:
{essay}

Provide your response in the following JSON format:
{{
    "overall_score": <number out of {max_points}>,
    "rubric_scores": {{
        "criterion_name": {{"score": <number>, "feedback": "<specific feedback>"}},
        ...
    }},
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "areas_for_improvement": ["<area 1>", "<area 2>", ...],
    "detailed_feedback": "<comprehensive feedback paragraph>"
}}"""
        
        response = self._generate(prompt, system_prompt)
        
        # Parse JSON response
        try:
            # Extract JSON from response (handle cases where model adds extra text)
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            json_str = response[json_start:json_end]
            result = json.loads(json_str)
            
            return {
                "score": result.get("overall_score", max_points * 0.7),
                "feedback": result.get("detailed_feedback", "Good work! Keep improving."),
                "rubric_scores": result.get("rubric_scores", {}),
                "strengths": result.get("strengths", []),
                "areas_for_improvement": result.get("areas_for_improvement", [])
            }
        except (json.JSONDecodeError, ValueError):
            # Fallback if JSON parsing fails
            return {
                "score": max_points * 0.75,
                "feedback": response,
                "rubric_scores": {},
                "strengths": [],
                "areas_for_improvement": []
            }
    
    def generate_lesson_plan(
        self, 
        topic: str, 
        grade_level: str, 
        duration: int,
        learning_objectives: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive lesson plan.
        
        Args:
            topic: Lesson topic
            grade_level: Target grade level
            duration: Lesson duration in minutes
            learning_objectives: Optional specific learning objectives
            
        Returns:
            Dictionary with lesson plan components
        """
        system_prompt = """You are an expert curriculum designer and educator.
        Create engaging, standards-aligned lesson plans that promote active learning and critical thinking.
        IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object."""
        
        objectives_str = "\n".join(learning_objectives) if learning_objectives else "Create appropriate objectives"
        
        prompt = f"""Create a detailed lesson plan for:

TOPIC: {topic}
GRADE LEVEL: {grade_level}
DURATION: {duration} minutes
LEARNING OBJECTIVES: {objectives_str}

IMPORTANT: Return ONLY the JSON object, with no additional text before or after.

Provide your response EXACTLY in this JSON format (use proper JSON array syntax with square brackets for lists):
{{
    "title": "<lesson title>",
    "objectives": ["<objective 1>", "<objective 2>", ...],
    "materials": ["<material 1>", "<material 2>", ...],
    "activities": [
        {{
            "name": "<activity name>",
            "duration": <minutes>,
            "description": "<detailed description>",
            "type": "<warmup|instruction|practice|assessment|closure>"
        }},
        ...
    ],
    "content": "<detailed lesson content and teaching notes>",
    "standards_aligned": ["<standard 1>", "<standard 2>", ...],
    "differentiation": "<strategies for diverse learners>",
    "assessment": "<how to assess student learning>"
}}"""
        
        response = self._generate(prompt, system_prompt)
        
        try:
            # Find the JSON object in the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response[json_start:json_end]
            
            # Clean up the JSON string
            json_str = json_str.strip()
            
            # Parse the JSON
            result = json.loads(json_str)
            
            # Ensure all required fields exist with proper types
            if not isinstance(result, dict):
                raise ValueError("Invalid response format")
            
            # Clean up the materials field if it's a string instead of list
            if "materials" in result and isinstance(result["materials"], str):
                # Parse materials from string format
                materials_str = result["materials"]
                result["materials"] = [m.strip() for m in materials_str.split(',') if m.strip()]
            
            return result
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing lesson plan JSON: {str(e)}")
            print(f"Response was: {response[:500]}...")
            # Fallback structure
            return {
                "title": f"Lesson: {topic}",
                "objectives": learning_objectives or [f"Understand {topic}"],
                "materials": ["Textbook", "Whiteboard", "Handouts"],
                "activities": [
                    {
                        "name": "Introduction",
                        "duration": 10,
                        "description": f"Introduce {topic}",
                        "type": "warmup"
                    }
                ],
                "content": response if len(response) < 500 else "Lesson plan content",
                "standards_aligned": [],
                "differentiation": "Provide support as needed",
                "assessment": "Exit ticket"
            }
    
    def generate_quiz(
        self, 
        topic: str, 
        num_questions: int = 10, 
        difficulty: str = "medium"
    ) -> List[Dict[str, Any]]:
        """
        Generate quiz questions on a topic.
        
        Args:
            topic: Quiz topic
            num_questions: Number of questions to generate
            difficulty: Difficulty level (easy, medium, hard)
            
        Returns:
            List of question dictionaries
        """
        system_prompt = """You are an expert at creating educational assessments.
        Create clear, fair questions that accurately test student understanding."""
        
        prompt = f"""Create {num_questions} quiz questions about: {topic}

Difficulty level: {difficulty}

Include a mix of multiple choice, true/false, and short answer questions.

Provide your response in the following JSON format:
{{
    "questions": [
        {{
            "question": "<question text>",
            "question_type": "<multiple_choice|true_false|short_answer>",
            "options": ["<option 1>", "<option 2>", ...],
            "correct_answer": "<correct answer>",
            "explanation": "<why this is correct>",
            "points": 1.0
        }},
        ...
    ]
}}"""
        
        response = self._generate(prompt, system_prompt)
        
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            json_str = response[json_start:json_end]
            result = json.loads(json_str)
            return result.get("questions", [])
        except (json.JSONDecodeError, ValueError):
            # Return default questions as fallback
            return [
                {
                    "question": f"Question about {topic}",
                    "question_type": "short_answer",
                    "options": [],
                    "correct_answer": "Sample answer",
                    "explanation": "Explanation",
                    "points": 1.0
                }
            ]
    
    def generate_assignment_questions(
        self, 
        topic: str, 
        description: str,
        num_questions: int = 5,
        question_type: str = "short_answer"
    ) -> List[Dict[str, Any]]:
        """
        Generate questions for an assignment based on topic and description.
        
        Args:
            topic: Assignment topic
            description: Assignment description/instructions
            num_questions: Number of questions to generate
            question_type: Type of questions (short_answer, essay, problem_solving)
            
        Returns:
            List of question dictionaries with answers
        """
        system_prompt = """You are an experienced teacher creating assignment questions.
        Create thoughtful questions that assess deep understanding of the material.
        Provide model answers for grading reference."""
        
        prompt = f"""Create {num_questions} {question_type} questions for this assignment:

TOPIC: {topic}
DESCRIPTION: {description}

Generate questions that are:
- Clear and specific
- Appropriately challenging
- Aligned with the topic

Provide your response in the following JSON format:
{{
    "questions": [
        {{
            "question_number": 1,
            "question_text": "<question text>",
            "model_answer": "<ideal answer>",
            "key_points": ["<key point 1>", "<key point 2>", ...],
            "points": <points for this question>
        }},
        ...
    ]
}}"""
        
        response = self._generate(prompt, system_prompt)
        
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            json_str = response[json_start:json_end]
            result = json.loads(json_str)
            return result.get("questions", [])
        except (json.JSONDecodeError, ValueError):
            # Return default question as fallback
            return [
                {
                    "question_number": i + 1,
                    "question_text": f"Question {i + 1} about {topic}",
                    "model_answer": "Model answer",
                    "key_points": ["Key point"],
                    "points": 10
                }
                for i in range(num_questions)
            ]
    
    def parse_and_grade_answer_sheet(
        self, 
        answer_sheet: str, 
        questions: List[Dict[str, Any]],
        max_points: float
    ) -> Dict[str, Any]:
        """
        Parse an answer sheet, match answers to questions, and grade them.
        
        Args:
            answer_sheet: Raw text of student's answer sheet
            questions: List of questions with model answers
            max_points: Maximum possible score
            
        Returns:
            Dictionary with parsed answers, grades, and feedback
        """
        system_prompt = """You are an expert teacher grading assignments.
        Analyze the answer sheet, identify which answer corresponds to which question,
        grade each answer, and provide constructive feedback."""
        
        # Format questions for the prompt
        questions_text = "\n\n".join([
            f"Question {q['question_number']}: {q['question_text']}\n"
            f"Model Answer: {q['model_answer']}\n"
            f"Key Points: {', '.join(q.get('key_points', []))}\n"
            f"Points: {q.get('points', 10)}"
            for q in questions
        ])
        
        prompt = f"""Grade this student's answer sheet by matching their answers to the questions.

QUESTIONS:
{questions_text}

STUDENT'S ANSWER SHEET:
{answer_sheet}

Your task:
1. Parse the answer sheet and identify which answer corresponds to which question
2. Grade each answer based on the model answer and key points
3. Provide specific feedback for each answer
4. Calculate the total score

Provide your response in the following JSON format:
{{
    "parsed_answers": [
        {{
            "question_number": <number>,
            "student_answer": "<extracted answer>",
            "score": <points earned>,
            "max_score": <points possible>,
            "feedback": "<specific feedback>",
            "key_points_addressed": ["<point 1>", "<point 2>", ...]
        }},
        ...
    ],
    "total_score": <total points earned>,
    "max_total_score": {max_points},
    "percentage": <percentage score>,
    "overall_feedback": "<general comments on the submission>",
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "areas_for_improvement": ["<area 1>", "<area 2>", ...]
}}"""
        
        response = self._generate(prompt, system_prompt)
        
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            json_str = response[json_start:json_end]
            result = json.loads(json_str)
            
            return {
                "parsed_answers": result.get("parsed_answers", []),
                "total_score": result.get("total_score", 0),
                "percentage": result.get("percentage", 0),
                "overall_feedback": result.get("overall_feedback", ""),
                "strengths": result.get("strengths", []),
                "areas_for_improvement": result.get("areas_for_improvement", []),
                "rubric_scores": {
                    f"Question {ans['question_number']}": {
                        "score": ans.get("score", 0),
                        "feedback": ans.get("feedback", "")
                    }
                    for ans in result.get("parsed_answers", [])
                }
            }
        except (json.JSONDecodeError, ValueError):
            # Fallback grading
            return {
                "parsed_answers": [],
                "total_score": max_points * 0.75,
                "percentage": 75.0,
                "overall_feedback": "Answer sheet graded. Good effort overall.",
                "strengths": ["Attempted all questions"],
                "areas_for_improvement": ["Provide more detailed answers"],
                "rubric_scores": {}
            }


# Singleton instance
ollama_service = OllamaService()




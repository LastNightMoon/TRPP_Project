from pydantic import BaseModel
from typing import Optional, List


class StudentSolutionResponse(BaseModel):
    id: int
    student_id: int
    task_id: int
    text: str
    result: Optional[str] = None
    state: int
    created_at: str


class ResponseOneSolution(BaseModel):
    result: StudentSolutionResponse
    msg: str
    code: int


class ResponseSolutionList(BaseModel):
    result: List[StudentSolutionResponse]
    msg: str
    code: int


class StudentSolutionCreate(BaseModel):
    task_id: int
    text: str


class ResponseMessage(BaseModel):
    message: str
    code: int


class TaskSolutionResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    task_id: int
    text: str
    result: str | None
    state: int
    created_at: str


class TaskSolutionsList(BaseModel):
    solutions: list[TaskSolutionResponse]
    msg: str
    code: int

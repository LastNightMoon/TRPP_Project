from tests import *


def test_register_teacher(database_all):
    result = database_all.register_teacher("teacher101", "pass2", "Коваленко Кирилл")
    assert result
    assert result.login == "teacher101"
    assert result.password_hash == "pass2"
    assert result.bio == "Коваленко Кирилл"


def test_get_students_by_teacher(database_all):
    teacher = database_all.register_teacher("teacher2", "pass3", "Коваленко Кирилл")
    student1 = database_all.register_student("s1", "p1", teacher.id)
    student2 = database_all.register_student("s2", "p2", teacher.id)

    students = database_all.get_students_by_teacher(teacher.id)
    assert len(students) == 2
    assert students[0].id in [student1.id, student2.id]
    assert students[1].id in [student1.id, student2.id]


def test_get_teacher_bio(database_all):
    teacher = database_all.register_teacher("bio_teacher", "pass123", "Коваленко Кирилл")
    bio = database_all.get_teacher_bio(teacher.id)
    assert bio == "Коваленко Кирилл"

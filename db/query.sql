SELECT department.department_names AS department, role.title, role.salary, employee.first_name, employee.last_name
FROM employee
LEFT JOIN department
ON employee.department_id = department.id
ORDER BY department.department_names;
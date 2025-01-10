import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';

await connectToDb();

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Delete a department',
        'Delete a role',
        'Delete an employee',
        'Exit'
      ]
    }
  ]);

  switch (action) {
    case 'View all departments':
      return viewAllDepartments();
    case 'View all roles':
      return viewAllRoles();
    case 'View all employees':
      return viewAllEmployees();
    case 'Add a department':
      return addDepartment();
    case 'Add a role':
      return addRole();
    case 'Add an employee':
      return addEmployee();
    case 'Update an employee role':
      return updateEmployeeRole();
    case 'Delete a department':
      return deleteDepartment();
    case 'Delete a role':
      return deleteRole();
    case 'Delete an employee':
      return deleteEmployee();
    case 'Exit':
      pool.end();
      process.exit();
  }
}

async function viewAllDepartments() {
  const res = await pool.query('SELECT * FROM department');
  console.table(res.rows);
  mainMenu();
}

async function viewAllRoles() {
  const res = await pool.query('SELECT * FROM role');
  console.table(res.rows);
  mainMenu();
}

async function viewAllEmployees() {
  const res = await pool.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.names AS department, role.salary, employee.manager_id
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
  `);
  console.table(res.rows);
  mainMenu();
}

async function addDepartment() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the department:'
    }
  ]);
  await pool.query('INSERT INTO department (names) VALUES ($1)', [name]);
  console.log(`Added department ${name}`);
  mainMenu();
}

async function addRole() {
  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the role:'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the role:'
    },
    {
      type: 'input',
      name: 'department_id',
      message: 'Enter the department ID for the role:'
    }
  ]);
  await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
  console.log(`Added role ${title}`);
  mainMenu();
}

async function addEmployee() {
  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter the first name of the employee:'
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter the last name of the employee:'
    },
    {
      type: 'input',
      name: 'role_id',
      message: 'Enter the role ID for the employee:'
    },
    {
      type: 'input',
      name: 'manager_id',
      message: 'Enter the manager ID for the employee (optional):',
      default: null
    }
  ]);

  // Convert empty manager_id to null
  const managerId = manager_id === '' ? null : manager_id;

  await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, managerId]);
  console.log(`Added employee ${first_name} ${last_name}`);
  mainMenu();
}

async function updateEmployeeRole() {
  const { employee_id, new_role_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'employee_id',
      message: 'Enter the ID of the employee you want to update:'
    },
    {
      type: 'input',
      name: 'new_role_id',
      message: 'Enter the new role ID for the employee:'
    }
  ]);

  // Convert new_role_id to integer
  const roleId = parseInt(new_role_id, 10);

  if (isNaN(roleId)) {
    console.log('Invalid role ID. Please enter a valid number.');
    return mainMenu();
  }

  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [roleId, employee_id]);
  console.log(`Updated employee ${employee_id} with new role ${roleId}`);
  mainMenu();
}

async function deleteDepartment() {
  const { id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Enter the ID of the department you want to delete:'
    }
  ]);
  await pool.query('DELETE FROM department WHERE id = $1', [id]);
  console.log(`Deleted department with ID ${id}`);
  mainMenu();
}

async function deleteRole() {
  const { id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Enter the ID of the role you want to delete:'
    }
  ]);
  await pool.query('DELETE FROM role WHERE id = $1', [id]);
  console.log(`Deleted role with ID ${id}`);
  mainMenu();
}

async function deleteEmployee() {
  const { id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Enter the ID of the employee you want to delete:'
    }
  ]);
  await pool.query('DELETE FROM employee WHERE id = $1', [id]);
  console.log(`Deleted employee with ID ${id}`);
  mainMenu();
}

mainMenu();
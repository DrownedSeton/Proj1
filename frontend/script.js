// selectors
const todoInputs = document.querySelector(".todo-inputs");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todos");

// function to add todos
function addTodos(e) {
  e.preventDefault();

  // todoDiv
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");

  // new todo
  const newTodo = document.createElement("li");
  newTodo.classList.add("todo-item");
  newTodo.innerText = todoInputs.value;
  todoDiv.appendChild(newTodo);

  // checked button
  const completedButton = document.createElement("button");
  completedButton.innerHTML = '<i class="fas fa-check"></i>';
  completedButton.classList.add("complete-btn");
  todoDiv.appendChild(completedButton);

  // trash button
  const trashButton = document.createElement("button");
  trashButton.innerHTML = '<i class="fas fa-trash"></i>';
  trashButton.classList.add("trash-btn");
  todoDiv.appendChild(trashButton);

  // append list
  todoList.appendChild(todoDiv);
  todoInputs.value = "";
}

// function to delete or check todos
function deleteCheck(e) {
  const item = e.target;

  // delete todo
  if (item.classList.contains("trash-btn")) {
    const todo = item.parentElement;

    // todo animation
    todo.classList.add("fall");
    todo.addEventListener("transitionend", function () {
      todo.remove();
    });
  }

  // complete todo
  if (item.classList.contains("complete-btn")) {
    const todo = item.parentElement;
    todo.classList.toggle("completed");
  }
}

// function to filter todos
function filterTodo(e) {
  const todos = todoList.childNodes;
  todos.forEach(function (todo) {
    switch (e.target.value) {
      case "all":
        todo.style.display = "flex";
        break;
      case "completed":
        if (todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;
      case "uncompleted":
        if (!todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;
    }
  });
}

// function to retrieve todos from server
function getTodos() {
  // fetch todos from server
  fetch('http://localhost:3000/api/getTasks')
    .then(response => response.json())
    .then(data => {
      data.forEach(todo => {
        // todoDiv
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");

        // create li
        const newTodo = document.createElement("li");
        newTodo.classList.add("todo-item");
        newTodo.innerText = todo;
        todoDiv.appendChild(newTodo);

        // checked button
        const completedButton = document.createElement("button");
        completedButton.innerHTML = '<i class="fas fa-check"></i>';
        completedButton.classList.add("complete-btn");
        todoDiv.appendChild(completedButton);

        // trash button
        const trashButton = document.createElement("button");
        trashButton.innerHTML = '<i class="fas fa-trash"></i>';
        trashButton.classList.add("trash-btn");
        todoDiv.appendChild(trashButton);

        // append list
        todoList.appendChild(todoDiv);
      });
    })
    .catch(error => console.error('Error fetching todos:', error));
}

// function to load tasks
function loadTasks() {
  fetch('http://localhost:3000/api/getTasks')
    .then(response => response.json())
    .then(tasks => {
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = '';
      tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.name;
        taskList.appendChild(li);
      });
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

// function to add a task
function addTask(taskName) {
  fetch('http://localhost:3000/api/CreateTask', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({name: taskName})
  })
  .then(response => response.text())
  .then(message => {
    console.log(message);
    loadTasks(); 
  })
  .catch(error => console.error('Error adding task:', error));
}

// event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Load tasks on page load
  loadTasks();

  // Form submission for adding tasks
  document.getElementById('taskForm').addEventListener('submit', function (event) {
    event.preventDefault(); 
    const taskInput = document.getElementById('taskInput');
    const taskName = taskInput.value.trim();
    if (taskName !== '') {
      addTask(taskName); 
      taskInput.value = ''; 
    }
  });

  // Event listener for filtering todos
  filterOption.addEventListener("click", filterTodo);
});


const fetchTasks = async () => {
    try {
      const response = await fetch('/getTasks', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Передача токена авторизации
        }
      });
      const data = await response.json();
      console.log('Задачи текущего пользователя:', data);
      // Далее обрабатываем полученные задачи на клиенте
    } catch (error) {
      console.error('Ошибка при получении задач:', error);
    }
  };

// Event listeners for todo functionality
document.addEventListener("DOMContentLoaded", getTodos);
todoButton.addEventListener("click", addTodos);
todoList.addEventListener("click", deleteCheck);

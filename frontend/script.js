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

  addTask(newTodo.innerText);
}
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
    loadTasks(); // Перезагружаем список задач после добавления
  })
  .catch(error => console.error('Error adding task:', error));
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

function deleteTask(taskId) {
  return fetch('http://localhost:3000/api/DeleteTasks/:taskId', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: taskId})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Task deleted:', data.message);
  })
  .catch(error => console.error('Error deleting task:', error));
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
/*function loadTasks() {
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
}*/

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

  document.addEventListener('DOMContentLoaded', () => {
    // Обработка формы входа
    document.getElementById('window2').addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        localStorage.setItem('token', data.token); // Сохранение токена в localStorage
        alert('Вы успешно вошли');
      } catch (error) {
        console.error('Ошибка при входе:', error);
        alert('Ошибка при входе');
      }
    });
  
    // Обработка формы регистрации
    document.getElementById('window').addEventListener('submit', async (event) => {
      event.preventDefault();
      const newUsername = document.getElementById('newUsername').value;
      const email = document.getElementById('email').value;
      const newPassword = document.getElementById('newPassword').value;
      const provPassword = document.getElementById('provPassword').value;
      try {
        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email, username: newUsername, password: newPassword })
        });
        if (provPassword != newPassword) {
          alert('Разные пароли.');
          return;
      } else {
          alert('Пользователь успешно зарегистрирован');
      }
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        alert('Ошибка при регистрации');
      }
    });
  });
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const loginButton = document.querySelector('.init');
    const registerButton = document.querySelector('.reg');
    if (token) {
      // Пользователь аутентифицирован, делаем что-то...
      // Например, получаем данные пользователя или показываем защищенные части приложения
      // Вы можете отправить запрос на /profile маршрут для получения данных о пользователе
      // Или просто показать определенные элементы интерфейса, доступные только аутентифицированным пользователям
    } else {
      loginButton.style.display = 'none';
      registerButton.style.display = 'none';
      // Пользователь не аутентифицирован, показываем форму входа и/или регистрации
      // Например:
      //document.getElementById('window2').style.display = 'block';
      //document.getElementById('window').style.display = 'block';
    }
  });

// Event listeners for todo functionality
document.addEventListener("DOMContentLoaded", getTodos);
todoButton.addEventListener("click", addTodos);
todoList.addEventListener("click", deleteCheck);

// затемнение фона 
function show(state)
{
    document.getElementById('window').style.display = state;
    document.getElementById('gray').style.display = state;
}
function show2(state)
{
    document.getElementById('window2').style.display = state;
    document.getElementById('gray1').style.display = state;
}
//смена темы
const toggleLink = document.getElementById('toggleTheme');
const body = document.body;
const wrapper = document.querySelector('.wrapper');

toggleLink.addEventListener('click', function(e) {
    e.preventDefault();
    body.classList.toggle('light-theme');
    wrapper.classList.toggle('light-theme');
});
//смена языка 
document.addEventListener("DOMContentLoaded", function() {
  var languageLink = document.querySelector(".Leng a");
  var currentLanguage = "ru"; 

  languageLink.addEventListener("click", function(event) {
      event.preventDefault();

      
      var allElements = document.querySelectorAll("*");
      allElements.forEach(function(element) {
          if (element.classList.contains('init')) {
              element.querySelector("a").textContent = currentLanguage === "ru" ? "Вход" : "Login";
          } else if (element.classList.contains('reg')) {
              element.querySelector("a").textContent = currentLanguage === "ru" ? "Регистрация" : "Registration";
          } else if (element.classList.contains('theme')) {
              element.querySelector("a").textContent = currentLanguage === "ru" ? "Тема" : "Theme";
          } else if (element.id === 'username' || element.id === 'newUsername') {
              element.placeholder = currentLanguage === "ru" ? "Имя пользователя" : "Username";
          } else if (element.id === 'password' || element.id === 'newPassword') {
              element.placeholder = currentLanguage === "ru" ? "Пароль" : "Password";
          } else if (element.id === 'provPassword') {
              element.placeholder = currentLanguage === "ru" ? "Подтвердите пароль" : "Confirm Password";
          } else if (element.id === 'email') {
              element.placeholder = currentLanguage === "ru" ? "Почта" : "Email";
          } else if (element.type === 'submit') {
              element.value = currentLanguage === "ru" ? "Подтвердить" : "Submit";
          } else if (element.id === 'IN') {
              element.textContent = currentLanguage === "ru" ? "Вход" : "Login";
          } else if (element.tagName === 'H2') {
              element.textContent = currentLanguage === "ru" ? "Регистрация" : "Registration";
          }
      });
      languageLink.textContent = currentLanguage === "ru" ? "Язык" : "Language";
      currentLanguage = currentLanguage === "ru" ? "en" : "ru";
  });
});
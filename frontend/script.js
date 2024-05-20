const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskListinfolder = document.getElementById('taskList');
const editForm = document.querySelector('.edit-form');
const editForm2 = document.querySelector('.edit-form2');
const editForm3 = document.querySelector('.edit-form3');
const editTaskInput = document.getElementById('editTaskInput');
const editFolderInput = document.getElementById('editFolderInput');
const editTaskDescription = document.getElementById('editTaskDescription');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const saveFolderBtn = document.getElementById('saveFolderBtn');
const saveFolderBtnTask = document.getElementById('saveFolderBtnTask');
let currentTaskId = null;
let currentFolderd = null;
const closeFormBtn = document.getElementById('closeFormBtn');
const closeFormBtn2 = document.getElementById('closeFormBtn2');
const closeFormBtn3 = document.getElementById('closeFormBtn3');

//загрузка задач
document.addEventListener('DOMContentLoaded', async () => {
  const taskList = document.getElementById('taskList');

  async function getTasksFromServer() {
      try {
          const response = await fetch('http://localhost:3000/api/getTasks');
          const data = await response.json();
          console.log('Задачи получены:', data);
          return data;
      } catch (error) {
          console.error('Ошибка при получении задач:', error);
      }
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.classList.add('task');

    const title = document.createElement('span');
    title.classList.add('task-title');
    title.textContent = task.title;

    const description = document.createElement('span');
    description.classList.add('task-description');
    description.textContent = task.description;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', async () => {
        await deleteTaskFromServer(task.id);
        li.remove();
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => {
        showEditForm(task.id);
    });

    li.appendChild(title);
    li.appendChild(description);
    li.appendChild(deleteBtn);
    li.appendChild(editBtn);

    return li;
}
  
  async function deleteTaskFromServer(taskId) {
    try {
        const response = await fetch(`http://localhost:3000/api/DeleteTasks/${taskId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        console.log('Задача удалена:', data);
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
    }
  }

  const tasks = await getTasksFromServer();
  tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      taskList.appendChild(taskElement);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const taskList = document.getElementById('taskList');

  function createTaskElement(task) {
      const li = document.createElement('li');
      li.classList.add('task');

      const title = document.createElement('span');
      title.classList.add('task-title');
      title.textContent = task.title;

      const description = document.createElement('span');
      description.classList.add('task-description');
      description.textContent = task.description;

      li.appendChild(title);
      li.appendChild(description);

      return li;
  }

  function addTask(title, description) {
      const task = { title, description };
      const taskElement = createTaskElement(task);
      taskList.appendChild(taskElement);
  }

  const addTaskBtn = document.getElementById('addTaskBtn');
  addTaskBtn.addEventListener('click', () => {
      const taskInput = document.getElementById('taskInput');
      const editTaskDescription = document.getElementById('editTaskDescription');
      addTask(taskInput.value, editTaskDescription.value);
      taskInput.value = '';
      editTaskDescription.value = '';
      location.reload();
  });

});

// Функция для добавления задачи на сервер
async function addTaskToServer(title, description, status) {
  try {
      const response = await fetch('http://localhost:3000/api/CreateTask', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ title, description, status }),
      });
      const data = await response.json();
      console.log('Задача создана:', data);
      return data;
  } catch (error) {
      console.error('Ошибка при создании задачи:', error);
  }
}
addTaskBtn.addEventListener('click', async () => {
  const taskName = taskInput.value.trim();
  if (taskName) {
      const newTask = await addTaskToServer(taskName, '', 'new'); 
      const li = document.createElement('li');
      li.textContent = newTask.title;
      taskList.appendChild(li);
      taskInput.value = '';
  }
});

function showEditForm(taskId) {
  currentTaskId = taskId;
  editForm.style.display = 'block';
}

saveTaskBtn.addEventListener('click', () => {
  const newTaskName = editTaskInput.value.trim();
  const newTaskDescription = editTaskDescription.value.trim();
  console.log('Значение taskId:', currentTaskId); 
  if (newTaskName && currentTaskId) {
    updateTaskOnServer(currentTaskId, newTaskName, newTaskDescription, 'in progress')
          .then(() => {
              taskList.childNodes.forEach(node => {
                  if (node.textContent === currentTaskId) {
                      node.textContent = newTaskName;
                  }
              });
              closeEditForm();
              location.reload();
          }); 
  }
});

// Функция для обновления задачи на сервере
async function updateTaskOnServer(taskId, title, description, status) {
  try {
      const response = await fetch(`http://localhost:3000/api/UpdateTasks/${taskId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description, status }),
      });
      const data = await response.json();
      console.log('Задача обновлена:', data);
      return data;
  } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
  }
}

function closeEditForm() {
  editForm.style.display = 'none';
  editTaskInput.value = '';
  editTaskDescription.value = '';
  currentTaskId = null;
}



const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/getTasks', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log('Задачи текущего пользователя:', data);
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
        localStorage.setItem('token', data.token); 
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
      // Пользователь аутентифицирован
    } else {
      loginButton.style.display = 'none';
      registerButton.style.display = 'none';
      // Пользователь не аутентифицирован
    }
  });
  
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
const theme = localStorage.getItem('theme'); 

if (theme) {
    body.classList.add(theme);
    wrapper.classList.add(theme);
}

toggleLink.addEventListener('click', function(e) {
    e.preventDefault();
    body.classList.toggle('light-theme');
    wrapper.classList.toggle('light-theme');

    if (body.classList.contains('light-theme')) {
        localStorage.setItem('theme', 'light-theme');
    } else {
        localStorage.removeItem('theme');
    }
});
//смена языка 
document.addEventListener("DOMContentLoaded", function() {
  var languageLink = document.querySelector(".Leng a");
  var currentLanguage = localStorage.getItem('language') || "ru"; 

  function updateTextContent(language) {
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
      } else if (element.id === 'taskInput') {
        element.placeholder = language === "ru" ? "Название задачи" : "Task Name";
      }else if (element.id === 'editTaskInput') {
        element.placeholder = language === "ru" ? "Новое название" : "New Name";
      }else if (element.id === 'editTaskDescription') {
        element.placeholder = language === "ru" ? "Описание" : "Description";
      }else if (element.id === 'editFolderInput') {
        element.placeholder = language === "ru" ? "Новое название" : "New Name";
      }else if (element.id === 'folderInput') {
        element.placeholder = language === "ru" ? "Название папки" : "Folder Name";
      }
      else if (element.id === 'addTaskFolderInput') {
        element.placeholder = language === "ru" ? "Название задачи" : "Task Name";
      }
      
  });
    languageLink.textContent = language === "ru" ? "Язык" : "Language";
  }

  updateTextContent(currentLanguage);

  languageLink.addEventListener("click", function(event) {
      event.preventDefault();
      currentLanguage = currentLanguage === "ru" ? "en" : "ru";
      updateTextContent(currentLanguage);
      localStorage.setItem('language', currentLanguage);
  });
});
document.getElementById('closeFormBtn').addEventListener('click', function() {
  document.querySelector('.edit-form').style.display = 'none';
  document.body.style.overflow = 'auto';
});

document.getElementById('closeFormBtn2').addEventListener('click', function() {
  document.querySelector('.edit-form2').style.display = 'none';
  document.body.style.overflow = 'auto';
});
document.getElementById('closeFormBtn3').addEventListener('click', function() {
  document.querySelector('.edit-form3').style.display = 'none';
  document.body.style.overflow = 'auto';
});

const addFolderBtn = document.getElementById('addFolderBtn');
const foldersContainer = document.getElementById('foldersContainer');

addFolderBtn.addEventListener('click', async () => {
  const folderInput = document.getElementById('folderInput');
  const folderName = folderInput.value.trim();
  if (folderName) {
    await addFolderToServer(folderName);
    const li = document.createElement('li');
    li.textContent = folderName;
    foldersContainer.appendChild(li);
    folderInput.value = '';
    location.reload();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const folderList = document.getElementById('taskList');

  async function getFoldersFromServer() {
    try {
      const response = await fetch('http://localhost:3000/api/getFolders');
      const data = await response.json();
      console.log('Папки получены:', data);
      return data;
    } catch (error) {
      console.error('Ошибка при получении папок:', error);
    }
  }

  function createFolderElement(folder) {
    const li = document.createElement('li');
    li.classList.add('folder');

    const title = document.createElement('span');
    title.classList.add('folder-title');
    title.textContent = '📁'+ folder.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', async () => {
      await deleteFolderFromServer(folder.id);
      li.remove();
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => {
      showEditForm2(folder.id);
    });

    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => {
      showEditForm3(folder.id);
    });

    li.appendChild(title);
    li.appendChild(deleteBtn);
    li.appendChild(editBtn);
    li.appendChild(addBtn);

    return li;
  }

  function showEditForm3(taskId) {
    currentTaskId = taskId;
    editForm3.style.display = 'block';
  }

  function showEditForm2(folderId) {
    currentFolderId = folderId;
    editForm2.style.display = 'block';
  }

  saveFolderBtn.addEventListener('click', () => {
    const newFolderName = editFolderInput.value.trim();
    console.log('Значение FolderId:', currentFolderId); 
    if (newFolderName && currentFolderId) {
      updateTaskOnServer(currentFolderId, newFolderName)
            .then(() => {
                taskList.childNodes.forEach(node => {
                    if (node.textContent === currentFolderId) {
                        node.textContent = newFolderName;
                    }
                });
                closeEditForm2();
                location.reload();
            }); 
    }
  });

  async function displayFolders() {
    const folders = await getFoldersFromServer();
    folders.forEach(folder => {
      const folderElement = createFolderElement(folder);
      folderList.appendChild(folderElement);
    });
  }
  displayFolders();
});

async function addFolderToServer(folderName) {
  try {
    const response = await fetch('http://localhost:3000/api/CreateFolder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ name: folderName }),
    });
    const data = await response.json();
    console.log('Folder created:', data);
    return data;
  } catch (error) {
    console.error('Error creating folder:', error);
  }
}

saveFolderBtn.addEventListener('click', async () => {
  const folderId = currentFolderId; 
  const name = document.getElementById('editFolderInput').value;
  const parent = 1;

  try {
    const response = await updateFolderOnServer(folderId, name, parent);
    console.log('Folder updated:', response);
  } catch (error) {
    console.error('Error updating folder:', error);
  }
});

async function updateFolderOnServer(folderId, name, parent) {
  try {
    const response = await fetch(`http://localhost:3000/api/UpdateFolders/${folderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, parent }),
    });
    const data = await response.json();
    console.log('Folder updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating folder:', error);
  }
}

function closeEditForm2() {
  editForm2.style.display = 'none';
  editFolderInput.value = '';
  currentFolderId = null;
}


async function deleteFolderFromServer(folderId) {
  try {
    const response = await fetch(`http://localhost:3000/api/DeleteFolder/${folderId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    console.log('Folder deleted:', data);
  } catch (error) {
    console.error('Error deleting folder:', error);
  }
}

foldersContainer.addEventListener('click', async (event) => {
  if (event.target.tagName === 'LI') {
    const folderId = event.target.textContent;
    await deleteFolderFromServer(folderId);
    event.target.remove();
  }
});

async function addTaskToFolder(taskId, folderId) {
  try {
    const response = await fetch(`http://localhost:3000/api/AddTaskToFolder/${taskId}/${folderId}`, {
      method: 'PUT'
    });
    if (!response.ok) {
      throw new Error('Failed to add task to folder');
    }
    const data = await response.json();
    console.log('Task added to folder:', data);
    return data;
  } catch (error) {
    console.error('Error adding task to folder:', error);
    throw error;
  }
}

taskList.addEventListener('click', async (event) => {
  if (event.target.tagName === 'LI') {
    const taskId = event.target.textContent;
    const folderId = event.target.parentElement.id;}})


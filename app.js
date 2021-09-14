'use strict';

// function GENERATE uuid
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let tasks = [];
let allDoneTasks = [];
let removeId = '';

// DOM
const todoContainer = document.querySelector('.task-container');
const todoDoneContainer = document.querySelector('.task-done-container');
const form = document.forms['addTask'];
const input = form.elements['title'];
const progressBar = document.querySelector('.progress-bar');
const completeValues = document.querySelector('.complete');
const AllValues = document.querySelector('.incomplete');
const percentage = document.querySelector('.percentage');
const showMoreBtn = document.querySelector('.show-more');
const dontHaveTasks = document.querySelector('.dont-have-tasks');
const allDoneText = document.querySelector('.all-done-text');
const allDoneTextIcon = document.querySelector('.all-done-text-icon');

//modal
const modalDelete = document.querySelector('.modal-delete');
const modalDeleteContent = document.querySelector('.modal-delete-content');
const modalDeleteText = document.querySelector('.modal-delete-text');
const modalBtnYes = document.querySelector('.yes');
const modalBtnNo = document.querySelector('.no');
let offset = 5;

// Event
form.addEventListener('submit', formSubmitHandler);
modalBtnNo.addEventListener('click', () => {
  modalDelete.style.display = 'none';
  modalDeleteText.innerHTML = '';
});
showMoreBtn.addEventListener('click', () => EventAddBtnShowMore());
document.addEventListener('DOMContentLoaded', () => {
  let parsedTasks = JSON.parse(atob(location.hash.substring(1)));
  if (parsedTasks.tasks) {
    tasks = parsedTasks.tasks;
    tasks.forEach((task) => renderTask(task, todoContainer));
  }
  if (parsedTasks.allDoneTasks) {
    allDoneTasks = parsedTasks.allDoneTasks;
    allDoneTasks.forEach((doneTask, index) => {
      if (index < offset) {
        renderTask(doneTask, todoDoneContainer);
      }
    });
    if (parsedTasks.allDoneTasks.length >= offset) addBtnShowMore();
  }
});

function renderTask(
  { id, title, isDone } = {},
  whereGenerateTask,
  doDoneTask = true
) {
  let titleText = title;
  const taskGeneratePlace = doDoneTask ? whereGenerateTask : todoContainer;
  const generatedElem = generateTaskTemplate(
    id,
    titleText,
    isDone,
    taskGeneratePlace
  );
  const doneBtn = document.querySelector(`button.btn-done[data-id="${id}"]`);
  const taskTitle = document.querySelector(`span.task-title[data-id="${id}"]`);
  const deleteBtn = document.querySelector(
    `button.delete-task[data-id="${id}"]`
  );

  //addEventListeners

  doneBtn.addEventListener('click', () => {
    deleteTask(id, isDone, generatedElem, taskGeneratePlace);
    taskTitle.classList.add('hide');
    changeStatusDone(id, titleText, isDone);
  });
  taskTitle.addEventListener(
    'dblclick',
    () => (taskTitle.contentEditable = 'true')
  );
  taskTitle.addEventListener('keydown', (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
      taskTitle.contentEditable = 'false';
    }
    updateTitle(e.target.innerText, id);

    titleText = e.target.innerText;
  });
  deleteBtn.addEventListener('click', () => {
    removeId = id;
    generateDeleteModal(title);
    modalBtnYes.addEventListener(
      'click',
      () => {
        deleteTask(removeId, isDone, generatedElem, taskGeneratePlace);
        modalDeleteText.innerHTML = '';
      },
      { once: true }
    );
  });

  // style for done tasks
  if (isDone) {
    taskTitle.classList.add('line');
    doneBtn.style.background = '#7fffd4';
    doneBtn.style.border = '1px solid #6cdcb6';
  }

  removeId = null;

  // ProgressBar
  progressBarFunc();

  // hashed
  allToHash();
}

function progressBarFunc() {
  let allNums = tasks.length + allDoneTasks.length;
  let completedNums = allDoneTasks.length;
  if (allNums) {
    progressBar.classList.remove('hide');
    AllValues.textContent = allNums;
    completeValues.textContent = completedNums;
    if (completedNums) {
      percentage.textContent = Math.floor((completedNums * 100) / allNums);
    } else {
      percentage.textContent = 0;
    }
  } else {
    progressBar.classList.add('hide');
  }

  // percentage COLOR
  let percentNum = +percentage.textContent;

  if (percentNum > 0 && percentNum < 50) {
    percentage.classList.add('red');
  } else {
    percentage.classList.remove('red');
  }
  if (percentNum >= 50 && percentNum < 100) {
    percentage.classList.add('yellow');
  } else {
    percentage.classList.remove('yellow');
  }
  if (percentNum === 100) {
    percentage.classList.add('green');
  } else {
    percentage.classList.remove('green');
  }

  percentage.textContent = percentNum + '%';

  // All done text
  if (allNums === completedNums && allNums !== 0) {
    allDoneText.classList.remove('hide');
    allDoneTextIcon.classList.remove('hide');
  } else {
    allDoneText.classList.add('hide');
    allDoneTextIcon.classList.add('hide');
  }

  // You don't have tasks to do TEXT
  if (allNums !== 0) {
    dontHaveTasks.classList.add('hide');
  } else {
    dontHaveTasks.classList.remove('hide');
  }
}

function generateTaskTemplate(id, title, isDone, taskPlace) {
  const element = document.createElement('div');
  element.classList.add('task');

  element.insertAdjacentHTML(
    'beforeend',
    `
        <button class="btn-done" data-id="${id}" data-is-done="${isDone}"></button>
          <span class="task-title" data-id="${id}"  contenteditable="false">${title}</span>
          <button class="delete-task" data-id="${id}">🗑</button>
      `
  );
  taskPlace.insertAdjacentElement('beforeend', element);

  return element;
}

function formSubmitHandler(e) {
  e.preventDefault();
  const titleValue = input.value;

  if (titleValue.trim()) {
    const task = {
      title: titleValue,
      id: uuid(),
      isDone: false,
    };
    tasks.push(task);
    renderTask(task, todoContainer);
    form.reset();
  } else {
    return;
  }
}

function changeStatusDone(id, title, isDone) {
  const doneTask = {
    title: title,
    id: id,
    isDone: !isDone,
  };
  if (!isDone) {
    modalDelete.style.display = 'none';
    allDoneTasks.push(doneTask);
    addBtnShowMore();
    if (allDoneTasks.length <= offset) {
      renderTask(doneTask, todoDoneContainer);
    }
  } else {
    tasks.push(doneTask);
    renderTask(doneTask, todoDoneContainer, false);
    addBtnShowMore();
  }

  allToHash();
}

function EventAddBtnShowMore() {
  allDoneTasks.slice(offset, offset + 5).forEach((task) => {
    renderTask(task, todoDoneContainer);
  });
  offset += 5;
  if (offset >= allDoneTasks.length) {
    showMoreBtn.style.display = 'none';
  }
}

function addBtnShowMore() {
  if (allDoneTasks.length > offset) {
    showMoreBtn.style.display = 'block';
  } else {
    showMoreBtn.style.display = 'none';
  }
}

function deleteTask(id, isDone, elem, whereDeleteTask) {
  if (!isDone) {
    tasks = tasks.filter((t) => t.id !== id);
    whereDeleteTask.removeChild(elem);
  } else {
    allDoneTasks = allDoneTasks.filter((t) => t.id !== id);
    whereDeleteTask.removeChild(elem);
  }
  modalDelete.style.display = 'none';
  allToHash();
  progressBarFunc();
}

function generateDeleteModal(modalTitle) {
  modalDelete.style.display = 'block';
  const deleteTextElem = generateDeleteModalTemplate(modalTitle);
  modalDeleteText.insertAdjacentElement('beforeend', deleteTextElem);
}

function generateDeleteModalTemplate(modalTitle) {
  const deleteText = document.createElement('div');
  deleteText.insertAdjacentHTML(
    'beforeend',
    `
    <span>Are you sure you want to delete task "${modalTitle}"?</span>
    `
  );

  return deleteText;
}

function updateTitle(newTitle, id) {
  tasks = tasks.map((task) => {
    if (task.id === id) task.title = newTitle;
    return task;
  });
  allToHash();
}

function allToHash() {
  const stringTasks = JSON.stringify({
    tasks,
    allDoneTasks,
  });
  const b64Tasks = btoa(stringTasks);
  location.hash = b64Tasks;
}

import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');

    const firebaseConfig = {
        apiKey: "AIzaSyAKWQDHGl-Xr5uO-tTltK-cpRmbDtk0kfo",
        authDomain: "to-do-list-fee10.firebaseapp.com",
        databaseURL: "https://to-do-list-fee10-default-rtdb.firebaseio.com",
        projectId: "to-do-list-fee10",
        storageBucket: "to-do-list-fee10.appspot.com",
        messagingSenderId: "376116052987",
        appId: "1:376116052987:web:d5ee2b34aad74f660f015e",
        measurementId: "G-MHEY9095S3"
      };
      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
    
      function signUpWithEmail(email, password) {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Successfully registered
            const user = userCredential.user;
            console.log("User Registered:", user);
        })
        .catch((error) => {
            console.error("Error registering user:", error.message);
            alert(error.message);
        });
    }
    
    function loginWithEmail(email, password) {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Successfully logged in
            const user = userCredential.user;
            console.log("Logged in as:", user.email);
            // Redirect to profile or another page if you want
            window.location.href = 'profile.html';
        })
        .catch((error) => {
            console.error("Error logging in:", error.message);
            alert(error.message);
        });
    }
    
    const signupForm = document.querySelector('form');
    signupForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form from submitting the default way
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    signUpWithEmail(email, password);
    });
    
    const loginForm = document.querySelectorAll('form')[1];
    loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const emailOrUsername = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    loginWithEmail(emailOrUsername, password); // Assuming the username is not implemented for now
    });  
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });

    addTaskButton.addEventListener('click', function() {
        addTask(taskInput.value);
    });

    function addTask(taskValue) {
        if (taskValue.trim() === '') return;
        
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'draggable');
        listItem.setAttribute('draggable', 'true');
        
        listItem.innerHTML = `
    <span class="drag-handle">&#8942;</span>
    <span class="task-text">${taskValue}</span>
    
    <button class="btn btn-danger btn-sm float-right remove-task">X</button>
    
    <!-- Custom Dropdown -->
    <div class="dropdown float-right" style="margin-right: 5px;">
        <button class="btn btn-light btn-sm dropdown-toggle custom-dropdown-toggle">Color</button>
        <div class="dropdown-content">
            <a href="#" data-color="default">Default</a>
            <a href="#" data-color="#FFB6B6">Red</a>
            <a href="#" data-color="#76db91">Green</a>
        </div>
    </div>
    
    <button class="btn btn-light btn-sm float-right edit-task" style="margin-right: 5px;">Edit</button>
`;

        addDragListeners(listItem);
        addRemoveListener(listItem);
        addEditListener(listItem);
        addColorChangeListener(listItem);
        addDropdownListeners(listItem);
        
        taskList.appendChild(listItem);
        taskInput.value = '';
    }

    function addDropdownListeners(listItem) {
        const dropdownToggle = listItem.querySelector('.custom-dropdown-toggle');
        const dropdownContent = listItem.querySelector('.dropdown-content');
        
        dropdownToggle.addEventListener('click', function() {
            dropdownContent.classList.toggle('show');
        });
    }

    function addEditListener(listItem) {
        const editButton = listItem.querySelector('.edit-task');
        const taskText = listItem.querySelector('.task-text');

        editButton.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskText.textContent;
            input.classList.add('form-control', 'inline-edit');

            taskText.replaceWith(input);
            input.focus();

            input.addEventListener('focusout', revertToText);
            input.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    revertToText.call(input);
                }
            });
        });

        function revertToText() {
            const input = this;
            if (input.value.trim() !== '') {
                const span = document.createElement('span');
                span.textContent = input.value.trim();
                span.classList.add('task-text');
                input.replaceWith(span);
                updateLocalStorage();
            }
        }
    }

    function addRemoveListener(listItem) {
        const removeButton = listItem.querySelector('.remove-task');
        removeButton.addEventListener('click', function() {
            taskList.removeChild(listItem);
            updateLocalStorage();
        });
    }

    function addDragListeners(listItem) {
        listItem.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', '');
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        });

        listItem.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            updateLocalStorage();
        });

        taskList.addEventListener('dragover', function(e) {
            e.preventDefault();
            const draggingEl = document.querySelector('.dragging');
            const afterEl = getDragAfterElement(taskList, e.clientY);
            if (afterEl) {
                taskList.insertBefore(draggingEl, afterEl);
            } else {
                taskList.appendChild(draggingEl);
            }
        });
    }

    function getDragAfterElement(container, y) {
        const draggableEls = [...container.querySelectorAll('.draggable:not(.dragging)')];
        return draggableEls.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

       function addColorChangeListener(listItem) {
        const dropdownItems = listItem.querySelectorAll('.dropdown-content a');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const chosenColor = this.getAttribute('data-color');
                listItem.style.backgroundColor = (chosenColor === 'default' ? '' : chosenColor);
                updateLocalStorage();
            });
        });
    }      

    function updateLocalStorage() {
        const listItems = taskList.querySelectorAll('li');
        const tasks = [...listItems].map(item => ({
            text: item.querySelector('.task-text').textContent,
            color: item.style.backgroundColor
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        const storedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (storedTasks) {
            storedTasks.forEach(task => {
                addTask(task.text);
                const listItem = taskList.lastChild;
                listItem.style.backgroundColor = task.color;
            });
        }
    }
    
    loadTasks();
});


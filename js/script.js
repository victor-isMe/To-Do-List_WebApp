function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const data = localStorage.getItem("tasks");
    tasks = data ? JSON.parse(data) : [];
}

document.addEventListener("DOMContentLoaded", () =>{
const inputTask = document.querySelector(".input-task");
const inputDate = document.querySelector(".input-date");
const addButton = document.querySelector("button");
const taskList = document.querySelector(".task-list");
const filterButtons = document.querySelectorAll(".task-filter span");
const clearButton = document.querySelector(".clear-button");

let tasks = [];

//fungsi render ulang task
function renderTasks(filter = "all"){
    taskList.innerHTML = "";
    let filteredTasks = [];

    if (tasks.length === 0){
        taskList.innerHTML = "<li><p>No task found</p></li>";
        return;
    }

    if (filter === "all"){
        filteredTasks = tasks;
    }else if(filter ==="pending"){
        filteredTasks = tasks.filter((t) => !t.completed);
    }else if(filter ==="completed"){
        filteredTasks = tasks.filter((t) => t.completed);
    }

    if (filteredTasks.length === 0){
        taskList.innerHTML = "<li><p>No task found</p></li>";
        return;
    }

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.classList.add("task-value");

        const span = document.createElement("span");
        span.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
        <s style="text-decoration: ${task.completed ? 'line-through' : 'none'};">
            ${task.text} (${task.date}) 
        </s>`;

        const subtools = document.createElement("div");
        subtools.classList.add("subtools");
        subtools.innerHTML = `
        <span>
            <i class="fa fa-trash" style="color:red;" data-id="${task.id}"></i>
        </span>`;

        li.appendChild(span);
        li.appendChild(subtools);
        taskList.appendChild(li);
        });
    }

    //fungsi validasi input
    function validateInput(){
        return inputTask.value.trim() !== "" && inputDate.value.trim() !== "";
    }

    //fungsi tambah task
    addButton.addEventListener("click", () => {
        if (!validateInput()){
            alert("Task dan tanggal tidak boleh kosong!");
            return;
        }

        tasks.push({
            id: Date.now(),
            text: inputTask.value.trim(),
            date: inputDate.value,
            completed:false
        });

        saveTasks();
        inputTask.value = "";
        inputDate.value = "";
        renderTasks(getActiveFilter());
        });

    //fungsi toggle status selesai
    taskList.addEventListener("change", (e) => {
        if (e.target.type === "checkbox"){
            const id = Number(e.target.dataset.id);
            const task = tasks.find(t => t.id === id);
            task.completed = e.target.checked;
            saveTasks();
            renderTasks(getActiveFilter());
        }
    });

    //fungsi hapus task fa-trash
    taskList.addEventListener("click", (e) => {
        if (e.target.classList.contains("fa-trash")) {
            const id = Number(e.target.dataset.id);
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks(getActiveFilter());
        }
    });

    //fungsi filter-task
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".task-filter .active")?.classList.remove("active");
            btn.classList.add("active");
            renderTasks(btn.textContent.toLowerCase());
        });
    });

    function getActiveFilter() {
        return document.querySelector(".task-filter .active").textContent.toLowerCase();
    }

    //fungsi clear all
    clearButton.addEventListener("click", () => {
        if (confirm("Apa kamu yakin ingin menghapus semua task?")) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });

    //inisialisasi awal
    loadTasks();
    renderTasks();

});
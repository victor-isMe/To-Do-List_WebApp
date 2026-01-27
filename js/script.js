document.addEventListener("DOMContentLoaded", () =>{
const inputTask = document.querySelector(".input-task");
const inputDate = document.querySelector(".input-date");
const addButton = document.querySelector("button");
const taskList = document.querySelector(".task-list");
const filterButtons = document.querySelectorAll(".task-filter span");
const clearButton = document.querySelector(".clear-button");
const exportBtn = document.querySelector(".export-btn");
const importBtn = document.querySelector(".import-btn");
const importInput = document.querySelector(".import-input");
const toast = document.getElementById("toast");
const historyBtn = document.querySelector(".history-btn");
const archiveBox = document.querySelector(".archive-box");
const archiveList = document.querySelector(".archive-list");
const clearHistoryBtn = document.querySelector(".clear-archive");
const maxLength = 40;

let tasks = [];

let isArchiveView = false;

//Fungsi save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

//fungsi Load tasks
function loadTasks() {
    const data = localStorage.getItem("tasks");
    tasks = data ? JSON.parse(data) : [];
}

//fungsi export (download file)
function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "tasks.json";
    a.click();

    URL.revokeObjectURL(url);
}

//addEventListener ke export button
exportBtn.addEventListener("click", exportTasks);

//Fitur import (upload file)
importBtn.addEventListener("click", () => {
    importInput.click();
});

importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const importedTasks = JSON.parse(reader.result);

            if (!Array.isArray(importedTasks)) {
                showToast("File tidak valid!");
                return;
            }

            //Untuk menjalankan merge task dengan faktor updatedAt
            tasks = mergeTasks(tasks, importedTasks);

            saveTasks();
            renderTasks();

            showToast("Import berhasil!");
        } catch (err) {
            showToast("Gagal membaca file JSON!");
        }
    };

    reader.readAsText(file);
});

//Fungsi set status waktu
function getTimeStatus(task) {
    if (task.completed) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate < today) return "overdue";
    if (taskDate.getTime() === today.getTime()) return "today";
    return "upcoming";
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

const statusPriority = {
    today: 1, 
    upcoming: 2,
    overdue: 3
};

const AUTO_ARCHIVE_DAYS = 2;

function daysBetween(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);

    const diff = today - target;
    return Math.floor(diff/(1000*60*60*24));
}

function autoArchiveTasks() {
    let changed = false;

    tasks.forEach(task => {
        if (task.archived) return;

        //Task completed
        if (task.completed && task.completedAt) {
            const days = daysBetween(task.completedAt);

            if (days >= AUTO_ARCHIVE_DAYS && days > 0) {
                task.archived = true;
                update(task);
                changed = true;
            }
        }

        //Task overdue
        if (!task.completed) {
            const days = daysBetween(task.date);

            if (days >= AUTO_ARCHIVE_DAYS) {
                task.archived = true;
                update(task);
                changed = true;
            }
        }
    });

    if (changed) {
        saveTasks();
        console.log("Beberapa task telah diarsipkan secara otomatis");
    }
}

//Fungsi untuk toast, pengganti alert
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

//Fungsi untuk update updatedAt
function update(task) {
    task.updatedAt = new Date().toISOString();
}

//Fungsi yang bekerja saat melakukan merge task
function mergeTasks(localTasks, incomingTasks) {
    const map = new Map();

    [...localTasks, ...incomingTasks].forEach(task => {
        if (!map.has(task.id)) {
            map.set(task.id, task);
        } else {
            const existing = map.get(task.id);
            if (new Date(task.updatedAt) > new Date(existing.updatedAt)) {
                map.set(task.id, task);
            }
        }
    });

    return Array.from(map.values());
}

//fungsi render ulang task
function renderTasks(filter = "all"){
    taskList.innerHTML = "";
    let filteredTasks = tasks.filter(t => !t.archived);

    //empty task v1
    // if (tasks.length === 0){
    //     taskList.innerHTML = "<li><p>No task found</p></li>";
    //     return;
    // }

    if (filter === "all"){
        filteredTasks = tasks.filter(t => !t.archived);
    }else if(filter ==="pending"){
        filteredTasks = filteredTasks.filter(t => !t.completed);
    }else if(filter ==="completed"){
        filteredTasks = filteredTasks.filter(t => t.completed);
    }

    //empty filteredTask v1
    // if (filteredTasks.length === 0){
    //     taskList.innerHTML = "<li><p>No task found</p></li>";
    //     return;
    // }

    //empty filteredTask v2
    if (tasks.length === 0){
        taskList.innerHTML = `
            <li class="empty-state">
                <p>Tidak ada task</p>
                <small>Tambahkan task untuk mulai mengatur harimu</small>
            </li>
        `;
        return;
    }

    //empty task v2
    if (filteredTasks.length === 0){
        taskList.innerHTML = `
            <li class="empty-state">
                <p>Tidak ada task</p>
                <small>Tambahkan task untuk mulai mengatur harimu</small>
            </li>
        `;
        return;
    }

    filteredTasks.sort((a, b) => {
        const statusA = getTimeStatus(a);
        const statusB = getTimeStatus(b);

        const priorityA = statusPriority[statusA];
        const priorityB = statusPriority[statusB];

        //Urutkan berdasarkan status waktu
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        //Kalau status sama, urutkan berdasar tanggal
        return new Date(a.date) - new Date(b.date);
    });

    filteredTasks.forEach((task) => {
        const status = getTimeStatus(task);
        const li = document.createElement("li");
        li.classList.add("task-value");
        if (status) li.classList.add(status);

        const span = document.createElement("span");
        span.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
        <s style="text-decoration: ${task.completed ? 'line-through' : 'none'}; color: ${task.completed ? 'rgb(58, 58, 58)' : ''}">
            ${task.text} (${formatDate(task.date)}) 
        </s>
        ${status? `<small class="status ${status}">${status}</small>` : ""}
        `;

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

    //Membatasi input user
    inputTask.addEventListener("input", () => {
        const length = inputTask.value.length;

        if (length >= maxLength) {
            showToast("Anda mencapai max input");
        }
    });

    //fungsi tambah task
    addButton.addEventListener("click", () => {
        if (!validateInput()){
            showToast("Task dan tanggal tidak boleh kosong!");
            return;
        }

        tasks.push({
            id: Date.now(),
            text: inputTask.value.trim(),
            date: inputDate.value,

            completed:false,
            completedAt: null,
            archived: false,

            updatedAt: new Date().toISOString()
        });

        showToast("Task berhasil ditambahkan");
        saveTasks();
        inputTask.value = "";
        inputDate.value = "";
        renderTasks(getActiveFilter());
        });

    //Add button lewat 'Enter'
    inputTask.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && validateInput()) {
            addButton.click();
        }
    });

    //fungsi toggle status selesai
    taskList.addEventListener("change", (e) => {
        if (e.target.type === "checkbox"){
            const id = Number(e.target.dataset.id);
            const task = tasks.find(t => t.id === id);

            task.completed = e.target.checked;
            task.completedAt = task.completed? new Date().toISOString().split("T")[0] : null;

            update(task);
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
            tasks = tasks.filter(t => t.archived);
            saveTasks();
            renderTasks();
        }
    });

    //Fungsi show archive history
    function renderArchiveTasks() {
        archiveList.innerHTML = "";

        const archivedTasks = tasks.filter(t => t.archived);

        if (archivedTasks.length === 0) {
            archiveList.innerHTML = `
                <p class="empty-state">History task masih kosong</p>
            `;
            return;
        }

        archivedTasks.forEach(task => {
            const list = document.createElement("li");
            list.textContent = `${task.text} (${formatDate(task.date)})`;
            archiveList.appendChild(list);
        });
    }
    function showArchiveView() {
        archiveBox.classList.add("show");
        renderArchiveTasks();
    }
    function hideArchiveView() {
        archiveBox.classList.remove("show");
        archiveList.innerHTML = "";
    }

    //Fitur view history
    historyBtn.addEventListener("click", () => {
        isArchiveView = !isArchiveView;

        if (isArchiveView) {
            historyBtn.textContent = "< Back";
            historyBtn.classList.add("back");
            showArchiveView();
        } else {
            historyBtn.textContent = "View History";
            historyBtn.classList.remove("back");
            hideArchiveView();
        }
    });

    //Hapus archive task
    clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Apa kamu yakin ingin menghapus semua history task?")) {
            archiveList.innerHTML = "";
            tasks = tasks.filter(t => !t.archived);
            saveTasks();
            renderTasks();

            showToast("History task berhasil dihapus");
        }
    });

    //inisialisasi awal
    loadTasks();
    autoArchiveTasks();
    renderTasks();

});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch((err) => console.error("Service Worker failed: ", err));
    });
}
WebApp To-Do-List dengan local storage. Still in progress...

#### Note for Author: "Perbaiki cloud system, data structure"

Date Development: (Start from zero: 28 July 2025), (Continue: 07 January 2026) - Now

# ToDo PWA

ToDo App berbasis Web App + Progressive Web App (PWA) yang dibuat dengan Vanilla JavaScript.
Mendukung offline mode, auto-archive task, export/import data dalam bentuk JSON, history task viewer, dan sinkronisasi cloud (single user) dengan Mockapi.io

Projek ini dibuat sebagai latihan fundamental sebelum masuk ke React & arsitektur frontend yang lebih advanced.

---

## Features Ready
- Add / Delete / Complete task
- Task dengan due date
- Status task otomatis :
    - Today
    - Upcoming
    - Overdue
- Auto archive task (completed & overdue task setelah satu hari)
- History / Archive viewer
- Export task -> JSON fle
- Import task -> merge task tanpa menghapus data lama
- Mobile responsive UI
- Progressive Web App (PWA)
- Service Worker + offline cache
- Toast notification system
- Cloud sync (single user + mock API based)
- Fully usable offline

---

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage
- Service Worker
- Web App Manifest
- MockAPI (untuk cloud sync single user)

---

## Project Structure
To-Do-List_WebApp/
|--css/
|  |--style.css
|--icons/
|  |--favicon - 32.png
|  |--icon-192.png
|  |--icon-512.png
|--js/
|  |--script.js
|--index.html
|--manifest.json
|--service-worker.js

---

## Installation & Run
Clone repo: git clone https://github.com/victor-isMe/To-Do-List_WebApp.git

Jalankan dengan:
- Live Server (VSCode extension) -> recommended
- atau buka 'index.html' langsung di browser

> Service Worker butuh environment server (tidak jalan sempurna via file://)

---

## PWA Install
App dapat di-install seperti aplikasi:
- Chrome -> Add to Home Screen
- Android -> Install App prompt
- Desktop -> Install icon di address bar

---

## Export & Import System
### Export
Mengunduh file: tasks.json
Berisi seluruh task termasuk archived task.

---

### Import
- Mendukung merge
- Tidak menimpa data lama
- Menggunakan strategi: task.id + updateAt, task terbaru akan menang saat merge.

---

## Auto Archived Logic
Task akan otomatis di-archive jika:
- Completed >= 1 hari
- Overdue >= 1 hari
Tetap tersimpan di data tasks, hanya hilang dari tampilan utama.

---

## Archive / History Viewer
Mode history menampilkan:
- Semua task archived
- Bisa dihapus permanen
- Ditampilkan dalam overlay panel

---

## Cloud Sync (Single User)
Menggunakan MockAPI:

### Sync Up
Upload seluruh task ke cloud.

### Sync Down
Ambil seluruh task dari cloud -> merge -> renderTasks.

Struktur cloud:
[
    {
        "id":...,
        "tasks": [...]
    }
]

---

## Offline Support
Service Worker:
- Cache HTML
- Cache CSS
- Cache JS
- Cache icon
- Tetap bisa digunakan tanpa koneksi internet

---

## Learning Goals Project Ini
Project ini dibuat untuk melatih:
- State management manual
- Data structure design
- Merge algorithm
- Offline-first thinking
- PWA fundamentals
- UI responsive
- Local persistence
- Cloud syc dasar

---

## Next Possible Improvements
- Multi User sync
- Login System
- Real database (Firebase / Supabase)
- Push notification
- Background sync
- Recurring tasks
- Tag & category
- Drag & drop sorting
- React rewrite version

---

## Author
Dibuat sebagai bagian dari perjalanan belajar frontend & web app architecture.

---

## License
Free to use for learning & development.
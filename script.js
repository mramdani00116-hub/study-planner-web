/* =========================
   STUDY PLANNER - SCRIPT.JS
   Fitur: localStorage, CRUD tugas,
   CRUD jadwal, filter, pencarian,
   statistik dinamis
========================= */

/* ── DATA STORE ─────────────────────────────── */

const DEFAULT_TASKS = [
  {
    id: 1,
    name: "Membuat Website Study Planner",
    subject: "Pemrograman Web",
    deadline: "2026-10-10",
    status: "pending",
  },
  {
    id: 2,
    name: "Membuat Wireframe",
    subject: "UI/UX",
    deadline: "2026-10-12",
    status: "completed",
  },
  {
    id: 3,
    name: "Database MySQL",
    subject: "Basis Data",
    deadline: "2026-10-15",
    status: "pending",
  },
];

const DEFAULT_JADWAL = [
  {
    id: 101,
    nama: "Pemrograman Mobile",
    hari: "Senin",
    mulai: "08:30",
    selesai: "10:00",
    ruang: "Ruang Lab Komputer",
  },
  {
    id: 102,
    nama: "Desain UI/UX",
    hari: "Selasa",
    mulai: "10:30",
    selesai: "12:00",
    ruang: "Ruang 203",
  },
  {
    id: 103,
    nama: "Jaringan Komputer",
    hari: "Kamis",
    mulai: "13:30",
    selesai: "15:00",
    ruang: "Ruang 204",
  },
  {
    id: 104,
    nama: "Basis Data",
    hari: "Rabu",
    mulai: "13:30",
    selesai: "15:00",
    ruang: "Ruang 201",
  },
];

const DEFAULT_PROFILE = { name: "PUTRA", email: "putra@email.com" };

/* ── Tugas ── */
function getTasks() {
  const raw = localStorage.getItem("sp_tasks");
  return raw ? JSON.parse(raw) : DEFAULT_TASKS;
}
function saveTasks(tasks) {
  localStorage.setItem("sp_tasks", JSON.stringify(tasks));
}

/* ── Jadwal ── */
function getJadwal() {
  const raw = localStorage.getItem("sp_jadwal");
  return raw ? JSON.parse(raw) : DEFAULT_JADWAL;
}
function saveJadwal_store(list) {
  localStorage.setItem("sp_jadwal", JSON.stringify(list));
}

/* ── Profil ── */
function getProfile() {
  const raw = localStorage.getItem("sp_profile");
  return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
}
function saveProfile(profile) {
  localStorage.setItem("sp_profile", JSON.stringify(profile));
}

/* ── UTILITY ─────────────────────────────────── */

const HARI_ORDER = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

function hariHariIni() {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[new Date().getDay()];
}

function formatDeadline(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.round((date - now) / 86400000);
  if (diff < 0) return "Terlambat " + Math.abs(diff) + " hari";
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Besok";
  return diff + " Hari";
}

function generateId() {
  return Date.now();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── DASHBOARD ────────────────────────────────── */

function initDashboard() {
  const tasks = getTasks();
  const jadwal = getJadwal();
  const profile = getProfile();

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const late = tasks.filter((t) => {
    const d = new Date(t.deadline);
    d.setHours(0, 0, 0, 0);
    return t.status === "pending" && d < new Date().setHours(0, 0, 0, 0);
  }).length;

  const todaySchedule = jadwal.filter((j) => j.hari === hariHariIni());

  const el = (id) => document.getElementById(id);
  if (el("stat-total")) el("stat-total").textContent = total;
  if (el("stat-done")) el("stat-done").textContent = done;
  if (el("stat-late")) el("stat-late").textContent = late;
  if (el("stat-jadwal")) el("stat-jadwal").textContent = todaySchedule.length;

  const greet = document.getElementById("welcome-name");
  if (greet) greet.textContent = profile.name;

  /* Tugas terdekat */
  const container = document.getElementById("dashboard-tasks");
  if (container) {
    container.innerHTML = "";
    const pending = tasks
      .filter((t) => t.status === "pending")
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3);

    if (pending.length === 0) {
      container.innerHTML =
        '<p style="color:#64748b;font-size:13px;padding:10px 0">Tidak ada tugas tertunda 🎉</p>';
    } else {
      pending.forEach((task) => {
        container.insertAdjacentHTML(
          "beforeend",
          `
          <div class="task">
            <div class="task-check">✓</div>
            <div class="task-info">
              <h4>${escHtml(task.name)}</h4>
              <p>${escHtml(task.subject)}</p>
            </div>
            <span class="deadline">${formatDeadline(task.deadline)}</span>
          </div>
        `,
        );
      });
    }
  }

  /* Jadwal hari ini di dashboard */
  const dashJadwal = document.getElementById("dashboard-jadwal");
  if (dashJadwal) {
    dashJadwal.innerHTML = "";
    if (todaySchedule.length === 0) {
      dashJadwal.innerHTML =
        '<p style="color:#64748b;font-size:13px;padding:10px 0">Tidak ada kelas hari ini ✌️</p>';
    } else {
      todaySchedule
        .sort((a, b) => a.mulai.localeCompare(b.mulai))
        .forEach((j) => {
          dashJadwal.insertAdjacentHTML(
            "beforeend",
            `
            <div class="schedule">
              <span class="time">${escHtml(j.mulai)}</span>
              <div>
                <h4>${escHtml(j.nama)}</h4>
                <p>${escHtml(j.ruang)}</p>
              </div>
            </div>
          `,
          );
        });
    }
  }
}

function showMessage() {
  window.location.href = "tugas.html";
}

/* ── TUGAS ────────────────────────────────────── */

function renderTasks(filter = "all", keyword = "") {
  const container = document.getElementById("task-list");
  if (!container) return;

  let tasks = getTasks();

  if (filter === "pending") tasks = tasks.filter((t) => t.status === "pending");
  if (filter === "completed")
    tasks = tasks.filter((t) => t.status === "completed");

  if (keyword.trim()) {
    const kw = keyword.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        t.subject.toLowerCase().includes(kw),
    );
  }

  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML =
      '<p style="color:#64748b;padding:20px 0">Tidak ada tugas ditemukan.</p>';
    return;
  }

  tasks.forEach((task) => {
    const isDone = task.status === "completed";
    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="task-card" data-id="${task.id}">
        <div class="task-check"
             style="${isDone ? "background:#e8f8ef;color:#16a34a;cursor:pointer" : "cursor:pointer"}"
             onclick="toggleTask(${task.id})" title="Tandai selesai/belum">✓</div>
        <div class="task-info">
          <h3 style="${isDone ? "text-decoration:line-through;color:#94a3b8" : ""}">${escHtml(task.name)}</h3>
          <p>${escHtml(task.subject)}</p>
          <small>Deadline: ${task.deadline}</small>
        </div>
        <span class="status ${isDone ? "completed" : "pending"}">${isDone ? "Selesai" : "Belum Selesai"}</span>
        <button class="edit-button" onclick="editTask(${task.id})">Edit</button>
        <button class="edit-button" style="color:#dc2626;border-color:#fecaca"
                onclick="deleteTask(${task.id})">Hapus</button>
      </div>
    `,
    );
  });
}

function addTask() {
  const modal = document.getElementById("task-modal");
  if (!modal) return;
  document.getElementById("modal-title").textContent = "Tambah Tugas";
  document.getElementById("task-id-input").value = "";
  document.getElementById("task-name-input").value = "";
  document.getElementById("task-subject-input").value = "";
  document.getElementById("task-deadline-input").value = "";
  document.getElementById("task-status-input").value = "pending";
  modal.style.display = "flex";
}

function editTask(id) {
  const task = getTasks().find((t) => t.id === id);
  if (!task) return;
  const modal = document.getElementById("task-modal");
  if (!modal) return;
  document.getElementById("modal-title").textContent = "Edit Tugas";
  document.getElementById("task-id-input").value = task.id;
  document.getElementById("task-name-input").value = task.name;
  document.getElementById("task-subject-input").value = task.subject;
  document.getElementById("task-deadline-input").value = task.deadline;
  document.getElementById("task-status-input").value = task.status;
  modal.style.display = "flex";
}

function saveTask() {
  const id = document.getElementById("task-id-input").value;
  const name = document.getElementById("task-name-input").value.trim();
  const subject = document.getElementById("task-subject-input").value.trim();
  const deadline = document.getElementById("task-deadline-input").value;
  const status = document.getElementById("task-status-input").value;

  if (!name || !subject || !deadline) {
    alert("Harap isi semua kolom!");
    return;
  }

  let tasks = getTasks();
  if (id) {
    tasks = tasks.map((t) =>
      t.id === Number(id) ? { ...t, name, subject, deadline, status } : t,
    );
  } else {
    tasks.push({ id: generateId(), name, subject, deadline, status });
  }
  saveTasks(tasks);
  closeModal();
  renderTasks(currentFilter(), currentKeyword());
  showToast(id ? "Tugas berhasil diperbarui!" : "Tugas berhasil ditambahkan!");
}

function deleteTask(id) {
  if (!confirm("Hapus tugas ini?")) return;
  saveTasks(getTasks().filter((t) => t.id !== id));
  renderTasks(currentFilter(), currentKeyword());
  showToast("Tugas berhasil dihapus!");
}

function toggleTask(id) {
  const tasks = getTasks().map((t) =>
    t.id === id
      ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
      : t,
  );
  saveTasks(tasks);
  renderTasks(currentFilter(), currentKeyword());
}

function closeModal() {
  const modal = document.getElementById("task-modal");
  if (modal) modal.style.display = "none";
}

function currentFilter() {
  return document.getElementById("filter-status")?.value ?? "all";
}
function currentKeyword() {
  return document.getElementById("searchTask")?.value ?? "";
}
function searchTask() {
  renderTasks(currentFilter(), currentKeyword());
}
function filterTask() {
  renderTasks(currentFilter(), currentKeyword());
}

/* ── JADWAL ───────────────────────────────────── */

let _activeHariFilter = "semua"; // state filter hari aktif

function initJadwal() {
  renderTodayJadwal();
  renderWeeklyJadwal(_activeHariFilter);
}

/* Jadwal hari ini */
function renderTodayJadwal() {
  const today = hariHariIni();
  const jadwal = getJadwal()
    .filter((j) => j.hari === today)
    .sort((a, b) => a.mulai.localeCompare(b.mulai));
  const countEl = document.getElementById("today-count");
  const container = document.getElementById("today-list");
  if (!countEl || !container) return;

  countEl.textContent = jadwal.length;
  container.innerHTML = "";

  if (jadwal.length === 0) {
    container.innerHTML =
      '<div class="empty-state">Tidak ada kelas hari ini ✌️</div>';
    return;
  }

  jadwal.forEach((j) => {
    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="schedule-card" style="position:relative;margin-bottom:12px">
        <div class="schedule-time">
          ${escHtml(j.mulai)}
          <small>${escHtml(j.selesai)}</small>
        </div>
        <div class="schedule-detail">
          <h3>${escHtml(j.nama)}</h3>
          <p>${escHtml(j.hari)} • ${escHtml(j.ruang)}</p>
        </div>
        <div class="card-actions" style="position:absolute;top:14px;right:14px;display:flex;gap:8px">
          <button class="btn-icon" onclick="openEditJadwal(${j.id})">✏️ Edit</button>
          <button class="btn-icon del" onclick="deleteJadwal(${j.id})">🗑 Hapus</button>
        </div>
      </div>
    `,
    );
  });
}

/* Semua jadwal mingguan */
function renderWeeklyJadwal(hariFilter = "semua") {
  _activeHariFilter = hariFilter;
  let jadwal = getJadwal();
  if (hariFilter !== "semua")
    jadwal = jadwal.filter((j) => j.hari === hariFilter);

  // Urutkan: hari → jam
  jadwal.sort((a, b) => {
    const hi = HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari);
    return hi !== 0 ? hi : a.mulai.localeCompare(b.mulai);
  });

  const container = document.getElementById("weekly-list");
  if (!container) return;
  container.innerHTML = "";

  if (jadwal.length === 0) {
    container.innerHTML =
      '<div class="empty-state" style="padding:24px 0">Belum ada jadwal. Klik "+ Tambah Jadwal"!</div>';
    return;
  }

  // Group per hari jika filter = semua
  if (hariFilter === "semua") {
    const grouped = {};
    jadwal.forEach((j) => {
      (grouped[j.hari] = grouped[j.hari] || []).push(j);
    });

    HARI_ORDER.forEach((hari) => {
      if (!grouped[hari]) return;
      container.insertAdjacentHTML(
        "beforeend",
        `<div style="padding:12px 20px 4px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em">${hari}</div>`,
      );
      grouped[hari].forEach((j) =>
        container.insertAdjacentHTML("beforeend", jadwalRowHTML(j)),
      );
    });
  } else {
    jadwal.forEach((j) =>
      container.insertAdjacentHTML("beforeend", jadwalRowHTML(j)),
    );
  }
}

function jadwalRowHTML(j) {
  return `
    <div class="schedule-row">
      <span>${escHtml(j.mulai)}</span>
      <div>
        <strong>${escHtml(j.nama)}</strong>
        <small style="display:block;color:#64748b;margin-top:2px">${escHtml(j.ruang)}</small>
      </div>
      <div class="row-actions">
        <button class="btn-icon" onclick="openEditJadwal(${j.id})">✏️</button>
        <button class="btn-icon del" onclick="deleteJadwal(${j.id})">🗑</button>
      </div>
    </div>
  `;
}

function filterHari(hari, btn) {
  // Update chip aktif
  document
    .querySelectorAll(".day-chip")
    .forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  renderWeeklyJadwal(hari);
}

/* Modal Tambah Jadwal */
function openJadwalModal() {
  const modal = document.getElementById("jadwal-modal");
  if (!modal) return;
  document.getElementById("jadwal-modal-title").textContent = "Tambah Jadwal";
  document.getElementById("jadwal-id-input").value = "";
  document.getElementById("jadwal-nama-input").value = "";
  document.getElementById("jadwal-hari-input").value = "Senin";
  document.getElementById("jadwal-mulai-input").value = "";
  document.getElementById("jadwal-selesai-input").value = "";
  document.getElementById("jadwal-ruang-input").value = "";
  modal.style.display = "flex";
}

/* Modal Edit Jadwal */
function openEditJadwal(id) {
  const j = getJadwal().find((x) => x.id === id);
  if (!j) return;
  const modal = document.getElementById("jadwal-modal");
  if (!modal) return;
  document.getElementById("jadwal-modal-title").textContent = "Edit Jadwal";
  document.getElementById("jadwal-id-input").value = j.id;
  document.getElementById("jadwal-nama-input").value = j.nama;
  document.getElementById("jadwal-hari-input").value = j.hari;
  document.getElementById("jadwal-mulai-input").value = j.mulai;
  document.getElementById("jadwal-selesai-input").value = j.selesai;
  document.getElementById("jadwal-ruang-input").value = j.ruang;
  modal.style.display = "flex";
}

/* Simpan jadwal */
function saveJadwal() {
  const id = document.getElementById("jadwal-id-input").value;
  const nama = document.getElementById("jadwal-nama-input").value.trim();
  const hari = document.getElementById("jadwal-hari-input").value;
  const mulai = document.getElementById("jadwal-mulai-input").value;
  const selesai = document.getElementById("jadwal-selesai-input").value;
  const ruang = document.getElementById("jadwal-ruang-input").value.trim();

  if (!nama || !mulai || !selesai || !ruang) {
    alert("Harap isi semua kolom!");
    return;
  }
  if (mulai >= selesai) {
    alert("Jam selesai harus lebih dari jam mulai!");
    return;
  }

  let list = getJadwal();
  if (id) {
    list = list.map((j) =>
      j.id === Number(id) ? { ...j, nama, hari, mulai, selesai, ruang } : j,
    );
  } else {
    list.push({ id: generateId(), nama, hari, mulai, selesai, ruang });
  }

  saveJadwal_store(list);
  closeJadwalModal();
  initJadwal();
  showToast(
    id ? "Jadwal berhasil diperbarui!" : "Jadwal berhasil ditambahkan!",
  );
}

/* Hapus jadwal */
function deleteJadwal(id) {
  if (!confirm("Hapus jadwal ini?")) return;
  saveJadwal_store(getJadwal().filter((j) => j.id !== id));
  initJadwal();
  showToast("Jadwal berhasil dihapus!");
}

function closeJadwalModal() {
  const modal = document.getElementById("jadwal-modal");
  if (modal) modal.style.display = "none";
}

/* ── SETTINGS ─────────────────────────────────── */

function initSettings() {
  const profile = getProfile();
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  if (nameEl) nameEl.value = profile.name;
  if (emailEl) emailEl.value = profile.email;
}

function saveSettings() {
  const name = document.getElementById("profile-name")?.value.trim();
  const email = document.getElementById("profile-email")?.value.trim();
  if (!name || !email) {
    alert("Isi nama dan email!");
    return;
  }
  saveProfile({ name, email });
  showToast("Pengaturan berhasil disimpan!");
}

/* ── TOAST ────────────────────────────────────── */

function showToast(msg) {
  let toast = document.getElementById("sp-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "sp-toast";
    toast.style.cssText =
      "position:fixed;bottom:24px;right:24px;background:#2454d6;color:#fff;" +
      "padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;" +
      "box-shadow:0 4px 16px rgba(36,84,214,.35);z-index:9999;transition:opacity .3s";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

/* ── AUTO-INIT ────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.dataset.page;
  if (page === "dashboard") initDashboard();
  if (page === "tugas") renderTasks();
  if (page === "jadwal") initJadwal();
  if (page === "pengaturan") initSettings();

  /* Tutup modal task saat klik luar */
  const modalTask = document.getElementById("task-modal");
  if (modalTask) {
    modalTask.addEventListener("click", (e) => {
      if (e.target === modalTask) closeModal();
    });
  }

  /* Tutup modal jadwal saat klik luar */
  const modalJadwal = document.getElementById("jadwal-modal");
  if (modalJadwal) {
    modalJadwal.addEventListener("click", (e) => {
      if (e.target === modalJadwal) closeJadwalModal();
    });
  }
});

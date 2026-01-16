// State
let sections = JSON.parse(localStorage.getItem('focus_sections')) || [];
let activeSectionId = null;
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

// Elements
const clockEl = document.getElementById('clock');
const startStopBtn = document.getElementById('start-stop-btn');
const resetBtn = document.getElementById('reset-btn');
const finishBtn = document.getElementById('finish-btn');
const sectionsListEl = document.getElementById('sections-list');
const activeSectionNameEl = document.getElementById('active-section-name');
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

// --- Sidebar Logic ---
closeSidebarBtn.onclick = () => {
    sidebar.classList.add('hidden');
    setTimeout(() => { openSidebarBtn.style.display = 'block'; }, 300);
};

openSidebarBtn.onclick = () => {
    sidebar.classList.remove('hidden');
    openSidebarBtn.style.display = 'none';
};

// Auto-hide pe mobil la start
if (window.innerWidth < 768) {
    sidebar.classList.add('hidden');
    openSidebarBtn.style.display = 'block';
}

// --- Logic ---
function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function render() {
    sectionsListEl.innerHTML = '';
    sections.forEach(s => {
        const item = document.createElement('div');
        item.className = `section-item ${s.id === activeSectionId ? 'active' : ''}`;
        item.onclick = () => select(s.id);
        
        const h = Math.floor(s.totalSeconds / 3600);
        const m = Math.floor((s.totalSeconds % 3600) / 60);
        const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

        item.innerHTML = `
            <div>
                <div class="section-name">${s.name}</div>
                <div class="section-time">Total: ${timeStr}</div>
            </div>
            <button class="delete-btn" onclick="del(${s.id}, event)">✕</button>
        `;
        sectionsListEl.appendChild(item);
    });
}

function select(id) {
    if (isRunning) return;
    activeSectionId = id;
    const s = sections.find(x => x.id === id);
    activeSectionNameEl.textContent = s ? s.name : "Selectează un proiect";
    elapsedTime = 0;
    clockEl.textContent = "00:00:00";
    
    // Închide sidebar pe mobil după selecție
    if (window.innerWidth < 768) {
        sidebar.classList.add('hidden');
        openSidebarBtn.style.display = 'block';
    }
    render();
}

window.del = (id, e) => {
    e.stopPropagation();
    if (!confirm("Ștergi proiectul?")) return;
    sections = sections.filter(x => x.id !== id);
    if (activeSectionId === id) {
        activeSectionId = null;
        activeSectionNameEl.textContent = "Selectează un proiect";
        elapsedTime = 0;
        clockEl.textContent = "00:00:00";
    }
    localStorage.setItem('focus_sections', JSON.stringify(sections));
    render();
};

startStopBtn.onclick = () => {
    if (!activeSectionId) return alert("Selectează un proiect!");
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            clockEl.textContent = formatTime(elapsedTime);
        }, 100);
        startStopBtn.textContent = "Stop";
        startStopBtn.className = "ios-btn stop";
        finishBtn.disabled = true;
    } else {
        isRunning = false;
        clearInterval(timerInterval);
        startStopBtn.textContent = "Start";
        startStopBtn.className = "ios-btn start";
        finishBtn.disabled = false;
    }
};

resetBtn.onclick = () => {
    isRunning = false;
    clearInterval(timerInterval);
    elapsedTime = 0;
    clockEl.textContent = "00:00:00";
    startStopBtn.textContent = "Start";
    startStopBtn.className = "ios-btn start";
    finishBtn.disabled = true;
};

finishBtn.onclick = () => {
    const s = sections.find(x => x.id === activeSectionId);
    if (s && elapsedTime > 0) {
        s.totalSeconds += Math.floor(elapsedTime / 1000);
        localStorage.setItem('focus_sections', JSON.stringify(sections));
        resetBtn.click();
        render();
    }
};

document.getElementById('add-section-btn').onclick = () => {
    const n = prompt("Nume proiect:");
    if (n) {
        const s = { id: Date.now(), name: n, totalSeconds: 0 };
        sections.push(s);
        localStorage.setItem('focus_sections', JSON.stringify(sections));
        select(s.id);
    }
};

render();
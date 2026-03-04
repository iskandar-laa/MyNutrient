import { auth, db } from "./Firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let phChart, weatherChart;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "Login.html";
        return;
    }

    // 1. Handle User Profile UI (Name & Photo)
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Update Name - Checks both 'fullName' and 'name' fields from Firestore
        const nameElement = document.getElementById("userName");
        if (nameElement) {
            nameElement.innerText = userData.fullName || userData.name || "User";
        }

        // Update Avatar
        const avatarElement = document.getElementById("userAvatar");
        if (avatarElement && userData.profilePic) {
            avatarElement.style.backgroundImage = `url('${userData.profilePic}')`;
            avatarElement.style.backgroundSize = "cover";
            avatarElement.style.backgroundPosition = "center";
            avatarElement.style.backgroundColor = "transparent";
        }
    }

    // 2. Initialize Real-time Charts
    initCharts(); 

    // 3. Real-time Dashboard Data Listener
    onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            updateDashboardUI(data);
        }
    });
});

function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 14 } }
    };

    const ctxPh = document.getElementById('phBarChart')?.getContext('2d');
    if (ctxPh) {
        phChart = new Chart(ctxPh, {
            type: 'bar',
            data: {
                labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                datasets: [{
                    data: [6, 8, 4, 7, 6, 2, 6], 
                    backgroundColor: ['#ff5e5e', '#f1c40f', '#ff5e5e', '#f1c40f', '#ff5e5e', '#f1c40f', '#ff5e5e'],
                    borderRadius: 5,
                    barThickness: 10
                }]
            },
            options: commonOptions
        });
    }

    const ctxWeather = document.getElementById('weatherBarChart')?.getContext('2d');
    if (ctxWeather) {
        weatherChart = new Chart(ctxWeather, {
            type: 'bar',
            data: {
                labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                datasets: [{
                    data: [5, 9, 3, 8, 5, 4, 7],
                    backgroundColor: '#3498db',
                    borderRadius: 5,
                    barThickness: 10
                }]
            },
            options: commonOptions
        });
    }
}

function updateDashboardUI(data) {
    if (data.moisture) document.getElementById("kpiMoisture").innerText = `${data.moisture}%`;
    if (data.soilTemp) document.getElementById("kpiTemp").innerText = `${data.soilTemp}°C`;

    updateCircularProgress("moistureRing", data.moisture || 0, "#ff5e5e");
    updateCircularProgress("phosphorusRing", data.phosphorus || 0, "#00b359");
    updateCircularProgress("nitrogenRing", data.nitrogen || 0, "#3498db");

    if (data.history && phChart) {
        phChart.data.datasets[0].data = data.history.ph;
        phChart.update();
    }
}

function updateCircularProgress(elementId, value, color) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.background = `radial-gradient(closest-side, white 79%, transparent 80% 100%),
                           conic-gradient(${color} ${value}%, #f2f2f2 0)`;
    el.innerText = `${value}%`;
}

// 4. Calendar and Logout Logic
document.addEventListener('DOMContentLoaded', () => {
    const fp = flatpickr("#dateInput", {
        mode: "range",
        dateFormat: "d M Y",
        positionElement: document.getElementById('calendarTrigger'),
        onChange: function(selectedDates, dateStr) {
            if (selectedDates.length === 2) {
                const rangeText = dateStr.replace(" to ", " - ");
                document.getElementById('dateDisplay').innerHTML = rangeText;
                
                if (phChart) {
                    phChart.data.datasets[0].data = [4, 5, 9, 2, 8, 7, 5];
                    phChart.update();
                }
            }
        }
    });

    document.getElementById('calendarTrigger')?.addEventListener('click', () => fp.open());

    document.querySelector(".logout-btn")?.addEventListener("click", () => {
        if(confirm("Are you sure you want to log out?")) {
            signOut(auth).then(() => {
                window.location.href = "Login.html";
            }).catch((error) => {
                console.error("Logout error:", error);
            });
        }
    });
});
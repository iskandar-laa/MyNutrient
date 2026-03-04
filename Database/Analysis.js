import { auth, db } from "./Firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let analysisChart;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the Monthly Analysis Donut Chart
    const ctx = document.getElementById('analysisDonutChart');
    if (ctx) {
        analysisChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Nutrient', 'Cost', 'Weather'],
                datasets: [{
                    data: [40, 32, 28],
                    backgroundColor: ['#5d5fef', '#a5a6f6', '#d1d2ff'],
                    hoverOffset: 10,
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: (context) => ` ${context.label}: ${context.parsed}%`
                        }
                    }
                }
            }
        });
    }

    // 2. Calendar Logic
    const fp = flatpickr("#dateInput", {
        mode: "range",
        dateFormat: "d M Y",
        positionElement: document.getElementById('calendarTrigger'),
        onChange: function(selectedDates, dateStr) {
            if (selectedDates.length === 2) {
                const rangeText = dateStr.replace(" to ", " - ");
                document.getElementById('dateDisplay').innerHTML = rangeText;

                // Update donut chart with new data based on selection
                if (analysisChart) {
                    analysisChart.data.datasets[0].data = [35, 45, 20];
                    analysisChart.update();
                }
            }
        }
    });

    document.getElementById('calendarTrigger')?.addEventListener('click', () => fp.open());

    // 3. Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 4. Logout Logic
    document.querySelector(".logout-btn")?.addEventListener("click", () => {
        if(confirm("Are you sure you want to log out?")) {
            signOut(auth).then(() => {
                window.location.href = "Login.html";
            }).catch((error) => {
                console.error("Logout Error:", error);
            });
        }
    });
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Fix 1: Check both possible field names for the name
            const nameElement = document.getElementById("userName");
            if (nameElement) {
                nameElement.innerText = userData.fullName || userData.name || "User Account";
            }

            // Fix 2: Ensure profile pic is set as a background
            const avatarElement = document.getElementById("userAvatar");
            if (avatarElement && userData.profilePic) {
                avatarElement.style.backgroundImage = `url('${userData.profilePic}')`;
                avatarElement.style.backgroundSize = "cover";
                avatarElement.style.backgroundPosition = "center";
                avatarElement.style.backgroundColor = "transparent";
            }
        }
    } else {
        window.location.href = "Login.html";
    }
});
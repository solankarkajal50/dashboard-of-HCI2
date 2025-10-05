(function () {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const toast = document.getElementById('toast');
    const overlay = document.getElementById('overlay');
    const mobileMenu = document.getElementById('mobileMenu');

    const kpiRevenue = document.getElementById('kpiRevenue');
    const kpiRevenueDelta = document.getElementById('kpiRevenueDelta');
    const kpiUsers = document.getElementById('kpiUsers');
    const kpiUsersDelta = document.getElementById('kpiUsersDelta');
    const kpiOrders = document.getElementById('kpiOrders');
    const kpiOrdersDelta = document.getElementById('kpiOrdersDelta');
    const kpiConversion = document.getElementById('kpiConversion');
    const kpiConversionDelta = document.getElementById('kpiConversionDelta');

    const ordersTableBody = document.querySelector('#ordersTable tbody');
    const ordersFilter = document.getElementById('ordersFilter');
    const globalSearch = document.getElementById('globalSearch');
    const notificationsBtn = document.getElementById('notificationsBtn');
    const navLinks = document.querySelectorAll('.nav__item');
    const contactForm = document.getElementById('contactForm');
    const nextClassEl = document.getElementById('nextClass');
    const nextClassMetaEl = document.getElementById('nextClassMeta');
    const attendancePctEl = document.getElementById('attendancePct');
    const attendanceBarEl = document.getElementById('attendanceBar');
    const attendanceMetaEl = document.getElementById('attendanceMeta');
    const assignmentsListEl = document.getElementById('assignmentsList');
    const addAssignmentBtn = document.getElementById('addAssignment');
    const notesText = document.getElementById('notesText');
    const notesSave = document.getElementById('notesSave');
    const timetableTableBody = document.querySelector('#timetableTable tbody');
    const timetableWeek = document.getElementById('timetableWeek');
    const timetableExport = document.getElementById('timetableExport');

    // State
    const state = {
        theme: localStorage.getItem('theme') || 'light',
        orders: [],
        sort: { key: 'date', dir: 'desc' },
    };

    if (state.theme === 'dark') html.classList.add('dark');

    // Utils
    function formatCurrency(n) {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    }
    function formatDate(d) {
        return new Intl.DateTimeFormat(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).format(d);
    }
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 2200);
    }

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        html.classList.toggle('dark', state.theme === 'dark');
        localStorage.setItem('theme', state.theme);
        showToast(`Theme: ${state.theme}`);
    });

    // Sidebar collapse (desktop) and open (mobile)
    sidebarToggle.addEventListener('click', () => {
        const collapsed = sidebar.getAttribute('data-collapsed') === 'true';
        sidebar.setAttribute('data-collapsed', String(!collapsed));
        showToast(!collapsed ? 'Sidebar expanded' : 'Sidebar collapsed');
    });

    function openSidebarMobile() {
        sidebar.setAttribute('data-open', 'true');
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('pointer-events-none', 'opacity-0');
    }
    function closeSidebarMobile() {
        sidebar.removeAttribute('data-open');
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('pointer-events-none', 'opacity-0');
    }
    mobileMenu.addEventListener('click', openSidebarMobile);
    overlay.addEventListener('click', closeSidebarMobile);

    // Sidebar nav smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-nav');
            if (target === 'contact') {
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (target === 'timetable') {
                const el = document.getElementById('timetable');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            navLinks.forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');
            closeSidebarMobile();
        });
    });

    // Mock data generation
    function randomBetween(min, max) { return Math.random() * (max - min) + min; }
    function randomInt(min, max) { return Math.floor(randomBetween(min, max)); }

    function generateKpis() {
        const revenue = 150000 + randomInt(-8000, 12000);
        const users = 4800 + randomInt(-300, 600);
        const orders = 1200 + randomInt(-150, 220);
        const conversion = +(2.3 + randomBetween(-0.3, 0.4)).toFixed(2);

        kpiRevenue.textContent = formatCurrency(revenue);
        kpiRevenueDelta.textContent = `${(randomBetween(-2, 4)).toFixed(1)}% vs last wk`;
        kpiRevenueDelta.style.color = revenue % 2 ? 'var(--ok)' : 'var(--warn)';

        kpiUsers.textContent = users.toLocaleString();
        kpiUsersDelta.textContent = `${(randomBetween(-3, 5)).toFixed(1)}%`;
        kpiUsersDelta.style.color = 'var(--ok)';

        kpiOrders.textContent = orders.toLocaleString();
        kpiOrdersDelta.textContent = `${(randomBetween(-1, 3)).toFixed(1)}%`;
        kpiOrdersDelta.style.color = 'var(--ok)';

        kpiConversion.textContent = `${conversion}%`;
        kpiConversionDelta.textContent = `${(randomBetween(-0.4, 0.6)).toFixed(2)}%`;
        kpiConversionDelta.style.color = conversion > 2.2 ? 'var(--ok)' : 'var(--warn)';
    }

    function generateOrders(count = 32) {
        const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        const customers = ['Ava', 'Noah', 'Olivia', 'Liam', 'Emma', 'Ethan', 'Sophia', 'Mason', 'Mia', 'Lucas'];
        const orders = Array.from({ length: count }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - randomInt(0, 28));
            return {
                id: 10000 + i + randomInt(0, 999),
                customer: customers[randomInt(0, customers.length)],
                date,
                amount: +(randomBetween(20, 1500)).toFixed(2),
                status: statuses[randomInt(0, statuses.length)],
            };
        });
        state.orders = orders;
    }

    function renderOrders() {
        const q = (ordersFilter.value || globalSearch.value || '').toLowerCase();
        let rows = state.orders;
        if (q) {
            rows = rows.filter(r => String(r.id).includes(q) || r.customer.toLowerCase().includes(q) || r.status.toLowerCase().includes(q));
        }
        const { key, dir } = state.sort;
        rows = [...rows].sort((a, b) => {
            const va = a[key];
            const vb = b[key];
            if (va < vb) return dir === 'asc' ? -1 : 1;
            if (va > vb) return dir === 'asc' ? 1 : -1;
            return 0;
        });

        ordersTableBody.innerHTML = rows.map(r => `
            <tr>
                <td>#${r.id}</td>
                <td>${r.customer}</td>
                <td>${formatDate(r.date)}</td>
                <td>${formatCurrency(r.amount)}</td>
                <td>${r.status}</td>
            </tr>
        `).join('');
    }

    // Timetable
    const timetableState = {
        slots: [
            '08:00 - 09:00',
            '09:00 - 10:00',
            '10:00 - 11:00',
            '11:00 - 12:00',
            '12:00 - 13:00',
            '13:00 - 14:00',
            '14:00 - 15:00',
            '15:00 - 16:00',
        ],
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        dataCurrent: {
            Monday:    ['Math', 'Physics', '—', 'HCI Lab', '—', 'DSA', '—', '—'],
            Tuesday:   ['—', 'Operating Systems', '—', '—', '—', 'DBMS', '—', '—'],
            Wednesday: ['English', '—', 'Algorithms', '—', '—', '—', 'IoT', '—'],
            Thursday:  ['—', '—', 'Math', '—', '—', '—', '—', 'Sports'],
            Friday:    ['—', 'DBMS Lab', 'DBMS Lab', '—', '—', '—', 'Seminar', '—'],
        },
        dataNext: {
            Monday:    ['Math', '—', '—', 'HCI', '—', '—', '—', '—'],
            Tuesday:   ['—', 'OS', '—', '—', '—', 'DBMS', '—', '—'],
            Wednesday: ['English', '—', 'Algorithms', '—', '—', '—', '—', '—'],
            Thursday:  ['—', '—', 'Math', '—', '—', '—', '—', 'Sports'],
            Friday:    ['—', '—', '—', '—', '—', '—', 'Seminar', '—'],
        }
    };

    function renderTimetable() {
        if (!timetableTableBody) return;
        const useNext = timetableWeek && timetableWeek.value === 'next';
        const data = useNext ? timetableState.dataNext : timetableState.dataCurrent;
        const rows = timetableState.slots.map((slot, i) => {
            const cells = timetableState.days.map(day => {
                const val = (data[day] && data[day][i]) || '—';
                const isBreak = val === '—';
                return `<td class="p-3 ${isBreak ? 'text-slate-400' : ''}">${val}</td>`;
            }).join('');
            return `<tr class="border-b border-slate-200 dark:border-slate-800"><td class="p-3 font-medium">${slot}</td>${cells}</tr>`;
        }).join('');
        timetableTableBody.innerHTML = rows;
    }

    function exportTimetableCsv() {
        if (!timetableTableBody) return;
        const header = ['Time', ...timetableState.days].join(',');
        const useNext = timetableWeek && timetableWeek.value === 'next';
        const data = useNext ? timetableState.dataNext : timetableState.dataCurrent;
        const lines = timetableState.slots.map((slot, i) => {
            const cells = timetableState.days.map(day => (data[day] && data[day][i]) || '').join(',');
            return `${slot},${cells}`;
        });
        const csv = [header, ...lines].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetable-${useNext ? 'next' : 'current'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Timetable exported');
    }

    // Widgets logic
    function findNextClass(now = new Date()) {
        if (!timetableState || !timetableState.slots) return null;
        const dayIndex = now.getDay(); // 0 Sun .. 6 Sat
        const dayMap = {1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday'};
        const timeToMinutes = (s) => {
            const [hms, ] = s.split(' - ');
            const [h, m] = hms.split(':').map(Number);
            return h * 60 + m;
        };
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Build a list of upcoming slots for today and the next days
        const queue = [];
        for (let offset = 0; offset < 7; offset++) {
            const d = new Date(now);
            d.setDate(d.getDate() + offset);
            const wd = d.getDay();
            const name = dayMap[wd];
            if (!name) continue;
            const slots = timetableState.slots;
            for (let i = 0; i < slots.length; i++) {
                const subject = (timetableState.dataCurrent[name] && timetableState.dataCurrent[name][i]) || '—';
                if (subject === '—') continue;
                const startMins = timeToMinutes(slots[i]);
                const isToday = offset === 0;
                if (!isToday || startMins >= currentMinutes) {
                    queue.push({ day: name, dayOffset: offset, slot: slots[i], subject });
                }
            }
            if (queue.length) break;
        }
        return queue.length ? queue[0] : null;
    }

    function renderNextClass() {
        if (!nextClassEl || !nextClassMetaEl) return;
        const n = findNextClass();
        if (!n) {
            nextClassEl.textContent = 'No upcoming class';
            nextClassMetaEl.textContent = '—';
            return;
        }
        nextClassEl.textContent = n.subject;
        nextClassMetaEl.textContent = `${n.day} • ${n.slot}`;
    }

    function renderAttendance() {
        if (!attendancePctEl || !attendanceBarEl || !attendanceMetaEl) return;
        const totalDays = 20; // mock
        const attended = 16; // mock
        const pct = Math.round((attended / totalDays) * 100);
        attendancePctEl.textContent = `${pct}%`;
        attendanceBarEl.style.width = `${pct}%`;
        attendanceBarEl.className = `h-2 rounded ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`;
        attendanceMetaEl.textContent = `${attended} of ${totalDays} days`;
    }

    const assignmentsState = {
        items: JSON.parse(localStorage.getItem('assignments') || '[]')
    };
    function persistAssignments() {
        localStorage.setItem('assignments', JSON.stringify(assignmentsState.items));
    }
    function renderAssignments() {
        if (!assignmentsListEl) return;
        if (!assignmentsState.items.length) {
            assignmentsListEl.innerHTML = '<li class="text-slate-500">No assignments</li>';
            return;
        }
        assignmentsListEl.innerHTML = assignmentsState.items.map((a, idx) => `
            <li class="flex items-center justify-between gap-2 rounded border border-slate-200 p-2 dark:border-slate-800">
                <div>
                    <div class="font-medium">${a.title}</div>
                    <div class="text-xs text-slate-500">Due: ${a.due || '—'}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button data-idx="${idx}" class="markDone rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">${a.done ? 'Undo' : 'Done'}</button>
                    <button data-idx="${idx}" class="removeItem rounded bg-rose-600 px-2 py-1 text-xs text-white">Del</button>
                </div>
            </li>
        `).join('');
        assignmentsListEl.querySelectorAll('.markDone').forEach(btn => btn.addEventListener('click', () => {
            const i = +btn.getAttribute('data-idx');
            assignmentsState.items[i].done = !assignmentsState.items[i].done;
            persistAssignments();
            renderAssignments();
        }));
        assignmentsListEl.querySelectorAll('.removeItem').forEach(btn => btn.addEventListener('click', () => {
            const i = +btn.getAttribute('data-idx');
            assignmentsState.items.splice(i, 1);
            persistAssignments();
            renderAssignments();
        }));
    }
    if (addAssignmentBtn) {
        addAssignmentBtn.addEventListener('click', () => {
            const title = prompt('Assignment title');
            if (!title) return;
            const due = prompt('Due date (e.g. 2025-10-10)');
            assignmentsState.items.push({ title, due, done: false });
            persistAssignments();
            renderAssignments();
        });
    }

    // Notes
    if (notesText) {
        notesText.value = localStorage.getItem('notes') || '';
    }
    if (notesSave && notesText) {
        notesSave.addEventListener('click', () => {
            localStorage.setItem('notes', notesText.value || '');
            showToast('Notes saved');
        });
    }

    // Sorting handlers
    document.querySelectorAll('#ordersTable thead th').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.getAttribute('data-sort');
            if (!key) return;
            if (state.sort.key === key) {
                state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                state.sort.key = key;
                state.sort.dir = 'asc';
            }
            renderOrders();
        });
    });

    // Debounced filtering
    function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), ms); }; }
    const renderOrdersDebounced = debounce(renderOrders, 150);
    ordersFilter.addEventListener('input', renderOrdersDebounced);
    globalSearch.addEventListener('input', renderOrdersDebounced);

    notificationsBtn.addEventListener('click', () => {
        const msgs = [
            'New order received',
            'User Emma upgraded plan',
            'Inventory low on SKU-1042',
            'Payout processed',
        ];
        showToast(msgs[randomInt(0, msgs.length)]);
    });

    // Contact form submit handler
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = new FormData(contactForm);
            const name = String(form.get('name') || '').trim();
            const email = String(form.get('email') || '').trim();
            const subject = String(form.get('subject') || '').trim();
            const message = String(form.get('message') || '').trim();

            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!name || !emailOk || !subject || !message) {
                showToast('Please fill all fields with a valid email');
                return;
            }
            // Simulate send
            showToast('Message sent! We will get back to you.');
            contactForm.reset();
        });
    }

    // Charts
    let trafficChart, channelChart;
    function buildCharts() {
        const trafficCtx = document.getElementById('trafficChart');
        const channelCtx = document.getElementById('channelChart');
        if (!trafficCtx || !channelCtx || !window.Chart) return;

        const labels = Array.from({ length: 30 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        const trafficData = labels.map(() => 100 + randomInt(-30, 80));

        const brand = '#6366f1';
        trafficChart = new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Visitors',
                    data: trafficData,
                    borderColor: brand,
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    tension: 0.35,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(148,163,184,0.1)' } } }
            }
        });

        channelChart = new Chart(channelCtx, {
            type: 'doughnut',
            data: {
                labels: ['Web', 'Mobile', 'Retail', 'Partners'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#06b6d4']
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom' } },
                cutout: '60%',
                maintainAspectRatio: false
            }
        });
    }

    // Initial render
    generateKpis();
    generateOrders();
    renderOrders();
    buildCharts();
    renderTimetable();
    if (timetableWeek) timetableWeek.addEventListener('change', renderTimetable);
    if (timetableExport) timetableExport.addEventListener('click', exportTimetableCsv);
    renderNextClass();
    renderAttendance();
    renderAssignments();

    // Update next class every minute
    setInterval(() => {
        renderNextClass();
    }, 60000);

    // Periodic updates
    setInterval(() => {
        generateKpis();
        // randomly update an order
        if (state.orders.length) {
            const i = randomInt(0, state.orders.length);
            state.orders[i].amount = +(state.orders[i].amount + randomBetween(-10, 25)).toFixed(2);
        }
        renderOrders();
        // update charts
        if (trafficChart) {
            const last = trafficChart.data.datasets[0].data;
            last.shift();
            last.push(100 + randomInt(-30, 80));
            trafficChart.update('none');
        }
        if (channelChart) {
            const d = channelChart.data.datasets[0].data;
            for (let i = 0; i < d.length; i++) d[i] = Math.max(5, d[i] + randomInt(-3, 3));
            channelChart.update('none');
        }
    }, 5000);
})();


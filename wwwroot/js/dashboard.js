/**
 * dashboard.js — CareerInn User Dashboard
 * Depends on: Chart.js (loaded via CDN in view)
 * Does NOT duplicate site.js global utilities.
 * All DOM-ready logic is scoped to the dashboard page.
 */

(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════════
       CONSTANTS & COLOR PALETTE (mirrors dashboard.css variables)
    ═══════════════════════════════════════════════════════════════ */
    const COLOR = {
        teal: '#0d9488',
        tealDark: '#0f766e',
        amber: '#d97706',
        amberLight: '#fbbf24',
        dark1: '#1c1917',
        dark2: '#292524',
        glowTeal: 'rgba(13,148,136,0.30)',
        glowAmber: 'rgba(217,119,6,0.18)',
        surface: '#fafaf9',
        border: 'rgba(28,25,23,0.08)',
    };

    /* ═══════════════════════════════════════════════════════════════
       1. SCROLL REVEAL — staggered fade-in
    ═══════════════════════════════════════════════════════════════ */
    function initScrollReveal() {
        const items = document.querySelectorAll('.reveal-item');
        if (!items.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || 0, 10);
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        items.forEach((el, i) => {
            // Stagger sequentially for items without explicit data-delay
            if (!el.dataset.delay) el.dataset.delay = i * 60;
            observer.observe(el);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       2. COUNTER ANIMATIONS — animate KPI numbers on load
    ═══════════════════════════════════════════════════════════════ */
    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(eased * target);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));

        // Hero quick stats
        document.querySelectorAll('.qs-num[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            const duration = 900;
            const start = performance.now();
            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       3. PROGRESS BAR ANIMATIONS
    ═══════════════════════════════════════════════════════════════ */
    function initProgressBars() {
        // Hero strength bar
        const heroFill = document.getElementById('heroStrengthFill');
        const heroPct = document.getElementById('heroStrengthPct');
        if (heroFill) {
            const val = parseInt(heroFill.dataset.value, 10);
            setTimeout(() => {
                heroFill.style.width = val + '%';
                if (heroPct) animatePctText(heroPct, val);
            }, 400);
        }

        // Sidebar widget bar
        const widgetFills = document.querySelectorAll('.widget-strength-fill[data-value]');
        widgetFills.forEach(fill => {
            const val = parseInt(fill.dataset.value, 10);
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        fill.style.width = val + '%';
                        observer.unobserve(fill);
                    }
                });
            }, { threshold: 0.3 });
            observer.observe(fill);
        });
    }

    function animatePctText(el, target) {
        const duration = 1000;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + '%';
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ═══════════════════════════════════════════════════════════════
       4. CHART.JS INITIALIZATION
    ═══════════════════════════════════════════════════════════════ */
    function initCharts() {
        if (typeof Chart === 'undefined') return;

        // Global Chart defaults
        Chart.defaults.font.family = "'DM Sans', 'Segoe UI', sans-serif";
        Chart.defaults.color = '#6b7280';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
        Chart.defaults.plugins.legend.labels.padding = 16;
        Chart.defaults.animation.duration = 900;
        Chart.defaults.animation.easing = 'easeOutCubic';

        initChartApplicationsOverTime();
        initChartStatusBreakdown();
        initChartFunnel();
        initChartSkillRadar();
    }

    // Chart 1 — Applications Over Time (Line)
    const chartDataWeekly = {
        labels: ['Apr 14', 'Apr 21', 'Apr 28', 'May 5', 'May 12'],
        data: [2, 1, 3, 4, 4],
    };
    const chartDataMonthly = {
        labels: ['Feb', 'Mar', 'Apr', 'May'],
        data: [3, 5, 8, 14],
    };

    let chartAppsInstance = null;

    function initChartApplicationsOverTime(period = 'weekly') {
        const ctx = document.getElementById('chartApplicationsOverTime');
        if (!ctx) return;

        const source = period === 'weekly' ? chartDataWeekly : chartDataMonthly;

        if (chartAppsInstance) {
            chartAppsInstance.data.labels = source.labels;
            chartAppsInstance.data.datasets[0].data = source.data;
            chartAppsInstance.update('active');
            return;
        }

        chartAppsInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: source.labels,
                datasets: [{
                    label: 'Applications',
                    data: source.data,
                    borderColor: COLOR.teal,
                    backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
                        gradient.addColorStop(0, 'rgba(13,148,136,0.28)');
                        gradient.addColorStop(1, 'rgba(13,148,136,0.00)');
                        return gradient;
                    },
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.45,
                    pointBackgroundColor: COLOR.teal,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: COLOR.amber,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 11 } },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(28,25,23,0.05)', drawBorder: false },
                        border: { display: false },
                        ticks: { stepSize: 1, font: { size: 11 } },
                    }
                },
                interaction: { mode: 'index', intersect: false },
            }
        });
    }

    // Chart 2 — Status Breakdown (Doughnut)
    function initChartStatusBreakdown() {
        const ctx = document.getElementById('chartStatusBreakdown');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Rejected'],
                datasets: [{
                    data: [5, 3, 2, 3, 1],
                    backgroundColor: [
                        'rgba(13,148,136,0.80)',
                        'rgba(251,191,36,0.70)',
                        'rgba(99,102,241,0.70)',
                        'rgba(34,197,94,0.70)',
                        'rgba(239,68,68,0.65)',
                    ],
                    borderColor: '#fff',
                    borderWidth: 3,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 },
                            padding: 10,
                            boxWidth: 10,
                        }
                    }
                }
            }
        });
    }

    // Chart 3 — Job Search Funnel (Bar)
    function initChartFunnel() {
        const ctx = document.getElementById('chartFunnel');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Searched', 'Applied', 'Interview', 'Offer', 'Hired'],
                datasets: [{
                    label: 'Count',
                    data: [80, 14, 3, 1, 0],
                    backgroundColor: [
                        'rgba(13,148,136,0.75)',
                        'rgba(13,148,136,0.62)',
                        'rgba(251,191,36,0.75)',
                        'rgba(34,197,94,0.70)',
                        'rgba(34,197,94,0.45)',
                    ],
                    borderColor: 'transparent',
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 10 } },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(28,25,23,0.05)' },
                        border: { display: false },
                        ticks: { font: { size: 10 } },
                    }
                }
            }
        });
    }

    // Chart 4 — Skill Demand Radar
    function initChartSkillRadar() {
        const ctx = document.getElementById('chartSkillRadar');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['React', 'C#/.NET', 'UI/UX', 'SQL', 'TypeScript', 'APIs'],
                datasets: [
                    {
                        label: 'Your Skills',
                        data: [90, 85, 75, 70, 80, 78],
                        backgroundColor: 'rgba(13,148,136,0.18)',
                        borderColor: COLOR.teal,
                        borderWidth: 2,
                        pointBackgroundColor: COLOR.teal,
                        pointRadius: 4,
                    },
                    {
                        label: 'Market Demand',
                        data: [95, 80, 85, 75, 88, 82],
                        backgroundColor: 'rgba(217,119,6,0.12)',
                        borderColor: COLOR.amber,
                        borderWidth: 2,
                        pointBackgroundColor: COLOR.amber,
                        pointRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 11 }, padding: 10 }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(28,25,23,0.08)' },
                        angleLines: { color: 'rgba(28,25,23,0.08)' },
                        pointLabels: { font: { size: 11, weight: '600' }, color: COLOR.dark2 },
                    }
                }
            }
        });
    }

    /* ── CHART PERIOD TOGGLE ── */
    function initChartPeriodToggle() {
        const buttons = document.querySelectorAll('.period-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const period = btn.dataset.period;
                initChartApplicationsOverTime(period);
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       5. TAB SWITCHING SYSTEM
    ═══════════════════════════════════════════════════════════════ */
    function initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;

                // Update buttons
                tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                // Update panels
                tabPanels.forEach(panel => panel.classList.remove('active'));
                const activePanel = document.getElementById('tab-' + target);
                if (activePanel) {
                    activePanel.classList.add('active');
                    // Animate items in new panel
                    const newItems = activePanel.querySelectorAll('.app-row, .saved-card, .rec-card, .interview-item');
                    newItems.forEach((item, i) => {
                        item.style.animationDelay = (i * 60) + 'ms';
                    });
                }

                // Hide filter bar for non-application tabs
                const filterBar = document.getElementById('filterBar');
                if (filterBar) {
                    filterBar.style.display = target === 'applications' ? '' : 'none';
                }
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       6. FILTER SYSTEM — filter applications list
    ═══════════════════════════════════════════════════════════════ */
    function initFilters() {
        const searchInput = document.getElementById('searchInput');
        const filterStatus = document.getElementById('filterStatus');
        const filterCompany = document.getElementById('filterCompany');
        const filterDate = document.getElementById('filterDate');
        const noResults = document.getElementById('noResultsMsg');
        const rows = document.querySelectorAll('#applicationsList .app-row');

        function applyFilters() {
            const query = (searchInput ? searchInput.value.toLowerCase().trim() : '');
            const status = (filterStatus ? filterStatus.value : '');
            const company = (filterCompany ? filterCompany.value : '');
            const days = (filterDate ? parseInt(filterDate.value, 10) : 0);

            let visible = 0;

            rows.forEach(row => {
                const titleEl = row.querySelector('.app-title');
                const companyEl = row.querySelector('.app-company');
                const rowText = ((titleEl ? titleEl.textContent : '') + ' ' + (companyEl ? companyEl.textContent : '')).toLowerCase();

                const matchSearch = !query || rowText.includes(query);
                const matchStatus = !status || row.dataset.status === status;
                const matchCompany = !company || row.dataset.company === company;
                const matchDate = !days || parseInt(row.dataset.date, 10) <= days;

                const show = matchSearch && matchStatus && matchCompany && matchDate;
                row.classList.toggle('filtered-out', !show);
                if (show) visible++;
            });

            if (noResults) {
                noResults.style.display = visible === 0 ? 'block' : 'none';
            }
        }

        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (filterStatus) filterStatus.addEventListener('change', applyFilters);
        if (filterCompany) filterCompany.addEventListener('change', applyFilters);
        if (filterDate) filterDate.addEventListener('change', applyFilters);
    }

    /* ═══════════════════════════════════════════════════════════════
       7. BOOKMARK / SAVE JOB TOGGLE (with localStorage persistence)
    ═══════════════════════════════════════════════════════════════ */
    const SAVED_JOBS_KEY = 'careerinn_saved_jobs';

    function getSavedJobs() {
        try {
            return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function setSavedJobs(ids) {
        try {
            localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(ids));
        } catch { /* storage unavailable */ }
    }

    function initBookmarks() {
        const saved = getSavedJobs();
        const btns = document.querySelectorAll('.bookmark-btn[data-saved-id]');

        // Restore persisted state
        btns.forEach(btn => {
            const id = btn.dataset.savedId;
            if (saved.includes(id)) {
                btn.classList.add('bookmarked');
            }
        });

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.savedId;
                const isOn = btn.classList.contains('bookmarked');
                let saved = getSavedJobs();

                if (isOn) {
                    saved = saved.filter(s => s !== id);
                    btn.classList.remove('bookmarked');
                } else {
                    saved.push(id);
                    btn.classList.add('bookmarked');
                }

                setSavedJobs(saved);

                // Bounce animation
                btn.classList.remove('bounce');
                void btn.offsetWidth; // reflow
                btn.classList.add('bounce');

                // Optional: remove card if unsaved in saved-jobs tab
                if (isOn) {
                    const card = btn.closest('.saved-card');
                    if (card && document.getElementById('tab-saved').classList.contains('active')) {
                        card.style.transition = 'opacity 0.35s, transform 0.35s';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.92)';
                        setTimeout(() => card.remove(), 350);
                    }
                }
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       8. AI INSIGHT BANNER DISMISS + ROTATION
    ═══════════════════════════════════════════════════════════════ */
    const AI_INSIGHTS = [
        'Your profile strength improved by 12% this week. React & .NET roles are trending in Lahore — 3 new matches found.',
        'Companies that viewed your profile this week: TechCorp, NexaLab, CloudNest. Update your headline for more visibility.',
        'Tip: Adding a portfolio link can increase interview invitations by up to 40%. Try it today!',
        '3 saved jobs are closing applications soon. Apply before they expire!',
    ];

    function initAIInsight() {
        const banner = document.getElementById('aiInsightBanner');
        const textEl = document.getElementById('aiInsightText');
        const dismiss = document.getElementById('aiDismiss');

        if (!banner || !dismiss) return;

        // Rotate insight every 12 seconds
        let idx = 0;
        setInterval(() => {
            idx = (idx + 1) % AI_INSIGHTS.length;
            if (textEl) {
                textEl.style.opacity = '0';
                textEl.style.transform = 'translateY(4px)';
                setTimeout(() => {
                    textEl.textContent = AI_INSIGHTS[idx];
                    textEl.style.transition = 'opacity 0.4s, transform 0.4s';
                    textEl.style.opacity = '1';
                    textEl.style.transform = 'translateY(0)';
                }, 300);
            }
        }, 12000);

        dismiss.addEventListener('click', () => {
            banner.style.transition = 'opacity 0.4s, max-height 0.5s, margin 0.4s, padding 0.4s';
            banner.style.opacity = '0';
            banner.style.maxHeight = '0';
            banner.style.marginBottom = '0';
            banner.style.padding = '0';
            banner.style.overflow = 'hidden';
            setTimeout(() => banner.remove(), 500);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       9. NOTIFICATION PULSE — unread count badge
    ═══════════════════════════════════════════════════════════════ */
    function initNotifications() {
        const unread = document.querySelectorAll('.notif-item.notif-unread');
        const dot = document.querySelector('.notif-pulse-dot');

        if (dot && unread.length === 0) {
            dot.style.display = 'none';
        }

        // Mark as read on click
        unread.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.remove('notif-unread');
                const remaining = document.querySelectorAll('.notif-item.notif-unread');
                if (remaining.length === 0 && dot) dot.style.display = 'none';
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       10. VIEW DETAILS BUTTON (mock handler — ready for AJAX)
    ═══════════════════════════════════════════════════════════════ */
    function initViewDetails() {
        const btns = document.querySelectorAll('.btn-view[data-job-id]');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const jobId = btn.dataset.jobId;
                // Placeholder: navigate or trigger modal
                // For now emit a custom event for future integration
                const event = new CustomEvent('dashboard:viewJob', { detail: { jobId } });
                document.dispatchEvent(event);
                // Future: window.location.href = `/Jobs/Details/${jobId}`;
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       11. QUICK APPLY BUTTON (mock)
    ═══════════════════════════════════════════════════════════════ */
    function initQuickApply() {
        const btns = document.querySelectorAll('.btn-quick-apply');
        btns.forEach(btn => {
            btn.addEventListener('click', function () {
                const original = this.textContent;
                this.textContent = 'Applying…';
                this.disabled = true;
                this.style.opacity = '0.7';

                setTimeout(() => {
                    this.textContent = '✓ Applied';
                    this.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
                    this.style.opacity = '1';
                }, 1200);
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       INIT — run everything on DOMContentLoaded
    ═══════════════════════════════════════════════════════════════ */
    function init() {
        initScrollReveal();
        initCounters();
        initProgressBars();
        initCharts();
        initChartPeriodToggle();
        initTabs();
        initFilters();
        initBookmarks();
        initAIInsight();
        initNotifications();
        initViewDetails();
        initQuickApply();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); 

        (function () {
            'use strict';

            /* ─────────────────────────────────────────
               DATA — Mock job listings
            ───────────────────────────────────────── */
            // Read jobs from database (injected by Razor view)
            const jobsDataEl = document.getElementById('jobsData');
            let JOB_DATA = [];

            if (jobsDataEl) {
                try {
                    const raw = JSON.parse(jobsDataEl.textContent);
                    JOB_DATA = raw.filter(j => j !== null).map(job => ({
                        id: job.id,
                        title: job.title,
                        company: job.company,
                        avatar: job.company.substring(0, 2).toUpperCase(),
                        avatarGrad: 'linear-gradient(135deg,#0d9488,#14b8a6)',
                        location: job.location || 'Pakistan',
                        type: job.jobType || 'Full-time',
                        exp: job.experienceLevel || 'Mid Level',
                        salary: job.salary > 0 ? 'PKR ' + job.salary.toLocaleString() : 'Not Disclosed',
                        tags: [job.jobType || 'General'],
                        rating: 4.5,
                        posted: job.postedAt,
                        featured: false
                    }));
                } catch (e) {
                    console.error('Failed to parse jobs data', e);
                }
            }

            const SUGGEST_TITLES = [
                'React Developer', 'Python Engineer', 'UI/UX Designer', 'Data Scientist',
                'DevOps Engineer', 'Cloud Architect', 'Full Stack Developer',
                'Machine Learning Engineer', 'Cybersecurity Analyst', 'Graphic Designer',
                'Digital Marketing Manager', 'Backend Developer', 'Frontend Developer',
                'Product Manager', 'Business Analyst', 'Mobile Developer',
            ];

            const CARDS_PER_PAGE = 6;

            /* ─────────────────────────────────────────
               STATE
            ───────────────────────────────────────── */
            let state = {
                searchTitle: '',
                searchLocation: '',
                activeTypes: [],
                activeExp: [],
                activeLocs: [],
                activeSkills: [],
                maxSalary: 500000,
                sortBy: 'recent',
                page: 1,
                savedJobs: new Set(JSON.parse(localStorage.getItem('ci_saved_jobs') || '[]')),
            };

            /* ─────────────────────────────────────────
               HELPERS
            ───────────────────────────────────────── */
            function getFiltered() {
                let jobs = [...JOB_DATA];

                if (state.searchTitle) {
                    const q = state.searchTitle.toLowerCase();
                    jobs = jobs.filter(j =>
                        j.title.toLowerCase().includes(q) ||
                        j.company.toLowerCase().includes(q) ||
                        j.tags.some(t => t.toLowerCase().includes(q))
                    );
                }

                if (state.searchLocation) {
                    const q = state.searchLocation.toLowerCase();
                    jobs = jobs.filter(j => j.location.toLowerCase().includes(q));
                }

                if (state.activeTypes.length)
                    jobs = jobs.filter(j => state.activeTypes.includes(j.type));

                if (state.activeExp.length)
                    jobs = jobs.filter(j => state.activeExp.includes(j.exp));

                if (state.activeLocs.length)
                    jobs = jobs.filter(j => state.activeLocs.some(l =>
                        j.location.toLowerCase().includes(l.toLowerCase())
                    ));

                if (state.activeSkills.length)
                    jobs = jobs.filter(j =>
                        state.activeSkills.every(s => j.tags.some(t => t.toLowerCase() === s.toLowerCase()))
                    );

                // Sort
                if (state.sortBy === 'salary')
                    jobs.sort((a, b) => parseInt(b.salary.replace(/\D/g, '')) - parseInt(a.salary.replace(/\D/g, '')));
                else if (state.sortBy === 'rating')
                    jobs.sort((a, b) => b.rating - a.rating);

                return jobs;
            }

            function buildStars(rating) {
                const full = Math.floor(rating);
                const half = rating % 1 >= 0.5 ? 1 : 0;
                const empty = 5 - full - half;
                return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
            }

            function savePersist() {
                localStorage.setItem('ci_saved_jobs', JSON.stringify([...state.savedJobs]));
            }

            /* ─────────────────────────────────────────
               CARD BUILDER
            ───────────────────────────────────────── */
            function buildJobCard(job, delay) {
                const isSaved = state.savedJobs.has(job.id);
                const tagsHtml = job.tags.map(t =>
                    `<button class="job-card__tag" data-tag="${t}">${t}</button>`
                ).join('');

                const card = document.createElement('div');
                card.className = `job-card${job.featured ? ' job-card--featured' : ''}`;
                card.dataset.jobId = job.id;
                card.style.animationDelay = delay + 'ms';

                card.innerHTML = `
            ${job.featured ? '<span class="job-card__featured-badge">Featured</span>' : ''}
            <div class="job-card__glow"></div>
            <div class="job-card__avatar" style="background:${job.avatarGrad};">${job.avatar}</div>
            <div class="job-card__content">
                <div class="job-card__top">
                    <h5 class="job-card__title">${job.title}</h5>
                    <button class="job-card__bookmark${isSaved ? ' saved' : ''}"
                            data-job-id="${job.id}"
                            title="${isSaved ? 'Unsave' : 'Save job'}">
                        <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
                    </button>
                </div>
                <div class="job-card__company">
                    <i class="fa-solid fa-building" style="color:var(--ci-primary);font-size:.7rem;"></i>
                    ${job.company}
                </div>
                <div class="job-card__meta">
                    <span class="job-card__meta-item"><i class="fa-solid fa-location-dot"></i>${job.location}</span>
                    <span class="job-card__meta-item"><i class="fa-solid fa-briefcase"></i>${job.type}</span>
                    <span class="job-card__meta-item"><i class="fa-solid fa-chart-simple"></i>${job.exp}</span>
                    <span class="job-card__salary">${job.salary} / mo</span>
                </div>
                <div class="job-card__tags">${tagsHtml}</div>
                <div class="job-card__footer">
                    <div class="job-card__rating">
                        <span class="job-card__stars">${buildStars(job.rating)}</span>
                        <span class="job-card__rating-val">${job.rating}</span>
                    </div>
                    <span class="job-card__posted"><i class="fa-regular fa-clock me-1"></i>${job.posted}</span>
                    <a href="/Jobs/Details/${job.id}" class="job-card__apply">
                      View Details <i class="fa-solid fa-arrow-right ms-1"></i>
                     </a>
                </div>
            </div>`;

                return card;
            }

            /* ─────────────────────────────────────────
               RENDER FEED
            ───────────────────────────────────────── */
            function renderFeed(reset) {
                const grid = document.getElementById('jobCardGrid');
                const empty = document.getElementById('jobsEmpty');
                const loadWrap = document.getElementById('loadMoreWrap');
                const countEl = document.getElementById('jobCount');
                if (!grid) return;

                if (reset) { state.page = 1; grid.innerHTML = ''; }

                const filtered = getFiltered();
                const total = filtered.length;
                const slice = filtered.slice(0, state.page * CARDS_PER_PAGE);

                countEl.textContent = `${total} job${total !== 1 ? 's' : ''} found`;

                if (total === 0) {
                    grid.style.display = 'none';
                    empty.style.display = 'block';
                    loadWrap.style.display = 'none';
                } else {
                    grid.style.display = 'flex';
                    empty.style.display = 'none';

                    if (reset) grid.innerHTML = '';

                    const frag = document.createDocumentFragment();
                    slice.forEach((job, i) => {
                        // Only append newly needed cards
                        const existing = grid.querySelector(`[data-job-id="${job.id}"]`);
                        if (!existing) {
                            frag.appendChild(buildJobCard(job, i * 60));
                        }
                    });
                    grid.appendChild(frag);

                    bindCardEvents();

                    // Load more visibility
                    if (slice.length < total) {
                        loadWrap.style.display = 'block';
                    } else {
                        loadWrap.style.display = 'none';
                    }
                }

                renderActiveFiltersBar();
            }

            /* ─────────────────────────────────────────
               ACTIVE FILTERS BAR
            ───────────────────────────────────────── */
            function renderActiveFiltersBar() {
                const bar = document.getElementById('activeFiltersBar');
                if (!bar) return;
                bar.innerHTML = '';

                const addTag = (label, removeFn) => {
                    const span = document.createElement('span');
                    span.className = 'jobs-active-tag';
                    span.innerHTML = `${label}<button aria-label="Remove ${label}">✕</button>`;
                    span.querySelector('button').addEventListener('click', removeFn);
                    bar.appendChild(span);
                };

                if (state.searchTitle)
                    addTag(`"${state.searchTitle}"`, () => { state.searchTitle = ''; document.getElementById('searchTitle').value = ''; renderFeed(true); });

                state.activeTypes.forEach(t =>
                    addTag(t, () => { state.activeTypes = state.activeTypes.filter(x => x !== t); document.querySelector(`.filter-type[value="${t}"]`).checked = false; renderFeed(true); })
                );
                state.activeExp.forEach(e =>
                    addTag(e, () => { state.activeExp = state.activeExp.filter(x => x !== e); document.querySelector(`.filter-exp[value="${e}"]`).checked = false; renderFeed(true); })
                );
                state.activeSkills.forEach(s =>
                    addTag(s, () => {
                        state.activeSkills = state.activeSkills.filter(x => x !== s);
                        document.querySelectorAll(`.jobs-skill-filter[data-skill="${s}"]`).forEach(el => el.classList.remove('active'));
                        renderFeed(true);
                    })
                );
            }

            /* ─────────────────────────────────────────
               BIND CARD EVENTS
            ───────────────────────────────────────── */
            function bindCardEvents() {
                // Bookmark toggle
                document.querySelectorAll('.job-card__bookmark').forEach(btn => {
                    if (btn.dataset.bound) return;
                    btn.dataset.bound = '1';
                    btn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const id = parseInt(this.dataset.jobId);
                        const icon = this.querySelector('i');

                        if (state.savedJobs.has(id)) {
                            state.savedJobs.delete(id);
                            this.classList.remove('saved');
                            icon.className = 'fa-regular fa-bookmark';
                            this.title = 'Save job';
                        } else {
                            state.savedJobs.add(id);
                            this.classList.add('saved');
                            icon.className = 'fa-solid fa-bookmark';
                            this.title = 'Unsave';

                            // Micro-animation
                            this.style.transform = 'scale(1.3)';
                            setTimeout(() => { this.style.transform = ''; }, 200);
                        }
                        savePersist();
                    });
                });

                // Tag click → filter
                document.querySelectorAll('.job-card__tag').forEach(btn => {
                    if (btn.dataset.bound) return;
                    btn.dataset.bound = '1';
                    btn.addEventListener('click', function () {
                        const skill = this.dataset.tag;
                        if (!state.activeSkills.includes(skill)) {
                            state.activeSkills.push(skill);
                            document.querySelectorAll(`.jobs-skill-filter[data-skill="${skill}"]`)
                                .forEach(el => el.classList.add('active'));
                        }
                        renderFeed(true);
                    });
                });

                // Apply ripple
                document.querySelectorAll('.job-card__apply').forEach(btn => {
                    if (btn.dataset.bound) return;
                    btn.dataset.bound = '1';
                    btn.addEventListener('click', function () {
                        ripple(this);
                        // Future: navigate to application page
                    });
                });
            }

            /* ─────────────────────────────────────────
               RIPPLE EFFECT
            ───────────────────────────────────────── */
            function ripple(el) {
                const r = document.createElement('span');
                r.style.cssText = `
            position:absolute;pointer-events:none;border-radius:50%;
            background:rgba(255,255,255,.35);
            width:60px;height:60px;
            top:50%;left:50%;
            transform:translate(-50%,-50%) scale(0);
            animation:rippleAnim .5s ease-out forwards;`;
                el.style.position = 'relative';
                el.style.overflow = 'hidden';
                el.appendChild(r);
                setTimeout(() => r.remove(), 550);

                if (!document.getElementById('ripple-style')) {
                    const s = document.createElement('style');
                    s.id = 'ripple-style';
                    s.textContent = '@keyframes rippleAnim{to{transform:translate(-50%,-50%) scale(4);opacity:0;}}';
                    document.head.appendChild(s);
                }
            }

            /* ─────────────────────────────────────────
               SKELETON → REVEAL
            ───────────────────────────────────────── */
            function revealFeed() {
                const skeleton = document.getElementById('skeletonWrap');
                const grid = document.getElementById('jobCardGrid');
                setTimeout(() => {
                    if (skeleton) skeleton.style.display = 'none';
                    if (grid) grid.style.display = 'flex';
                    renderFeed(true);
                }, 1200);
            }

            /* ─────────────────────────────────────────
               STAT COUNTERS
            ───────────────────────────────────────── */
            function initStatCounters() {
                const nums = document.querySelectorAll('.jobs-stat-card__num');
                if (!nums.length) return;

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            nums.forEach(el => {
                                const target = parseInt(el.dataset.count || '0', 10);
                                const dur = 1800;
                                const start = performance.now();
                                (function step(now) {
                                    const p = Math.min((now - start) / dur, 1);
                                    const e = 1 - Math.pow(1 - p, 3);
                                    el.textContent = Math.round(e * target).toLocaleString();
                                    if (p < 1) requestAnimationFrame(step);
                                })(start);
                            });
                            observer.disconnect();
                        }
                    });
                }, { threshold: 0.3 });

                const section = document.querySelector('.jobs-stats');
                if (section) observer.observe(section);
            }

            /* ─────────────────────────────────────────
               SEARCH — autosuggest + trigger
            ───────────────────────────────────────── */
            function initSearch() {
                const titleInput = document.getElementById('searchTitle');
                const locInput = document.getElementById('searchLocation');
                const suggestBox = document.getElementById('searchSuggest');
                const searchBtn = document.getElementById('searchBtn');

                function doSearch() {
                    const title = titleInput ? titleInput.value.trim() : '';
                    const location = locInput ? locInput.value.trim() : '';
                    if (suggestBox) suggestBox.style.display = 'none';

                    // Send search to server
                    const params = new URLSearchParams();
                    if (title) params.append('search', title);
                    if (location) params.append('location', location);
                    window.location.href = '/Jobs?' + params.toString();
                }

                if (searchBtn) searchBtn.addEventListener('click', doSearch);

                if (titleInput) {
                    titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

                    titleInput.addEventListener('input', function () {
                        const q = this.value.trim().toLowerCase();
                        if (!q || !suggestBox) { suggestBox.style.display = 'none'; return; }

                        const matches = SUGGEST_TITLES.filter(t => t.toLowerCase().includes(q)).slice(0, 5);
                        if (!matches.length) { suggestBox.style.display = 'none'; return; }

                        suggestBox.innerHTML = matches.map(m =>
                            `<div class="jobs-search__suggest-item">
                        <i class="fa-solid fa-magnifying-glass" style="color:var(--ci-primary);font-size:.8rem;"></i>${m}
                     </div>`
                        ).join('');
                        suggestBox.style.display = 'block';

                        suggestBox.querySelectorAll('.jobs-search__suggest-item').forEach((item, i) => {
                            item.addEventListener('click', () => {
                                titleInput.value = matches[i];
                                suggestBox.style.display = 'none';
                                doSearch();
                            });
                        });
                    });

                    document.addEventListener('click', e => {
                        if (!e.target.closest('.jobs-search__field')) {
                            if (suggestBox) suggestBox.style.display = 'none';
                        }
                    });
                }

                if (locInput) locInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
            }

            /* ─────────────────────────────────────────
               FILTERS — sidebar checkboxes, skills, salary
            ───────────────────────────────────────── */
            function initFilters() {
                // Checkbox filters
                function bindCheckboxGroup(selector, paramName) {
                    document.querySelectorAll(selector).forEach(cb => {
                        cb.addEventListener('change', function () {
                            const params = new URLSearchParams(window.location.search);
                            if (this.checked) {
                                params.set(paramName, this.value);
                            } else {
                                params.delete(paramName);
                            }
                            window.location.href = '/Jobs?' + params.toString();
                        });
                    });
                }

                bindCheckboxGroup('.filter-type', 'jobType');
                bindCheckboxGroup('.filter-exp', 'experience');
                bindCheckboxGroup('.filter-loc', 'location');

                // Skill tag filters (sidebar)
                document.querySelectorAll('.jobs-skill-filter').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const skill = this.dataset.skill;
                        this.classList.toggle('active');
                        if (state.activeSkills.includes(skill)) {
                            state.activeSkills = state.activeSkills.filter(s => s !== skill);
                        } else {
                            state.activeSkills.push(skill);
                        }
                        renderFeed(true);
                    });
                });

                // Popular tag pills (hero)
                document.querySelectorAll('.jobs-tag-pill').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const tag = this.dataset.filterTag;
                        this.classList.toggle('active');
                        if (state.activeSkills.includes(tag)) {
                            state.activeSkills = state.activeSkills.filter(s => s !== tag);
                        } else {
                            state.activeSkills.push(tag);
                        }
                        document.getElementById('jobsBoard')?.scrollIntoView({ behavior: 'smooth' });
                        renderFeed(true);
                    });
                });

                // Salary range slider
                const salaryRange = document.getElementById('salaryRange');
                const salaryVal = document.getElementById('salaryVal');
                const salaryFill = document.getElementById('salaryFill');

                if (salaryRange) {
                    salaryRange.addEventListener('input', function () {
                        const pct = (this.value / this.max) * 100;
                        state.maxSalary = parseInt(this.value);
                        if (salaryVal) salaryVal.textContent = 'PKR ' + parseInt(this.value).toLocaleString();
                        if (salaryFill) salaryFill.style.width = pct + '%';
                    });
                }

                // Sort
                const sortSelect = document.getElementById('sortSelect');
                if (sortSelect) {
                    sortSelect.addEventListener('change', function () {
                        state.sortBy = this.value;
                        renderFeed(true);
                    });
                }

                // Reset all
                document.getElementById('resetFilters')?.addEventListener('click', resetAll);
                document.getElementById('clearAllFilters')?.addEventListener('click', resetAll);

                function resetAll() {
                    state.activeTypes = []; state.activeExp = [];
                    state.activeLocs = []; state.activeSkills = [];
                    state.searchTitle = ''; state.searchLocation = '';
                    state.maxSalary = 500000;

                    document.querySelectorAll('.filter-type, .filter-exp, .filter-loc').forEach(cb => cb.checked = false);
                    document.querySelectorAll('.jobs-skill-filter, .jobs-tag-pill').forEach(el => el.classList.remove('active'));
                    const ti = document.getElementById('searchTitle');
                    const li = document.getElementById('searchLocation');
                    if (ti) ti.value = '';
                    if (li) li.value = '';
                    if (salaryRange) salaryRange.value = 500000;
                    if (salaryVal) salaryVal.textContent = 'PKR 500,000';
                    if (salaryFill) salaryFill.style.width = '100%';

                    renderFeed(true);
                }
            }

            /* ─────────────────────────────────────────
               MOBILE SIDEBAR TOGGLE
            ───────────────────────────────────────── */
            function initSidebarToggle() {
                const sidebar = document.getElementById('jobsSidebar');
                const toggle = document.getElementById('filterToggle');
                const closeBtn = document.getElementById('sidebarClose');

                // Create overlay
                const overlay = document.createElement('div');
                overlay.className = 'jobs-sidebar-overlay';
                document.body.appendChild(overlay);

                function openSidebar() {
                    sidebar?.classList.add('open');
                    overlay.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }

                function closeSidebar() {
                    sidebar?.classList.remove('open');
                    overlay.classList.remove('show');
                    document.body.style.overflow = '';
                }

                toggle?.addEventListener('click', openSidebar);
                closeBtn?.addEventListener('click', closeSidebar);
                overlay.addEventListener('click', closeSidebar);
            }

            /* ─────────────────────────────────────────
               LOAD MORE
            ───────────────────────────────────────── */
            function initLoadMore() {
                const btn = document.getElementById('loadMoreBtn');
                if (!btn) return;
                btn.addEventListener('click', function () {
                    this.classList.add('loading');
                    this.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Loading...';
                    setTimeout(() => {
                        state.page++;
                        renderFeed(false);
                        this.classList.remove('loading');
                        this.innerHTML = '<i class="fa-solid fa-arrow-down me-2"></i>Load More Jobs';
                    }, 700);
                });
            }

            /* ─────────────────────────────────────────
               FEATURED CAROUSEL
            ───────────────────────────────────────── */
            function initCarousel() {
                const carousel = document.getElementById('featuredCarousel');
                if (!carousel) return;

                const featured = JOB_DATA.slice(0, 4);

                carousel.innerHTML = featured.map(job => `
            <div class="jobs-featured-card">
                <div class="jobs-featured-card__avatar" style="background:${job.avatarGrad};">${job.avatar}</div>
                <div class="jobs-featured-card__title">${job.title}</div>
                <div class="jobs-featured-card__company">${job.company} · ${job.location}</div>
                <div class="jobs-featured-card__tags">
                    ${job.tags.slice(0, 3).map(t => `<button class="job-card__tag" data-tag="${t}">${t}</button>`).join('')}
                </div>
                <div class="jobs-featured-card__footer">
                    <span class="jobs-featured-card__salary">${job.salary}</span>
                    <button class="jobs-featured-card__apply">Apply Now</button>
                </div>
            </div>`
                ).join('');

                // Bind tag clicks on carousel cards
                carousel.querySelectorAll('.job-card__tag').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const skill = this.dataset.tag;
                        if (!state.activeSkills.includes(skill)) state.activeSkills.push(skill);
                        document.getElementById('jobsBoard')?.scrollIntoView({ behavior: 'smooth' });
                        renderFeed(true);
                    });
                });

                let index = 0;
                const cardW = () => (carousel.querySelector('.jobs-featured-card')?.offsetWidth || 300) + 20;
                const maxIdx = () => Math.max(0, featured.length - Math.floor(carousel.parentElement.offsetWidth / cardW()));

                document.getElementById('carouselNext')?.addEventListener('click', () => {
                    index = Math.min(index + 1, maxIdx());
                    carousel.style.transform = `translateX(-${index * cardW()}px)`;
                });

                document.getElementById('carouselPrev')?.addEventListener('click', () => {
                    index = Math.max(index - 1, 0);
                    carousel.style.transform = `translateX(-${index * cardW()}px)`;
                });

                // Touch/swipe
                let startX = 0;
                carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
                carousel.addEventListener('touchend', e => {
                    const diff = startX - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 50) {
                        if (diff > 0) index = Math.min(index + 1, maxIdx());
                        else index = Math.max(index - 1, 0);
                        carousel.style.transform = `translateX(-${index * cardW()}px)`;
                    }
                }, { passive: true });
            }

            /* ─────────────────────────────────────────
               CTA — Email alerts
            ───────────────────────────────────────── */
            function initCTA() {
                const submit = document.getElementById('alertSubmit');
                const input = document.getElementById('alertEmail');
                const note = document.getElementById('alertNote');
                if (!submit || !input || !note) return;

                submit.addEventListener('click', function () {
                    const email = input.value.trim();
                    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

                    note.style.display = 'block';
                    note.className = 'jobs-cta__note';

                    if (!email) {
                        note.classList.add('jobs-cta__note--error');
                        note.textContent = '⚠ Please enter your email address.';
                        return;
                    }
                    if (!valid) {
                        note.classList.add('jobs-cta__note--error');
                        note.textContent = '⚠ Please enter a valid email address.';
                        return;
                    }

                    // Success
                    note.classList.add('jobs-cta__note--success');
                    note.textContent = '✓ You\'re subscribed! Job alerts will arrive shortly.';
                    input.value = '';
                    ripple(submit);
                });
            }

            /* ─────────────────────────────────────────
               INIT ALL
            ───────────────────────────────────────── */
            function init() {
                initStatCounters();
                initSearch();
                initFilters();
                initSidebarToggle();
                initLoadMore();
                initCarousel();
                initCTA();

                // Show skeleton then reveal cards
                revealFeed();
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }

        })();
/**
 * CareerInn – site.js
 * GLOBAL JAVASCRIPT — runs on ALL pages
 * (Navbar scroll, Smooth scroll, Scroll reveal engine)
 */

(function () {
    'use strict';

    /* ─────────────────────────────────────────
       1. NAVBAR — shrink + highlight on scroll
    ───────────────────────────────────────── */
    const navbar = document.getElementById('mainNavbar');
    const navLinks = document.querySelectorAll('.ci-nav-link');

    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function highlightNavLink() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.includes(currentSection) && currentSection !== '') {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        highlightNavLink();
    }, { passive: true });

    handleNavbarScroll();


    /* ─────────────────────────────────────────
       2. GLOBAL SCROLL REVEAL ENGINE
          Works for both [data-anim] and .reveal
    ───────────────────────────────────────── */
    function initScrollAnimations() {

        /* ── data-anim elements ── */
        const animEls = document.querySelectorAll('[data-anim]');

        if (animEls.length) {
            const animObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                        setTimeout(() => el.classList.add('anim-done'), delay);
                        animObserver.unobserve(el);
                    }
                });
            }, {
                threshold: 0.08,
                rootMargin: '0px 0px -30px 0px'
            });

            animEls.forEach(el => animObserver.observe(el));
        }

        /* ── .reveal elements ── */
        const revealEls = document.querySelectorAll('.reveal');

        if (revealEls.length) {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const siblings = Array.from(
                            el.parentElement?.parentElement?.querySelectorAll('.reveal') || []
                        );
                        const sibIndex = siblings.indexOf(el);
                        const delay = sibIndex >= 0 ? sibIndex * 100 : 0;
                        setTimeout(() => el.classList.add('visible'), delay);
                        revealObserver.unobserve(el);
                    }
                });
            }, {
                threshold: 0.05,
                rootMargin: '0px 0px -20px 0px'
            });

            revealEls.forEach(el => revealObserver.observe(el));
        }
    }

    /* Run on DOMContentLoaded */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }


    /* ─────────────────────────────────────────
       3. SMOOTH SCROLL — all anchor links
    ───────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navbarHeight = navbar ? navbar.offsetHeight : 70;
                const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });
            }
        });
    });


    /* ─────────────────────────────────────────
       4. PAGE LOAD — body ready class
    ───────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('loaded');
    });

})();

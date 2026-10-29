/**
 * CareerInn – home.js
 * HOME PAGE ONLY JAVASCRIPT
 * (Hero counter, Reviews auto-scroll, Niche card tilt)
 */

(function () {
    'use strict';

    /* ─────────────────────────────────────────
       1. HERO STAT COUNTER ANIMATION
    ───────────────────────────────────────── */
    function animateCounter(el, target, suffix) {
        const duration = 1800;
        const start = performance.now();

        function update(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); /* ease out cubic */
            const current = Math.round(eased * target);
            el.textContent = current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    const statNums = document.querySelectorAll('.stat-num');
    let statsAnimated = false;

    if (statNums.length) {
        const heroSection = document.querySelector('.ci-hero');

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsAnimated) {
                    statsAnimated = true;

                    statNums.forEach(el => {
                        const text = el.textContent.trim();
                        const suffix = text.replace(/[\d,]/g, '');   /* e.g. K+, + */
                        const raw = text.replace(/[^0-9]/g, '');
                        const value = parseInt(raw, 10);
                        if (!isNaN(value)) animateCounter(el, value, suffix);
                    });
                }
            });
        }, { threshold: 0.4 });

        if (heroSection) heroObserver.observe(heroSection);
    }


    /* ─────────────────────────────────────────
       2. REVIEWS AUTO-SCROLL
    ───────────────────────────────────────── */
    const reviewsWrapper = document.querySelector('.reviews-track-wrapper');
    const reviewsTrack = document.querySelector('.reviews-track');

    if (reviewsWrapper && reviewsTrack) {
        let isPaused = false;

        function startAutoScroll() {
            setInterval(() => {
                if (isPaused) return;

                const maxScroll = reviewsTrack.scrollWidth - reviewsWrapper.clientWidth;

                if (reviewsWrapper.scrollLeft >= maxScroll - 10) {
                    reviewsWrapper.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    reviewsWrapper.scrollBy({ left: 1.2, behavior: 'auto' });
                }
            }, 20);
        }

        /* Pause on hover / touch */
        reviewsWrapper.addEventListener('mouseenter', () => { isPaused = true; });
        reviewsWrapper.addEventListener('mouseleave', () => { isPaused = false; });
        reviewsWrapper.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
        reviewsWrapper.addEventListener('touchend', () => {
            setTimeout(() => { isPaused = false; }, 2000);
        }, { passive: true });

        setTimeout(startAutoScroll, 1500);
    }


    /* ─────────────────────────────────────────
       3. NICHE CARD — 3D TILT ON MOUSEMOVE
    ───────────────────────────────────────── */
    const nicheCards = document.querySelectorAll('.niche-card');

    nicheCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform =
                `translateY(-10px) scale(1.025) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

})();
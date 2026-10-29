(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {

        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 80,
                easing: 'ease-in-out'
            });
        }

        const cards = document.querySelectorAll(
            '.ci-feature-card, .ci-team-card, .ci-step-card, .ci-mission-card'
        );

        cards.forEach(card => {

            card.addEventListener('mousemove', (e) => {

                const rect = card.getBoundingClientRect();

                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotateY = ((x / rect.width) - 0.5) * 8;
                const rotateX = ((y / rect.height) - 0.5) * -8;

                card.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform =
                    'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });

       
    });

})();
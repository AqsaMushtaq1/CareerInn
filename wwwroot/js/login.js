(function () {

    'use strict';

    document.addEventListener('DOMContentLoaded', () => {

        /* AOS INIT */
        if (typeof AOS !== 'undefined') {

            AOS.init({
                duration: 1000,
                once: true,
                easing: 'ease-in-out',
                offset: 60
            });
        }

        /* INPUT ANIMATION */
        const inputs = document.querySelectorAll('.ci-input');

        inputs.forEach(input => {

            input.addEventListener('focus', () => {

                input.parentElement.style.transform = 'translateY(-2px)';
            });

            input.addEventListener('blur', () => {

                input.parentElement.style.transform = 'translateY(0px)';
            });

        });

        /* CARD HOVER EFFECT */
        const loginCard = document.querySelector('.ci-login-card');

        if (loginCard) {

            loginCard.addEventListener('mousemove', (e) => {

                const rect = loginCard.getBoundingClientRect();

                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotateY = ((x / rect.width) - 0.5) * 5;
                const rotateX = ((y / rect.height) - 0.5) * -5;

                loginCard.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            loginCard.addEventListener('mouseleave', () => {

                loginCard.style.transform =
                    'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        }

    });

})();
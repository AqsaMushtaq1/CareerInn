// ==========================================
// PASSWORD TOGGLE
// ==========================================

// ==========================================
// PASSWORD TOGGLE
// ==========================================

const togglePassword =
    document.getElementById("togglePassword");

const password =
    document.getElementById("password");

if (togglePassword && password) {

    togglePassword.addEventListener("click", () => {

        const type =
            password.type === "password"
                ? "text"
                : "password";

        password.type = type;

        togglePassword.classList.toggle("fa-eye-slash");
    });
}

// ==========================================
// BUTTON LOADING EFFECT
// ==========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const btn =
            document.querySelector(".register-btn");

        btn.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i>
             Creating Account...`;

        btn.style.pointerEvents = "none";

        setTimeout(() => {

            btn.innerHTML =
                `<i class="fa-solid fa-check"></i>
                 Account Created`;

            btn.style.background = "#0f766e";

        }, 1800);
    });
}

// ==========================================
// FLOATING INTERACTION
// ==========================================

const cards =
    document.querySelectorAll(".feature-box");

cards.forEach((card) => {

    card.addEventListener("mousemove", (e) => {

        const rect =
            card.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const y =
            e.clientY - rect.top;

        card.style.transform =
            `perspective(700px)
             rotateX(${-(y - rect.height / 2) / 25}deg)
             rotateY(${(x - rect.width / 2) / 25}deg)
             translateX(10px)`;
    });

    card.addEventListener("mouseleave", () => {

        card.style.transform =
            "perspective(700px) rotateX(0) rotateY(0)";
    });
});
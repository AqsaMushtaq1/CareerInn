/**
 * contact.js — CareerInn Contact Page
 * Handles: AOS init, form validation, success animation, FAQ accordion, smooth scroll
 */

(function () {
    "use strict";

    /* ─────────────────────────────────────────────────────────
       1. AOS INITIALIZATION
       (AOS is loaded globally via _Layout; we just configure it here)
    ───────────────────────────────────────────────────────── */
    document.addEventListener("DOMContentLoaded", function () {
        if (typeof AOS !== "undefined") {
            AOS.init({
                once: true,           // animate only once
                offset: 80,           // px before element enters viewport
                easing: "ease-out-cubic",
                duration: 650,
            });
        }

        initForm();
        initFAQ();
        initSmoothScroll();
        initInputAnimations();
    });

    /* ─────────────────────────────────────────────────────────
       2. FORM VALIDATION & SUBMISSION
    ───────────────────────────────────────────────────────── */
    function initForm() {
        const form = document.getElementById("contactForm");
        const submitBtn = document.getElementById("submitBtn");
        const successMsg = document.getElementById("successMessage");

        if (!form) return;

        // Live validation on blur
        const fields = form.querySelectorAll(".ci-input");
        fields.forEach(function (field) {
            field.addEventListener("blur", function () { validateField(field); });
            field.addEventListener("input", function () {
                if (field.classList.contains("is-invalid")) validateField(field);
            });
        });

        // Submit handler
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            let isValid = true;
            fields.forEach(function (field) {
                if (!validateField(field)) isValid = false;
            });

            if (!isValid) {
                // Shake the form card
                const card = form.closest(".form-card");
                if (card) {
                    card.style.animation = "shakeCard .4s ease";
                    setTimeout(function () { card.style.animation = ""; }, 440);
                }
                return;
            }

            // Show loading state
            setLoadingState(submitBtn, true);

            // Simulate async submit (replace with real fetch call)
            setTimeout(function () {
                setLoadingState(submitBtn, false);
                showSuccess(form, successMsg);
            }, 1400);
        });
    }

    /**
     * Validate a single field.
     * Returns true if valid, false otherwise.
     */
    function validateField(field) {
        const id = field.id;
        const value = field.value.trim();
        const errorEl = document.getElementById(id + "Error") ||
            document.getElementById(id.replace("fullName", "name") + "Error");

        let message = "";

        switch (id) {
            case "fullName":
                if (!value) message = "Full name is required.";
                else if (value.length < 2) message = "Please enter at least 2 characters.";
                else if (!/^[a-zA-Z\s\-'.]+$/.test(value)) message = "Please enter a valid name.";
                break;

            case "email":
                if (!value) message = "Email address is required.";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) message = "Please enter a valid email.";
                break;

            case "subject":
                if (!value) message = "Subject is required.";
                else if (value.length < 4) message = "Subject must be at least 4 characters.";
                break;

            case "message":
                if (!value) message = "Message cannot be empty.";
                else if (value.length < 15) message = "Please write at least 15 characters.";
                break;
        }

        // Apply UI state
        if (message) {
            field.classList.add("is-invalid");
            field.classList.remove("is-valid");
            if (errorEl) errorEl.textContent = message;
            return false;
        } else {
            field.classList.remove("is-invalid");
            field.classList.add("is-valid");
            if (errorEl) errorEl.textContent = "";
            return true;
        }
    }

    /** Toggle submit button loading state */
    function setLoadingState(btn, isLoading) {
        const text = btn.querySelector(".btn-submit__text");
        const icon = btn.querySelector(".btn-submit__icon");
        const loader = btn.querySelector(".btn-submit__loader");

        btn.disabled = isLoading;
        if (isLoading) {
            if (text) text.textContent = "Sending…";
            if (icon) icon.classList.add("d-none");
            if (loader) loader.classList.remove("d-none");
        } else {
            if (text) text.textContent = "Send Message";
            if (icon) icon.classList.remove("d-none");
            if (loader) loader.classList.add("d-none");
        }
    }

    /** Show animated success message and reset form */
    function showSuccess(form, successEl) {
        if (!successEl) return;

        // Slide-up dismiss the form fields gently
        form.querySelectorAll(".form-group, .row, .mt-3, .mt-4").forEach(function (el) {
            el.style.transition = "opacity .35s ease, transform .35s ease";
            el.style.opacity = "0";
            el.style.transform = "translateY(-8px)";
        });

        setTimeout(function () {
            // Reset all fields and states
            form.reset();
            form.querySelectorAll(".ci-input").forEach(function (f) {
                f.classList.remove("is-valid", "is-invalid");
            });
            form.querySelectorAll("[id$='Error']").forEach(function (e) {
                e.textContent = "";
            });

            // Restore field visibility
            form.querySelectorAll(".form-group, .row, .mt-3, .mt-4").forEach(function (el) {
                el.style.transition = "";
                el.style.opacity = "1";
                el.style.transform = "";
            });

            // Show success banner
            successEl.classList.remove("d-none");

            // Auto-hide after 6 seconds
            setTimeout(function () {
                successEl.style.transition = "opacity .5s ease, transform .5s ease";
                successEl.style.opacity = "0";
                successEl.style.transform = "translateY(-8px)";
                setTimeout(function () {
                    successEl.classList.add("d-none");
                    successEl.style.cssText = "";
                }, 520);
            }, 6000);
        }, 380);
    }

    /* ─────────────────────────────────────────────────────────
       3. FAQ ACCORDION
    ───────────────────────────────────────────────────────── */
    function initFAQ() {
        const accordion = document.getElementById("faqAccordion");
        if (!accordion) return;

        accordion.addEventListener("click", function (e) {
            const btn = e.target.closest(".faq-question");
            if (!btn) return;

            const targetId = btn.getAttribute("data-target");
            const answer = document.getElementById(targetId);
            const isOpen = btn.getAttribute("aria-expanded") === "true";

            // Close all open items first (single-open behaviour)
            accordion.querySelectorAll(".faq-question[aria-expanded='true']").forEach(function (openBtn) {
                if (openBtn === btn) return;
                openBtn.setAttribute("aria-expanded", "false");
                const openAnswer = document.getElementById(openBtn.getAttribute("data-target"));
                if (openAnswer) openAnswer.classList.add("faq-answer--closed");
            });

            // Toggle current
            if (isOpen) {
                btn.setAttribute("aria-expanded", "false");
                if (answer) answer.classList.add("faq-answer--closed");
            } else {
                btn.setAttribute("aria-expanded", "true");
                if (answer) answer.classList.remove("faq-answer--closed");
            }
        });
    }

    /* ─────────────────────────────────────────────────────────
       4. SMOOTH SCROLL for anchor links
    ───────────────────────────────────────────────────────── */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener("click", function (e) {
                const href = this.getAttribute("href");
                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const offset = 72; // navbar height offset
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({ top: top, behavior: "smooth" });
            });
        });
    }

    /* ─────────────────────────────────────────────────────────
       5. INPUT FOCUS MICRO-ANIMATIONS
       Slight label lift effect (supplement to CSS)
    ───────────────────────────────────────────────────────── */
    function initInputAnimations() {
        document.querySelectorAll(".ci-input").forEach(function (input) {
            // Add a filled class when the field has a value (for future CSS hooks)
            function checkFilled() {
                input.classList.toggle("has-value", input.value.trim().length > 0);
            }
            input.addEventListener("input", checkFilled);
            input.addEventListener("change", checkFilled);
            checkFilled(); // run once on load
        });
    }

    /* ─────────────────────────────────────────────────────────
       CSS ANIMATION: shake — injected once at runtime
    ───────────────────────────────────────────────────────── */
    (function injectShakeKeyframes() {
        if (document.getElementById("ci-shake-style")) return;
        const style = document.createElement("style");
        style.id = "ci-shake-style";
        style.textContent = `
      @keyframes shakeCard {
        0%,100% { transform: translateX(0); }
        20%      { transform: translateX(-6px); }
        40%      { transform: translateX(6px); }
        60%      { transform: translateX(-4px); }
        80%      { transform: translateX(4px); }
      }
    `;
        document.head.appendChild(style);
    })();

})();

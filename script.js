// Form handling with FormSubmit.co (free email service for static sites)
// You'll need to update the email in the fetch URL to your email address

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitButton = form.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        submitButton.disabled = true;
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline';
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';

        const formData = new FormData(form);

        // Replace YOUR_EMAIL with your actual email address
        const YOUR_EMAIL = 'your-email@example.com'; // UPDATE THIS!

        try {
            const response = await fetch(`https://formsubmit.co/${YOUR_EMAIL}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formMessage.textContent = 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.';
                formMessage.className = 'form-message success';
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            formMessage.textContent = 'Oops! There was a problem sending your message. Please try again or email us directly.';
            formMessage.className = 'form-message error';
        } finally {
            submitButton.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            e.preventDefault();
            const offsetTop = target.offsetTop - 90;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        });
    });

    // Navigation scroll effect
    const nav = document.querySelector('.nav');
    const onScroll = () => {
        if (window.pageYOffset > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    onScroll();
    window.addEventListener('scroll', onScroll);

    // Reveal animations
    const revealItems = document.querySelectorAll('[data-reveal]');
    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 0.06, 0.3)}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.15 });

    revealItems.forEach(item => observer.observe(item));

    // Workstation scroll trigger
    const workstation = document.querySelector('.workstation-bleed');
    if (workstation) {
        const workstationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-active');
                } else {
                    entry.target.classList.remove('is-active');
                }
            });
        }, { threshold: 0.35 });

        workstationObserver.observe(workstation);
    }
});

// Form handling with FormSubmit.co (free email service for static sites)
// Update the contact form action in index.html with your destination email address.

document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const trackEvent = (name, properties = {}) => {
        if (!name) return;

        if (typeof window.gtag === 'function') {
            window.gtag('event', name, properties);
        }

        if (typeof window.plausible === 'function') {
            window.plausible(name, { props: properties });
        }

        if (window.dataLayer && Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: name, ...properties });
        }
    };

    document.querySelectorAll('[data-track]').forEach((element) => {
        element.addEventListener('click', () => {
            trackEvent(element.dataset.track, {
                label: element.dataset.trackLabel || '',
                location: element.dataset.trackLocation || '',
                target: element.getAttribute('href') || ''
            });
        });
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
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    });

    const prefillMessageField = document.getElementById('message');
    document.querySelectorAll('[data-prefill-message]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const prefillValue = (trigger.dataset.prefillMessage || '').trim();
            if (!prefillMessageField || !prefillValue) return;

            if (!prefillMessageField.value.trim()) {
                prefillMessageField.value = `${prefillValue}\n`;
            }
        });
    });

    // Mobile navigation toggle
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('primary-navigation');
    if (nav && navToggle && navMenu) {
        const setNavOpen = (isOpen) => {
            navMenu.classList.toggle('is-open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
            nav.classList.toggle('menu-open', isOpen);
        };

        navToggle.addEventListener('click', () => {
            setNavOpen(!navMenu.classList.contains('is-open'));
        });

        navMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', () => setNavOpen(false));
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setNavOpen(false);
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 820) {
                setNavOpen(false);
            }
        });
    }

    // Navigation scroll effect
    if (nav) {
        const onScroll = () => {
            if (window.pageYOffset > 60) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        };

        onScroll();
        window.addEventListener('scroll', onScroll);
    }

    // Reveal animations
    const revealItems = document.querySelectorAll('[data-reveal]');
    if (prefersReducedMotion) {
        revealItems.forEach(item => item.classList.add('is-visible'));
    }

    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 0.06, 0.3)}s`;
    });

    if (!prefersReducedMotion) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.15 });

        revealItems.forEach(item => observer.observe(item));
    }

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

    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitButton = form ? form.querySelector('.submit-button') : null;
    const buttonText = submitButton ? submitButton.querySelector('.button-text') : null;
    const buttonLoader = submitButton ? submitButton.querySelector('.button-loader') : null;
    if (!form || !formMessage || !submitButton || !buttonText || !buttonLoader) return;

    const formAction = (form.getAttribute('action') || '').trim();
    const isPlaceholderFormEndpoint = (action) => !action || action.includes('your-email@example.com');
    const showMessage = (message, type) => {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (isPlaceholderFormEndpoint(formAction)) {
            showMessage('Form setup required: update the form action with your destination email address.', 'error');
            trackEvent('lead_form_submit_error', { form_id: 'contact-form', reason: 'placeholder_endpoint' });
            return;
        }

        submitButton.disabled = true;
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline';
        formMessage.className = 'form-message';

        const formData = new FormData(form);
        const honey = (formData.get('_honey') || '').toString().trim();

        // Silent-drop spam bots that fill hidden fields.
        if (honey) {
            showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
            form.reset();
            submitButton.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 12000);

        try {
            const response = await fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });

            if (response.ok) {
                showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
                trackEvent('lead_form_submit_success', { form_id: 'contact-form' });
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            const message = error.name === 'AbortError'
                ? 'Request timed out. Please try again in a moment.'
                : 'Oops! There was a problem sending your message. Please try again or email us directly.';
            showMessage(message, 'error');
            trackEvent('lead_form_submit_error', {
                form_id: 'contact-form',
                reason: error.name === 'AbortError' ? 'timeout' : 'request_failed'
            });
        } finally {
            window.clearTimeout(timeoutId);
            submitButton.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
        }
    });
});

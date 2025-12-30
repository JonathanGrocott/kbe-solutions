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

        // Disable form during submission
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline';
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';

        // Get form data
        const formData = new FormData(form);
        
        // Option 1: Using FormSubmit.co (recommended for simplicity)
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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navigation
    let lastScroll = 0;
    const nav = document.querySelector('.nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }

        lastScroll = currentScroll;
    });

    // Add animation on scroll for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Alternative: Using Web3Forms (another option)
// If you prefer Web3Forms, uncomment below and comment out the FormSubmit code above
/*
async function submitToWeb3Forms(formData) {
    // Get your free access key from https://web3forms.com/
    formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY');
    
    const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
    });
    
    return response;
}
*/

// Alternative: Using Formspree (another option)
// If you prefer Formspree, uncomment below and comment out the FormSubmit code above
/*
async function submitToFormspree(formData) {
    // Get your form ID from https://formspree.io/
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });
    
    return response;
}
*/

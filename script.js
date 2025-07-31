// Theme Toggle with enhanced features
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

if (themeToggle) {
  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (savedTheme === 'light') {
      body.classList.add('light-theme');
  }

  const updateThemeIcon = () => {
    const moonIcon = themeToggle.querySelector('.fa-moon');
    const sunIcon = themeToggle.querySelector('.fa-sun');
    if (body.classList.contains('light-theme')) {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
    } else {
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
    }
  };

  themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-theme');
      const theme = body.classList.contains('light-theme') ? 'light' : 'dark';
      localStorage.setItem('theme', theme);
      updateThemeIcon();
      
      // Update header background immediately
      const header = document.querySelector('header');
      if (header) {
        header.style.background = theme === 'light' 
          ? 'rgba(248, 250, 252, 0.98)' 
          : 'rgba(10, 10, 18, 0.98)';
      }
  });

  // Initialize icon state
  updateThemeIcon();
}

// Enhanced smooth scrolling with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without page jump
            history.pushState(null, null, this.getAttribute('href'));
        }
    });
});

// Improved scroll animations with performance optimization
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Optimized scroll handler with debounce
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = body.classList.contains('light-theme') 
                    ? 'rgba(248, 250, 252, 0.98)' 
                    : 'rgba(10, 10, 18, 0.98)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = body.classList.contains('light-theme') 
                    ? 'rgba(248, 250, 252, 0.9)' 
                    : 'rgba(10, 10, 18, 0.9)';
                header.style.boxShadow = 'none';
            }
        }
    }, 50);
});

// Enhanced form submission with validation
const CLIForm = (function() {
    const cliOutput = document.getElementById('cli-output');
    const cliInput = document.querySelector('.cli-input');
    let currentStep = 'name';
    let formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
    };

    // Add response to terminal
    function addResponse(text, {isError = false, isWarning = false} = {}) {
        const response = document.createElement('div');
        response.className = `cli-response ${isError ? 'cli-error' : ''} ${isWarning ? 'cli-warning' : ''}`;
        response.textContent = text;
        cliOutput.appendChild(response);
        cliOutput.scrollTop = cliOutput.scrollHeight;
    }

    // Update the prompt for the current step
    function updatePrompt() {
        cliInput.innerHTML = `
            <span class="cli-prompt">${currentStep}:</span>
            <input type="${currentStep === 'email' ? 'email' : 'text'}" 
                   id="cli-field" 
                   class="cli-field" 
                   autofocus>
        `;
        
        const field = document.getElementById('cli-field');
        field.addEventListener('keydown', handleInput);
    }

    // Handle user input
    function handleInput(e) {
        if (e.key === 'Enter') {
            const value = e.target.value.trim();
            
            // Handle empty input
            if (!value) {
                addResponse('Error: Please enter a value', {isError: true});
                return;
            }

            // Handle email validation
            if (currentStep === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
                addResponse('Error: Please enter a valid email address', {isError: true});
                return;
            }

            // Store the value
            formData[currentStep] = value;
            addResponse(`${currentStep}: ${value}`);

            // Progress to next step
            switch(currentStep) {
                case 'name':
                    currentStep = 'email';
                    break;
                case 'email':
                    currentStep = 'subject';
                    break;
                case 'subject':
                    currentStep = 'message';
                    addResponse('Enter your message (press Enter twice to send)', {isWarning: true});
                    break;
                case 'message':
                    sendEmail();
                    return;
            }

            // Update the prompt for next step
            updatePrompt();
        }
    }

    // Send the email
    async function sendEmail() {
        addResponse('Sending message...', {isWarning: true});
        
        try {
            const response = await fetch('https://formsubmit.co/ajax/tchemweno18@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    _replyto: formData.email
                })
            });

            if (response.ok) {
                addResponse('Message sent successfully!', {isWarning: false});
                addResponse('I will get back to you soon.', {isWarning: false});
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            addResponse(`Error: ${error.message}`, {isError: true});
        } finally {
            resetForm();
        }
    }

    // Reset the form
    function resetForm() {
        formData = { name: '', email: '', subject: '', message: '' };
        currentStep = 'name';
        setTimeout(() => {
            addResponse('Type "contact --start" to send another message or Clear to end conversation', {isWarning: true});
            updatePrompt();
        }, 1000);
    }

    // Initialize
    updatePrompt();

    return {
        addResponse,
        updatePrompt
    };
})();

// AI particles animation with performance optimization
const aiParticles = document.querySelector('.ai-particles');
if (aiParticles) {
    let lastTime = 0;
    const throttleDelay = 30; // milliseconds
    
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime >= throttleDelay) {
            lastTime = now;
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            aiParticles.style.background = `
                radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at ${100 - (x * 100)}% ${100 - (y * 50)}%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
                radial-gradient(circle at ${x * 50 + 25}% ${y * 50 + 25}%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
            `;
        }
    });
}

// Enhanced typing animation with multiple phrases
function initTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    const phrases = [
        "Hi, I'm Timothy Kiprop",
        "I'm a Fullstack Developer",
        "I build web applications",
        "Let's create something amazing"
        
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let cursorVisible = true;

    // Cursor blink animation
    setInterval(() => {
        cursorVisible = !cursorVisible;
        typingElement.style.borderRightColor = cursorVisible ? '#a855f7' : 'transparent';
    }, 600);

    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = charIndex % 3 === 0 ? 150 : 100; // Randomize speed slightly
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end of typing
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before next phrase
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start the typing effect
    setTimeout(type, 1000);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    initTypingAnimation();
    
    // Initialize other components if needed
    const header = document.querySelector('header');
    if (header) {
        header.style.transition = 'background 0.3s ease, box-shadow 0.3s ease';
    }
});
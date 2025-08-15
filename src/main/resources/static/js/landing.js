// Landing Page JavaScript for Brooks

class LandingPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupStreamAnimation();
        this.setupFormHandling();
        this.setupProgressAnimation();
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('active');
                
                if (isOpen) {
                    this.closeMobileMenu();
                } else {
                    this.openMobileMenu();
                }
            });

            // Close mobile menu when clicking on links
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Close mobile menu on resize
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    openMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle i');
        
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('data-lucide', 'x');
            // Re-render the icon if using Lucide
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle i');
        
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('data-lucide', 'menu');
            // Re-render the icon if using Lucide
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    setupSmoothScrolling() {
        // Handle smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupIntersectionObserver() {
        // Add intersection observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                    entry.target.style.opacity = '1';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(
            '.feature-card, .about-feature, .section-header'
        );
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    setupStreamAnimation() {
        const streamDots = document.querySelectorAll('.stream-dot');
        
        if (streamDots.length > 0) {
            let currentIndex = 0;
            
            const animateStream = () => {
                // Remove active class from all dots
                streamDots.forEach(dot => dot.classList.remove('active'));
                
                // Add active class to current dot
                streamDots[currentIndex].classList.add('active');
                
                // Move to next dot
                currentIndex = (currentIndex + 1) % streamDots.length;
            };
            
            // Start animation
            animateStream();
            setInterval(animateStream, 1500);
        }
    }

    setupProgressAnimation() {
        const progressBars = document.querySelectorAll('.progress-fill');
        
        if (progressBars.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progressBar = entry.target;
                        const width = progressBar.dataset.width || '75%';
                        
                        setTimeout(() => {
                            progressBar.style.width = width;
                        }, 500);
                    }
                });
            });

            progressBars.forEach(bar => {
                bar.style.width = '0%';
                bar.style.transition = 'width 1s ease-out';
                observer.observe(bar);
            });
        }
    }

    setupFormHandling() {
        // Handle CTA buttons
        const ctaButtons = document.querySelectorAll('.hero-cta .btn-primary, .cta .btn-primary');
        const secondaryButtons = document.querySelectorAll('.hero-cta .btn-secondary, .cta .btn-ghost');

        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.textContent.toLowerCase().includes('get started') || 
                    button.textContent.toLowerCase().includes('sign up')) {
                    e.preventDefault();
                    this.navigateToApp('/register');
                }
            });
        });

        secondaryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.textContent.toLowerCase().includes('sign in') || 
                    button.textContent.toLowerCase().includes('login')) {
                    e.preventDefault();
                    this.navigateToApp('/login');
                }
            });
        });

        // Check if user is already authenticated
        this.checkAuthenticationStatus();
    }

    async checkAuthenticationStatus() {
        try {
            const response = await fetch('/api/me', {
                method: 'GET',
                credentials: 'include' // Include cookies
            });

            if (response.ok) {
                // User is authenticated, show different CTA
                this.updateCTAForAuthenticatedUser();
            }
        } catch (error) {
            // User is not authenticated, keep default CTA
            console.log('User not authenticated');
        }
    }

    updateCTAForAuthenticatedUser() {
        const primaryButtons = document.querySelectorAll('.hero-cta .btn-primary, .cta .btn-primary');
        const secondaryButtons = document.querySelectorAll('.hero-cta .btn-secondary, .cta .btn-ghost');

        primaryButtons.forEach(button => {
            if (button.textContent.toLowerCase().includes('get started') || 
                button.textContent.toLowerCase().includes('sign up')) {
                button.textContent = 'Go to Dashboard';
                button.innerHTML = '<i data-lucide="arrow-right"></i> Go to Dashboard';
                button.onclick = (e) => {
                    e.preventDefault();
                    this.navigateToApp('/dashboard');
                };
            }
        });

        secondaryButtons.forEach(button => {
            if (button.textContent.toLowerCase().includes('sign in') || 
                button.textContent.toLowerCase().includes('login')) {
                button.textContent = 'View Profile';
                button.innerHTML = '<i data-lucide="user"></i> View Profile';
                button.onclick = (e) => {
                    e.preventDefault();
                    this.navigateToApp('/dashboard');
                };
            }
        });

        // Re-render Lucide icons if available
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    navigateToApp(path) {
        // Add a subtle loading state
        document.body.style.opacity = '0.9';
        
        setTimeout(() => {
            window.location.href = path;
        }, 200);
    }

    // Utility method to update stats dynamically (if needed)
    updateHeroStats(stats) {
        const statElements = {
            income: document.querySelector('.stat-value.income'),
            expense: document.querySelector('.stat-value.expense'),
            savings: document.querySelector('.stat-value.savings')
        };

        if (stats.income && statElements.income) {
            statElements.income.textContent = this.formatCurrency(stats.income);
        }
        
        if (stats.expense && statElements.expense) {
            statElements.expense.textContent = this.formatCurrency(stats.expense);
        }
        
        if (stats.savings && statElements.savings) {
            statElements.savings.textContent = this.formatCurrency(stats.savings);
        }

        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill && stats.savingsGoal) {
            const percentage = Math.min((stats.savings / stats.savingsGoal) * 100, 100);
            progressFill.dataset.width = `${percentage}%`;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Method to show loading state
    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i data-lucide="loader-2"></i>
            </div>
        `;
        
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const spinner = loading.querySelector('i');
        spinner.style.cssText = `
            width: 2rem;
            height: 2rem;
            color: var(--primary-blue);
            animation: spin 1s linear infinite;
        `;
        
        document.body.appendChild(loading);
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        return loading;
    }

    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.remove();
        }
    }

    // Method to handle scroll-based header transparency
    setupHeaderScroll() {
        const header = document.querySelector('.header');
        
        if (header) {
            let lastScrollY = window.scrollY;
            
            const updateHeader = () => {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > 100) {
                    header.style.background = 'rgba(255, 255, 255, 0.98)';
                    header.style.backdropFilter = 'blur(12px)';
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.95)';
                    header.style.backdropFilter = 'blur(10px)';
                }
                
                lastScrollY = currentScrollY;
            };
            
            window.addEventListener('scroll', updateHeader, { passive: true });
        }
    }

    // Method to add typing effect to hero title
    addTypingEffect() {
        const titleElement = document.querySelector('.hero-title');
        if (!titleElement) return;
        
        const text = titleElement.textContent;
        titleElement.textContent = '';
        titleElement.style.borderRight = '2px solid var(--primary-blue)';
        
        let index = 0;
        const typeSpeed = 50;
        
        const typeWriter = () => {
            if (index < text.length) {
                titleElement.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, typeSpeed);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    titleElement.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        // Start typing after a delay
        setTimeout(typeWriter, 500);
    }
}

// Initialize the landing page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const landingPage = new LandingPage();
    
    // Initialize Lucide icons if available
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // Add any additional initialization here
    console.log('Brooks landing page initialized');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page is visible again, restart any paused animations
        const streamDots = document.querySelectorAll('.stream-dot');
        if (streamDots.length > 0) {
            // Restart stream animation if needed
        }
    }
});

// Export for potential use in other scripts
window.BrooksLanding = LandingPage;

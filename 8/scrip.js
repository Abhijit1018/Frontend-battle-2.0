document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const headlineElement = document.querySelector('.headline');
    const headlineWordContainers = document.querySelectorAll('.headline-word-container');
    const highlightSpans = document.querySelectorAll('.highlight-text');
    const body = document.body;

    const headlineHoverOverlay = document.getElementById('headline-hover-overlay');
    const hoverPopoutElement = document.getElementById('hover-popout-element');
    const popoutTitle = document.getElementById('popout-title');
    const popoutDescription = document.getElementById('popout-description');

    // Store references to specific highlight spans
    const reportsTextSpan = document.getElementById('reports-text');
    const dashboardsTextSpan = document.getElementById('dashboards-text');

    // --- Chart.js Initialization (keep as is) ---
    // (Ensure your Chart.js code is here, as it's correctly placed within DOMContentLoaded)
    const expensesCtx = document.getElementById('expensesChart').getContext('2d');
    const expensesChart = new Chart(expensesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Insurance', 'Wages', 'Rent', 'Legal Expenses', 'Other'],
            datasets: [{
                data: [20, 25, 15, 10, 30], // Example data
                backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336', '#9C27B0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide default legend as we have custom list
                }
            }
        }
    });

    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    const incomeChart = new Chart(incomeCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Example labels
            datasets: [{
                label: 'Total Income',
                data: [120, 150, 130, 180, 160, 200], // Example data
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    ticks: { color: '#ffffff' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#ffffff' }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    const cashCtx = document.getElementById('cashChart').getContext('2d');
    const cashChart = new Chart(cashCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], // Example labels
            datasets: [{
                label: 'Cash Flow',
                data: [100, 120, 90, 140], // Example data
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    ticks: { color: '#ffffff' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#ffffff' }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    // --- End Chart.js Initialization ---


    // Map of card classes to their DOM elements for quick lookup
    const cardElements = {};
    document.querySelectorAll('.content-card').forEach(card => {
        cardElements[card.id] = card;
    });

    // Data for hover pop-out content (add visual type)
    const hoverContent = {
        'reports': {
            title: 'Actionable Reports',
            description: 'Generate stunning, data-rich reports in seconds. Tailor them for any audience, from executive summaries to detailed breakdowns.',
            visual: ['report-preview-card'] // Array for consistency
        },
        'forecasts': {
            title: 'Predictive Forecasts',
            description: 'Leverage AI to predict future financial trends with high accuracy. Plan your next moves with confidence and foresight.',
            visual: ['today-card', 'invoices-card', 'cash-runway-card', 'overdue-card'] // Show all related cards
        },
        'dashboards': {
            title: 'Dynamic Dashboards',
            description: 'Visualize your key metrics with interactive dashboards. Get real-time insights at a glance, customized to your needs.',
            visual: ['expenses-card']
        },
        'consolidations': {
            title: 'Effortless Consolidations',
            description: 'Streamline the consolidation of multiple entities or branches. Ensure accuracy and compliance across your entire organization.',
            visual: ['integrations-card']
        }
    };


    // Define the precise animation sequence
    const animationSequence = [
        { highlight: 'dashboards', showCards: ['expenses-card', 'total-income-card', 'cash-card', 'finance-score-card'], hideCards: [], duration: 3500 },
        { highlight: 'reports', showCards: ['report-preview-card', 'comment-card', 'send-to-card'], hideCards: ['expenses-card', 'total-income-card', 'cash-card', 'finance-score-card'], duration: 4000 },
        { highlight: 'forecasts', showCards: ['today-card', 'invoices-card', 'cash-runway-card', 'overdue-card'], hideCards: ['report-preview-card', 'comment-card', 'send-to-card'], duration: 4000 },
        { highlight: 'consolidations', showCards: ['integrations-card', 'branch-card', 'us-states-card'], hideCards: ['today-card', 'invoices-card', 'cash-runway-card', 'overdue-card'], duration: 3500 }
    ];

    let currentStepIndex = 0;
    let autoAnimationTimeout; // To hold the timeout for the auto-animation

    function animateStep() {
        const step = animationSequence[currentStepIndex];

        // 1. Hide all cards initially before showing new ones for this step
        Object.values(cardElements).forEach(card => {
             card.classList.remove('active');
        });

        // 2. Animate Headline Change
        // Reset and prepare all highlight spans for new animation
        highlightSpans.forEach(span => {
            span.style.transition = 'none'; // Temporarily disable transitions for reset
            span.style.opacity = '0';
            span.style.transform = 'translateY(100%)'; // Move off-screen bottom
            span.textContent = ''; // Clear text
        });

        // Determine which span to update based on the target highlight
        let targetSpan = null;
        if (step.highlight === 'reports') {
            targetSpan = reportsTextSpan;
        } else if (step.highlight === 'dashboards') {
            targetSpan = dashboardsTextSpan;
        } else {
            // For 'forecasts' and 'consolidations', we'll use the 'reports' span
            // This is a stylistic choice to manage two changing words within the fixed headline structure
            targetSpan = reportsTextSpan;
        }

        // Apply new text and animate
        if (targetSpan) {
            targetSpan.textContent = step.highlight; // Set the new word
            // Force reflow
            void targetSpan.offsetWidth;
            // Apply entrance animation
            targetSpan.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            targetSpan.style.opacity = '1';
            targetSpan.style.transform = 'translateY(0)';
        }

        // Ensure the *other* word container is correctly hidden if not the current target
        if (step.highlight !== 'reports' && reportsTextSpan) {
            reportsTextSpan.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            reportsTextSpan.style.opacity = '0';
            reportsTextSpan.style.transform = 'translateY(-100%)';
        }
        if (step.highlight !== 'dashboards' && dashboardsTextSpan) {
            dashboardsTextSpan.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            dashboardsTextSpan.style.opacity = '0';
            dashboardsTextSpan.style.transform = 'translateY(-100%)';
        }


        // 3. Show cards for the current step with staggered delay
        let cardDelay = 200;
        step.showCards.forEach(cardClass => {
            const card = cardElements[cardClass];
            if (card) {
                setTimeout(() => {
                    card.classList.add('active');
                }, cardDelay);
                cardDelay += 100; // Stagger each card by 100ms
            }
        });

        // Move to the next step
        currentStepIndex = (currentStepIndex + 1) % animationSequence.length;

        // Clear any existing timeout and schedule the next cycle
        clearTimeout(autoAnimationTimeout);
        autoAnimationTimeout = setTimeout(animateStep, step.duration);
    }

    // Initial call to start the sequence
    animateStep();

    // --- Headline Hover Effects ---
    // Event listeners for headline word containers
    headlineWordContainers.forEach(container => {
        let hoverTimeout;
        container.addEventListener('mouseenter', () => {
            // Clear any pending auto-animation to prevent conflict
            clearTimeout(autoAnimationTimeout);

            // Get the text of the word currently highlighted by the auto-animation
            // (or the word explicitly in this container)
            const hoveredWord = container.querySelector('.highlight-text').textContent.trim().toLowerCase();
            const content = hoverContent[hoveredWord];

            if (content) {
                popoutTitle.textContent = content.title;
                popoutDescription.textContent = content.description;

                // Show the relevant visual(s) in the popout
                popoutVisual.innerHTML = '';
                if (content.visual && Array.isArray(content.visual)) {
                    let found = false;
                    content.visual.forEach(cardId => {
                        const card = document.getElementById(cardId);
                        if (card) {
                            const cardClone = card.cloneNode(true);
                            cardClone.style.pointerEvents = 'none';
                            cardClone.style.boxShadow = 'none';
                            cardClone.style.background = 'none';
                            cardClone.style.padding = '0';
                            cardClone.style.margin = '10px auto';
                            cardClone.style.width = '90%';
                            cardClone.style.height = 'auto';
                            cardClone.querySelectorAll('input,button').forEach(el => el.remove());
                            popoutVisual.appendChild(cardClone);
                            found = true;
                        }
                    });
                    if (!found) {
                        popoutVisual.innerHTML = '<div style="height:120px;display:flex;align-items:center;justify-content:center;opacity:0.5;">[No Visual]</div>';
                    }
                }

                // Position the popout relative to the hovered word
                const rect = container.getBoundingClientRect();
                hoverPopoutElement.style.top = `${rect.top + rect.height / 2}px`;
                hoverPopoutElement.style.left = `${rect.left + rect.width / 2}px`;

                // Add active classes
                body.classList.add('overlay-active');
                headlineHoverOverlay.classList.add('active');
                hoverPopoutElement.classList.add('active');

                // Subtle scale for the hovered word
                container.style.transform = 'scale(1.05)';
            }
        });

        container.addEventListener('mouseleave', () => {
            // Re-enable auto-animation after a short delay
            autoAnimationTimeout = setTimeout(animateStep, animationSequence[currentStepIndex].duration);

            // Remove active classes
            body.classList.remove('overlay-active');
            headlineHoverOverlay.classList.remove('active');
            hoverPopoutElement.classList.remove('active');

            // Reset scale for the hovered word
            container.style.transform = 'scale(1)';
            popoutVisual.innerHTML = '';
        });
    });

    // --- Button Hover Effects ---
    const primaryBtn = document.querySelector('.primary-btn');
    const secondaryBtn = document.querySelector('.secondary-btn');

    // CSS handles the hover effects for buttons directly, but you can add JS if needed for complex effects
    // E.g., if you wanted to trigger particles or other non-CSS effects.
    // For this replica, CSS should suffice based on the video.
});
#!/usr/bin/env python3
"""
Add bottom progress bar to the quiz
"""

with open('index.html', 'r') as f:
    content = f.read()

# Insert bottom progress bar HTML before the result sections
bottom_html = '''<!-- Bottom Progress Bar -->
<div class="bottom-progress-bar" id="bottom-progress">
    <div class="progress-info">
        <span class="question-number-display">Q1 of 6</span>
        <span class="progress-percent-display">0%</span>
    </div>
    <div class="progress-track">
        <div class="progress-fill" id="bottom-progress-fill"></div>
    </div>
    <div class="question-dots" id="question-dots">
        <span class="dot active" data-q="1"></span>
        <span class="dot" data-q="2"></span>
        <span class="dot" data-q="3"></span>
        <span class="dot" data-q="4"></span>
        <span class="dot" data-q="5"></span>
        <span class="dot" data-q="6"></span>
    </div>
</div>

'''

# Find where to insert - before first result section
content = content.replace('<!-- Result: No Remote Income -->', bottom_html + '<!-- Result: No Remote Income -->')

# Add CSS before closing </style>
css_addition = '''
        /* Bottom Progress Bar */
        .bottom-progress-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--white);
            border-top: 1px solid var(--cream-dark);
            padding: 1rem 1.5rem;
            z-index: 1000;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
            display: none;
        }
        
        .bottom-progress-bar.active {
            display: block;
        }
        
        .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }
        
        .question-number-display {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--charcoal);
        }
        
        .progress-percent-display {
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--gold-deep);
        }
        
        .progress-track {
            height: 6px;
            background: var(--cream-dark);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 0.75rem;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--gold-deep), var(--gold-light));
            border-radius: 3px;
            transition: width 0.3s ease;
            width: 0%;
        }
        
        .question-dots {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .question-dots .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--cream-dark);
            transition: all 0.3s ease;
        }
        
        .question-dots .dot.active {
            background: var(--gold-deep);
            transform: scale(1.2);
        }
        
        .question-dots .dot.completed {
            background: var(--green-soft);
        }
        
        .quiz-section {
            padding-bottom: 120px;
        }
        
        @media (min-width: 768px) {
            .bottom-progress-bar {
                padding: 1.25rem 2rem;
            }
            
            .progress-track {
                height: 8px;
            }
            
            .question-dots .dot {
                width: 10px;
                height: 10px;
            }
        }
'''

content = content.replace('</style>', css_addition + '</style>')

# Add JavaScript before closing </script>
js_addition = '''

// Bottom Progress Bar Functions
function updateBottomProgress(currentQ, percentage) {
    const bottomProgress = document.getElementById('bottom-progress');
    if (!bottomProgress) return;
    
    const questionDisplay = bottomProgress.querySelector('.question-number-display');
    const percentDisplay = bottomProgress.querySelector('.progress-percent-display');
    const progressFill = document.getElementById('bottom-progress-fill');
    const dots = document.querySelectorAll('.question-dots .dot');
    
    bottomProgress.classList.add('active');
    if (questionDisplay) questionDisplay.textContent = 'Q' + currentQ + ' of 6';
    if (percentDisplay) percentDisplay.textContent = percentage + '%';
    if (progressFill) progressFill.style.width = percentage + '%';
    
    dots.forEach(function(dot, index) {
        dot.classList.remove('active', 'completed');
        if (index < currentQ - 1) {
            dot.classList.add('completed');
        } else if (index === currentQ - 1) {
            dot.classList.add('active');
        }
    });
}

function hideBottomProgress() {
    const bottomProgress = document.getElementById('bottom-progress');
    if (bottomProgress) bottomProgress.classList.remove('active');
}
'''

content = content.replace('</script>', js_addition + '</script>')

with open('index.html', 'w') as f:
    f.write(content)

print("Done - added bottom progress bar")

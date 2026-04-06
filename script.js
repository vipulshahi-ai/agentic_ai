/* ═══════════════════════════════════════════════════════════
   AGENTIC AI — GAMIFIED WEB APP SCRIPT
   XP System, Quizzes, Drag-and-Drop, Graph Builder,
   Simulator, Persona Lab, Blueprint Builder
   All chapters unlocked — free navigation
   ═══════════════════════════════════════════════════════════ */

// ── Global State ──
let xp = 0;
const maxXP = 500;
const completedInteractions = new Set();

// ── XP System ──
function addXP(amount, interactionId) {
    if (interactionId && completedInteractions.has(interactionId)) return;
    if (interactionId) completedInteractions.add(interactionId);

    xp += amount;
    if (xp > maxXP) xp = maxXP;

    document.getElementById('xp-counter').innerText = xp;
    document.getElementById('xp-bar-fill').style.width = `${(xp / maxXP) * 100}%`;

    const mobileXp = document.getElementById('xp-counter-mobile');
    if (mobileXp) mobileXp.innerText = xp;

    updateRank();
    if (amount >= 10) spawnParticles();
}

function updateRank() {
    const rankEl = document.getElementById('xp-rank');
    let rank = 'Novice Intern';
    if (xp >= 400) rank = '🏆 Agent Architect';
    else if (xp >= 300) rank = '⚡ Graph Master';
    else if (xp >= 200) rank = '🛠️ Tool Builder';
    else if (xp >= 100) rank = '🧠 Brain Trainer';
    else if (xp >= 50) rank = '📋 Curious Explorer';
    rankEl.innerText = `Rank: ${rank}`;
}

// ── Particle Effects ──
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnParticles(x, y) {
    if (!x) x = window.innerWidth / 2;
    if (!y) y = window.innerHeight / 2;

    const colors = ['#333', '#555', '#777', '#999', '#bbb'];
    for (let i = 0; i < 30; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 3,
            life: 1,
            decay: 0.015 + Math.random() * 0.02,
            size: 3 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= p.decay;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
}
animateParticles();


// ═══════════════════════════════════════════
// NAVIGATION & LEVEL MANAGEMENT (Unlocked)
// ═══════════════════════════════════════════

function switchLevel(levelId) {
    document.querySelectorAll('.level').forEach(l => l.classList.remove('active'));
    const target = document.getElementById(levelId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-target="${levelId}"]`);
    if (navItem) navItem.classList.add('active');

    document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    closeSidebar();
}

// All nav items are clickable (no locking)
document.getElementById('level-nav').addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        switchLevel(navItem.dataset.target);
    }
});

// Next level button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('next-level-btn')) {
        const nextLevelId = e.target.dataset.next;
        if (nextLevelId) {
            switchLevel(nextLevelId);
        }
    }
});

// Mobile sidebar
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay visible';
        overlay.onclick = closeSidebar;
        document.body.appendChild(overlay);
    } else {
        overlay.classList.add('visible');
    }
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('visible');
}

// Toggle sidebar with floating button
const floatingBtn = document.getElementById('floating-menu-btn');
if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}

const closeBtn = document.getElementById('sidebar-close');
if (closeBtn) closeBtn.addEventListener('click', closeSidebar);


// ═══════════════════════════════════════════
// LEVEL 1: INTERACTIVE CODE RUNNER & MATH DEMO
// ═══════════════════════════════════════════

let codeRunnerActive = false;

function runCodeDemo() {
    if (codeRunnerActive) return;
    codeRunnerActive = true;

    const runBtn = document.getElementById('run-code-btn');
    const resetBtn = document.getElementById('reset-code-btn');
    const consoleBody = document.getElementById('console-body');
    const varInspector = document.getElementById('var-inspector');
    const varBody = document.getElementById('var-inspector-body');

    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
    resetBtn.style.display = 'none';
    consoleBody.innerHTML = '<span class="console-cursor">▋</span>';
    varInspector.style.display = 'block';
    varBody.innerHTML = '';

    // Clear all line states
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`cl-${i}`).classList.remove('active-line', 'done-line');
        document.getElementById(`cls-${i}`).textContent = '';
    }

    const wrongAnswers = ['3,081,714,741', '3,080,714,841', '3,079,714,741', '3,080,174,741'];
    const llmWrongAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

    // Step 1: Comment line (fast)
    setTimeout(() => {
        highlightLine(1);
        document.getElementById('cls-1').textContent = '✓';
        consoleBody.innerHTML = '<span class="console-muted"># comment — skipped</span><br><span class="console-cursor">▋</span>';
    }, 400);

    // Step 2: Set question variable
    setTimeout(() => {
        completeLine(1);
        highlightLine(2);
        setTimeout(() => {
            document.getElementById('cls-2').textContent = '✓';
            varBody.innerHTML = `
                <div class="var-row animate-in">
                    <span class="var-name">question</span>
                    <span class="var-type">str</span>
                    <span class="var-value">"What is 34567 multiplied by 89123?"</span>
                </div>
            `;
            consoleBody.innerHTML = '<span class="console-muted"># comment — skipped</span><br><span class="console-muted">>> question = "What is 34567 multiplied by 89123?"</span><br><span class="console-cursor">▋</span>';
        }, 500);
    }, 1200);

    // Step 3: llm.invoke() — the dramatic moment
    setTimeout(() => {
        completeLine(2);
        highlightLine(3);
        document.getElementById('cls-3').innerHTML = '<span class="spinner"></span>';
        consoleBody.innerHTML = '<span class="console-muted"># comment — skipped</span><br><span class="console-muted">>> question = "What is 34567 multiplied by 89123?"</span><br><span class="console-info">>> llm.invoke(question)  ⏳ Sending to Groq API...</span><br><span class="console-cursor">▋</span>';

        // API "response" comes back
        setTimeout(() => {
            document.getElementById('cls-3').textContent = '✓';
            varBody.innerHTML = `
                <div class="var-row">
                    <span class="var-name">question</span>
                    <span class="var-type">str</span>
                    <span class="var-value">"What is 34567 multiplied by 89123?"</span>
                </div>
                <div class="var-row animate-in highlight-var">
                    <span class="var-name">response</span>
                    <span class="var-type">AIMessage</span>
                    <span class="var-value">.content = "${llmWrongAnswer}"</span>
                </div>
            `;
            consoleBody.innerHTML = '<span class="console-muted"># comment — skipped</span><br><span class="console-muted">>> question = "What is 34567 multiplied by 89123?"</span><br><span class="console-info">>> llm.invoke(question)  ✓ Response received (0.8s)</span><br><span class="console-cursor">▋</span>';
        }, 2000);
    }, 2800);

    // Step 4: print() — show the output
    setTimeout(() => {
        completeLine(3);
        highlightLine(4);

        setTimeout(() => {
            document.getElementById('cls-4').textContent = '✓';
            // Typing animation for the output
            const outputText = `LLM's Answer: ${llmWrongAnswer}`;
            let printed = '';
            let charIdx = 0;

            const typeInterval = setInterval(() => {
                printed += outputText[charIdx];
                consoleBody.innerHTML = '<span class="console-muted"># comment — skipped</span><br><span class="console-muted">>> question = "What is 34567 multiplied by 89123?"</span><br><span class="console-info">>> llm.invoke(question)  ✓ Response received (0.8s)</span><br><span class="console-output-text">>> ' + printed + '</span><span class="console-cursor">▋</span>';
                charIdx++;
                if (charIdx >= outputText.length) {
                    clearInterval(typeInterval);
                    // Final state
                    setTimeout(() => {
                        completeLine(4);
                        consoleBody.innerHTML = '<span class="console-muted"># comment — skipped</span><br><span class="console-muted">>> question = "What is 34567 multiplied by 89123?"</span><br><span class="console-info">>> llm.invoke(question)  ✓ Response received (0.8s)</span><br><span class="console-output-text console-wrong">>> ' + outputText + '  ← WRONG! ✗</span><br><br><span class="console-note">⚠️ The correct answer is 3,080,714,741</span><br><span class="console-note">   The LLM guessed — it didn\'t calculate!</span>';

                        runBtn.innerHTML = '<span class="btn-icon">✓</span> Execution Complete';
                        resetBtn.style.display = 'inline-flex';
                        addXP(15, 'code-runner');
                        codeRunnerActive = false;
                    }, 400);
                }
            }, 40);
        }, 600);
    }, 5600);
}

function highlightLine(lineNum) {
    document.getElementById(`cl-${lineNum}`).classList.add('active-line');
}

function completeLine(lineNum) {
    const el = document.getElementById(`cl-${lineNum}`);
    el.classList.remove('active-line');
    el.classList.add('done-line');
}

function resetCodeDemo() {
    codeRunnerActive = false;
    const runBtn = document.getElementById('run-code-btn');
    const resetBtn = document.getElementById('reset-code-btn');
    const consoleBody = document.getElementById('console-body');
    const varInspector = document.getElementById('var-inspector');

    runBtn.disabled = false;
    runBtn.innerHTML = '<span class="btn-icon">▶</span> Run Code';
    resetBtn.style.display = 'none';
    consoleBody.innerHTML = '<span class="console-prompt">Waiting to run...</span>';
    varInspector.style.display = 'none';

    for (let i = 1; i <= 4; i++) {
        document.getElementById(`cl-${i}`).classList.remove('active-line', 'done-line');
        document.getElementById(`cls-${i}`).textContent = '';
    }
}

function runMathDemo() {
    const results = document.getElementById('math-results');
    const llmAnswer = document.getElementById('llm-answer');
    const btn = document.getElementById('math-demo-btn');
    const explanation = document.getElementById('math-explanation');

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon">⏳</span> Comparing...';

    setTimeout(() => {
        const wrongAnswers = ['3,081,714,741', '3,080,714,841', '3,079,714,741', '3,080,174,741'];
        llmAnswer.textContent = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        results.style.display = 'flex';
        btn.innerHTML = '<span class="btn-icon">✓</span> Comparison Complete';

         // Show explanation after a brief pause
        setTimeout(() => {
            if (explanation) explanation.style.display = 'flex';
        }, 800);

        addXP(5, 'math-demo');
    }, 1200);
}


// ═══════════════════════════════════════════
// LEVEL 2: TOOL PIPELINE CODE RUNNER
// ═══════════════════════════════════════════

let codeRunnerL2Active = false;

function l2Highlight(n) { document.getElementById(`l2-cl-${n}`).classList.add('active-line'); }
function l2Complete(n) {
    const el = document.getElementById(`l2-cl-${n}`);
    el.classList.remove('active-line');
    el.classList.add('done-line');
    document.getElementById(`l2-cls-${n}`).textContent = '✓';
}

function runCodeDemoL2() {
    if (codeRunnerL2Active) return;
    codeRunnerL2Active = true;

    const runBtn = document.getElementById('run-code-btn-l2');
    const resetBtn = document.getElementById('reset-code-btn-l2');
    const consoleBody = document.getElementById('console-body-l2');
    const varInspector = document.getElementById('var-inspector-l2');
    const varBody = document.getElementById('var-inspector-body-l2');

    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
    resetBtn.style.display = 'none';
    consoleBody.innerHTML = '<span class="console-cursor">▋</span>';
    varInspector.style.display = 'block';
    varBody.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        document.getElementById(`l2-cl-${i}`).classList.remove('active-line', 'done-line');
        document.getElementById(`l2-cls-${i}`).textContent = '';
    }

    // ── PHASE 1: Define the tool (Lines 1-5) ──
    setTimeout(() => {
        l2Highlight(1);
        consoleBody.innerHTML = '<span class="console-muted">>> from langchain_core.tools import tool</span><br><span class="console-cursor">▋</span>';
    }, 400);

    setTimeout(() => {
        l2Complete(1);
        l2Highlight(2); l2Highlight(3); l2Highlight(4); l2Highlight(5);
        consoleBody.innerHTML = '<span class="console-muted">>> from langchain_core.tools import tool</span><br><span class="console-info">>> Registering @tool: multiply(a: float, b: float) → float</span><br><span class="console-info">   📖 Docstring: "Multiply two numbers together."</span><br><span class="console-cursor">▋</span>';
        varBody.innerHTML = '<div class="var-row animate-in"><span class="var-name">multiply</span><span class="var-type">Tool</span><span class="var-value">name="multiply", desc="Multiply two numbers together."</span></div>';
    }, 1200);

    setTimeout(() => { l2Complete(2); l2Complete(3); l2Complete(4); l2Complete(5); }, 2200);

    // ── PHASE 2: Bind & Invoke (Lines 6-7) ──
    setTimeout(() => {
        l2Highlight(6);
        consoleBody.innerHTML = '<span class="console-muted">>> Tool registered: multiply ✓</span><br><span class="console-info">>> llm_with_tools = llm.bind_tools([multiply])</span><br><span class="console-info">   🔗 LLM now knows about: [multiply]</span><br><span class="console-cursor">▋</span>';
        varBody.innerHTML = '<div class="var-row"><span class="var-name">multiply</span><span class="var-type">Tool</span><span class="var-value">name="multiply"</span></div><div class="var-row animate-in highlight-var"><span class="var-name">llm_with_tools</span><span class="var-type">RunnableBinding</span><span class="var-value">llm + [multiply]</span></div>';
    }, 2800);

    setTimeout(() => { l2Complete(6); }, 3600);

    setTimeout(() => {
        l2Highlight(7);
        document.getElementById('l2-cls-7').innerHTML = '<span class="spinner"></span>';
        consoleBody.innerHTML = '<span class="console-muted">>> Tool registered: multiply ✓</span><br><span class="console-muted">>> LLM bound with tools ✓</span><br><span class="console-info">>> response = llm_with_tools.invoke(question)  ⏳ Calling Groq API...</span><br><span class="console-cursor">▋</span>';
    }, 3800);

    setTimeout(() => {
        l2Complete(7);
        consoleBody.innerHTML = '<span class="console-muted">>> Tool registered ✓ | LLM bound ✓</span><br><span class="console-info">>> response received ✓ (0.6s)</span><br><span class="console-output-text">>> Content: ""  ← EMPTY! 🤯</span><br><span class="console-output-text">>> Tool Calls: [{\'name\': \'multiply\', \'args\': {\'a\': 34567, \'b\': 89123}}]</span><br><span class="console-cursor">▋</span>';
        varBody.innerHTML = '<div class="var-row"><span class="var-name">multiply</span><span class="var-type">Tool</span><span class="var-value">name="multiply"</span></div><div class="var-row"><span class="var-name">llm_with_tools</span><span class="var-type">RunnableBinding</span><span class="var-value">llm + [multiply]</span></div><div class="var-row animate-in highlight-var"><span class="var-name">response</span><span class="var-type">AIMessage</span><span class="var-value">.content="" | .tool_calls=[{multiply, a:34567, b:89123}]</span></div>';
    }, 5800);

    // ── PHASE 3: Execute tool call (Lines 8-10) ──
    setTimeout(() => {
        l2Highlight(8);
    }, 7000);

    setTimeout(() => { l2Complete(8); }, 7600);

    setTimeout(() => {
        l2Highlight(9);
        consoleBody.innerHTML = '<span class="console-muted">>> Content: "" ← EMPTY!</span><br><span class="console-muted">>> Tool Calls: [{multiply, args:{34567, 89123}}]</span><br><span class="console-info">>> func_name = "multiply" ✓</span><br><span class="console-info">>> args = {\'a\': 34567, \'b\': 89123} ✓</span><br><span class="console-info">>> Running: multiply.func(34567, 89123)...</span><br><span class="console-cursor">▋</span>';
        varBody.innerHTML = '<div class="var-row"><span class="var-name">response</span><span class="var-type">AIMessage</span><span class="var-value">.content="" | .tool_calls=[{multiply}]</span></div><div class="var-row animate-in"><span class="var-name">func_name</span><span class="var-type">str</span><span class="var-value">"multiply"</span></div><div class="var-row animate-in"><span class="var-name">args</span><span class="var-type">dict</span><span class="var-value">{\'a\': 34567, \'b\': 89123}</span></div>';
    }, 8000);

    setTimeout(() => {
        l2Complete(9);
        varBody.innerHTML += '<div class="var-row animate-in highlight-var"><span class="var-name">result</span><span class="var-type">float</span><span class="var-value">3080714741.0  ✓ CORRECT!</span></div>';
    }, 9200);

    setTimeout(() => {
        l2Highlight(10);
        const outputText = 'Calculated Answer: 3,080,714,741';
        let printed = '';
        let idx = 0;
        const typeInterval = setInterval(() => {
            printed += outputText[idx];
            consoleBody.innerHTML = '<span class="console-muted">>> Content: "" | Tool Calls: [{multiply}]</span><br><span class="console-muted">>> multiply.func(34567, 89123) executed</span><br><br><span class="console-output-text console-correct">>> ' + printed + '</span><span class="console-cursor">▋</span>';
            idx++;
            if (idx >= outputText.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    l2Complete(10);
                    consoleBody.innerHTML = '<span class="console-muted">>> Content: "" | Tool Calls: [{multiply}]</span><br><span class="console-muted">>> multiply.func(34567, 89123) executed</span><br><br><span class="console-output-text console-correct">>> Calculated Answer: 3,080,714,741  ← CORRECT! ✓</span><br><br><span class="console-note">🎉 The tool gave the RIGHT answer!</span><br><span class="console-note">   LLM (brain) + Tool (calculator) = Agent magic!</span>';
                    runBtn.innerHTML = '<span class="btn-icon">✓</span> Execution Complete';
                    resetBtn.style.display = 'inline-flex';
                    addXP(20, 'code-runner-l2');
                    codeRunnerL2Active = false;
                }, 400);
            }
        }, 35);
    }, 9800);
}

function resetCodeDemoL2() {
    codeRunnerL2Active = false;
    document.getElementById('run-code-btn-l2').disabled = false;
    document.getElementById('run-code-btn-l2').innerHTML = '<span class="btn-icon">▶</span> Run Code';
    document.getElementById('reset-code-btn-l2').style.display = 'none';
    document.getElementById('console-body-l2').innerHTML = '<span class="console-prompt">Waiting to run...</span>';
    document.getElementById('var-inspector-l2').style.display = 'none';
    for (let i = 1; i <= 10; i++) {
        document.getElementById(`l2-cl-${i}`).classList.remove('active-line', 'done-line');
        document.getElementById(`l2-cls-${i}`).textContent = '';
    }
}


// Generic quiz handler
document.querySelectorAll('.quiz-options').forEach(group => {
    group.addEventListener('click', (e) => {
        if (!e.target.classList.contains('quiz-btn')) return;
        if (group.dataset.completed === 'true') return;

        const correctAns = group.dataset.correct;
        const selectedAns = e.target.dataset.value;
        const feedback = group.nextElementSibling;
        const level = group.dataset.level;
        const points = Number(group.dataset.points);

        group.querySelectorAll('.quiz-btn').forEach(b => {
            b.classList.remove('correct', 'incorrect');
        });

        if (selectedAns === correctAns) {
            if (level === '5-tools') document.getElementById('l5-tools-next').style.display = 'inline-block';
            if (level === '11') document.getElementById('l11-next-btn').style.display = 'inline-block';
            e.target.classList.add('correct');
            feedback.innerHTML = '✅ ' + getQuizFeedback(level, true);
            feedback.className = 'feedback-text success';
            group.dataset.completed = 'true';
            addXP(points, `quiz-${level}-${correctAns}`);
        } else {
            e.target.classList.add('incorrect');
            feedback.innerHTML = '❌ ' + getQuizFeedback(level, false);
            feedback.className = 'feedback-text error';
        }
    });
});

function getQuizFeedback(level, isCorrect) {
    if (!isCorrect) return 'Not quite. Think about it again!';
    const feedbacks = {
        '0': 'Agents can perceive, reason, act, and loop — that\'s what makes them special!',
        '1': 'The LLM is a word-predictor that can\'t calculate — that\'s why we need tools!',
        '5': 'The tool only supports USD. An agent is only as good as its tools!',
        '11': 'Exactly! Agents are much slower than regular functions because they iteratively reason and fetch web tools.'
    };
    return feedbacks[level] || 'Correct! Great work!';
}


// ═══════════════════════════════════════════
// DRAG & DROP ENGINE (Shared)
// ═══════════════════════════════════════════

let draggedItem = null;

function initDragDrop(containerId, feedbackId, totalItems, xpReward, onComplete) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const draggables = container.querySelectorAll('.drag-item');
    const dropZones = container.querySelectorAll('.drop-zone');

    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });
        item.addEventListener('touchstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
        }, { passive: true });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!zone.classList.contains('filled')) zone.classList.add('hover');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('hover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('hover');
            handleDrop(zone, container, feedbackId, totalItems, xpReward, onComplete);
        });
        zone.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleDrop(zone, container, feedbackId, totalItems, xpReward, onComplete);
        });
    });
}

function handleDrop(zone, container, feedbackId, totalItems, xpReward, onComplete) {
    if (!draggedItem || zone.classList.contains('filled')) return;

    const expected = zone.dataset.match;
    const actual = draggedItem.dataset.id;

    if (expected === actual) {
        zone.textContent = '✓ ' + draggedItem.textContent;
        zone.classList.add('filled');
        draggedItem.remove();
        draggedItem = null;

        const filledCount = container.querySelectorAll('.drop-zone.filled').length;
        if (filledCount >= totalItems) {
            const feedback = document.getElementById(feedbackId);
            if (feedback) {
                feedback.innerHTML = '🎉 Perfect! All matched correctly!';
                feedback.className = 'feedback-text success';
            }
            addXP(xpReward, feedbackId);
            if (onComplete) onComplete();
        }
    } else {
        zone.classList.add('wrong');
        setTimeout(() => zone.classList.remove('wrong'), 600);
    }
}

// Initialize Level 2 drag-and-drop
initDragDrop('dd-tools', 'dd-tools-feedback', 4, 20);

// Initialize Level 8 drag-and-drop
initDragDrop('dd-terms', 'dd-terms-feedback', 6, 25);


// ═══════════════════════════════════════════
// LEVEL 3: ORDERING GAME
// ═══════════════════════════════════════════

(function initOrderingGame() {
    const slots = document.querySelectorAll('.slot-drop');
    const orderItems = document.querySelectorAll('.order-drag');

    orderItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });
    });

    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!slot.classList.contains('filled')) slot.classList.add('hover');
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('hover'));
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('hover');
            if (!draggedItem || slot.classList.contains('filled')) return;

            const expectedPos = parseInt(slot.dataset.pos);
            const actualOrder = parseInt(draggedItem.dataset.order);

            if (expectedPos === actualOrder) {
                slot.textContent = draggedItem.textContent;
                slot.classList.add('filled');
                draggedItem.remove();
                draggedItem = null;

                const allFilled = document.querySelectorAll('.slot-drop.filled').length === 4;
                if (allFilled) {
                    const feedback = document.getElementById('ordering-feedback');
                    feedback.innerHTML = '🎉 Perfect sequence! The agentic flow is clear!';
                    feedback.className = 'feedback-text success';
                    addXP(20, 'ordering-game');
                }
            } else {
                slot.classList.add('wrong');
                setTimeout(() => {
                    slot.classList.remove('wrong');
                    slot.style.borderColor = '';
                }, 600);
                const feedback = document.getElementById('ordering-feedback');
                feedback.innerHTML = '🤔 Not quite. Think about what happens first in the flow!';
                feedback.className = 'feedback-text error';
            }
        });
    });
})();


// ═══════════════════════════════════════════
// LEVEL 4: GRAPH BUILDER
// ═══════════════════════════════════════════

const graphSequence = ['start', 'assistant', 'router', 'tools', 'end'];
let graphStep = 0;
let graphActive = false;

function startGraphBuilder() {
    graphActive = true;
    graphStep = 0;
    document.getElementById('graph-start-btn').style.display = 'none';
    document.getElementById('graph-reset-btn').style.display = 'inline-flex';
    document.getElementById('graph-status').textContent = '👉 Click the START node to begin wiring!';
    document.getElementById('gn-start').classList.add('active-node');
}

function resetGraphBuilder() {
    graphStep = 0;
    graphActive = false;
    document.getElementById('graph-start-btn').style.display = 'inline-flex';
    document.getElementById('graph-reset-btn').style.display = 'none';
    document.getElementById('graph-status').textContent = '';
    document.getElementById('graph-feedback').innerHTML = '';

    document.querySelectorAll('.graph-node').forEach(n => {
        n.classList.remove('active-node', 'wired');
    });
    document.querySelectorAll('.graph-edge').forEach(e => {
        e.classList.remove('wired');
    });
}

document.getElementById('graph-builder').addEventListener('click', (e) => {
    if (!graphActive) return;
    const node = e.target.closest('.graph-node');
    if (!node) return;

    const nodeId = node.dataset.node;
    const expectedNode = graphSequence[graphStep];

    if (nodeId === expectedNode) {
        node.classList.remove('active-node');
        node.classList.add('wired');

        const edgeMap = {
            0: 'ge-1',
            1: 'ge-2',
            2: ['ge-3a', 'ge-3b'],
            3: 'ge-4'
        };

        const edgeId = edgeMap[graphStep];
        if (edgeId) {
            if (Array.isArray(edgeId)) {
                edgeId.forEach(id => document.getElementById(id)?.classList.add('wired'));
            } else {
                document.getElementById(edgeId)?.classList.add('wired');
            }
        }

        graphStep++;

        if (graphStep < graphSequence.length) {
            const nextNode = document.getElementById(`gn-${graphSequence[graphStep]}`);
            if (nextNode) nextNode.classList.add('active-node');

            const statusMessages = {
                1: '🧠 Now click the Assistant node!',
                2: '🚦 Click the Router — it decides what happens next!',
                3: '🛠️ Click the Tools node — it executes tool calls!',
                4: '⏹ Click END — to complete the graph!'
            };
            document.getElementById('graph-status').textContent = statusMessages[graphStep] || '';
        }

        if (graphStep >= graphSequence.length) {
            graphActive = false;
            document.getElementById('graph-status').textContent = '';
            document.getElementById('graph-feedback').innerHTML = '🎉 Graph wired successfully! The LangGraph loop is complete!';
            document.getElementById('graph-feedback').className = 'feedback-text success';
            addXP(25, 'graph-builder');
        }
    } else {
        document.getElementById('graph-status').textContent = `❌ Not that one! Click the ${expectedNode.toUpperCase()} node.`;
    }
});


// ═══════════════════════════════════════════
// LEVEL 5: PERSONA LAB
// ═══════════════════════════════════════════

let selectedPersona = 'trader';

function selectPersona(btn) {
    document.querySelectorAll('.persona-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    selectedPersona = btn.dataset.persona;

    const customInput = document.getElementById('custom-persona');
    customInput.style.display = selectedPersona === 'custom' ? 'block' : 'none';
}

function runPersonaLab() {
    const output = document.getElementById('persona-output');
    const stepsEl = document.getElementById('agent-steps');
    output.style.display = 'block';
    stepsEl.innerHTML = '';

    const personaResponses = {
        trader: {
            steps: [
                { type: 'step-tool', label: 'TOOL CALL', text: '📡 Calling get_crypto_price("bitcoin")...' },
                { type: 'step-tool', label: 'TOOL RESULT', text: '💰 Current BTC Price: $67,342.18 USD' },
                { type: 'step-tool', label: 'TOOL CALL', text: '🧮 Calling multiply(67342.18, 2.5)...' },
                { type: 'step-result', label: 'AGENT RESPONSE', text: '"HOLY BULL RUN! 📈 Your 2.5 BTC portfolio is sitting at $168,355.45! That\'s a BEAST position! BTC is looking absolutely BULLISH right now — TO THE MOON! 🚀 Diamond hands, baby!"' }
            ]
        },
        pirate: {
            steps: [
                { type: 'step-tool', label: 'TOOL CALL', text: '📡 Calling get_crypto_price("bitcoin")...' },
                { type: 'step-tool', label: 'TOOL RESULT', text: '💰 Current BTC Price: $67,342.18 USD' },
                { type: 'step-tool', label: 'TOOL CALL', text: '🧮 Calling multiply(67342.18, 2.5)...' },
                { type: 'step-result', label: 'AGENT RESPONSE', text: '"ARRR! Ye treasure chest be worth $168,355.45 in doubloons! 🏴‍☠️ By Davy Jones\' locker, that\'s a fine haul! The seas be favorable for Bitcoin, me hearty! HOIST THE SAILS!"' }
            ]
        },
        monk: {
            steps: [
                { type: 'step-tool', label: 'TOOL CALL', text: '📡 Calling get_crypto_price("bitcoin")...' },
                { type: 'step-tool', label: 'TOOL RESULT', text: '💰 Current BTC Price: $67,342.18 USD' },
                { type: 'step-tool', label: 'TOOL CALL', text: '🧮 Calling multiply(67342.18, 2.5)...' },
                { type: 'step-result', label: 'AGENT RESPONSE', text: '"🧘 Breathe deeply. Your 2.5 Bitcoin, like flowing water, carries a value of $168,355.45. Remember: wealth is impermanent. The price rises and falls like the tide. Find peace not in numbers, but in wisdom."' }
            ]
        },
        custom: {
            steps: [
                { type: 'step-tool', label: 'TOOL CALL', text: '📡 Calling get_crypto_price("bitcoin")...' },
                { type: 'step-tool', label: 'TOOL RESULT', text: '💰 Current BTC Price: $67,342.18 USD' },
                { type: 'step-tool', label: 'TOOL CALL', text: '🧮 Calling multiply(67342.18, 2.5)...' },
                { type: 'step-result', label: 'AGENT RESPONSE', text: '"Based on current market data, your 2.5 BTC portfolio is valued at $168,355.45 USD. The agent used your custom persona to generate this response!"' }
            ]
        }
    };

    const data = personaResponses[selectedPersona];
    data.steps.forEach((step, i) => {
        const div = document.createElement('div');
        div.className = `agent-step ${step.type}`;
        div.style.animationDelay = `${i * 0.6}s`;
        div.innerHTML = `<span class="step-label" style="color: ${step.type === 'step-result' ? '#222' : '#555'}">${step.label}</span>${step.text}`;
        stepsEl.appendChild(div);
    });

    addXP(15, 'persona-lab');
}


// ═══════════════════════════════════════════
// LEVEL 6: SOFTWARE HOUSE SIMULATOR
// ═══════════════════════════════════════════

let simRunning = false;

function runSimulator() {
    if (simRunning) return;
    simRunning = true;

    const btn = document.getElementById('sim-run-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon">⏳</span> Running...';

    const timeline = document.getElementById('sim-timeline');
    timeline.style.display = 'flex';

    const request = document.getElementById('sim-request').value || 'Create a snake game';

    ['pm', 'dev', 'qa'].forEach(id => {
        document.getElementById(`sim-step-${id}`).className = 'sim-step';
        document.getElementById(`sim-status-${id}`).textContent = 'Waiting...';
        document.getElementById(`sim-status-${id}`).style.color = '#444';
        document.getElementById(`sim-output-${id}`).style.display = 'none';
    });
    document.getElementById('sim-loop-connector').style.display = 'none';
    document.getElementById('sim-loop-msg').style.display = 'none';
    document.getElementById('sim-final').style.display = 'none';
    document.getElementById('dev-attempt').textContent = '1';

    // Step 1: PM
    setTimeout(() => {
        const pmStep = document.getElementById('sim-step-pm');
        pmStep.classList.add('active-step');
        document.getElementById('sim-status-pm').textContent = 'Analyzing...';
        document.getElementById('sim-status-pm').style.color = '#444';

        setTimeout(() => {
            pmStep.classList.remove('active-step');
            pmStep.classList.add('done');
            document.getElementById('sim-status-pm').textContent = '✓ Done';
            document.getElementById('sim-status-pm').style.color = '#222';
            const output = document.getElementById('sim-output-pm');
            output.style.display = 'block';
            output.innerHTML = `<strong>📋 Specs:</strong> Build "${request}" with the following:\n• Core game loop with keyboard controls\n• Score tracking system\n• Game over detection\n• Clean, modular Python code`;

            // Step 2: Dev (Attempt 1)
            setTimeout(() => {
                const devStep = document.getElementById('sim-step-dev');
                devStep.classList.add('active-step');
                document.getElementById('sim-status-dev').textContent = 'Writing code...';
                document.getElementById('sim-status-dev').style.color = '#444';

                setTimeout(() => {
                    devStep.classList.remove('active-step');
                    devStep.classList.add('done');
                    document.getElementById('sim-status-dev').textContent = '✓ Done';
                    document.getElementById('sim-status-dev').style.color = '#222';
                    const devOutput = document.getElementById('sim-output-dev');
                    devOutput.style.display = 'block';
                    devOutput.innerHTML = '<strong>👨‍💻 Code v1:</strong> Basic implementation with pygame, snake movement, and food generation. Missing: score display, game over screen.';

                    // Step 3: QA (Reject!)
                    setTimeout(() => {
                        const qaStep = document.getElementById('sim-step-qa');
                        qaStep.classList.add('active-step');
                        document.getElementById('sim-status-qa').textContent = 'Reviewing...';
                        document.getElementById('sim-status-qa').style.color = '#444';

                        setTimeout(() => {
                            qaStep.classList.remove('active-step');
                            qaStep.classList.add('done');
                            document.getElementById('sim-status-qa').textContent = '❌ REJECTED';
                            document.getElementById('sim-status-qa').style.color = '#777';
                            const qaOutput = document.getElementById('sim-output-qa');
                            qaOutput.style.display = 'block';
                            qaOutput.innerHTML = '<strong>🔍 Review:</strong> REJECTED — Missing scoring system UI and no game-over screen. The PM spec required both.';

                            // Loop back!
                            setTimeout(() => {
                                document.getElementById('sim-loop-connector').style.display = 'block';
                                document.getElementById('sim-loop-msg').style.display = 'block';

                                // Step 4: Dev (Attempt 2)
                                setTimeout(() => {
                                    document.getElementById('dev-attempt').textContent = '2';
                                    const devStep2 = document.getElementById('sim-step-dev');
                                    devStep2.className = 'sim-step active-step';
                                    document.getElementById('sim-status-dev').textContent = 'Rewriting...';
                                    document.getElementById('sim-status-dev').style.color = '#666';
                                    document.getElementById('sim-output-dev').innerHTML = '<strong>👨‍💻 Code v2:</strong> Added scoring display, game-over screen, restart functionality. Addressed all QA feedback.';

                                    setTimeout(() => {
                                        devStep2.classList.remove('active-step');
                                        devStep2.classList.add('done');
                                        document.getElementById('sim-status-dev').textContent = '✓ Done';
                                        document.getElementById('sim-status-dev').style.color = '#222';

                                        // Step 5: QA (Approve!)
                                        setTimeout(() => {
                                            const qaStep2 = document.getElementById('sim-step-qa');
                                            qaStep2.className = 'sim-step active-step';
                                            document.getElementById('sim-status-qa').textContent = 'Re-reviewing...';
                                            document.getElementById('sim-status-qa').style.color = '#444';

                                            setTimeout(() => {
                                                qaStep2.classList.remove('active-step');
                                                qaStep2.classList.add('done');
                                                document.getElementById('sim-status-qa').textContent = '✅ APPROVED';
                                                document.getElementById('sim-status-qa').style.color = '#222';
                                                document.getElementById('sim-output-qa').innerHTML = '<strong>🔍 Review:</strong> APPROVED! All requirements met. Code is clean and functional.';

                                                // Final
                                                setTimeout(() => {
                                                    document.getElementById('sim-final').style.display = 'block';
                                                    document.getElementById('sim-final-text').textContent = `The team completed "${request}" in 2 iterations. PM wrote specs → Dev coded (rejected) → Dev fixed → QA approved. The loop automated the entire process!`;

                                                    addXP(30, 'simulator');
                                                    simRunning = false;
                                                    btn.disabled = false;
                                                    btn.innerHTML = '<span class="btn-icon">🚀</span> Run Again';
                                                }, 600);
                                            }, 1000);
                                        }, 500);
                                    }, 1200);
                                }, 800);
                            }, 600);
                        }, 1200);
                    }, 500);
                }, 1500);
            }, 500);
        }, 1200);
    }, 400);
}

// Fill-in-the-Blanks
function checkFillBlanks() {
    const selects = document.querySelectorAll('#fill-blanks .blank-select');
    let allCorrect = true;

    selects.forEach(select => {
        select.classList.remove('correct', 'incorrect');
        if (select.value === select.dataset.correct) {
            select.classList.add('correct');
        } else {
            select.classList.add('incorrect');
            allCorrect = false;
        }
    });

    const feedback = document.getElementById('fill-feedback');
    if (allCorrect) {
        feedback.innerHTML = '🎉 Perfect! All agents follow the same pattern: State → Prompt → LLM → Dictionary!';
        feedback.className = 'feedback-text success';
        addXP(20, 'fill-blanks');
    } else {
        feedback.innerHTML = '❌ Some answers are incorrect. Re-read the pattern and try again!';
        feedback.className = 'feedback-text error';
    }
}


// ═══════════════════════════════════════════
// LEVEL 9: BLUEPRINT BUILDER
// ═══════════════════════════════════════════

let selectedScenario = null;

function selectScenario(card) {
    document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedScenario = card.dataset.scenario;

    document.getElementById('bp-step-2').style.display = 'block';
    document.getElementById('bp-step-2').scrollIntoView({ behavior: 'smooth', block: 'center' });

    const toolbox = document.getElementById('toolbox-drop');
    toolbox.innerHTML = 'Drop tools here...';
    toolbox.className = 'toolbox-drop';
    document.querySelectorAll('.tool-chip').forEach(c => c.classList.remove('used'));

    addXP(5, 'bp-scenario');
}

// Toolbox drag-and-drop
(function initToolbox() {
    const toolChips = document.querySelectorAll('.tool-chip');
    const toolboxDrop = document.getElementById('toolbox-drop');
    if (!toolboxDrop) return;

    toolChips.forEach(chip => {
        chip.addEventListener('dragstart', (e) => {
            draggedItem = chip;
            chip.classList.add('dragging');
        });
        chip.addEventListener('dragend', () => {
            chip.classList.remove('dragging');
            draggedItem = null;
        });
    });

    toolboxDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        toolboxDrop.classList.add('hover');
    });
    toolboxDrop.addEventListener('dragleave', () => {
        toolboxDrop.classList.remove('hover');
    });
    toolboxDrop.addEventListener('drop', (e) => {
        e.preventDefault();
        toolboxDrop.classList.remove('hover');
        if (!draggedItem) return;

        const toolFor = draggedItem.dataset.for;
        const feedback = document.getElementById('toolbox-feedback');

        if (toolFor === selectedScenario) {
            if (toolboxDrop.textContent === 'Drop tools here...') toolboxDrop.innerHTML = '';
            const item = document.createElement('div');
            item.className = 'toolbox-item';
            item.textContent = '✓ ' + draggedItem.textContent;
            toolboxDrop.appendChild(item);
            draggedItem.classList.add('used');
            draggedItem = null;

            const correctTools = toolboxDrop.querySelectorAll('.toolbox-item').length;
            if (correctTools >= 2) {
                feedback.innerHTML = '✅ Toolkit complete! Both tools are loaded!';
                feedback.className = 'feedback-text success';
                addXP(15, 'bp-tools');

                setTimeout(() => {
                    document.getElementById('bp-step-3').style.display = 'block';
                    document.getElementById('bp-step-3').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 600);
            }
        } else {
            feedback.innerHTML = '❌ That tool doesn\'t match your chosen scenario. Try a different one!';
            feedback.className = 'feedback-text error';
        }
    });
})();

function submitPersona() {
    const personaInput = document.getElementById('blueprint-persona');
    const feedback = document.getElementById('persona-bp-feedback');

    if (personaInput.value.length < 15) {
        feedback.innerHTML = '❌ Your system message is too short. Describe the persona\'s tone, behavior, and style!';
        feedback.className = 'feedback-text error';
        return;
    }

    feedback.innerHTML = '✅ Persona locked in! Your agent has a soul now.';
    feedback.className = 'feedback-text success';
    addXP(10, 'bp-persona');

    setTimeout(() => {
        document.getElementById('bp-step-4').style.display = 'block';
        document.getElementById('bp-step-4').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
}

function submitRouter() {
    const toolAction = document.getElementById('router-tool-action').value;
    const endAction = document.getElementById('router-end-action').value;
    const feedback = document.getElementById('router-feedback');

    if (toolAction === 'tools' && endAction === 'end') {
        feedback.innerHTML = '✅ Perfect router logic! Tool calls go to Tools, otherwise END.';
        feedback.className = 'feedback-text success';
        addXP(50, 'bp-router');

        setTimeout(() => {
            document.getElementById('bp-final').style.display = 'block';

            const scenarioNames = { fitness: 'Fitness Coach', news: 'News Summarizer', code: 'Code Review' };
            const persona = document.getElementById('blueprint-persona').value;

            document.getElementById('blueprint-summary').innerHTML = `
                <strong>Agent:</strong> ${scenarioNames[selectedScenario] || 'Custom'} Agent<br>
                <strong>Persona:</strong> "${persona.substring(0, 100)}${persona.length > 100 ? '...' : ''}"<br>
                <strong>Tools:</strong> ${getSelectedTools()}<br>
                <strong>Router:</strong> If tool_calls → Tools node. If no calls → END.<br>
                <strong>Graph:</strong> START → Assistant → Router → [Tools ↩ Assistant | END]
            `;

            // Unhide Phase 2 Code Builder!
            document.getElementById('bp-build').style.display = 'block';
            document.getElementById('bp-build').scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        }, 600);
    } else {
        if (toolAction !== 'tools') {
            feedback.innerHTML = '❌ When the LLM requests a tool, where should the graph go? Think about the assembly line!';
        } else {
            feedback.innerHTML = '❌ When no tool is needed, the agent is done. Where should it go?';
        }
        feedback.className = 'feedback-text error';
    }
}

function getSelectedTools() {
    const items = document.querySelectorAll('.toolbox-item');
    return Array.from(items).map(i => i.textContent.replace('✓ ', '')).join(', ') || 'None';
}

function completeQuest() {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3);
    setTimeout(() => spawnParticles(window.innerWidth / 3, window.innerHeight / 2), 300);
    setTimeout(() => spawnParticles(window.innerWidth * 2/3, window.innerHeight / 2), 600);

    xp = maxXP;
    document.getElementById('xp-counter').innerText = xp;
    document.getElementById('xp-bar-fill').style.width = '100%';
    const mobileXp = document.getElementById('xp-counter-mobile');
    if (mobileXp) mobileXp.innerText = xp;
    updateRank();

    const btn = document.getElementById('complete-btn');
    btn.textContent = '🏆 Quest Complete!';
    btn.disabled = true;
    btn.style.opacity = '0.7';
}

function revealCodeStep(stepNum) {
    document.getElementById(`code-solution-${stepNum}`).style.display = 'block';
    
    // Hide the button safely
    const btn = document.querySelector(`#build-step-${stepNum} .action-btn`);
    if (btn) btn.style.display = 'none';

    addXP(15, `build-step-${stepNum}`);
    
    if (stepNum < 5) {
        setTimeout(() => {
            const nextStep = document.getElementById(`build-step-${stepNum + 1}`);
            if (nextStep) {
                nextStep.style.display = 'block';
                nextStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 400);
    } else {
        // Final completion step
        setTimeout(() => {
            document.getElementById('complete-btn').style.display = 'inline-block';
            document.getElementById('complete-btn').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
    }
}
// ==========================================
// LEVEL 10: RAPID PROTOTYPING DRAG & DROP
// ==========================================
let l10Placed = 0;

function allowDropFramework(ev) {
    ev.preventDefault();
}

function dragFramework(ev) {
    draggedItem = ev.target;
    ev.target.classList.add('dragging');
}

function enterFrameworkDrop(ev) {
    let dz = ev.target.closest('.framework-drop');
    if(dz) dz.classList.add('hover');
}

function leaveFrameworkDrop(ev) {
    let dz = ev.target.closest('.framework-drop');
    if(dz) dz.classList.remove('hover');
}

function dropFramework(ev) {
    ev.preventDefault();
    if (!draggedItem) return;
    
    let dropzone = ev.target.closest('.framework-drop');
    if (!dropzone) return;
    
    dropzone.classList.remove('hover');
    
    const correctBucket = draggedItem.dataset.answer;
    const targetBucket = dropzone.dataset.bucket;
    
    if (correctBucket === targetBucket) {
        dropzone.appendChild(draggedItem);
        draggedItem.draggable = false;
        draggedItem.style.cursor = 'default';
        draggedItem.style.background = '#dcfce7';
        draggedItem.style.borderColor = '#22c55e';
        draggedItem.classList.remove('dragging');
        draggedItem = null;
        
        l10Placed++;
        addXP(20, `l10-chip-${l10Placed}`);
        
        if (l10Placed === 4) {
            document.getElementById('l10-next-btn').style.display = 'inline-block';
            addXP(50, 'l10-mastered');
        }
    } else {
        draggedItem.classList.remove('dragging');
        draggedItem.classList.add('shake');
        setTimeout(() => draggedItem.classList.remove('shake'), 400);
        draggedItem = null;
    }
}

// ==========================================
// LEVEL 10: Expandable Framework Panels
// ==========================================
function toggleFrameworkPanel(framework) {
    const panel = document.getElementById(`panel-${framework}`);
    const card = document.getElementById(`card-${framework}`);
    const otherFramework = framework === 'streamlit' ? 'gradio' : 'streamlit';
    const otherPanel = document.getElementById(`panel-${otherFramework}`);
    const otherCard = document.getElementById(`card-${otherFramework}`);

    // If clicking the same card that's already open, close it
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
        card.classList.remove('active-card');
        return;
    }

    // Close the other panel if open
    if (otherPanel) {
        otherPanel.style.display = 'none';
        otherCard.classList.remove('active-card');
    }

    // Open this panel
    panel.style.display = 'block';
    card.classList.add('active-card');

    // Scroll to the panel smoothly
    setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    addXP(10, `l10-explore-${framework}`);
}

// ==========================================
// LEVEL 11: Single-Agent UIs
// ==========================================
function simCryptoStreamlit() {
    const btn = document.getElementById('sim-crypto-btn');
    const out = document.getElementById('sim-crypto-output');
    
    btn.innerHTML = `⏳ Agent is thinking...`;
    btn.style.opacity = '0.7';
    out.style.display = 'none';
    
    setTimeout(() => {
        btn.innerHTML = `Check Price`;
        btn.style.opacity = '1';
        out.style.display = 'block';
        addXP(10, 'l11-crypto-sim');
    }, 1500);
}

function simNewsGradio() {
    const btn = document.getElementById('sim-news-btn');
    const out = document.getElementById('sim-gradio-output');
    
    btn.innerHTML = `⏳ Processing Agent Loop...`;
    btn.style.opacity = '0.7';
    out.innerHTML = `<span style="opacity:0.5;">Generating summary tools...</span>`;
    
    setTimeout(() => {
        btn.innerHTML = `Submit`;
        btn.style.opacity = '1';
        out.innerHTML = `<strong>Title:</strong> AI Agents Revolutionize Work<br><strong>Summary:</strong> AI Agents are now capable of multi-tool execution and reasoning over complex loops...`;
        addXP(10, 'l11-news-sim');
    }, 1500);
}

// ==========================================
// LEVEL 12: Software House UI
// ==========================================
function simSoftwareHouseUI() {
    const btn = document.getElementById('sim-swe-btn');
    const container = document.getElementById('sim-swe-status-container');
    const title = document.getElementById('sim-swe-status-title');
    const logs = document.getElementById('sim-swe-logs');
    const finalCode = document.getElementById('sim-swe-final-code');
    const spinner = document.getElementById('sim-swe-spinner');
    
    btn.disabled = true;
    btn.style.opacity = '0.5';
    container.style.display = 'block';
    finalCode.style.display = 'none';
    logs.innerHTML = '';
    title.textContent = "Initializing AI Employees...";
    spinner.className = 'spin';
    spinner.textContent = '↻';
    spinner.style.color = '#3b82f6';
    
    setTimeout(() => { logs.innerHTML += `<div>✅ PM generated requirements.</div>`; }, 1000);
    setTimeout(() => { logs.innerHTML += `<div>💻 Developer wrote code.</div>`; }, 2500);
    setTimeout(() => { logs.innerHTML += `<div>🔍 QA is reviewing code...</div>`; }, 4000);
    setTimeout(() => {
        logs.innerHTML += `<div style="color:#ef4444">❌ QA Rejected: Missing edge cases.</div>`;
        logs.innerHTML += `<div style="color:#f59e0b">⚠️ Re-routing back to Developer...</div>`;
    }, 5500);
    setTimeout(() => { logs.innerHTML += `<div>💻 Developer updated code.</div>`; }, 7500);
    setTimeout(() => { logs.innerHTML += `<div>🔍 QA is reviewing code...</div>`; }, 9000);
    setTimeout(() => { logs.innerHTML += `<div style="color:#10b981">✅ QA Approved!</div>`; }, 10500);
    setTimeout(() => {
        title.textContent = "Software Done!";
        spinner.className = '';
        spinner.textContent = '✓';
        spinner.style.color = '#10b981';
        container.querySelector('#sim-swe-status-header').style.background = '#dcfce7';
        container.querySelector('#sim-swe-status-header').style.borderColor = '#22c55e';
    }, 11000);
    setTimeout(() => {
        finalCode.style.display = 'block';
        document.getElementById('final-graduation-btn').style.display = 'inline-block';
        addXP(50, 'l12-software-house');
    }, 11500);
}

// ==========================================
// LEVEL 12: Expandable Project Panels
// ==========================================
function toggleProjectPanel(projectId) {
    const allProjects = ['news-summariser', 'code-review', 'software-house'];
    const panel = document.getElementById(`project-panel-${projectId}`);
    const card = document.getElementById(`project-card-${projectId}`);

    // If clicking the same card that's already open, close it
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
        card.classList.remove('active-card');
        return;
    }

    // Close all other panels
    allProjects.forEach(pid => {
        const p = document.getElementById(`project-panel-${pid}`);
        const c = document.getElementById(`project-card-${pid}`);
        if (p) { p.style.display = 'none'; }
        if (c) { c.classList.remove('active-card'); }
    });

    // Open this panel
    panel.style.display = 'block';
    card.classList.add('active-card');

    // Scroll to the panel smoothly
    setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    addXP(10, `l12-explore-${projectId}`);
}

function triggerGraduation() {
    alert("🎓 CONGRATULATIONS! You have completed the Agentic AI gamified course! You are now fully equipped to build multi-tool LangGraph agents in Google Colab and wrap them in beautiful Streamlit/Gradio web interfaces! Go out there and build something amazing!");
    window.location.reload();
}

function showLevel(levelNum) {
    switchLevel(`level-${levelNum}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    switchLevel('level-0');
});

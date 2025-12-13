function cubicBezier(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
    const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

    return { x, y };
}

function bezierTangent(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    const t2 = t * t;

    // Calculate derivative components
    // Term 1: 3(1-t)²(P₁-P₀)
    const term1Scale = 3 * mt * mt;
    const dx1 = term1Scale * (p1.x - p0.x);
    const dy1 = term1Scale * (p1.y - p0.y);

    // Term 2: 6(1-t)t(P₂-P₁)
    const term2Scale = 6 * mt * t;
    const dx2 = term2Scale * (p2.x - p1.x);
    const dy2 = term2Scale * (p2.y - p1.y);

    // Term 3: 3t²(P₃-P₂)
    const term3Scale = 3 * t2;
    const dx3 = term3Scale * (p3.x - p2.x);
    const dy3 = term3Scale * (p3.y - p2.y);

    // Sum components
    const tx = dx1 + dx2 + dx3;
    const ty = dy1 + dy2 + dy3;

    // Normalize
    const length = Math.sqrt(tx * tx + ty * ty);
    if (length === 0) return { x: 0, y: 0 };
    
    return { x: tx / length, y: ty / length };
}

class SpringPoint {
    constructor(x, y) {
        this.position = { x, y };
        this.target = { x, y };
        this.velocity = { x: 0, y: 0 };
        
        // Physics constants
        this.stiffness = 0.1; // Spring constant (k)
        this.damping = 0.85;  // Damping factor
        this.mass = 1.0;
    }

    update() {
        // Force = -k * (position - target)
        const forceX = -this.stiffness * (this.position.x - this.target.x);
        const forceY = -this.stiffness * (this.position.y - this.target.y);

        // Acceleration = Force / Mass
        const ax = forceX / this.mass;
        const ay = forceY / this.mass;

        // Update velocity
        this.velocity.x += ax;
        this.velocity.y += ay;

        // Apply damping
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    setTarget(x, y) {
        this.target.x = x;
        this.target.y = y;
    }
}


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// State
let width, height;
let p0, p3; 
let cp1, cp2; 
let mouse = { x: 0, y: 0 };
let isMouseActive = false;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Reset points based on new dimensions
    const centerY = height / 2;
    const margin = width * 0.1;

    p0 = { x: margin, y: centerY };
    p3 = { x: width - margin, y: centerY };

    // Initialize control points if not already created
    if (!cp1) {
        cp1 = new SpringPoint(width * 0.33, centerY);
        cp2 = new SpringPoint(width * 0.66, centerY);
    }
}


window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMouseActive = true;
});

window.addEventListener('mouseleave', () => {
    isMouseActive = false;
});


function updatePhysics() {
    const centerY = height / 2;
    
    let target1 = { x: width * 0.33, y: centerY };
    let target2 = { x: width * 0.66, y: centerY };

    if (isMouseActive) {
        const influence = 0.6;
        
        target1.x += (mouse.x - target1.x) * influence;
        target1.y += (mouse.y - target1.y) * influence;
        
        target2.x += (mouse.x - target2.x) * influence;
        target2.y += (mouse.y - target2.y) * influence;
    }

    // Update physics simulation
    cp1.setTarget(target1.x, target1.y);
    cp2.setTarget(target2.x, target2.y);
    
    cp1.update();
    cp2.update();
}

function drawPoint(p, color, radius = 5) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawLine(pA, pB, color, width = 1) {
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();
}

function draw() {
    // Clear screen
    ctx.clearRect(0, 0, width, height);

    // Update physics
    updatePhysics();

    // Get current positions
    const P0 = p0;
    const P1 = cp1.position;
    const P2 = cp2.position;
    const P3 = p3;

    // 1. Draw Control Lines (Visual aid)
    ctx.setLineDash([5, 5]);
    drawLine(P0, P1, 'rgba(255, 255, 255, 0.2)');
    drawLine(P3, P2, 'rgba(255, 255, 255, 0.2)');
    drawLine(P1, P2, 'rgba(255, 255, 255, 0.2)');
    ctx.setLineDash([]);

    // 2. Draw Bézier Curve
    ctx.beginPath();
    ctx.moveTo(P0.x, P0.y);
    
    // Sample the curve
    const steps = 100; // t increments of 0.01
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const point = cubicBezier(t, P0, P1, P2, P3);
        ctx.lineTo(point.x, point.y);
    }
    
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();

    // 3. Draw Tangents
    // Draw tangents at t = 0.2, 0.5, 0.8
    const tangentPoints = [0.2, 0.5, 0.8];
    const tangentLength = 40;

    tangentPoints.forEach(t => {
        const origin = cubicBezier(t, P0, P1, P2, P3);
        const tangent = bezierTangent(t, P0, P1, P2, P3);
        
        const endX = origin.x + tangent.x * tangentLength;
        const endY = origin.y + tangent.y * tangentLength;
        
        drawLine(origin, { x: endX, y: endY }, '#00ff88', 2);
        
        // Draw a small dot at the tangent origin
        drawPoint(origin, '#00ff88', 3);
    });

    // 4. Draw Control Points
    drawPoint(P0, '#ff4444'); // Fixed
    drawPoint(P3, '#ff4444'); // Fixed
    drawPoint(P1, '#ffaa00'); // Dynamic
    drawPoint(P2, '#ffaa00'); // Dynamic

    requestAnimationFrame(draw);
}

// Initialize
resize();
requestAnimationFrame(draw);

# Interactive Bézier Curve Simulation

## The Challenge
The assignment was pretty straightforward but tricky: build a digital rope from scratch. No physics libraries, no pre-made Bézier tools. Just raw math and code. 

The goal was to make a cubic Bézier curve that doesn't just sit there—it needs to react to you. It had to feel "springy" and alive, showing its tangents as it moves, all while running smoothly at 60 FPS.

## How it Works (The "Feel")
When you move your mouse around the screen, you'll notice the rope acts a bit like it's magnetic or floating in water. 

I didn't want it to just snap directly to your cursor because that looks stiff and robotic. Instead, the control points (the invisible handles that shape the curve) get "pulled" toward your mouse, but they have weight. They swing towards you and then bounce back into place when you leave. This is all powered by a custom spring-physics system running under the hood.

## How to Run
Simply open `index.html` in any modern web browser.

## Technical Implementation

### 1. Bézier Curve Math
The curve is generated using the standard cubic Bézier formula:
$$B(t) = (1-t)^3P_0 + 3(1-t)^2tP_1 + 3(1-t)t^2P_2 + t^3P_3$$

Where:
- $t$ ranges from 0 to 1.
- $P_0, P_3$ are fixed endpoints.
- $P_1, P_2$ are dynamic control points.

The curve is rendered by sampling $t$ at intervals of 0.01 (100 steps) and connecting the points with line segments.

### 2. Tangent Visualization
Tangents are calculated using the first derivative of the Bézier function:
$$B'(t) = 3(1-t)^2(P_1-P_0) + 6(1-t)t(P_2-P_1) + 3t^2(P_3-P_2)$$

The resulting vector is normalized and drawn at specific intervals ($t=0.2, 0.5, 0.8$) to visualize the curve's direction and flow.

### 3. Physics Model (Spring-Damping)
To create the "rope-like" feel, the control points $P_1$ and $P_2$ are not set directly to the mouse position. Instead, they are governed by a spring-mass-damper system:

$$F = -k(x - x_{target}) - c(v)$$
$$a = F / m$$
$$v = v + a$$
$$x = x + v$$

Where:
- $k$ (stiffness) determines how strongly the point is pulled towards its target.
- $c$ (damping) simulates air resistance/friction to prevent infinite oscillation.
- The "target" position is dynamically updated based on the mouse cursor's location relative to the curve's resting state.

### 4. Interaction
- **Mouse Move**: The mouse acts as an attractor. When the mouse moves, it shifts the target positions of the control points, causing them to spring towards the cursor.
- **Rest State**: When the mouse leaves or stops moving, the points spring back to their default positions.

## File Structure
- `index.html`: Main entry point and canvas setup.
- `style.css`: Styling for full-screen immersive view.
- `script.js`: Contains all logic (Math, Physics, Rendering, Input).

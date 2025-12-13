/**
 * Input Handler
 * Universe Evolution Simulator v2.47.3
 *
 * Handles keyboard, mouse, and touch input with momentum and gestures
 */

export class InputHandler {
    constructor(canvas, callbacks = {}) {
        this.canvas = canvas;
        this.callbacks = callbacks;

        // Mouse state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseButton = 0;

        // Touch state
        this.touches = {};
        this.lastTouchDistance = 0;
        this.lastTouchCenter = { x: 0, y: 0 };
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.lastTapTime = 0;
        this.touchStartTime = 0;
        this.initialPinchDistance = 0;

        // Momentum/inertia state
        this.momentum = { x: 0, y: 0 };
        this.velocityHistory = [];
        this.maxVelocityHistory = 5;
        this.momentumDamping = 0.92;
        this.momentumThreshold = 0.5;
        this.lastMoveTime = 0;

        // Zoom momentum
        this.zoomMomentum = 0;
        this.zoomDamping = 0.85;
        this.zoomThreshold = 0.001;

        // Rotation momentum
        this.rotationMomentum = { x: 0, y: 0 };
        this.rotationDamping = 0.9;

        // Long press detection
        this.longPressTimer = null;
        this.longPressDelay = 500;
        this.longPressTriggered = false;

        // Gesture state
        this.gestureType = null; // 'pan', 'zoom', 'rotate'
        this.gestureStarted = false;

        // Key state
        this.keysDown = new Set();

        // Animation frame for momentum
        this.animationFrame = null;

        // Bind event handlers
        this.bindEvents();

        // Start momentum update loop
        this.startMomentumLoop();
    }

    /**
     * Start the momentum update loop
     */
    startMomentumLoop() {
        const updateMomentum = () => {
            this.applyMomentum();
            this.animationFrame = requestAnimationFrame(updateMomentum);
        };
        this.animationFrame = requestAnimationFrame(updateMomentum);
    }

    /**
     * Apply momentum for smooth deceleration
     */
    applyMomentum() {
        // Skip if actively dragging
        if (this.isDragging) return;

        // Apply pan momentum
        if (Math.abs(this.momentum.x) > this.momentumThreshold ||
            Math.abs(this.momentum.y) > this.momentumThreshold) {

            if (this.callbacks.onCameraMove) {
                this.callbacks.onCameraMove(this.momentum.x, this.momentum.y, 0);
            }

            this.momentum.x *= this.momentumDamping;
            this.momentum.y *= this.momentumDamping;

            if (Math.abs(this.momentum.x) < this.momentumThreshold) this.momentum.x = 0;
            if (Math.abs(this.momentum.y) < this.momentumThreshold) this.momentum.y = 0;
        }

        // Apply zoom momentum
        if (Math.abs(this.zoomMomentum) > this.zoomThreshold) {
            if (this.callbacks.onZoom) {
                this.callbacks.onZoom(1 + this.zoomMomentum);
            }
            this.zoomMomentum *= this.zoomDamping;
            if (Math.abs(this.zoomMomentum) < this.zoomThreshold) this.zoomMomentum = 0;
        }

        // Apply rotation momentum
        if (Math.abs(this.rotationMomentum.x) > 0.001 ||
            Math.abs(this.rotationMomentum.y) > 0.001) {

            if (this.callbacks.onCameraRotate) {
                this.callbacks.onCameraRotate(this.rotationMomentum.x, this.rotationMomentum.y);
            }

            this.rotationMomentum.x *= this.rotationDamping;
            this.rotationMomentum.y *= this.rotationDamping;

            if (Math.abs(this.rotationMomentum.x) < 0.001) this.rotationMomentum.x = 0;
            if (Math.abs(this.rotationMomentum.y) < 0.001) this.rotationMomentum.y = 0;
        }
    }

    /**
     * Calculate velocity from recent movements
     */
    calculateVelocity() {
        if (this.velocityHistory.length < 2) return { x: 0, y: 0 };

        let totalX = 0, totalY = 0, count = 0;
        const now = performance.now();

        for (let i = 1; i < this.velocityHistory.length; i++) {
            const prev = this.velocityHistory[i - 1];
            const curr = this.velocityHistory[i];
            const dt = curr.time - prev.time;

            if (dt > 0 && now - curr.time < 100) {
                totalX += (curr.x - prev.x) / dt * 16;
                totalY += (curr.y - prev.y) / dt * 16;
                count++;
            }
        }

        return count > 0 ? { x: totalX / count, y: totalY / count } : { x: 0, y: 0 };
    }

    /**
     * Add position to velocity history
     */
    addToVelocityHistory(x, y) {
        this.velocityHistory.push({ x, y, time: performance.now() });
        if (this.velocityHistory.length > this.maxVelocityHistory) {
            this.velocityHistory.shift();
        }
    }

    /**
     * Stop all momentum
     */
    stopMomentum() {
        this.momentum = { x: 0, y: 0 };
        this.zoomMomentum = 0;
        this.rotationMomentum = { x: 0, y: 0 };
        this.velocityHistory = [];
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Touch
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    /**
     * Handle key down
     */
    handleKeyDown(e) {
        // Ignore if focused on input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        this.keysDown.add(e.key.toLowerCase());

        const key = e.key.toLowerCase();
        const shift = e.shiftKey;
        const ctrl = e.ctrlKey;

        // Call callback with key info
        if (this.callbacks.onKeyDown) {
            const handled = this.callbacks.onKeyDown({
                key,
                shift,
                ctrl,
                alt: e.altKey,
                originalEvent: e
            });

            if (handled) {
                e.preventDefault();
            }
        }

        // Camera movement keys (continuous)
        const moveSpeed = 30;
        switch (key) {
            case 'w':
            case 'arrowup':
                if (this.callbacks.onCameraMove) {
                    this.callbacks.onCameraMove(0, -moveSpeed, 0);
                }
                break;
            case 's':
            case 'arrowdown':
                if (!ctrl && this.callbacks.onCameraMove) {
                    this.callbacks.onCameraMove(0, moveSpeed, 0);
                }
                break;
            case 'a':
            case 'arrowleft':
                if (this.callbacks.onCameraMove) {
                    this.callbacks.onCameraMove(-moveSpeed, 0, 0);
                }
                break;
            case 'd':
            case 'arrowright':
                if (this.callbacks.onCameraMove) {
                    this.callbacks.onCameraMove(moveSpeed, 0, 0);
                }
                break;
            case 'q':
                if (this.callbacks.onCameraRotate) {
                    this.callbacks.onCameraRotate(-0.1, 0);
                }
                break;
            case 'e':
                if (this.callbacks.onCameraRotate) {
                    this.callbacks.onCameraRotate(0.1, 0);
                }
                break;
            case '=':
            case '+':
                if (this.callbacks.onZoom) {
                    this.callbacks.onZoom(1.2);
                }
                break;
            case '-':
            case '_':
                if (this.callbacks.onZoom) {
                    this.callbacks.onZoom(1 / 1.2);
                }
                break;

            // Time control
            case ' ':
                e.preventDefault();
                if (this.callbacks.onTogglePlay) {
                    this.callbacks.onTogglePlay();
                }
                break;
            case '[':
                if (this.callbacks.onSpeedChange) {
                    this.callbacks.onSpeedChange(0.5);
                }
                break;
            case ']':
                if (this.callbacks.onSpeedChange) {
                    this.callbacks.onSpeedChange(2);
                }
                break;
            case 'backspace':
                e.preventDefault();
                if (this.callbacks.onToggleReverse) {
                    this.callbacks.onToggleReverse();
                }
                break;

            // Epoch jumps
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
                if (this.callbacks.onEpochJump) {
                    this.callbacks.onEpochJump(parseInt(key));
                }
                break;

            // View controls
            case 'r':
                if (this.callbacks.onResetView) {
                    this.callbacks.onResetView();
                }
                break;
            case 'h':
                if (this.callbacks.onToggleUI) {
                    this.callbacks.onToggleUI();
                }
                break;
            case 'g':
                if (this.callbacks.onToggleGrid) {
                    this.callbacks.onToggleGrid();
                }
                break;
            case 'v':
                if (this.callbacks.onToggleVelocities) {
                    this.callbacks.onToggleVelocities();
                }
                break;
            case 'c':
                if (this.callbacks.onToggleClusters) {
                    this.callbacks.onToggleClusters();
                }
                break;
            case 'f':
                if (key === 'F1') {
                    e.preventDefault();
                    if (this.callbacks.onToggleHelp) {
                        this.callbacks.onToggleHelp();
                    }
                } else if (key === 'F11') {
                    if (this.callbacks.onToggleFullscreen) {
                        this.callbacks.onToggleFullscreen();
                    }
                } else {
                    if (this.callbacks.onCycleFuture) {
                        this.callbacks.onCycleFuture();
                    }
                }
                break;
            case 'p':
                if (this.callbacks.onToggleSettings) {
                    this.callbacks.onToggleSettings();
                }
                break;
            case 't':
                if (this.callbacks.onToggleTracer) {
                    this.callbacks.onToggleTracer();
                }
                break;
            case 'b':
                if (this.callbacks.onAddBookmark) {
                    this.callbacks.onAddBookmark();
                }
                break;
            case 'escape':
                if (this.callbacks.onEscape) {
                    this.callbacks.onEscape();
                }
                break;
        }

        // Screenshot (S key, not Ctrl+S)
        if (key === 's' && !ctrl) {
            if (this.callbacks.onScreenshot) {
                this.callbacks.onScreenshot();
            }
        }
    }

    /**
     * Handle key up
     */
    handleKeyUp(e) {
        this.keysDown.delete(e.key.toLowerCase());

        if (this.callbacks.onKeyUp) {
            this.callbacks.onKeyUp({
                key: e.key.toLowerCase(),
                originalEvent: e
            });
        }
    }

    /**
     * Handle mouse wheel
     */
    handleWheel(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;

        if (this.callbacks.onZoom) {
            this.callbacks.onZoom(delta);
        }
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.mouseButton = e.button;

        if (this.callbacks.onMouseDown) {
            this.callbacks.onMouseDown({
                x: e.clientX,
                y: e.clientY,
                button: e.button
            });
        }
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(e) {
        if (!this.isDragging) {
            if (this.callbacks.onMouseMove) {
                this.callbacks.onMouseMove({
                    x: e.clientX,
                    y: e.clientY,
                    dragging: false
                });
            }
            return;
        }

        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;

        // Left button: pan (or rotate with shift)
        if (e.buttons === 1) {
            if (e.shiftKey) {
                if (this.callbacks.onCameraRotate) {
                    this.callbacks.onCameraRotate(dx * 0.005, dy * 0.005);
                }
            } else {
                if (this.callbacks.onCameraMove) {
                    this.callbacks.onCameraMove(dx, dy, 0);
                }
            }
        }

        // Right button: rotate
        if (e.buttons === 2) {
            if (this.callbacks.onCameraRotate) {
                this.callbacks.onCameraRotate(dx * 0.005, dy * 0.005);
            }
        }

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        if (this.callbacks.onMouseMove) {
            this.callbacks.onMouseMove({
                x: e.clientX,
                y: e.clientY,
                dx,
                dy,
                dragging: true
            });
        }
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(e) {
        this.isDragging = false;

        if (this.callbacks.onMouseUp) {
            this.callbacks.onMouseUp({
                x: e.clientX,
                y: e.clientY,
                button: e.button
            });
        }
    }

    /**
     * Handle click
     */
    handleClick(e) {
        if (this.callbacks.onClick) {
            this.callbacks.onClick({
                x: e.clientX,
                y: e.clientY,
                button: e.button
            });
        }
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        e.preventDefault();

        // Stop any existing momentum when starting a new touch
        this.stopMomentum();

        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.longPressTriggered = false;

        for (const touch of e.changedTouches) {
            this.touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY
            };
        }

        const touchCount = Object.keys(this.touches).length;
        this.touchStartTime = performance.now();
        this.gestureType = null;
        this.gestureStarted = false;

        if (touchCount === 2) {
            const touchPoints = Object.values(this.touches);
            this.lastTouchDistance = Math.hypot(
                touchPoints[1].x - touchPoints[0].x,
                touchPoints[1].y - touchPoints[0].y
            );
            this.initialPinchDistance = this.lastTouchDistance;
            this.lastTouchCenter = {
                x: (touchPoints[0].x + touchPoints[1].x) / 2,
                y: (touchPoints[0].y + touchPoints[1].y) / 2
            };
        }

        if (touchCount === 1) {
            const touch = Object.values(this.touches)[0];
            this.lastTouchX = touch.x;
            this.lastTouchY = touch.y;
            this.addToVelocityHistory(touch.x, touch.y);

            // Start long press timer
            this.longPressTimer = setTimeout(() => {
                if (!this.gestureStarted) {
                    this.longPressTriggered = true;
                    if (this.callbacks.onLongPress) {
                        this.callbacks.onLongPress({
                            x: touch.x,
                            y: touch.y
                        });
                    }
                }
            }, this.longPressDelay);
        }

        if (touchCount === 3) {
            // Three finger gesture - could be used for special actions
            if (this.callbacks.onThreeFingerGesture) {
                this.callbacks.onThreeFingerGesture('start');
            }
        }

        this.isDragging = true;

        if (this.callbacks.onTouchStart) {
            this.callbacks.onTouchStart({
                touches: Object.values(this.touches),
                count: touchCount
            });
        }
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        e.preventDefault();

        // Clear long press timer on move
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        for (const touch of e.changedTouches) {
            if (this.touches[touch.identifier]) {
                this.touches[touch.identifier].x = touch.clientX;
                this.touches[touch.identifier].y = touch.clientY;
            }
        }

        const touchCount = Object.keys(this.touches).length;

        if (touchCount === 1 && !this.longPressTriggered) {
            // Single touch: pan with momentum tracking
            const touch = Object.values(this.touches)[0];
            const dx = touch.x - this.lastTouchX;
            const dy = touch.y - this.lastTouchY;

            // Mark gesture as started if moved enough
            if (!this.gestureStarted && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                this.gestureStarted = true;
                this.gestureType = 'pan';
            }

            if (this.gestureStarted && this.callbacks.onCameraMove) {
                this.callbacks.onCameraMove(dx, dy, 0);
            }

            // Track velocity for momentum
            this.addToVelocityHistory(touch.x, touch.y);

            this.lastTouchX = touch.x;
            this.lastTouchY = touch.y;

        } else if (touchCount === 2) {
            // Two touch: pinch zoom and pan
            const touchPoints = Object.values(this.touches);
            const currentDistance = Math.hypot(
                touchPoints[1].x - touchPoints[0].x,
                touchPoints[1].y - touchPoints[0].y
            );
            const currentCenter = {
                x: (touchPoints[0].x + touchPoints[1].x) / 2,
                y: (touchPoints[0].y + touchPoints[1].y) / 2
            };

            // Determine gesture type based on initial movement
            if (!this.gestureType) {
                const distanceChange = Math.abs(currentDistance - this.initialPinchDistance);
                const centerMove = Math.hypot(
                    currentCenter.x - this.lastTouchCenter.x,
                    currentCenter.y - this.lastTouchCenter.y
                );

                if (distanceChange > 15) {
                    this.gestureType = 'zoom';
                } else if (centerMove > 15) {
                    this.gestureType = 'rotate';
                }
            }

            // Pinch to zoom (always active with two fingers)
            if (this.lastTouchDistance > 0) {
                const scale = currentDistance / this.lastTouchDistance;

                // Zoom toward the pinch center
                if (this.callbacks.onZoomAtPoint) {
                    this.callbacks.onZoomAtPoint(scale, currentCenter.x, currentCenter.y);
                } else if (this.callbacks.onZoom) {
                    this.callbacks.onZoom(scale);
                }

                // Track zoom momentum
                this.zoomMomentum = (scale - 1) * 0.5;
            }

            // Two finger pan/rotate
            const dx = currentCenter.x - this.lastTouchCenter.x;
            const dy = currentCenter.y - this.lastTouchCenter.y;

            if (this.gestureType === 'rotate' || Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                if (this.callbacks.onCameraRotate) {
                    this.callbacks.onCameraRotate(dx * 0.005, dy * 0.005);
                }
                this.rotationMomentum = { x: dx * 0.003, y: dy * 0.003 };
            }

            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
            this.gestureStarted = true;

        } else if (touchCount === 3) {
            // Three finger: could be time scrub or special control
            if (this.callbacks.onThreeFingerGesture) {
                const touchPoints = Object.values(this.touches);
                const avgX = touchPoints.reduce((sum, t) => sum + t.x, 0) / 3;
                const avgY = touchPoints.reduce((sum, t) => sum + t.y, 0) / 3;

                this.callbacks.onThreeFingerGesture('move', { x: avgX, y: avgY });
            }
        }

        if (this.callbacks.onTouchMove) {
            this.callbacks.onTouchMove({
                touches: Object.values(this.touches),
                count: touchCount,
                gestureType: this.gestureType
            });
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        const touchDuration = performance.now() - this.touchStartTime;
        const wasQuickTap = touchDuration < 200 && !this.gestureStarted;

        for (const touch of e.changedTouches) {
            delete this.touches[touch.identifier];
        }

        const remainingTouches = Object.keys(this.touches).length;

        if (remainingTouches === 0) {
            // Calculate and apply momentum for single touch pan
            if (this.gestureType === 'pan' || (!this.gestureType && this.gestureStarted)) {
                const velocity = this.calculateVelocity();
                this.momentum = {
                    x: velocity.x * 0.8,
                    y: velocity.y * 0.8
                };
            }

            this.isDragging = false;
            this.gestureType = null;
            this.gestureStarted = false;

            // Detect double tap (quick taps only)
            const now = Date.now();
            if (wasQuickTap && now - this.lastTapTime < 300) {
                if (this.callbacks.onDoubleTap) {
                    this.callbacks.onDoubleTap();
                }
                this.lastTapTime = 0; // Reset to prevent triple-tap
            } else if (wasQuickTap) {
                this.lastTapTime = now;

                // Single tap callback
                if (this.callbacks.onTap) {
                    const touch = e.changedTouches[0];
                    this.callbacks.onTap({
                        x: touch.clientX,
                        y: touch.clientY
                    });
                }
            }
        } else if (remainingTouches === 1) {
            // Transitioning from multi-touch to single touch
            const touch = Object.values(this.touches)[0];
            this.lastTouchX = touch.x;
            this.lastTouchY = touch.y;
            this.velocityHistory = [];
            this.addToVelocityHistory(touch.x, touch.y);
            this.gestureType = 'pan';
        }

        if (this.callbacks.onTouchEnd) {
            this.callbacks.onTouchEnd({
                remainingTouches: Object.values(this.touches),
                wasQuickTap
            });
        }
    }

    /**
     * Check if a key is currently pressed
     */
    isKeyDown(key) {
        return this.keysDown.has(key.toLowerCase());
    }

    /**
     * Unbind all event listeners
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        // Cancel momentum animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }

        // Note: canvas listeners would be removed when canvas is removed from DOM
    }

    /**
     * Get current gesture state (for UI feedback)
     */
    getGestureState() {
        return {
            isDragging: this.isDragging,
            gestureType: this.gestureType,
            touchCount: Object.keys(this.touches).length,
            hasMomentum: Math.abs(this.momentum.x) > 0.1 || Math.abs(this.momentum.y) > 0.1
        };
    }
}

export default InputHandler;

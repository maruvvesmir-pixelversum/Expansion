/**
 * Input Handler
 * Universe Evolution Simulator v2.47.3
 *
 * Handles keyboard, mouse, and touch input
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

        // Key state
        this.keysDown = new Set();

        // Bind event handlers
        this.bindEvents();
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

        for (const touch of e.changedTouches) {
            this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
        }

        const touchCount = Object.keys(this.touches).length;

        if (touchCount === 2) {
            const touchPoints = Object.values(this.touches);
            this.lastTouchDistance = Math.hypot(
                touchPoints[1].x - touchPoints[0].x,
                touchPoints[1].y - touchPoints[0].y
            );
            this.lastTouchCenter = {
                x: (touchPoints[0].x + touchPoints[1].x) / 2,
                y: (touchPoints[0].y + touchPoints[1].y) / 2
            };
        }

        if (touchCount === 1) {
            const touch = Object.values(this.touches)[0];
            this.lastTouchX = touch.x;
            this.lastTouchY = touch.y;
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

        for (const touch of e.changedTouches) {
            if (this.touches[touch.identifier]) {
                this.touches[touch.identifier] = { x: touch.clientX, y: touch.clientY };
            }
        }

        const touchCount = Object.keys(this.touches).length;

        if (touchCount === 1) {
            // Single touch: pan
            const touch = Object.values(this.touches)[0];
            const dx = touch.x - this.lastTouchX;
            const dy = touch.y - this.lastTouchY;

            if (this.callbacks.onCameraMove) {
                this.callbacks.onCameraMove(dx, dy, 0);
            }

            this.lastTouchX = touch.x;
            this.lastTouchY = touch.y;
        } else if (touchCount === 2) {
            // Two touch: zoom and rotate
            const touchPoints = Object.values(this.touches);
            const currentDistance = Math.hypot(
                touchPoints[1].x - touchPoints[0].x,
                touchPoints[1].y - touchPoints[0].y
            );
            const currentCenter = {
                x: (touchPoints[0].x + touchPoints[1].x) / 2,
                y: (touchPoints[0].y + touchPoints[1].y) / 2
            };

            // Zoom
            if (this.lastTouchDistance > 0) {
                const scale = currentDistance / this.lastTouchDistance;
                if (this.callbacks.onZoom) {
                    this.callbacks.onZoom(scale);
                }
            }

            // Rotate
            const dx = currentCenter.x - this.lastTouchCenter.x;
            const dy = currentCenter.y - this.lastTouchCenter.y;
            if (this.callbacks.onCameraRotate) {
                this.callbacks.onCameraRotate(dx * 0.005, dy * 0.005);
            }

            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
        }

        if (this.callbacks.onTouchMove) {
            this.callbacks.onTouchMove({
                touches: Object.values(this.touches),
                count: touchCount
            });
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        for (const touch of e.changedTouches) {
            delete this.touches[touch.identifier];
        }

        if (Object.keys(this.touches).length === 0) {
            this.isDragging = false;

            // Detect double tap
            const now = Date.now();
            if (now - this.lastTapTime < 300) {
                if (this.callbacks.onDoubleTap) {
                    this.callbacks.onDoubleTap();
                }
            }
            this.lastTapTime = now;
        }

        if (this.callbacks.onTouchEnd) {
            this.callbacks.onTouchEnd({
                remainingTouches: Object.values(this.touches)
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
        // Note: canvas listeners would be removed when canvas is removed from DOM
    }
}

export default InputHandler;

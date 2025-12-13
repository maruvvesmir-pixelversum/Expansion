# Universe Evolution Simulator v2.47.3

An interactive, physics-based simulation of the universe from the Big Bang to various future scenarios. Built with pure JavaScript and HTML5 Canvas, featuring scientifically accurate cosmology, 50,000+ particles, and full touch/mouse controls.

![Universe Evolution Simulator](https://img.shields.io/badge/Version-2.47.3-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Physics](https://img.shields.io/badge/Physics-Accurate-green)

## Features

### 🌌 Complete Cosmic Timeline
- **Planck Epoch** (0 - 10⁻⁴³s): Quantum foam at 10³² K
- **Cosmic Inflation** (10⁻³⁶s - 10⁻³²s): 10²⁶× expansion
- **Quark-Gluon Plasma** (10⁻³²s - 1s): Particle soup cooling
- **Nucleosynthesis** (3-20 min): First atomic nuclei
- **Recombination** (380 kyr): CMB released, atoms form
- **Dark Ages** (380k - 200M yr): No stars, only gravity
- **First Stars** (200M - 1B yr): Reionization begins
- **Structure Formation** (1-9 Gyr): Galaxies and cosmic web
- **Dark Energy Era** (9-13.8 Gyr): Accelerating expansion
- **Present Day** (13.8 Gyr): Now

### 🔮 Future Scenarios
- **Big Freeze**: Heat death, eternal expansion to darkness
- **Big Rip**: Phantom energy tears apart all structures
- **Big Crunch**: Universe recollapses to singularity
- **Big Bounce**: Cyclic universe with infinite rebounds

### ⚛️ Physics Engine
- **Particle System**: 50,000 particles (scalable to millions)
- **N-body Gravity**: Softened gravitational forces
- **Cosmological Expansion**: Friedmann equations, Hubble flow
- **Velocity Verlet Integration**: Energy-conserving integration
- **Temperature Evolution**: Wien's law, CMB temperature tracking
- **Structure of Arrays**: Cache-friendly memory layout

### 🎮 Controls

#### Touch Controls (Mobile)
- **Single Touch + Drag**: Pan camera
- **Pinch**: Zoom in/out
- **Two-Finger Rotate**: Rotate view around center

#### Mouse Controls (Desktop)
- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out

#### Keyboard Shortcuts

**Navigation:**
- **WASD** / **Arrow Keys**: Pan camera
- **Q** / **E**: Rotate camera around Z-axis
- **+** / **-**: Zoom in/out

**Time Control:**
- **SPACE**: Play/Pause simulation
- **[** / **]**: Decrease/Increase time speed (halve/double)
- **1-9**: Set speed multiplier to ×10ⁿ (e.g., 6 = ×10⁶)
- **0**: Reset speed to ×1
- **Backspace**: Reverse time direction
- **Enter**: Step forward one frame

**Quick Epoch Jumps:**
- **Shift+1**: Planck Epoch
- **Shift+2**: Inflation
- **Shift+3**: QGP Phase
- **Shift+4**: Nucleosynthesis
- **Shift+5**: Recombination
- **Shift+6**: Dark Ages
- **Shift+7**: First Stars
- **Shift+8**: Structure Formation
- **Shift+9**: Present Day
- **Shift+0**: Big Freeze

**View Presets:**
- **R**: Reset camera view
- **T**: Top view
- **F**: Front view
- **L**: Left view
- **Home**: Return to origin

**Interface:**
- **H**: Hide/Show UI panels
- **F5**: Restart simulation from Big Bang
- **F11**: Toggle fullscreen

### 🖥️ Terminal-Style UI
- **Temporal Navigation**: Timeline scrubber, epoch jumping, speed controls
- **Cosmological State**: Size, Hubble parameter, CMB temperature, density
- **Physics Engine**: Particle counts, energy, temperature statistics
- **Performance Metrics**: Real-time FPS, frame time, quality monitoring
- **Grayscale Aesthetic**: Monospace fonts, terminal-inspired design

## Usage

### Quick Start

1. **Open `index.html`** in a modern web browser (Chrome, Firefox, Safari, Edge)
2. **Wait for loading** - The simulator will initialize 50,000 particles
3. **Press SPACE** or click "► PLAY" to start the simulation
4. **Explore**:
   - Use mouse/touch to navigate
   - Click epoch buttons to jump through time
   - Adjust speed with [/] keys or speed buttons

### Epoch Navigation

Click any epoch button to instantly jump to that time period:

```
Planck → Inflation → QGP → Nucleosynthesis → Recombination
  ↓
Dark Ages → First Stars → Modern → Present
  ↓
Big Freeze / Big Rip / Big Crunch / Big Bounce
```

### Timeline Scrubber

Drag the white handle on the timeline bar to manually scrub through cosmic time from 0 to 13.8 billion years.

### Speed Control

- **Default**: ×1.0E+6 (1 million times real time)
- **Slower**: Click "◄◄ SLOWER" or press **[**
- **Faster**: Click "FASTER ►►" or press **]**
- **Range**: ×1 to ×1.0E+15

### Future Scenarios

After reaching the present day (13.8 Gyr), click one of the future scenario buttons:

- **Big Freeze**: Watch the universe slowly dim and cool
- **Big Rip**: See phantom energy tear structures apart
- **Big Crunch**: Observe gravitational recollapse
- **Big Bounce**: Experience a cyclic universe restart

## Technical Details

### Cosmological Parameters

Based on Planck 2018 results:
- **H₀** = 67.4 km/s/Mpc (Hubble constant)
- **Ω_m** = 0.3111 (Matter density)
- **Ω_Λ** = 0.6889 (Dark energy density)
- **Ω_b** = 0.0486 (Baryonic matter)
- **T₀_CMB** = 2.725 K (Current CMB temperature)

### Physics Implementation

**Gravity**: Softened Newtonian gravity with ε = 1 kpc
```
F = G·m₁·m₂ / (r² + ε²)^(3/2)
```

**Expansion**: Friedmann equation
```
H(a) = H₀ · √(Ω_m/a³ + Ω_r/a⁴ + Ω_Λ)
```

**Temperature**: CMB redshift relation
```
T(z) = T₀ · (1 + z)
```

### Particle Color System

Temperature-based colors using Wien's law:
- **>30,000 K**: Blue (O-type stars)
- **10,000-30,000 K**: Blue-white (B/A-type)
- **6,000-10,000 K**: White (F-type)
- **4,000-6,000 K**: Yellow (G-type, Sun-like)
- **3,000-4,000 K**: Orange (K-type)
- **<3,000 K**: Red (M-type, red dwarfs)
- **<100 K**: Deep red (dying stars, dark ages)

### Performance

**Target**: 60 FPS
**Optimizations**:
- Structure of Arrays (SoA) memory layout
- Simplified O(N²) → sampled O(N) for <100k particles
- Depth sorting with painter's algorithm
- Gaussian blur particle rendering
- Adaptive quality system (planned)

### Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Configuration

Edit `simulator.js` CONFIG object to customize:

```javascript
const CONFIG = {
    particleCount: 50000,      // 10k-100k recommended
    G: 6.674e-11,              // Gravitational constant
    H0: 67.4,                  // Hubble constant
    Omega_m: 0.3111,           // Matter density
    Omega_Lambda: 0.6889,      // Dark energy
    softening: 1e19,           // 1 kpc softening
    timeStep: 1e12,            // Time step
    particleSize: 2.0          // Render size
};
```

## Scientific Accuracy

### What's Accurate
✅ Friedmann equations for expansion
✅ Hubble parameter evolution H(z)
✅ CMB temperature redshift: T(z) = T₀(1+z)
✅ Epoch timescales and temperatures
✅ Structure formation via gravity
✅ Energy conservation in isolated systems
✅ Velocity Verlet symplectic integration

### Simplifications
⚠️ Simplified N-body (not full Barnes-Hut for performance)
⚠️ No quantum effects (Planck/Inflation are illustrative)
⚠️ Dark matter not separately simulated
⚠️ Simplified stellar physics
⚠️ No magnetic fields or radiation pressure

## Development

### File Structure
```
Expansion/
├── index.html          # Main HTML with UI
├── simulator.js        # Complete physics engine
├── guide.md           # Full technical specification
└── README.md          # This file
```

### Future Enhancements (guide.md)
- [ ] Barnes-Hut octree (O(N log N) gravity)
- [ ] WebGPU compute shaders for 4M+ particles
- [ ] Web Workers for multi-threading
- [ ] LOD system for massive particle counts
- [ ] Advanced visual effects (bloom, motion blur)
- [ ] Particle tracer system
- [ ] Statistical analysis tools
- [ ] Save/load simulation state

## Credits

**Physics**: Based on Planck 2018 cosmological parameters
**Inspired by**: Illustris simulation, EAGLE, Millennium Run
**Development**: Universe Evolution Simulator Team

## License

MIT License - See guide.md for full technical specification

---

**Version**: 2.47.3
**Build Date**: 2025-12-13
**Status**: ✅ Fully Functional

*"From quantum foam to heat death - Experience 13.8 billion years and beyond"*
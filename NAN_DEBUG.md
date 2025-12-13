# 🐛 NaN BUG FOUND - Tracking It Down

## The Problem

```
world: {x: NaN, y: NaN, z: NaN}
screen: {x: NaN, y: NaN, z: NaN}
```

**Particles have NaN (Not a Number) positions!**

This is NOT a projection bug - particles are created with invalid data.

## Debug Logging Added

I've added 4 checkpoints to track WHERE NaN appears:

### Checkpoint 1: Array Creation
```javascript
console.log('Particle arrays created:', {
    xArrayLength: 500000,
    yArrayLength: 500000,
    zArrayLength: 500000,
    firstX: 0,  // Should be 0 (uninitialized)
    firstY: 0,
    firstZ: 0
});
```

### Checkpoint 2: First Particle Generation
```javascript
console.log('First particle generation:', {
    pos: { x: 13.55, y: -3.97, z: -2.88 },  // Generated position
    stored: { x: 13.55, y: -3.97, z: -2.88 }, // What was stored
    distribution: 'spherical',
    radius: 50
});
```

### Checkpoint 3: Generation Complete
```javascript
console.log('Particle generation complete:', {
    count: 500000,
    firstParticle: {
        x: 13.55,
        y: -3.97,
        z: -2.88,
        vx: ...,
        vy: ...,
        vz: ...,
        mass: ...,
        temp: ...
    },
    lastParticle: {
        x: ...,
        y: ...,
        z: ...
    }
});
```

### Checkpoint 4: Simulator Reads (existing)
```javascript
console.log('First particle position:', {
    x: particles.particles.x[0],
    y: particles.particles.y[0],
    z: particles.particles.z[0]
});
```

### Checkpoint 5: Renderer Reads (existing)
```javascript
console.log('First particle projection test:', {
    world: { x: p.x[0], y: p.y[0], z: p.z[0] },
    ...
});
```

## What This Will Show

**Scenario A: NaN from the start**
```
✅ Particle arrays created: { firstX: 0, firstY: 0, firstZ: 0 }
❌ First particle generation: { pos: { x: NaN, y: NaN, z: NaN } }
```
→ **Bug in position generation** (generateSphericalPosition or Vec3)

**Scenario B: NaN during generation**
```
✅ Particle arrays created: { firstX: 0, firstY: 0, firstZ: 0 }
✅ First particle generation: { pos: { x: 13.55, y: -3.97, z: -2.88 } }
❌ Particle generation complete: { firstParticle: { x: NaN, y: NaN, z: NaN } }
```
→ **Bug in updateStatistics()** or other code in generation loop

**Scenario C: NaN after generation**
```
✅ Particle generation complete: { firstParticle: { x: 13.55, ... } }
❌ First particle position: { x: NaN, y: NaN, z: NaN }  (in Simulator)
```
→ **Bug in physics update** or something between init and first render

**Scenario D: Array corruption**
```
✅ Particle generation complete: { firstParticle: { x: 13.55, ... } }
✅ First particle position: { x: 13.55, ... }  (in Simulator)
❌ First particle projection test: { world: { x: NaN, ... } }  (in Renderer)
```
→ **Bug in renderer** accessing wrong array or physics corrupted it

## Your Task

**1. HARD REFRESH:** Ctrl+Shift+R

**2. Copy ENTIRE console output** including all new logs:
```
Particle arrays created: ...
First particle generation: ...
Particle generation complete: ...
Particles initialized: ...
First particle position: ...
Camera initialized at: ...
Culling stats: ...
First particle projection test: ...
```

**3. Paste it here!**

This will show me the EXACT line where NaN appears, and I can fix it immediately!

## Likely Culprits

Based on common causes of NaN:

1. **Vec3 constructor** - Maybe not setting properties correctly
2. **Math.sqrt(negative)** - Would return NaN
3. **Division by zero** - Would return Infinity or NaN
4. **Math.acos(> 1)** - Would return NaN
5. **Uninitialized variable** - Would be undefined → NaN in math

Once I see which checkpoint fails, I'll know exactly what to fix!

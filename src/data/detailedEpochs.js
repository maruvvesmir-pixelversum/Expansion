/**
 * Detailed Epoch Definitions (30+ epochs)
 * Universe Evolution Simulator v3.0.0
 *
 * Comprehensive timeline from Planck epoch to far future
 * Based on: Planck 2018, WMAP, Hubble observations
 */

import { PLANCK, COSMOLOGICAL, UNITS } from '../utils/constants.js';

/**
 * Particle State Enum
 */
export const PARTICLE_STATES = {
    ENERGY: 0,              // Pure energy (Planck/GUT)
    UNIFIED: 1,             // Unified forces
    INFLATION: 2,           // Inflationary expansion
    QGP_HOT: 3,             // Hot quark-gluon plasma
    QGP_COOLING: 4,         // Cooling QGP
    HADRONS: 5,             // Hadronization
    LEPTONS: 6,             // Lepton era
    NUCLEI: 7,              // Nucleosynthesis
    PHOTONS: 8,             // Photon-dominated
    ATOMS: 9,               // Recombination
    NEUTRAL_GAS: 10,        // Dark ages
    PROTOSTARS: 11,         // First stars forming
    PROTOGALAXY: 12,        // Protogalaxies
    GALAXY: 13,             // Formed galaxies
    MERGED: 14              // Merged into another
};

/**
 * Render Mode Enum
 */
export const RENDER_MODES = {
    SINGULARITY: 'singularity',    // Tiny dense point
    ENERGY: 'energy',              // Pure energy glow
    PLASMA: 'plasma',              // Large blurry plasma
    PARTICLES: 'particles',        // Standard particles
    GALAXIES: 'galaxies'          // Sharp galaxy points
};

/**
 * Comprehensive 33-epoch timeline
 * Each epoch includes:
 * - Time range (seconds)
 * - Cosmological parameters (temperature, redshift, scale factor)
 * - Physics toggles (gravity, merging, expansion rate)
 * - Visual properties (blur, jitter, size, color)
 * - Particle state and render mode
 * - Key events
 */
export const DETAILED_EPOCHS = [
    // ============================================================
    // EPOCH 1: PLANCK ERA (Quantum Gravity Dominates)
    // ============================================================
    {
        id: 'planck',
        name: 'Planck Epoch',
        shortName: 'Planck',
        timeStart: 0,
        timeEnd: PLANCK.time, // 5.391e-44 s
        temperature: PLANCK.temperature, // 1.417e32 K
        redshift: Infinity,
        scaleFactor: 1e-30,
        hubbleParam: Infinity,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 0,

        // Visual - SUPERHEATED, MASSIVE, BLURRED
        particleBlur: 3.0,  // Maximum blur
        particleJitter: 2.0,
        particleSize: 100,  // Very large
        particleAlpha: 1.0,
        color: { r: 255, g: 255, b: 255 },  // Pure white core
        colorLayer1: { r: 255, g: 240, b: 180 },  // Yellow layer
        colorLayer2: { r: 255, g: 100, b: 80 },   // Red outer layer
        backgroundColor: { r: 255, g: 255, b: 255 },
        glowIntensity: 2.0,  // Intense glow

        // State
        particleState: PARTICLE_STATES.ENERGY,
        galaxyFormation: false,
        renderMode: RENDER_MODES.SINGULARITY,

        // Info
        size: PLANCK.length + ' m',
        sizeMeters: PLANCK.length,
        events: [
            'Quantum gravity dominates',
            'All four forces unified',
            'Space-time foam',
            'Physics as we know it breaks down',
            'No meaningful concept of time or space'
        ],
        description: 'The Planck epoch represents the earliest known period in the history of the universe. Gravity, electromagnetic, weak, and strong forces were unified. Quantum effects of gravity dominate. Space and time as we know them may not exist yet. This is the ultimate frontier of physics.',
        dataSource: 'Theoretical (Quantum Gravity)'
    },

    // ============================================================
    // EPOCH 2: GRAND UNIFICATION ERA
    // ============================================================
    {
        id: 'gut',
        name: 'Grand Unification Epoch',
        shortName: 'GUT',
        timeStart: 1e-43,
        timeEnd: 1e-36,
        temperature: 1e28, // 10^28 K
        redshift: 1e27,
        scaleFactor: 1e-27,
        hubbleParam: 1e35,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 0.1,

        // Visual - Still very hot, large, blurred
        particleBlur: 2.5,  // Very blurred
        particleJitter: 0.95,
        particleSize: 85,  // Very large
        particleAlpha: 0.95,
        color: { r: 255, g: 255, b: 250 },  // White core
        colorLayer1: { r: 255, g: 250, b: 200 },  // Light yellow layer
        backgroundColor: { r: 255, g: 250, b: 240 },
        glowIntensity: 1.5,  // High glow

        // State
        particleState: PARTICLE_STATES.UNIFIED,
        galaxyFormation: false,
        renderMode: RENDER_MODES.ENERGY,

        // Info
        size: '10^-28 m',
        sizeMeters: 1e-28,
        events: [
            'Gravity separates from other forces',
            'Strong, weak, EM forces still unified',
            'GUT symmetry breaking',
            'X and Y bosons exist',
            'Matter-antimatter symmetry',
            'Possible monopole formation'
        ],
        description: 'The Grand Unified Epoch: gravity has separated, but the strong, weak, and electromagnetic forces remain unified under the Grand Unified Theory (GUT). The universe is filled with exotic particles like X and Y bosons. Matter and antimatter exist in equal amounts.',
        dataSource: 'Theoretical (GUT)'
    },

    // ============================================================
    // EPOCH 3: INFLATION BEGIN
    // ============================================================
    {
        id: 'inflation_begin',
        name: 'Inflation Begins',
        shortName: 'Inf-Start',
        timeStart: 1e-36,
        timeEnd: 1e-35,
        temperature: 1e27,
        redshift: 1e26,
        scaleFactor: 1e-26,
        hubbleParam: 1e34,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 10.0, // Exponential expansion begins

        // Visual - Inflation starting, large and blurred
        particleBlur: 2.3,
        particleJitter: 0.9,
        particleSize: 75,
        particleAlpha: 0.9,
        color: { r: 255, g: 250, b: 220 },
        colorLayer1: { r: 255, g: 245, b: 210 },  // Faint yellow layer
        backgroundColor: { r: 250, g: 240, b: 220 },
        glowIntensity: 1.3,

        // State
        particleState: PARTICLE_STATES.INFLATION,
        galaxyFormation: false,
        renderMode: RENDER_MODES.ENERGY,

        // Info
        size: '10^-26 m → 10 cm',
        sizeMeters: 1e-26,
        events: [
            'Inflationary expansion begins',
            'Inflaton field dominates',
            'Exponential expansion starts',
            'Horizon problem begins to resolve',
            'Flatness problem solution emerges'
        ],
        description: 'Cosmic inflation begins! The inflaton field causes exponential expansion of space itself, faster than the speed of light. This solves the horizon and flatness problems of the standard Big Bang model.',
        dataSource: 'Inflationary Theory (Guth, Linde)'
    },

    // ============================================================
    // EPOCH 4: INFLATION PEAK (Exponential Expansion)
    // ============================================================
    {
        id: 'inflation_peak',
        name: 'Exponential Expansion',
        shortName: 'Inf-Peak',
        timeStart: 1e-35,
        timeEnd: 1e-33,
        temperature: 1e27,
        redshift: 1e20,
        scaleFactor: 1e-20,
        hubbleParam: 1e33,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 100.0, // Maximum expansion rate

        // Visual - Peak expansion, still large
        particleBlur: 2.1,
        particleJitter: 0.85,
        particleSize: 70,
        particleAlpha: 0.85,
        color: { r: 255, g: 245, b: 200 },
        backgroundColor: { r: 245, g: 235, b: 200 },
        glowIntensity: 1.2,

        // State
        particleState: PARTICLE_STATES.INFLATION,
        galaxyFormation: false,
        renderMode: RENDER_MODES.ENERGY,

        // Info
        size: '~1 meter',
        sizeMeters: 1.0,
        events: [
            'Universe expands by factor of 10^26',
            'Quantum fluctuations stretched',
            'Density perturbations frozen in',
            'Seeds of future structure created',
            'Observable universe much larger than horizon'
        ],
        description: 'The peak of inflation! The universe expands by an enormous factor (at least 10^26). Tiny quantum fluctuations are stretched to cosmic scales, creating the seeds of all future structure: galaxies, clusters, and the cosmic web.',
        dataSource: 'Inflationary Theory + Planck 2018 (primordial perturbations)'
    },

    // ============================================================
    // EPOCH 5: REHEATING (Inflation Ends)
    // ============================================================
    {
        id: 'reheating',
        name: 'Reheating',
        shortName: 'Reheat',
        timeStart: 1e-33,
        timeEnd: 1e-32,
        temperature: 1e27,
        redshift: 1e19,
        scaleFactor: 1e-19,
        hubbleParam: 1e32,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0, // Back to normal expansion

        // Visual - Reheating, cooling down
        particleBlur: 1.9,
        particleJitter: 0.8,
        particleSize: 65,
        particleAlpha: 0.9,
        color: { r: 255, g: 240, b: 180 },
        backgroundColor: { r: 240, g: 230, b: 180 },
        glowIntensity: 1.1,

        // State
        particleState: PARTICLE_STATES.UNIFIED,
        galaxyFormation: false,
        renderMode: RENDER_MODES.ENERGY,

        // Info
        size: '~10 meters',
        sizeMeters: 10.0,
        events: [
            'Inflation ends',
            'Inflaton field decays',
            'Energy converted to particles',
            'Universe reheated to high temperature',
            'Standard particles emerge'
        ],
        description: 'Inflation ends. The inflaton field decays, converting its enormous vacuum energy into a hot soup of particles and radiation. The universe "reheats" to an extremely high temperature, filling with quarks, leptons, and force carriers.',
        dataSource: 'Reheating Theory'
    },

    // ============================================================
    // EPOCH 6: ELECTROWEAK ERA
    // ============================================================
    {
        id: 'electroweak',
        name: 'Electroweak Epoch',
        shortName: 'EW',
        timeStart: 1e-32,
        timeEnd: 1e-12,
        temperature: 1e15, // 10^15 K
        redshift: 1e14,
        scaleFactor: 1e-14,
        hubbleParam: 1e20,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Electroweak, still hot
        particleBlur: 1.7,
        particleJitter: 0.75,
        particleSize: 55,
        particleAlpha: 0.85,
        color: { r: 255, g: 230, b: 160 },
        backgroundColor: { r: 230, g: 220, b: 160 },
        glowIntensity: 1.0,

        // State
        particleState: PARTICLE_STATES.QGP_HOT,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PLASMA,

        // Info
        size: '~1 km',
        sizeMeters: 1000,
        events: [
            'Electroweak symmetry breaking',
            'Electromagnetic and weak forces separate',
            'Higgs mechanism activates',
            'W and Z bosons gain mass',
            'Quarks and leptons acquire mass'
        ],
        description: 'The electroweak epoch: the electromagnetic and weak nuclear forces separate through spontaneous symmetry breaking. The Higgs field gives mass to fundamental particles via the Higgs mechanism. W and Z bosons become massive.',
        dataSource: 'Standard Model + Electroweak Theory'
    },

    // ============================================================
    // EPOCH 7: QUARK EPOCH - HOT QGP
    // ============================================================
    {
        id: 'qgp_hot',
        name: 'Hot Quark-Gluon Plasma',
        shortName: 'QGP-Hot',
        timeStart: 1e-12,
        timeEnd: 1e-6,
        temperature: 1e13, // 10 trillion K
        redshift: 1e12,
        scaleFactor: 1e-12,
        hubbleParam: 1e18,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - HOT GLOWING PLASMA!
        particleBlur: 1.5,  // Large and blurred
        particleJitter: 0.8,
        particleSize: 50,  // Large for visibility
        particleAlpha: 1.0,  // FULL BRIGHTNESS
        color: { r: 255, g: 120, b: 30 },  // BRIGHT ORANGE/RED - HEATED!
        backgroundColor: { r: 60, g: 20, b: 10 },  // Dark red background
        glowIntensity: 0.95,

        // State
        particleState: PARTICLE_STATES.QGP_HOT,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PLASMA,

        // Info
        size: '~10 km',
        sizeMeters: 1e4,
        events: [
            'Quarks and gluons move freely',
            'No bound hadrons yet',
            'QCD plasma phase',
            'Strong force active but asymptotically free',
            'Color charges unconfined'
        ],
        description: 'The universe is a hot soup of quarks and gluons (Quark-Gluon Plasma). Temperature is too high for quarks to bind into protons and neutrons. Quarks interact via the strong force but move freely in the plasma. This state is recreated in particle colliders like the LHC.',
        dataSource: 'QCD Theory + RHIC/LHC experiments'
    },

    // ============================================================
    // EPOCH 8: QUARK EPOCH - COOLING QGP
    // ============================================================
    {
        id: 'qgp_cooling',
        name: 'Cooling Quark-Gluon Plasma',
        shortName: 'QGP-Cool',
        timeStart: 1e-6,
        timeEnd: 1e-4,
        temperature: 1e12, // 1 trillion K
        redshift: 1e11,
        scaleFactor: 1e-11,
        hubbleParam: 1e16,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - COOLING BUT STILL HOT!
        particleBlur: 1.3,  // Still blurred
        particleJitter: 0.7,
        particleSize: 45,  // Still big and visible
        particleAlpha: 0.95,  // Very bright
        color: { r: 255, g: 150, b: 50 },  // Orange/yellow - still heated
        backgroundColor: { r: 50, g: 25, b: 15 },  // Dark orange background
        glowIntensity: 0.85,

        // State
        particleState: PARTICLE_STATES.QGP_COOLING,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PLASMA,

        // Info
        size: '~100 km',
        sizeMeters: 1e5,
        events: [
            'QGP temperature dropping',
            'Approaching hadronization threshold',
            'Quarks beginning to confine',
            'Critical temperature approaching (150 MeV)'
        ],
        description: 'The Quark-Gluon Plasma cools through cosmic expansion. As temperature drops toward ~150 MeV (~1.7 trillion K), quarks begin to feel confinement. The universe is approaching the hadronization phase transition.',
        dataSource: 'Lattice QCD calculations'
    },

    // ============================================================
    // EPOCH 9: HADRONIZATION (Quarks → Protons/Neutrons)
    // ============================================================
    {
        id: 'hadronization',
        name: 'Hadronization',
        shortName: 'Hadron',
        timeStart: 1e-4,
        timeEnd: 1,
        temperature: 1e12,
        redshift: 1e10,
        scaleFactor: 1e-10,
        hubbleParam: 1e14,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Hadronization, cooling further
        particleBlur: 1.1,
        particleJitter: 0.6,
        particleSize: 40,
        particleAlpha: 0.75,
        color: { r: 255, g: 200, b: 120 },
        backgroundColor: { r: 200, g: 190, b: 120 },
        glowIntensity: 0.75,

        // State
        particleState: PARTICLE_STATES.HADRONS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PLASMA,

        // Info
        size: '~10,000 km',
        sizeMeters: 1e7,
        events: [
            'Quarks confined into hadrons',
            'Protons and neutrons form',
            'Pions, kaons produced',
            'Baryogenesis (matter-antimatter asymmetry)',
            'Slight excess of matter over antimatter'
        ],
        description: 'Hadronization: quarks combine to form hadrons (protons, neutrons, pions). The QCD phase transition occurs. A crucial asymmetry generates slightly more matter than antimatter (about 1 part in 10 billion), which will allow matter to survive after annihilation.',
        dataSource: 'QCD + Baryogenesis theories'
    },

    // ============================================================
    // EPOCH 10: LEPTON EPOCH
    // ============================================================
    {
        id: 'lepton',
        name: 'Lepton Epoch',
        shortName: 'Lepton',
        timeStart: 1,
        timeEnd: 10,
        temperature: 1e11, // 100 billion K
        redshift: 1e9,
        scaleFactor: 1e-9,
        hubbleParam: 1e12,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Lepton epoch
        particleBlur: 0.9,
        particleJitter: 0.55,
        particleSize: 35,
        particleAlpha: 0.7,
        color: { r: 255, g: 195, b: 110 },
        backgroundColor: { r: 195, g: 185, b: 110 },
        glowIntensity: 0.65,

        // State
        particleState: PARTICLE_STATES.LEPTONS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PLASMA,

        // Info
        size: '~100,000 km',
        sizeMeters: 1e8,
        events: [
            'Leptons dominate energy density',
            'Electron-positron annihilation begins',
            'Neutrinos decouple from matter',
            'Cosmic neutrino background forms'
        ],
        description: 'The lepton epoch: electrons and positrons dominate. Most matter-antimatter annihilation occurs, leaving only the tiny excess of matter. Neutrinos decouple from the rest of matter, forming the Cosmic Neutrino Background that persists today.',
        dataSource: 'Standard Model + Neutrino decoupling calculations'
    },

    // ============================================================
    // EPOCH 11: NUCLEOSYNTHESIS - DEUTERIUM BOTTLENECK
    // ============================================================
    {
        id: 'nucleosynthesis_deuterium',
        name: 'Deuterium Bottleneck',
        shortName: 'BBN-D',
        timeStart: 10,
        timeEnd: 180, // 3 minutes
        temperature: 1e9, // 1 billion K
        redshift: 1e8,
        scaleFactor: 1e-8,
        hubbleParam: 1e10,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - BBN starting
        particleBlur: 0.7,
        particleJitter: 0.5,
        particleSize: 30,
        particleAlpha: 0.65,
        color: { r: 255, g: 190, b: 100 },
        backgroundColor: { r: 190, g: 180, b: 100 },
        glowIntensity: 0.6,

        // State
        particleState: PARTICLE_STATES.NUCLEI,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~1 million km',
        sizeMeters: 1e9,
        events: [
            'Temperature drops below 1 billion K',
            'Protons and neutrons can fuse',
            'Deuterium (heavy hydrogen) forms',
            'Deuterium bottleneck overcome',
            'Pathway to heavier elements opens'
        ],
        description: 'Big Bang Nucleosynthesis begins! Temperature has dropped enough for deuterium (hydrogen-2) to survive. This is the "deuterium bottleneck" - once overcome, fusion to heavier elements can proceed rapidly.',
        dataSource: 'BBN Theory (Alpher, Gamow) + Observations'
    },

    // ============================================================
    // EPOCH 12: NUCLEOSYNTHESIS - HELIUM-4 SYNTHESIS
    // ============================================================
    {
        id: 'nucleosynthesis_helium',
        name: 'Helium-4 Synthesis',
        shortName: 'BBN-He',
        timeStart: 180, // 3 minutes
        timeEnd: 240, // 4 minutes
        temperature: 9e8, // 900 million K
        redshift: 5e7,
        scaleFactor: 2e-8,
        hubbleParam: 8e9,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Helium synthesis
        particleBlur: 0.6,
        particleJitter: 0.45,
        particleSize: 28,
        particleAlpha: 0.6,
        color: { r: 255, g: 185, b: 95 },
        backgroundColor: { r: 185, g: 175, b: 95 },
        glowIntensity: 0.55,

        // State
        particleState: PARTICLE_STATES.NUCLEI,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~2 million km',
        sizeMeters: 2e9,
        events: [
            'Helium-4 rapidly synthesized',
            'Fusion chain: D + D → He-3 + n',
            'He-3 + D → He-4 + p',
            '~25% of mass becomes helium',
            'Abundance ratio frozen in'
        ],
        description: 'Rapid synthesis of Helium-4! In just one minute, about 25% of all ordinary matter (by mass) fuses into helium-4. This primordial helium abundance ratio (75% H, 25% He) is remarkably uniform throughout the universe and matches BBN predictions perfectly.',
        dataSource: 'BBN Theory + Helium abundance observations'
    },

    // ============================================================
    // EPOCH 13: NUCLEOSYNTHESIS - LITHIUM FORMATION
    // ============================================================
    {
        id: 'nucleosynthesis_lithium',
        name: 'Lithium Formation',
        shortName: 'BBN-Li',
        timeStart: 240, // 4 minutes
        timeEnd: 1200, // 20 minutes
        temperature: 3e8, // 300 million K
        redshift: 1e7,
        scaleFactor: 1e-7,
        hubbleParam: 5e9,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Lithium formation
        particleBlur: 0.5,
        particleJitter: 0.4,
        particleSize: 26,
        particleAlpha: 0.55,
        color: { r: 255, g: 180, b: 90 },
        backgroundColor: { r: 180, g: 170, b: 90 },
        glowIntensity: 0.5,

        // State
        particleState: PARTICLE_STATES.NUCLEI,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~10 million km',
        sizeMeters: 1e10,
        events: [
            'Trace amounts of lithium-7 form',
            'Tiny amounts of beryllium-7',
            'Nucleosynthesis ends',
            'Too cool for further fusion',
            'Primordial element abundances frozen'
        ],
        description: 'The final stage of Big Bang Nucleosynthesis. Trace amounts of lithium-7 and beryllium-7 form. Temperature drops too low for further fusion. The primordial abundances are now frozen: ~75% H, ~25% He, trace Li. These predictions match observations remarkably well, strong evidence for the Big Bang.',
        dataSource: 'BBN Theory + Lithium observations'
    },

    // ============================================================
    // EPOCH 14: PHOTON EPOCH (Radiation-Dominated Era)
    // ============================================================
    {
        id: 'photon_epoch',
        name: 'Photon Epoch',
        shortName: 'Photon',
        timeStart: 1200, // 20 minutes
        timeEnd: 1.577e12, // ~50,000 years
        temperature: 1e6, // 1 million K (mid-epoch)
        redshift: 3600,
        scaleFactor: 2.8e-4,
        hubbleParam: 1e6,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Photon epoch
        particleBlur: 0.4,
        particleJitter: 0.35,
        particleSize: 24,
        particleAlpha: 0.5,
        color: { r: 255, g: 170, b: 80 },
        backgroundColor: { r: 170, g: 160, b: 80 },
        glowIntensity: 0.45,

        // State
        particleState: PARTICLE_STATES.PHOTONS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~1000 light-years',
        sizeMeters: 1e19,
        events: [
            'Radiation dominates energy density',
            'Photons control expansion rate',
            'Universe still opaque (ionized)',
            'Thomson scattering dominant',
            'Approaching matter-radiation equality'
        ],
        description: 'The Photon Epoch: radiation (photons) dominates the energy density and drives cosmic expansion. The universe is filled with a dense fog of ionized hydrogen, opaque to light. Photons scatter constantly off free electrons (Thomson scattering). This epoch ends when matter density overtakes radiation.',
        dataSource: 'Standard cosmology'
    },

    // ============================================================
    // EPOCH 15: MATTER-RADIATION EQUALITY
    // ============================================================
    {
        id: 'matter_radiation_equality',
        name: 'Matter-Radiation Equality',
        shortName: 'Equality',
        timeStart: 1.577e12, // ~50,000 years
        timeEnd: 3.154e12, // ~100,000 years
        temperature: 9000, // 9,000 K
        redshift: 3600,
        scaleFactor: 2.8e-4,
        hubbleParam: 2e5,

        // Physics
        gravityEnabled: false, // Gravity still negligible
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Matter-radiation equality
        particleBlur: 0.35,
        particleJitter: 0.3,
        particleSize: 22,
        particleAlpha: 0.45,
        color: { r: 255, g: 165, b: 75 },
        backgroundColor: { r: 165, g: 155, b: 75 },
        glowIntensity: 0.4,

        // State
        particleState: PARTICLE_STATES.PHOTONS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~10,000 light-years',
        sizeMeters: 1e20,
        events: [
            'Matter and radiation densities equal',
            'Transition from radiation to matter domination',
            'Critical epoch for structure formation',
            'Density perturbations can begin growing',
            'Dark matter halos start forming'
        ],
        description: 'Matter-Radiation Equality: a critical transition. Matter density equals radiation density for the first time. After this, matter dominates and density perturbations can grow via gravitational instability. This is the beginning of structure formation - the seeds planted during inflation can now grow.',
        dataSource: 'Planck 2018 (z_eq ≈ 3600)'
    },

    // ============================================================
    // EPOCH 16: RECOMBINATION BEGINS
    // ============================================================
    {
        id: 'recombination_begin',
        name: 'Recombination Begins',
        shortName: 'Recomb-Start',
        timeStart: 3.154e12, // ~100,000 years
        timeEnd: 1.167e13, // ~370,000 years
        temperature: 4000, // 4,000 K
        redshift: 1500,
        scaleFactor: 6.7e-4,
        hubbleParam: 1e5,

        // Physics
        gravityEnabled: false,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Recombination starting
        particleBlur: 0.3,
        particleJitter: 0.25,
        particleSize: 20,
        particleAlpha: 0.4,
        color: { r: 255, g: 160, b: 70 },
        backgroundColor: { r: 160, g: 150, b: 70 },
        glowIntensity: 0.35,

        // State
        particleState: PARTICLE_STATES.ATOMS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~50,000 light-years',
        sizeMeters: 5e20,
        events: [
            'Electrons begin binding to nuclei',
            'Neutral hydrogen starts forming',
            'Ionization fraction drops',
            'Universe becoming transparent',
            'Photon mean free path increasing'
        ],
        description: 'Recombination begins: the universe has cooled enough for electrons to bind to atomic nuclei, forming neutral hydrogen atoms. This is a gradual process. As more atoms form, photons scatter less frequently and can travel further.',
        dataSource: 'Recombination theory + CMB observations'
    },

    // ============================================================
    // EPOCH 17: LAST SCATTERING SURFACE (CMB Released)
    // ============================================================
    {
        id: 'last_scattering',
        name: 'Last Scattering Surface',
        shortName: 'CMB',
        timeStart: 1.167e13, // ~370,000 years
        timeEnd: 1.325e13, // ~420,000 years
        temperature: 3000, // 3,000 K
        redshift: 1100,
        scaleFactor: 9.1e-4,
        hubbleParam: 8e4,

        // Physics
        gravityEnabled: true, // Gravity begins to matter!
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Last scattering, becoming transparent
        particleBlur: 0.25,
        particleJitter: 0.2,
        particleSize: 18,
        particleAlpha: 0.35,
        color: { r: 255, g: 155, b: 65 },
        backgroundColor: { r: 155, g: 145, b: 65 },
        glowIntensity: 0.3,

        // State
        particleState: PARTICLE_STATES.ATOMS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~84 million light-years',
        sizeMeters: 8e23,
        events: [
            'Universe becomes transparent',
            'Photons decouple from matter',
            'CMB photons released',
            'Last scattering of primordial light',
            'Tiny temperature fluctuations imprinted (ΔT/T ~ 10^-5)'
        ],
        description: 'The Last Scattering Surface! The universe becomes transparent for the first time. Photons decouple from matter and stream freely through space. These photons, redshifted by cosmic expansion, are the Cosmic Microwave Background (CMB) we observe today. Tiny temperature fluctuations in the CMB reveal the density perturbations that will grow into galaxies.',
        dataSource: 'Planck 2018 CMB observations (z = 1100)'
    },

    // ============================================================
    // EPOCH 18: DARK AGES BEGIN
    // ============================================================
    {
        id: 'dark_ages_early',
        name: 'Early Dark Ages',
        shortName: 'Dark-Early',
        timeStart: 1.325e13, // ~420,000 years
        timeEnd: 3.154e14, // ~10 million years
        temperature: 60, // 60 K (cooled significantly)
        redshift: 100,
        scaleFactor: 0.01,
        hubbleParam: 1e4,

        // Physics
        gravityEnabled: true,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Dark ages, neutral gas
        particleBlur: 0.2,
        particleJitter: 0.15,
        particleSize: 16,
        particleAlpha: 0.3,
        color: { r: 60, g: 30, b: 30 },
        backgroundColor: { r: 30, g: 20, b: 25 },
        glowIntensity: 0.15,

        // State
        particleState: PARTICLE_STATES.NEUTRAL_GAS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~2 billion light-years',
        sizeMeters: 2e25,
        events: [
            'No stars exist yet',
            'Universe filled with neutral hydrogen',
            'Completely dark era',
            'Only gravity acting',
            '21-cm hydrogen line observable'
        ],
        description: 'The Dark Ages: no stars have formed yet. The universe is dark, filled only with neutral hydrogen gas. The only radiation is the fading CMB. Gravity slowly pulls gas into denser regions, but star formation has not yet ignited. This is a critical period of gravitational collapse leading to the first stars.',
        dataSource: '21-cm cosmology + structure formation simulations'
    },

    // ============================================================
    // EPOCH 19: GRAVITATIONAL COLLAPSE (Dark Matter Halos Form)
    // ============================================================
    {
        id: 'gravitational_collapse',
        name: 'Gravitational Collapse',
        shortName: 'Collapse',
        timeStart: 3.154e14, // ~10 million years
        timeEnd: 6.307e15, // ~200 million years
        temperature: 30, // 30 K
        redshift: 30,
        scaleFactor: 0.033,
        hubbleParam: 3000,

        // Physics
        gravityEnabled: true,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Gravitational collapse
        particleBlur: 0.15,
        particleJitter: 0.1,
        particleSize: 14,
        particleAlpha: 0.25,
        color: { r: 80, g: 40, b: 40 },
        backgroundColor: { r: 40, g: 25, b: 30 },
        glowIntensity: 0.12,

        // State
        particleState: PARTICLE_STATES.NEUTRAL_GAS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~5 billion light-years',
        sizeMeters: 5e25,
        events: [
            'Dark matter halos forming',
            'Gas falling into potential wells',
            'Density contrasts growing',
            'Filamentary structure emerging',
            'Approaching star formation threshold'
        ],
        description: 'Gravitational collapse intensifies. Dark matter halos grow through gravitational instability. Ordinary matter (gas) falls into these dark matter potential wells, heating as it collapses. The first structures are forming: small dark matter halos that will host the first stars.',
        dataSource: 'N-body + hydrodynamic simulations'
    },

    // ============================================================
    // EPOCH 20: FIRST STARS FORM (Population III)
    // ============================================================
    {
        id: 'first_stars',
        name: 'First Star Formation',
        shortName: 'PopIII',
        timeStart: 6.307e15, // ~200 million years
        timeEnd: 9.461e15, // ~300 million years
        temperature: 20, // 20 K
        redshift: 20,
        scaleFactor: 0.05,
        hubbleParam: 2000,

        // Physics
        gravityEnabled: true,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - First stars forming
        particleBlur: 0.12,
        particleJitter: 0.08,
        particleSize: 12,
        particleAlpha: 0.25,
        color: { r: 100, g: 120, b: 255 },
        backgroundColor: { r: 30, g: 30, b: 50 },
        glowIntensity: 0.2,

        // State
        particleState: PARTICLE_STATES.PROTOSTARS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~7 billion light-years',
        sizeMeters: 7e25,
        events: [
            'First stars ignite (Population III)',
            'Massive metal-free stars (50-500 M☉)',
            'First light in the universe!',
            'UV radiation begins ionizing surroundings',
            'Extremely short-lived stars'
        ],
        description: 'The first stars ignite! Population III stars form from pristine primordial gas (no heavy elements). These stars are massive (50-500 solar masses), extremely hot and blue, and short-lived. Their intense UV radiation begins ionizing the surrounding hydrogen. The first light in the universe!',
        dataSource: 'Pop III star formation simulations + JWST observations'
    },

    // ============================================================
    // EPOCH 21: FIRST SUPERNOVAE (Heavy Elements Created)
    // ============================================================
    {
        id: 'first_supernovae',
        name: 'First Supernovae',
        shortName: 'SN-I',
        timeStart: 9.461e15, // ~300 million years
        timeEnd: 1.261e16, // ~400 million years
        temperature: 15, // 15 K
        redshift: 15,
        scaleFactor: 0.067,
        hubbleParam: 1500,

        // Physics
        gravityEnabled: true,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - First supernovae
        particleBlur: 0.1,
        particleJitter: 0.06,
        particleSize: 10,
        particleAlpha: 0.22,
        color: { r: 255, g: 150, b: 100 },
        backgroundColor: { r: 40, g: 30, b: 45 },
        glowIntensity: 0.25,

        // State
        particleState: PARTICLE_STATES.PROTOSTARS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~8 billion light-years',
        sizeMeters: 8e25,
        events: [
            'First supernovae explosions',
            'Heavy elements synthesized',
            'Metals dispersed into IGM',
            'Chemical enrichment begins',
            'Energy feedback affects gas',
            'Possible pair-instability supernovae'
        ],
        description: 'The first supernovae! Massive Pop III stars explode after just a few million years, synthesizing heavy elements (carbon, oxygen, iron, etc.) in their cores and during the explosion. These "metals" are dispersed into the intergalactic medium, enriching future generations of stars.',
        dataSource: 'Supernova nucleosynthesis + chemical evolution models'
    },

    // ============================================================
    // EPOCH 22: REIONIZATION BEGINS
    // ============================================================
    {
        id: 'reionization_begin',
        name: 'Reionization Begins',
        shortName: 'Reion-Start',
        timeStart: 1.261e16, // ~400 million years
        timeEnd: 1.892e16, // ~600 million years
        temperature: 12, // 12 K
        redshift: 12,
        scaleFactor: 0.083,
        hubbleParam: 1200,

        // Physics
        gravityEnabled: true,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Reionization begins
        particleBlur: 0.08,
        particleJitter: 0.05,
        particleSize: 8,
        particleAlpha: 0.2,
        color: { r: 180, g: 140, b: 255 },
        backgroundColor: { r: 45, g: 35, b: 60 },
        glowIntensity: 0.22,

        // State
        particleState: PARTICLE_STATES.PROTOSTARS,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~10 billion light-years',
        sizeMeters: 1e26,
        events: [
            'UV radiation from stars ionizes hydrogen',
            'HII regions expand around galaxies',
            'Neutral hydrogen fraction dropping',
            'Gunn-Peterson trough observable',
            'Second ionization of the universe'
        ],
        description: 'Reionization begins: UV radiation from stars and early quasars ionizes the neutral hydrogen that filled the universe during the Dark Ages. Bubbles of ionized gas expand around galaxies and merge. This is the "second ionization" - the first was before recombination.',
        dataSource: 'Quasar spectra + Planck 2018 + JWST'
    },

    // ============================================================
    // EPOCH 23: REIONIZATION COMPLETE
    // ============================================================
    {
        id: 'reionization_complete',
        name: 'Reionization Complete',
        shortName: 'Reion-End',
        timeStart: 1.892e16, // ~600 million years
        timeEnd: 2.366e16, // ~750 million years
        temperature: 10, // 10 K
        redshift: 10,
        scaleFactor: 0.1,
        hubbleParam: 1000,

        // Physics
        gravityEnabled: true,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Reionization complete
        particleBlur: 0.06,
        particleJitter: 0.04,
        particleSize: 7,
        particleAlpha: 0.18,
        color: { r: 200, g: 160, b: 255 },
        backgroundColor: { r: 50, g: 40, b: 70 },
        glowIntensity: 0.2,

        // State
        particleState: PARTICLE_STATES.PROTOGALAXY,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~12 billion light-years',
        sizeMeters: 1.2e26,
        events: [
            'Universe fully reionized',
            'Neutral hydrogen < 1%',
            'IGM now ionized plasma',
            'Transparent to UV light',
            'End of Dark Ages'
        ],
        description: 'Reionization complete! The universe is now fully ionized again. Less than 1% of hydrogen remains neutral. The intergalactic medium is a hot ionized plasma, transparent to most light. The Dark Ages have ended. The universe is bright with stars and young galaxies.',
        dataSource: 'Planck 2018 (z_reion ≈ 8-10) + quasar observations'
    },

    // ============================================================
    // EPOCH 24: PROTOGALAXY FORMATION
    // ============================================================
    {
        id: 'protogalaxies',
        name: 'Protogalaxy Formation',
        shortName: 'ProtoGal',
        timeStart: 2.366e16, // ~750 million years
        timeEnd: 3.154e16, // ~1 billion years
        temperature: 8, // 8 K
        redshift: 8,
        scaleFactor: 0.125,
        hubbleParam: 800,

        // Physics
        gravityEnabled: true,
        mergingEnabled: false,
        expansionRate: 1.0,

        // Visual - Protogalaxies forming
        particleBlur: 0.05,
        particleJitter: 0.03,
        particleSize: 6,
        particleAlpha: 0.16,
        color: { r: 220, g: 180, b: 255 },
        backgroundColor: { r: 55, g: 45, b: 80 },
        glowIntensity: 0.18,

        // State
        particleState: PARTICLE_STATES.PROTOGALAXY,
        galaxyFormation: false,
        renderMode: RENDER_MODES.PARTICLES,

        // Info
        size: '~15 billion light-years',
        sizeMeters: 1.5e26,
        events: [
            'Small protogalaxies forming',
            'Hierarchical assembly begins',
            'Gas-rich clumpy galaxies',
            'High star formation rates',
            'Frequent mergers'
        ],
        description: 'Protogalaxies form: small, irregular, gas-rich clumps that are the building blocks of modern galaxies. Star formation rates are extremely high. Frequent mergers drive rapid evolution. These are the ancestors of today\'s massive galaxies, observed by JWST at high redshift.',
        dataSource: 'JWST high-z galaxy observations + simulations'
    },

    // ============================================================
    // EPOCH 25: FIRST GALAXIES ⭐ GALAXY FORMATION BEGINS!
    // ============================================================
    {
        id: 'first_galaxies',
        name: 'First Galaxies',
        shortName: 'Gal-I',
        timeStart: 3.154e16, // ~1 billion years
        timeEnd: 9.461e16, // ~3 billion years
        temperature: 5, // 5 K
        redshift: 5,
        scaleFactor: 0.2,
        hubbleParam: 500,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true, // ⭐ MERGING BEGINS!
        expansionRate: 1.0,

        // Visual - First recognizable galaxies, sharp!
        particleBlur: 0.02,
        particleJitter: 0.01,
        particleSize: 4,
        particleAlpha: 1.0,
        color: { r: 220, g: 200, b: 180 },
        backgroundColor: { r: 10, g: 10, b: 20 },
        glowIntensity: 0.15,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true, // ⭐ GALAXIES FORM!
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '~25 billion light-years',
        sizeMeters: 2.5e26,
        events: [
            '⭐ RECOGNIZABLE GALAXIES FORM!',
            'Particles now represent galaxies',
            'Click galaxies for information',
            'Disk galaxies emerging',
            'Supermassive black holes growing',
            'Active galactic nuclei (AGN/quasars)'
        ],
        description: '⭐ MILESTONE: First recognizable galaxies! From this point forward, each particle represents a galaxy with mass, type, name, and properties. Disk structures are emerging. Supermassive black holes at galaxy centers are growing rapidly, powering quasars. This is the era observed by Hubble Deep Fields and JWST.',
        dataSource: 'Hubble Deep Field + JWST + galaxy formation simulations'
    },

    // ============================================================
    // EPOCH 26: MAJOR MERGERS ERA
    // ============================================================
    {
        id: 'major_mergers',
        name: 'Major Mergers Era',
        shortName: 'Mergers',
        timeStart: 9.461e16, // ~3 billion years
        timeEnd: 1.577e17, // ~5 billion years
        temperature: 3.5, // 3.5 K
        redshift: 2,
        scaleFactor: 0.33,
        hubbleParam: 200,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.0,

        // Visual - Major mergers, very sharp
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 3.5,
        particleAlpha: 1.0,
        color: { r: 200, g: 180, b: 160 },
        backgroundColor: { r: 5, g: 5, b: 15 },
        glowIntensity: 0.12,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '~40 billion light-years',
        sizeMeters: 4e26,
        events: [
            'Frequent galaxy-galaxy collisions',
            'Spiral + spiral → elliptical',
            'Major mergers common',
            'Tidal tails and streams',
            'Starburst galaxies',
            'Building massive ellipticals'
        ],
        description: 'Peak of galaxy mergers! Galaxies collide frequently, triggering starbursts and building massive elliptical galaxies. Merger remnants have disturbed morphologies. Tidal tails and stellar streams are common. This violent period shapes the galaxy population we see today.',
        dataSource: 'Galaxy merger simulations + observations'
    },

    // ============================================================
    // EPOCH 27: COSMIC WEB EMERGES
    // ============================================================
    {
        id: 'cosmic_web',
        name: 'Cosmic Web Emerges',
        shortName: 'Web',
        timeStart: 1.577e17, // ~5 billion years
        timeEnd: 2.208e17, // ~7 billion years
        temperature: 3.2, // 3.2 K
        redshift: 1.5,
        scaleFactor: 0.4,
        hubbleParam: 150,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.0,

        // Visual - Cosmic web visible
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 3,
        particleAlpha: 1.0,
        color: { r: 180, g: 160, b: 140 },
        backgroundColor: { r: 3, g: 3, b: 10 },
        glowIntensity: 0.1,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '~50 billion light-years',
        sizeMeters: 5e26,
        events: [
            'Large-scale structure clearly visible',
            'Filaments connecting clusters',
            'Voids becoming prominent',
            'Cosmic web architecture established',
            'Galaxies trace dark matter distribution'
        ],
        description: 'The Cosmic Web is clearly visible! Galaxies are arranged in a vast network: dense clusters connected by filaments, surrounding giant voids. This "cosmic web" structure reflects the underlying dark matter distribution. This is the large-scale structure we map with galaxy surveys today.',
        dataSource: 'Galaxy surveys (SDSS, 2dF) + simulations'
    },

    // ============================================================
    // EPOCH 28: GALAXY CLUSTERS FORM
    // ============================================================
    {
        id: 'galaxy_clusters',
        name: 'Galaxy Clusters',
        shortName: 'Clusters',
        timeStart: 2.208e17, // ~7 billion years
        timeEnd: 2.839e17, // ~9 billion years
        temperature: 2.9, // 2.9 K
        redshift: 1.0,
        scaleFactor: 0.5,
        hubbleParam: 100,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.0,

        // Visual - Galaxy clusters
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 2.5,
        particleAlpha: 1.0,
        color: { r: 170, g: 150, b: 130 },
        backgroundColor: { r: 2, g: 2, b: 8 },
        glowIntensity: 0.08,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '~60 billion light-years',
        sizeMeters: 6e26,
        events: [
            'Massive galaxy clusters forming',
            'Hot intracluster medium (ICM)',
            'X-ray emitting gas',
            'Strong gravitational lensing',
            'BCGs (brightest cluster galaxies)',
            'Cluster-cluster mergers'
        ],
        description: 'Rich galaxy clusters form, containing hundreds to thousands of galaxies. Hot gas (10-100 million K) fills the space between galaxies, emitting X-rays. These clusters are the largest gravitationally bound structures in the universe. Strong gravitational lensing magnifies background galaxies.',
        dataSource: 'X-ray observations (Chandra) + lensing studies'
    },

    // ============================================================
    // EPOCH 29: SUPERCLUSTERS
    // ============================================================
    {
        id: 'superclusters',
        name: 'Superclusters',
        shortName: 'SuperC',
        timeStart: 2.839e17, // ~9 billion years
        timeEnd: 3.154e17, // ~10 billion years
        temperature: 2.8, // 2.8 K
        redshift: 0.8,
        scaleFactor: 0.56,
        hubbleParam: 90,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.0,

        // Visual - Superclusters
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 2.2,
        particleAlpha: 1.0,
        color: { r: 160, g: 140, b: 120 },
        backgroundColor: { r: 1, g: 1, b: 5 },
        glowIntensity: 0.06,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '~70 billion light-years',
        sizeMeters: 7e26,
        events: [
            'Largest structures forming',
            'Superclusters: clusters of clusters',
            'Great walls and sheets',
            'Not gravitationally bound (expanding)',
            'Laniakea, Virgo, Coma superclusters'
        ],
        description: 'Superclusters - the largest structures! These are massive complexes of galaxy clusters extending 100-500 million light-years. Unlike clusters, superclusters are not gravitationally bound and expand with the universe. Examples: Laniakea (our local supercluster), the Great Wall.',
        dataSource: 'Large-scale structure surveys + velocity flow mapping'
    },

    // ============================================================
    // EPOCH 30: PEAK STAR FORMATION
    // ============================================================
    {
        id: 'peak_star_formation',
        name: 'Peak Star Formation',
        shortName: 'Peak-SF',
        timeStart: 3.154e17, // ~10 billion years
        timeEnd: 3.470e17, // ~11 billion years
        temperature: 2.75, // 2.75 K
        redshift: 0.5,
        scaleFactor: 0.67,
        hubbleParam: 80,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.0,

        // Visual - Peak star formation
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 2.0,
        particleAlpha: 1.0,
        color: { r: 150, g: 130, b: 110 },
        backgroundColor: { r: 1, g: 1, b: 3 },
        glowIntensity: 0.05,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '~75 billion light-years',
        sizeMeters: 7.5e26,
        events: [
            'Maximum cosmic star formation rate',
            '~10× higher SFR than today',
            'Most stars in universe born',
            'Copious dust and star formation',
            'Submillimeter galaxies',
            'Peak of AGN activity'
        ],
        description: 'Peak of cosmic star formation! The universe is forming stars at maximum rate, about 10× faster than today. Most stars that will ever exist are born in this era. Galaxies are gas-rich and actively forming stars. This is "cosmic noon" - the universe at its most vibrant.',
        dataSource: 'SFR density evolution studies (Hopkins & Beacom 2006, updated)'
    },

    // ============================================================
    // EPOCH 31: STAR FORMATION DECLINE
    // ============================================================
    {
        id: 'decline_star_formation',
        name: 'Star Formation Decline',
        shortName: 'SF-Decline',
        timeStart: 3.470e17, // ~11 billion years
        timeEnd: 4.103e17, // ~13 billion years
        temperature: 2.73, // 2.73 K
        redshift: 0.2,
        scaleFactor: 0.83,
        hubbleParam: 72,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.0,

        // Visual - Star formation decline
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 1.8,
        particleAlpha: 1.0,
        color: { r: 140, g: 120, b: 100 },
        backgroundColor: { r: 0, g: 0, b: 2 },
        glowIntensity: 0.04,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '~85 billion light-years',
        sizeMeters: 8.5e26,
        events: [
            'Cosmic star formation declining',
            'Gas being depleted',
            'AGN feedback quenching SF',
            'Galaxies "retiring"',
            'More ellipticals, fewer spirals',
            'Dark energy beginning to dominate'
        ],
        description: 'Star formation declines from its peak. Galaxies are running out of cold gas to form new stars. AGN feedback and other processes quench star formation. The universe is "settling down" - more mature elliptical galaxies, fewer active star-forming spirals. Dark energy is becoming dominant.',
        dataSource: 'SFR evolution + quenching studies'
    },

    // ============================================================
    // EPOCH 32: PRESENT DAY
    // ============================================================
    {
        id: 'present',
        name: 'Present Day',
        shortName: 'Now',
        timeStart: 4.103e17, // ~13 billion years
        timeEnd: 4.354e17, // 13.798 billion years (present)
        temperature: 2.725, // 2.725 K (CMB today)
        redshift: 0,
        scaleFactor: 1.0,
        hubbleParam: 67.4, // H0 from Planck 2018

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.0,

        // Visual
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 1.0,
        particleAlpha: 1.0,
        color: { r: 130, g: 110, b: 90 },
        backgroundColor: { r: 0, g: 0, b: 1 },
        glowIntensity: 0.02,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '93 billion light-years',
        sizeMeters: 8.8e26, // Observable universe diameter
        events: [
            'Current era - you are here!',
            'Observable universe: 93 Gly diameter',
            '~2 trillion galaxies',
            'Dark energy: 68.9%',
            'Dark matter: 26.1%',
            'Ordinary matter: 4.9%',
            'CMB temperature: 2.725 K',
            'Accelerating expansion'
        ],
        description: 'The Present Day! The observable universe spans 93 billion light-years and contains approximately 2 trillion galaxies. Dark energy dominates (69%), causing accelerating expansion. Most star formation is over - we live in a mature, dark-energy-dominated universe. The CMB has cooled to 2.725 K.',
        dataSource: 'Planck 2018 cosmological parameters'
    },

    // ============================================================
    // EPOCH 33: NEAR FUTURE (Accelerating Expansion)
    // ============================================================
    {
        id: 'near_future',
        name: 'Near Future',
        shortName: 'Future',
        timeStart: 4.354e17, // 13.798 Gyr (present)
        timeEnd: 1.0e18, // ~31.7 billion years
        temperature: 1.5, // 1.5 K (cooled further)
        redshift: -0.2, // Negative redshift (future!)
        scaleFactor: 1.8,
        hubbleParam: 67.4,

        // Physics
        gravityEnabled: true,
        mergingEnabled: true,
        expansionRate: 1.2, // Accelerating!

        // Visual
        particleBlur: 0.0,
        particleJitter: 0.0,
        particleSize: 0.8,
        particleAlpha: 1.0,
        color: { r: 120, g: 100, b: 80 },
        backgroundColor: { r: 0, g: 0, b: 0 },
        glowIntensity: 0.01,

        // State
        particleState: PARTICLE_STATES.GALAXY,
        galaxyFormation: true,
        renderMode: RENDER_MODES.GALAXIES,

        // Info
        size: '>100 billion light-years',
        sizeMeters: 1.5e27,
        events: [
            'Dark energy dominates completely',
            'Accelerating expansion continues',
            'Distant galaxies recede beyond horizon',
            'Observable universe shrinks',
            'Local Group isolated',
            'Star formation nearly ceased',
            'Universe dimming and cooling'
        ],
        description: 'The near future: dark energy\'s repulsive effect accelerates expansion. Distant galaxies recede beyond our cosmic horizon - we can no longer see them. The observable universe paradoxically shrinks even as space expands. Eventually, only the Local Group remains visible. Star formation is nearly extinct.',
        dataSource: 'ΛCDM extrapolation + Big Freeze scenario'
    }
];

/**
 * Get epoch at given time
 */
export function getEpochAtTime(time) {
    for (let i = DETAILED_EPOCHS.length - 1; i >= 0; i--) {
        if (time >= DETAILED_EPOCHS[i].timeStart) {
            return DETAILED_EPOCHS[i];
        }
    }
    return DETAILED_EPOCHS[0];
}

/**
 * Get epoch by ID
 */
export function getEpochById(id) {
    return DETAILED_EPOCHS.find(e => e.id === id) || null;
}

/**
 * Get epoch by index
 */
export function getEpochByIndex(index) {
    return DETAILED_EPOCHS[Math.max(0, Math.min(index, DETAILED_EPOCHS.length - 1))];
}

/**
 * Get next epoch
 */
export function getNextEpoch(currentEpoch) {
    const currentIndex = DETAILED_EPOCHS.indexOf(currentEpoch);
    if (currentIndex >= 0 && currentIndex < DETAILED_EPOCHS.length - 1) {
        return DETAILED_EPOCHS[currentIndex + 1];
    }
    return currentEpoch;
}

export default DETAILED_EPOCHS;

/**
 * Epoch Definitions and Future Scenarios
 * Universe Evolution Simulator v2.47.3
 */

import { PLANCK, COSMOLOGICAL, UNITS } from '../utils/constants.js';

/**
 * Cosmic epochs from Big Bang to Present Day
 * Times are in seconds
 */
export const EPOCHS = [
    {
        id: 'planck',
        name: 'Planck Era',
        shortName: 'Planck',
        timeStart: 0,
        timeEnd: 1e-43,
        temperature: PLANCK.temperature,
        description: 'Quantum gravity dominates. Space-time foam. All forces unified. Physics as we know it breaks down.',
        timeRange: 't = 0 - 10^-43 s',
        size: '10^-35 m',
        sizeMeters: PLANCK.length,
        color: { r: 255, g: 255, b: 255 },
        particleBlur: 1.0,
        particleJitter: 1.0,
        events: ['Quantum gravity era', 'All forces unified', 'Space-time foam']
    },
    {
        id: 'inflation',
        name: 'Inflation',
        shortName: 'Inflation',
        timeStart: 1e-36,
        timeEnd: 1e-32,
        temperature: 1e27,
        description: 'Exponential expansion by factor of 10^26. Universe expands faster than light. Quantum fluctuations frozen into density perturbations.',
        timeRange: 't = 10^-36 - 10^-32 s',
        size: '~10 cm',
        sizeMeters: 0.1,
        color: { r: 255, g: 255, b: 255 },
        particleBlur: 0.9,
        particleJitter: 0.8,
        events: ['Exponential expansion', 'Quantum fluctuations seeded', 'Horizon problem solved']
    },
    {
        id: 'qgp',
        name: 'Quark-Gluon Plasma',
        shortName: 'QGP',
        timeStart: 1e-32,
        timeEnd: 1,
        temperature: 1e12,
        description: 'Hot soup of quarks and gluons. Too energetic for protons/neutrons to form. Electromagnetic and weak forces separate.',
        timeRange: 't = 10^-32 s - 1 s',
        size: '~20 light-years',
        sizeMeters: 20 * UNITS.ly_to_m,
        color: { r: 255, g: 200, b: 150 },
        particleBlur: 0.7,
        particleJitter: 0.5,
        events: ['Quark confinement', 'Electroweak symmetry breaking', 'Antimatter annihilation']
    },
    {
        id: 'nucleosynthesis',
        name: 'Nucleosynthesis',
        shortName: 'Nucleo',
        timeStart: 180,       // 3 minutes
        timeEnd: 1200,        // 20 minutes
        temperature: 1e9,
        description: 'First atomic nuclei form: hydrogen, helium, lithium. Determines 75% H, 25% He primordial abundance by mass.',
        timeRange: 't = 3 - 20 minutes',
        size: '~300 light-years',
        sizeMeters: 300 * UNITS.ly_to_m,
        color: { r: 255, g: 220, b: 100 },
        particleBlur: 0.5,
        particleJitter: 0.3,
        events: ['Proton-neutron ratio frozen', 'Deuterium formed', 'Helium-4 synthesis']
    },
    {
        id: 'recombination',
        name: 'Recombination',
        shortName: 'Recomb',
        timeStart: 1.2e13,    // ~380,000 years
        timeEnd: 1.5e13,
        temperature: 3000,
        description: "Electrons bind to nuclei forming neutral atoms. Universe becomes transparent. CMB released - 'Surface of last scattering'.",
        timeRange: 't = 380,000 years',
        size: '84 million light-years',
        sizeMeters: 84e6 * UNITS.ly_to_m,
        color: { r: 255, g: 180, b: 100 },
        particleBlur: 0.3,
        particleJitter: 0.1,
        events: ['Neutral hydrogen formed', 'CMB released', 'Universe becomes transparent']
    },
    {
        id: 'darkages',
        name: 'Dark Ages',
        shortName: 'Dark',
        timeStart: 1.2e13,
        timeEnd: 6.3e15,      // ~200 million years
        temperature: 60,
        description: 'No stars yet. Gravity slowly pulls matter into dense regions. Universe filled with neutral hydrogen. Very dim period.',
        timeRange: 't = 380k - 200M years',
        size: '9 billion light-years',
        sizeMeters: 9e9 * UNITS.ly_to_m,
        color: { r: 50, g: 20, b: 20 },
        particleBlur: 0.1,
        particleJitter: 0.05,
        events: ['Gravitational collapse begins', 'Dark matter halos form', 'First protogalaxies']
    },
    {
        id: 'firststars',
        name: 'First Stars',
        shortName: 'Stars',
        timeStart: 6.3e15,    // ~200 million years
        timeEnd: 3.15e16,     // ~1 billion years
        temperature: 10000,
        description: 'First stars ignite (Population III). Massive, short-lived blue giants. Reionization begins. First heavy elements forged.',
        timeRange: 't = 200M - 1B years',
        size: '9 billion light-years',
        sizeMeters: 9e9 * UNITS.ly_to_m,
        color: { r: 100, g: 150, b: 255 },
        particleBlur: 0.1,
        particleJitter: 0.02,
        events: ['Population III stars', 'Reionization begins', 'First supernovae']
    },
    {
        id: 'galaxyformation',
        name: 'Galaxy Formation',
        shortName: 'Galaxies',
        timeStart: 3.15e16,   // ~1 billion years
        timeEnd: 2.84e17,     // ~9 billion years
        temperature: 5000,
        description: 'Galaxies form and merge. Cosmic web of filaments emerges. Supermassive black holes grow. Peak star formation era.',
        timeRange: 't = 1 - 9 Gyr',
        size: '60 billion light-years',
        sizeMeters: 60e9 * UNITS.ly_to_m,
        color: { r: 255, g: 220, b: 180 },
        particleBlur: 0.05,
        particleJitter: 0.01,
        events: ['Cosmic web emerges', 'Galaxy mergers', 'Peak star formation']
    },
    {
        id: 'darkenergy',
        name: 'Dark Energy Era',
        shortName: 'DarkE',
        timeStart: 2.84e17,   // ~9 billion years
        timeEnd: 4.35e17,     // ~13.8 billion years
        temperature: 2.725,
        description: 'Dark energy dominates. Cosmic expansion accelerates. Large-scale structures established. Approaching present day.',
        timeRange: 't = 9 - 13.8 Gyr',
        size: '93 billion light-years',
        sizeMeters: 93e9 * UNITS.ly_to_m,
        color: { r: 200, g: 180, b: 150 },
        particleBlur: 0.0,
        particleJitter: 0.0,
        events: ['Dark energy dominates', 'Accelerating expansion', 'Structure growth slows']
    },
    {
        id: 'present',
        name: 'Present Day',
        shortName: 'Now',
        timeStart: 4.35e17,   // 13.8 billion years
        timeEnd: 4.35e17,
        temperature: 2.725,
        description: 'Current era. Observable universe spans 93 billion light-years. Contains ~2 trillion galaxies and countless stars.',
        timeRange: 't = 13.8 Gyr',
        size: '93 billion light-years',
        sizeMeters: 93e9 * UNITS.ly_to_m,
        color: { r: 200, g: 180, b: 150 },
        particleBlur: 0.0,
        particleJitter: 0.0,
        events: ['Observable universe', '~2 trillion galaxies', 'Local Group formed']
    }
];

/**
 * Future universe scenarios
 */
export const FUTURE_SCENARIOS = {
    freeze: {
        id: 'freeze',
        name: 'Big Freeze',
        shortName: 'Freeze',
        description: 'Eternal expansion. Heat death. All stars die. Maximum entropy. Universe fades to darkness over 10^100 years.',
        w: -1.0,
        endTime: Infinity,
        visualEffect: 'fade_to_black',
        stages: [
            { time: 1e10 * UNITS.yr_to_s, event: 'Star formation ends' },
            { time: 1e12 * UNITS.yr_to_s, event: 'Galaxies go dark' },
            { time: 1e14 * UNITS.yr_to_s, event: 'Only white dwarfs remain' },
            { time: 1e40 * UNITS.yr_to_s, event: 'Proton decay begins' },
            { time: 1e100 * UNITS.yr_to_s, event: 'Heat death complete' }
        ]
    },
    rip: {
        id: 'rip',
        name: 'Big Rip',
        shortName: 'Rip',
        description: 'Phantom energy tears apart all structures. Galaxies, stars, planets, atoms - all ripped apart at finite time (~22 Gyr).',
        w: -1.5,
        endTime: 22e9 * UNITS.yr_to_s,  // ~22 billion years
        visualEffect: 'violent_expansion',
        stages: [
            { time: 19e9 * UNITS.yr_to_s, event: 'Galaxy clusters separate' },
            { time: 21e9 * UNITS.yr_to_s, event: 'Galaxies torn apart' },
            { time: 21.9e9 * UNITS.yr_to_s, event: 'Stars disrupted' },
            { time: 22e9 * UNITS.yr_to_s - 1e6, event: 'Planets destroyed' },
            { time: 22e9 * UNITS.yr_to_s, event: 'Atoms ripped apart' }
        ]
    },
    crunch: {
        id: 'crunch',
        name: 'Big Crunch',
        shortName: 'Crunch',
        description: 'Expansion reverses. Universe collapses back to singularity. Temperature rises. Time runs backward toward new Big Bang.',
        w: -0.5,  // Requires Omega_m > 1 effectively
        endTime: 48e9 * UNITS.yr_to_s,  // ~48 billion years
        visualEffect: 'collapse_to_center',
        stages: [
            { time: 25e9 * UNITS.yr_to_s, event: 'Expansion halts' },
            { time: 35e9 * UNITS.yr_to_s, event: 'Contraction accelerates' },
            { time: 45e9 * UNITS.yr_to_s, event: 'Galaxies merge violently' },
            { time: 47e9 * UNITS.yr_to_s, event: 'Stars begin fusing' },
            { time: 48e9 * UNITS.yr_to_s, event: 'Final singularity' }
        ]
    },
    bounce: {
        id: 'bounce',
        name: 'Big Bounce',
        shortName: 'Bounce',
        description: 'Cyclic universe. Crunch followed by new Big Bang. Infinite cycles of expansion and contraction. New universe each time.',
        w: -0.5,
        endTime: Infinity,  // Cyclic
        visualEffect: 'cyclic',
        stages: [
            { time: 48e9 * UNITS.yr_to_s, event: 'First contraction' },
            { time: 96e9 * UNITS.yr_to_s, event: 'First bounce' },
            { time: 144e9 * UNITS.yr_to_s, event: 'Second contraction' },
            { time: 192e9 * UNITS.yr_to_s, event: 'Second bounce' }
        ]
    }
};

/**
 * Cosmological model presets
 */
export const COSMOLOGY_PRESETS = {
    lambdaCDM: {
        name: 'LCDM (Standard Model)',
        description: 'Standard Lambda-CDM cosmology with Planck 2018 parameters',
        params: {
            H0: 67.4,
            Omega_Lambda: 0.6889,
            Omega_m: 0.3111,
            Omega_b: 0.0486,
            Omega_DM: 0.2625,
            Omega_r: 9.24e-5,
            Omega_k: 0.0,
            w: -1.0,
            n_s: 0.9649,
            sigma_8: 0.811
        }
    },
    scdm: {
        name: 'SCDM (Einstein-de Sitter)',
        description: 'No dark energy, matter-dominated universe',
        params: {
            H0: 70.0,
            Omega_Lambda: 0.0,
            Omega_m: 1.0,
            Omega_b: 0.05,
            Omega_DM: 0.95,
            Omega_r: 0.0,
            Omega_k: 0.0,
            w: -1.0,
            n_s: 1.0,
            sigma_8: 0.8
        }
    },
    openUniverse: {
        name: 'Open Universe',
        description: 'Negative curvature, hyperbolic geometry',
        params: {
            H0: 70.0,
            Omega_Lambda: 0.0,
            Omega_m: 0.3,
            Omega_b: 0.04,
            Omega_DM: 0.26,
            Omega_r: 0.0,
            Omega_k: 0.7,  // Negative curvature
            w: -1.0,
            n_s: 0.96,
            sigma_8: 0.8
        }
    },
    closedUniverse: {
        name: 'Closed Universe',
        description: 'Positive curvature, spherical geometry, eventual recollapse',
        params: {
            H0: 65.0,
            Omega_Lambda: 0.0,
            Omega_m: 1.3,
            Omega_b: 0.05,
            Omega_DM: 1.25,
            Omega_r: 0.0,
            Omega_k: -0.3,  // Positive curvature
            w: -1.0,
            n_s: 0.96,
            sigma_8: 0.9
        }
    },
    phantomEnergy: {
        name: 'Phantom Energy',
        description: 'w < -1, leads to Big Rip scenario',
        params: {
            H0: 67.4,
            Omega_Lambda: 0.7,
            Omega_m: 0.3,
            Omega_b: 0.05,
            Omega_DM: 0.25,
            Omega_r: 0.0,
            Omega_k: 0.0,
            w: -1.5,
            n_s: 0.96,
            sigma_8: 0.8
        }
    },
    quintessence: {
        name: 'Quintessence',
        description: 'Slowly evolving dark energy with -1 < w < -1/3',
        params: {
            H0: 67.4,
            Omega_Lambda: 0.7,
            Omega_m: 0.3,
            Omega_b: 0.05,
            Omega_DM: 0.25,
            Omega_r: 0.0,
            Omega_k: 0.0,
            w: -0.8,
            n_s: 0.96,
            sigma_8: 0.8
        }
    }
};

/**
 * Initial condition presets
 */
export const INITIAL_CONDITIONS = {
    standard: {
        name: 'Standard Fluctuations',
        description: 'LCDM predicted primordial fluctuations',
        perturbationAmplitude: 1e-5,
        distribution: 'spherical',
        velocityField: 'hubble'
    },
    smooth: {
        name: 'Smooth Universe',
        description: 'Minimal structure, slow formation',
        perturbationAmplitude: 1e-6,
        distribution: 'spherical',
        velocityField: 'hubble'
    },
    lumpy: {
        name: 'Lumpy Universe',
        description: 'Enhanced structure, early formation',
        perturbationAmplitude: 1e-3,
        distribution: 'spherical',
        velocityField: 'hubble'
    },
    grid: {
        name: 'Grid (Test)',
        description: 'Regular grid for testing/visualization',
        perturbationAmplitude: 0,
        distribution: 'grid',
        velocityField: 'hubble'
    },
    singleCluster: {
        name: 'Single Cluster',
        description: 'Isolated galaxy cluster for detailed study',
        perturbationAmplitude: 1e-4,
        distribution: 'gaussian',
        velocityField: 'thermal'
    },
    collision: {
        name: 'Cluster Collision',
        description: 'Two clusters approaching for merger study',
        perturbationAmplitude: 1e-4,
        distribution: 'dual_cluster',
        velocityField: 'collision'
    }
};

/**
 * Get epoch at given time
 * @param {number} time - Time in seconds
 * @returns {Object} Current epoch
 */
export function getEpochAtTime(time) {
    for (let i = EPOCHS.length - 1; i >= 0; i--) {
        if (time >= EPOCHS[i].timeStart) {
            return EPOCHS[i];
        }
    }
    return EPOCHS[0];
}

/**
 * Get epoch by ID
 * @param {string} id - Epoch ID
 * @returns {Object|null} Epoch object or null
 */
export function getEpochById(id) {
    return EPOCHS.find(e => e.id === id) || null;
}

/**
 * Get epoch by index
 * @param {number} index - Epoch index
 * @returns {Object} Epoch object
 */
export function getEpochByIndex(index) {
    return EPOCHS[Math.max(0, Math.min(index, EPOCHS.length - 1))];
}

export default EPOCHS;

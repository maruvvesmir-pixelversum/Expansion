/**
 * Physical Constants
 * Universe Evolution Simulator v2.47.3
 */

// Fundamental Physical Constants
export const PHYSICAL = {
    G: 6.674e-11,           // Gravitational constant (m^3/kg*s^2)
    c: 2.998e8,             // Speed of light (m/s)
    k_B: 1.381e-23,         // Boltzmann constant (J/K)
    sigma: 5.670e-8,        // Stefan-Boltzmann constant (W/m^2*K^4)
    h: 6.626e-34,           // Planck constant (J*s)
    hbar: 1.055e-34,        // Reduced Planck constant (J*s)
};

// Planck Units
export const PLANCK = {
    time: 5.391e-44,        // Planck time (s)
    length: 1.616e-35,      // Planck length (m)
    temperature: 1.417e32,  // Planck temperature (K)
    mass: 2.176e-8,         // Planck mass (kg)
    energy: 1.956e9,        // Planck energy (J)
    density: 5.155e96,      // Planck density (kg/m^3)
};

// Cosmological Constants
export const COSMOLOGICAL = {
    H0: 67.4,               // Hubble constant (km/s/Mpc)
    H0_SI: 2.18e-18,        // Hubble constant (1/s)
    T_CMB_0: 2.725,         // Current CMB temperature (K)
    rho_crit: 9.47e-27,     // Critical density (kg/m^3)
    age_universe: 13.798,   // Age of universe (Gyr)
};

// Unit Conversion Factors
export const UNITS = {
    Mpc_to_m: 3.086e22,     // Megaparsec to meters
    Gyr_to_s: 3.156e16,     // Gigayear to seconds
    Myr_to_s: 3.156e13,     // Megayear to seconds
    kyr_to_s: 3.156e10,     // Kiloyear to seconds
    yr_to_s: 3.156e7,       // Year to seconds
    ly_to_m: 9.461e15,      // Light year to meters
    pc_to_m: 3.086e16,      // Parsec to meters
    kpc_to_m: 3.086e19,     // Kiloparsec to meters
    AU_to_m: 1.496e11,      // Astronomical unit to meters
};

// Solar Units
export const SOLAR = {
    mass: 1.989e30,         // Solar mass (kg)
    luminosity: 3.828e26,   // Solar luminosity (W)
    radius: 6.957e8,        // Solar radius (m)
    temperature: 5778,      // Solar surface temperature (K)
};

// Default Cosmological Parameters (Planck 2018)
export const DEFAULT_COSMOLOGY = {
    Omega_Lambda: 0.6889,   // Dark energy density
    Omega_m: 0.3111,        // Total matter density
    Omega_b: 0.0486,        // Baryonic matter density
    Omega_DM: 0.2625,       // Dark matter density
    Omega_r: 9.24e-5,       // Radiation density
    Omega_k: 0.0,           // Curvature (flat universe)
    w: -1.03,               // Dark energy equation of state
    n_s: 0.9649,            // Spectral index of primordial fluctuations
    sigma_8: 0.811,         // Density fluctuation amplitude at 8 Mpc/h
    tau: 0.054,             // Optical depth to reionization
};

// Simulation Configuration Defaults
export const SIMULATION = {
    particleCount: 10000,  // Optimized for performance
    maxParticleCount: 4000000,
    minParticleCount: 10000,
    softeningLength: 1.0,           // kpc
    barnesHutTheta: 0.5,            // Opening angle for tree gravity
    timeStepMultiplier: 1e10,       // Default time speed
    maxTimeStepMultiplier: 1e18,
    minTimeStepMultiplier: 1,
    perturbationAmplitude: 1e-5,    // Initial density perturbation
};

// Visual Configuration
export const VISUAL = {
    defaultZoom: 1.0,
    maxZoom: 100,
    minZoom: 0.1,
    defaultFOV: 60,
    cameraDistance: 100,
    particleMinSize: 0.3,
    particleMaxSize: 2.0,
    bloomRadius: 8,
    motionBlurLength: 20,
    filmGrainIntensity: 0.05,
    vignetteIntensity: 0.3,
};

// Temperature ranges for color mapping (K)
export const TEMPERATURE_COLORS = {
    O_TYPE: { min: 30000, color: { r: 68, g: 136, b: 255 } },      // Blue - O-type massive stars
    B_TYPE: { min: 10000, color: { r: 136, g: 187, b: 255 } },     // Blue-white - B/A-type
    A_TYPE: { min: 7500, color: { r: 255, g: 255, b: 255 } },      // White - A/F-type
    F_TYPE: { min: 6000, color: { r: 255, g: 255, b: 220 } },      // Yellow-white
    G_TYPE: { min: 5000, color: { r: 255, g: 221, b: 136 } },      // Yellow - G-type (sun-like)
    K_TYPE: { min: 3500, color: { r: 255, g: 136, b: 68 } },       // Orange - K-type
    M_TYPE: { min: 2500, color: { r: 255, g: 68, b: 68 } },        // Red - M-type red dwarfs
    COOL: { min: 100, color: { r: 136, g: 34, b: 34 } },           // Deep red - dying stars
    COLD: { min: 0, color: { r: 30, g: 15, b: 40 } },              // Near black
};

// Performance targets
export const PERFORMANCE = {
    targetFPS: 60,
    minFPS: 30,
    physicsTimebudget: 10,   // ms
    renderTimebudget: 6,     // ms
    uiTimebudget: 1,         // ms
};

// Export combined object for convenience
export const CONSTANTS = {
    ...PHYSICAL,
    ...PLANCK,
    ...COSMOLOGICAL,
    ...UNITS,
    ...SOLAR,
};

export default CONSTANTS;

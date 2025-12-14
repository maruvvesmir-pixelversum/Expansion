/**
 * Cosmology Engine
 * Universe Evolution Simulator v2.47.3
 *
 * Handles cosmological calculations: expansion, scale factor,
 * Hubble parameter, temperature evolution
 */

import { COSMOLOGICAL, UNITS, PLANCK } from '../utils/constants.js';
import { DEFAULT_COSMOLOGY } from '../utils/constants.js';
import { DETAILED_EPOCHS, getEpochAtTime, getNextEpoch } from '../data/detailedEpochs.js';
import { EPOCHS } from '../data/epochs.js'; // Keep for backwards compatibility

export class Cosmology {
    constructor(params = {}) {
        // Cosmological parameters (Planck 2018 defaults)
        this.H0 = params.H0 ?? DEFAULT_COSMOLOGY.H0;
        this.Omega_Lambda = params.Omega_Lambda ?? DEFAULT_COSMOLOGY.Omega_Lambda;
        this.Omega_m = params.Omega_m ?? DEFAULT_COSMOLOGY.Omega_m;
        this.Omega_b = params.Omega_b ?? DEFAULT_COSMOLOGY.Omega_b;
        this.Omega_DM = params.Omega_DM ?? DEFAULT_COSMOLOGY.Omega_DM;
        this.Omega_r = params.Omega_r ?? DEFAULT_COSMOLOGY.Omega_r;
        this.Omega_k = params.Omega_k ?? DEFAULT_COSMOLOGY.Omega_k;
        this.w = params.w ?? DEFAULT_COSMOLOGY.w;  // Dark energy equation of state
        this.n_s = params.n_s ?? DEFAULT_COSMOLOGY.n_s;
        this.sigma_8 = params.sigma_8 ?? DEFAULT_COSMOLOGY.sigma_8;

        // Current state
        this.time = 0;
        this.scaleFactor = 1e-30;
        this.redshift = Infinity;
        this.temperature = PLANCK.temperature;
        this.currentEpoch = DETAILED_EPOCHS[0];
        this.nextEpoch = DETAILED_EPOCHS[1];
        this.epochProgress = 0; // 0-1 interpolation within current epoch

        // History for graphs
        this.scaleHistory = new Array(100).fill(0);
        this.tempHistory = new Array(100).fill(0);

        // Present day values
        this.t0 = COSMOLOGICAL.age_universe * UNITS.Gyr_to_s;
    }

    /**
     * Set cosmological parameters
     */
    setParameters(params) {
        if (params.H0 !== undefined) this.H0 = params.H0;
        if (params.Omega_Lambda !== undefined) this.Omega_Lambda = params.Omega_Lambda;
        if (params.Omega_m !== undefined) this.Omega_m = params.Omega_m;
        if (params.Omega_b !== undefined) this.Omega_b = params.Omega_b;
        if (params.Omega_DM !== undefined) this.Omega_DM = params.Omega_DM;
        if (params.Omega_r !== undefined) this.Omega_r = params.Omega_r;
        if (params.Omega_k !== undefined) this.Omega_k = params.Omega_k;
        if (params.w !== undefined) this.w = params.w;
    }

    /**
     * Calculate Hubble parameter H(z) at given redshift
     * H(z) = H0 * sqrt(Omega_m(1+z)^3 + Omega_r(1+z)^4 + Omega_k(1+z)^2 + Omega_Lambda * (1+z)^(3(1+w)))
     *
     * @param {number} z - Redshift
     * @returns {number} Hubble parameter in km/s/Mpc
     */
    hubbleParameter(z) {
        // Safety check: clamp extreme redshifts
        if (!isFinite(z) || z > 1e10) {
            // For extremely early universe, use radiation-dominated approximation
            return this.H0 * Math.sqrt(this.Omega_r) * 1e10; // Approximate constant at very early times
        }

        const z1 = 1 + z;
        const z1_3 = z1 * z1 * z1;
        const z1_4 = z1_3 * z1;
        const z1_2 = z1 * z1;

        // Dark energy contribution with equation of state w
        const darkEnergyTerm = this.Omega_Lambda * Math.pow(z1, 3 * (1 + this.w));

        // Safety check: ensure all terms are finite
        if (!isFinite(z1_3) || !isFinite(z1_4) || !isFinite(darkEnergyTerm)) {
            // Fallback to radiation-dominated for numerical overflow
            return this.H0 * Math.sqrt(this.Omega_r) * 1e8;
        }

        const E2 = this.Omega_m * z1_3 +
                   this.Omega_r * z1_4 +
                   this.Omega_k * z1_2 +
                   darkEnergyTerm;

        const result = this.H0 * Math.sqrt(Math.max(0, E2));

        // Final safety check
        return isFinite(result) ? result : this.H0 * 100; // Fallback value
    }

    /**
     * Calculate Hubble parameter in SI units (1/s)
     */
    hubbleParameterSI(z) {
        // Convert km/s/Mpc to 1/s
        return this.hubbleParameter(z) * 1000 / UNITS.Mpc_to_m;
    }

    /**
     * Calculate scale factor a(t) at given cosmic time
     * Approximation for different eras
     *
     * @param {number} time - Cosmic time in seconds
     * @returns {number} Scale factor
     */
    getScaleFactor(time) {
        if (time <= 0) return 1e-30;

        // Inflation era: exponential expansion (FIXED: reduced exponent to prevent extreme values)
        if (time < 1e-32) {
            // Smoother expansion during inflation: a(t) = a_init * exp(H_inf * t)
            // Using H_inf ~ 1e36 for realistic inflation
            const H_inf = 5e33;  // Reduced from 1e35 to prevent oscillation
            const expansionFactor = Math.min(1e6, Math.exp(time * H_inf));  // Cap at 1 million
            return expansionFactor * 1e-30;
        }

        // Radiation-dominated era: a ∝ t^(1/2)
        if (time < 4.7e10) {  // ~1500 years (recombination)
            // Ensure smooth transition from inflation
            const a_inflation_end = Math.exp(1e-32 * 5e33) * 1e-30;
            return Math.max(a_inflation_end, Math.pow(time / this.t0, 0.5) * 1e-3);
        }

        // Matter-dominated era: a ∝ t^(2/3)
        if (time < this.t0 * 0.7) {  // Before dark energy dominance
            return Math.max(1e-3, Math.pow(time / this.t0, 2/3));
        }

        // Dark energy-dominated era: exponential expansion
        const H = COSMOLOGICAL.H0_SI;
        const t_transition = this.t0 * 0.7;
        const a_transition = Math.pow(0.7, 2/3);
        return Math.max(a_transition, Math.exp(H * (time - t_transition)) * a_transition);
    }

    /**
     * Get redshift at given time
     */
    getRedshift(time) {
        const a = this.getScaleFactor(time);
        if (a > 1e-20) {
            const z = (1 / a) - 1;
            // Clamp to maximum realistic redshift (z~1e6 for earliest observable universe)
            return Math.min(z, 1e6);
        }
        // For extremely early universe, return maximum redshift
        return 1e6;
    }

    /**
     * Calculate CMB temperature at given redshift
     * T(z) = T0 * (1 + z)
     *
     * @param {number} z - Redshift
     * @returns {number} Temperature in Kelvin
     */
    getCMBTemperature(z) {
        return COSMOLOGICAL.T_CMB_0 * (1 + z);
    }

    /**
     * Calculate universe temperature at given time
     */
    getTemperature(time) {
        const z = this.getRedshift(time);
        const T = this.getCMBTemperature(Math.min(z, 1e10));
        return Math.min(PLANCK.temperature, Math.max(COSMOLOGICAL.T_CMB_0, T));
    }

    /**
     * Calculate critical density at given redshift
     * rho_crit = 3H^2 / (8*pi*G)
     */
    getCriticalDensity(z) {
        const H = this.hubbleParameterSI(z);
        return (3 * H * H) / (8 * Math.PI * 6.674e-11);
    }

    /**
     * Calculate matter density at given redshift
     */
    getMatterDensity(z) {
        const rho_crit_0 = COSMOLOGICAL.rho_crit;
        return this.Omega_m * rho_crit_0 * Math.pow(1 + z, 3);
    }

    /**
     * Calculate comoving distance
     * d_c = c * integral(dz/H(z))
     */
    comovingDistance(z) {
        // Numerical integration using trapezoid rule
        const n = 100;
        const dz = z / n;
        let sum = 0;

        for (let i = 0; i < n; i++) {
            const z1 = i * dz;
            const z2 = (i + 1) * dz;
            const H1 = this.hubbleParameterSI(z1);
            const H2 = this.hubbleParameterSI(z2);
            sum += (1/H1 + 1/H2) / 2 * dz;
        }

        return 2.998e8 * sum;  // c * integral
    }

    /**
     * Calculate lookback time to given redshift
     */
    lookbackTime(z) {
        // Numerical integration
        const n = 100;
        const dz = z / n;
        let sum = 0;

        for (let i = 0; i < n; i++) {
            const z1 = i * dz;
            const z2 = (i + 1) * dz;
            const H1 = this.hubbleParameterSI(z1);
            const H2 = this.hubbleParameterSI(z2);
            sum += ((1/((1+z1)*H1)) + (1/((1+z2)*H2))) / 2 * dz;
        }

        return sum;
    }

    /**
     * Calculate age of universe at given redshift
     */
    universeAge(z) {
        return this.t0 - this.lookbackTime(z);
    }

    /**
     * Update cosmological state
     */
    update(dt, isReversed = false) {
        const direction = isReversed ? -1 : 1;
        this.time = Math.max(0, this.time + dt * direction);

        // Update scale factor
        this.scaleFactor = this.getScaleFactor(this.time);

        // Update redshift
        this.redshift = this.scaleFactor > 1e-20 ? (1 / this.scaleFactor) - 1 : 1e30;

        // Update temperature
        this.temperature = this.getTemperature(this.time);

        // Update epochs with progress tracking
        const newEpoch = getEpochAtTime(this.time);
        const epochChanged = this.currentEpoch !== newEpoch;

        if (epochChanged) {
            this.currentEpoch = newEpoch;
            // Update next epoch
            const epochIndex = DETAILED_EPOCHS.indexOf(newEpoch);
            this.nextEpoch = DETAILED_EPOCHS[Math.min(epochIndex + 1, DETAILED_EPOCHS.length - 1)];
        }

        // Calculate progress within current epoch (0 = start, 1 = end)
        const epochDuration = this.currentEpoch.timeEnd - this.currentEpoch.timeStart;
        if (epochDuration > 0) {
            this.epochProgress = Math.max(0, Math.min(1,
                (this.time - this.currentEpoch.timeStart) / epochDuration
            ));
        } else {
            // Instantaneous epoch (like present day)
            this.epochProgress = 0;
        }

        // Update history for graphs
        this.scaleHistory.push(Math.log10(Math.max(1e-30, this.scaleFactor)));
        this.scaleHistory.shift();
        this.tempHistory.push(Math.log10(Math.max(1, this.temperature)));
        this.tempHistory.shift();

        return {
            time: this.time,
            scaleFactor: this.scaleFactor,
            redshift: this.redshift,
            temperature: this.temperature,
            epoch: this.currentEpoch,
            nextEpoch: this.nextEpoch,
            epochProgress: this.epochProgress,
            epochChanged
        };
    }

    /**
     * Calculate expansion rate (da/dt / a)
     */
    getExpansionRate() {
        if (this.scaleFactor < 1e-30) return Infinity;

        const z = Math.min(this.redshift, 1e10);
        const H = this.hubbleParameterSI(z);
        return H;
    }

    /**
     * Get the expansion state description
     */
    getExpansionState() {
        if (this.time < 1e-32) return 'Inflation';
        if (this.time < 4.7e10) return 'Radiation-dominated';
        if (this.time < this.t0 * 0.7) return 'Decelerating';
        return 'Accelerating';
    }

    /**
     * Calculate Jeans length for gravitational collapse
     */
    getJeansLength() {
        const c_s = 5000;  // Sound speed in m/s (approximate)
        const rho = this.getMatterDensity(Math.min(this.redshift, 1000));
        const G = 6.674e-11;

        if (rho <= 0) return Infinity;

        return Math.sqrt(Math.PI * c_s * c_s / (G * rho));
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.time = 0;
        this.scaleFactor = 1e-30;
        this.redshift = Infinity;
        this.temperature = PLANCK.temperature;
        this.currentEpoch = DETAILED_EPOCHS[0];
        this.nextEpoch = DETAILED_EPOCHS[1];
        this.epochProgress = 0;
        this.scaleHistory.fill(0);
        this.tempHistory.fill(0);
    }

    /**
     * Jump to specific epoch
     */
    jumpToEpoch(epochIndex) {
        if (epochIndex >= 0 && epochIndex < DETAILED_EPOCHS.length) {
            this.time = DETAILED_EPOCHS[epochIndex].timeStart;
            this.update(0);
        }
    }

    /**
     * Jump to specific time
     */
    jumpToTime(time) {
        this.time = Math.max(0, time);
        this.update(0);
    }

    /**
     * Get state for UI display
     */
    getState() {
        return {
            time: this.time,
            scaleFactor: this.scaleFactor,
            redshift: this.redshift,
            temperature: this.temperature,
            hubbleRate: this.hubbleParameter(Math.min(this.redshift, 1e6)),
            epoch: this.currentEpoch,
            expansionState: this.getExpansionState(),
            density: this.getMatterDensity(Math.min(this.redshift, 1000)),
            lookbackTime: this.t0 - this.time
        };
    }
}

export default Cosmology;

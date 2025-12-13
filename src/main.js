/**
 * Universe Evolution Simulator v2.47.3
 * Entry Point
 * Anthropic Cosmological Research Institute
 */

import { Simulator } from './core/Simulator.js';

// Initialize simulator when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Create global simulator instance
    window.simulator = new Simulator();

    try {
        await window.simulator.init();
        console.log('Universe Evolution Simulator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize simulator:', error);

        // Show error on loading screen
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) {
            loadingStatus.textContent = 'Error: ' + error.message;
            loadingStatus.style.color = '#f88';
        }
    }
});

// Helper function for collapsible panels (used in HTML)
window.toggleSection = function(header) {
    header.parentElement.classList.toggle('collapsed');
};

/**
 * Galaxy Name Generator
 * Universe Evolution Simulator v3.0.0
 *
 * Generates realistic galaxy names using multiple strategies:
 * - Top 100 by mass: Real famous galaxy names
 * - Next 10,000: Catalog-style names (NGC, IC, UGC, etc.)
 * - Rest: Procedural names with syllable combinations
 */

export class GalaxyNameGenerator {
    constructor() {
        // Famous galaxy names (for most massive galaxies)
        this.famousNames = [
            'Milky Way', 'Andromeda', 'Triangulum', 'Large Magellanic Cloud',
            'Small Magellanic Cloud', 'Centaurus A', 'Whirlpool Galaxy',
            'Sombrero Galaxy', 'Pinwheel Galaxy', 'Sunflower Galaxy',
            'Black Eye Galaxy', 'Tadpole Galaxy', 'Antennae Galaxies',
            'Cartwheel Galaxy', 'Cigar Galaxy', 'Hoag\'s Object',
            'Messier 87', 'Messier 82', 'Messier 51', 'Messier 101',
            'NGC 1300', 'NGC 4258', 'NGC 4414', 'NGC 4622',
            'NGC 6240', 'ESO 137-001', 'Sculptor Galaxy', 'NGC 253',
            'NGC 300', 'NGC 1232', 'NGC 2403', 'NGC 2841',
            'NGC 3079', 'NGC 3310', 'NGC 4038', 'NGC 4039',
            'NGC 4490', 'NGC 4631', 'NGC 5194', 'NGC 5195',
            'NGC 6946', 'NGC 7331', 'IC 342', 'IC 1613',
            'IC 5332', 'Maffei 1', 'Maffei 2', 'Barnard\'s Galaxy',
            'Wolf-Lundmark-Melotte', 'NGC 147', 'NGC 185', 'NGC 205',
            'NGC 221', 'NGC 224', 'NGC 598', 'NGC 628',
            'NGC 891', 'NGC 925', 'NGC 1023', 'NGC 1097',
            'NGC 1275', 'NGC 1316', 'NGC 1365', 'NGC 1399',
            'NGC 1404', 'NGC 1407', 'NGC 1427', 'NGC 1453',
            'NGC 1566', 'NGC 1672', 'NGC 2207', 'NGC 2442',
            'NGC 2683', 'NGC 2768', 'NGC 2787', 'NGC 2976',
            'NGC 3115', 'NGC 3184', 'NGC 3198', 'NGC 3227',
            'NGC 3368', 'NGC 3521', 'NGC 3628', 'NGC 3718',
            'NGC 3923', 'NGC 4013', 'NGC 4125', 'NGC 4214',
            'NGC 4244', 'NGC 4303', 'NGC 4321', 'NGC 4449',
            'NGC 4535', 'NGC 4559', 'NGC 4565', 'NGC 4594',
            'NGC 4725', 'NGC 4736', 'NGC 4826', 'NGC 5033'
        ];

        // Syllable banks for procedural names
        this.prefixSyllables = [
            'An', 'Ar', 'Cal', 'Cen', 'Cor', 'Cyg', 'Dra', 'Er',
            'Hy', 'Leo', 'Lyr', 'Ori', 'Peg', 'Per', 'Phe', 'Sag',
            'Scor', 'Tau', 'Ur', 'Vel', 'Vir', 'Aq', 'Aur', 'Boo',
            'Can', 'Cap', 'Cas', 'Del', 'Equ', 'Gem', 'Her', 'Ind'
        ];

        this.middleSyllables = [
            'dor', 'tar', 'ven', 'ril', 'lon', 'mir', 'thal', 'dar',
            'kon', 'sar', 'vel', 'kor', 'mar', 'nar', 'pol', 'qua',
            'ras', 'sol', 'tor', 'var', 'wen', 'xal', 'yon', 'zar'
        ];

        this.suffixSyllables = [
            'ia', 'is', 'us', 'um', 'or', 'ar', 'on', 'en',
            'ix', 'ax', 'ex', 'ox', 'al', 'el', 'il', 'ol'
        ];

        // Catalog prefixes for mid-range galaxies
        this.catalogPrefixes = [
            'NGC', 'IC', 'UGC', 'ESO', 'MCG', 'CGCG',
            'PGC', 'LEDA', '2MASX', 'SDSS'
        ];

        // Track used names to ensure uniqueness
        this.usedNames = new Set();
        this.nameCache = new Map();
    }

    /**
     * Generate a galaxy name based on its properties and index
     *
     * @param {number} index - Galaxy index
     * @param {number} mass - Galaxy mass (for ranking)
     * @param {number} x - X position (for seeding)
     * @param {number} y - Y position (for seeding)
     * @param {number} z - Z position (for seeding)
     * @returns {string} Galaxy name
     */
    generate(index, mass, x, y, z) {
        // Check cache first
        if (this.nameCache.has(index)) {
            return this.nameCache.get(index);
        }

        let name;

        // Top 100 by mass: Use famous names
        if (index < this.famousNames.length) {
            name = this.famousNames[index];
        }
        // Next 10,000: Catalog-style names
        else if (index < 10000) {
            name = this.generateCatalogName(index);
        }
        // Rest: Procedural syllable names
        else {
            name = this.generateProceduralName(index, x, y, z);
        }

        // Ensure uniqueness
        let finalName = name;
        let suffix = 1;
        while (this.usedNames.has(finalName)) {
            finalName = `${name}-${suffix}`;
            suffix++;
        }

        this.usedNames.add(finalName);
        this.nameCache.set(index, finalName);
        return finalName;
    }

    /**
     * Generate catalog-style name (NGC-1234, IC-5678, etc.)
     */
    generateCatalogName(index) {
        const prefixIndex = Math.floor(index / 1000) % this.catalogPrefixes.length;
        const prefix = this.catalogPrefixes[prefixIndex];

        // Generate catalog number (1-9999)
        const catalogNum = (index % 9999) + 1;

        return `${prefix}-${String(catalogNum).padStart(4, '0')}`;
    }

    /**
     * Generate procedural syllable-based name
     * Uses position as seed for deterministic generation
     */
    generateProceduralName(index, x, y, z) {
        // Create deterministic seed from position
        const seed = Math.abs(Math.floor(x * 1000 + y * 777 + z * 555)) + index;

        // Use seed to select syllables
        const prefixIdx = this.seededRandom(seed, 0) % this.prefixSyllables.length;
        const middleIdx = this.seededRandom(seed, 1) % this.middleSyllables.length;
        const suffixIdx = this.seededRandom(seed, 2) % this.suffixSyllables.length;

        const prefix = this.prefixSyllables[prefixIdx];
        const middle = this.middleSyllables[middleIdx];
        const suffix = this.suffixSyllables[suffixIdx];

        // Randomly choose between 2 or 3 syllable names
        if (this.seededRandom(seed, 3) % 2 === 0) {
            // 3 syllables
            return prefix + middle + suffix;
        } else {
            // 2 syllables
            return prefix + suffix;
        }
    }

    /**
     * Deterministic pseudo-random number generator
     * Uses simple LCG (Linear Congruential Generator)
     */
    seededRandom(seed, offset = 0) {
        const a = 1103515245;
        const c = 12345;
        const m = 2147483648;

        return Math.abs(((seed + offset) * a + c) % m);
    }

    /**
     * Generate a short designation for compact display
     * Examples: "M31", "N1234", "A567"
     */
    generateShortName(fullName) {
        // Extract from known patterns
        if (fullName.startsWith('NGC-')) {
            return 'N' + fullName.slice(-4);
        }
        if (fullName.startsWith('IC-')) {
            return 'I' + fullName.slice(-4);
        }
        if (fullName.startsWith('Messier')) {
            return 'M' + fullName.split(' ')[1];
        }

        // For procedural names, use first 3-4 chars
        if (fullName.length > 6) {
            return fullName.slice(0, 4);
        }

        return fullName;
    }

    /**
     * Get galaxy designation type
     */
    getDesignationType(name) {
        if (this.famousNames.includes(name)) return 'NAMED';
        if (name.startsWith('NGC-')) return 'NGC';
        if (name.startsWith('IC-')) return 'IC';
        if (name.startsWith('Messier')) return 'MESSIER';
        return 'PROCEDURAL';
    }

    /**
     * Reset generator (clear cache and used names)
     */
    reset() {
        this.usedNames.clear();
        this.nameCache.clear();
    }

    /**
     * Get statistics about generated names
     */
    getStats() {
        return {
            totalGenerated: this.usedNames.size,
            cacheSize: this.nameCache.size,
            famousNamesAvailable: this.famousNames.length,
            catalogPrefixes: this.catalogPrefixes.length
        };
    }
}

export default GalaxyNameGenerator;

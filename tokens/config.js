import StyleDictionary from 'style-dictionary';
import { iosSwiftFormatter } from './formatters/ios-swift.js';
import { androidComposeFormatter } from './formatters/android-compose.js';

// ========================================
// SOURCE FILE PATHS
// ========================================

const PRIMITIVES = [
  'tokens/src/tokens/token_Color_Mode1.json',
  'tokens/src/tokens/token_Opacity_Mode1.json',
  'tokens/src/tokens/token_Radius_Mode1.json',
  'tokens/src/tokens/token_Sizing_Mode1.json',
  'tokens/src/tokens/token_Spacing_Mode1.json',
  'tokens/src/tokens/token_StrokeWidth_Mode1.json',
  'tokens/src/tokens/token_Typography_Mode1.json',
];

const BRAND_RETAIL         = 'tokens/src/tokens/token_Brand_Retail.json';
const BRAND_BUSINESS       = 'tokens/src/tokens/token_Brand_Business.json';
const THEME_RETAIL_LIGHT   = 'tokens/src/tokens/token_Theme_RetailLight.json';
const THEME_RETAIL_DARK    = 'tokens/src/tokens/token_Theme_RetailDark.json';
const THEME_BUSINESS_LIGHT = 'tokens/src/tokens/token_Theme_BusinessLight.json';
const THEME_BUSINESS_DARK  = 'tokens/src/tokens/token_Theme_BusinessDark.json';

// ========================================
// PARSERS — wrap flat primitive files in a namespace
//
// Figma exports spacing, radius, opacity, sizing, and stroke-width as flat
// objects with numeric/named keys at the root level. This causes token path
// collisions when they share keys (e.g. spacing "10" vs opacity "10").
//
// Parsers wrap each file in its category namespace before Style Dictionary
// processes it, so tokens get paths like ['spacing', '4'], ['radius', 'md'],
// ['opacity', '30'] — unique, readable, and collision-free.
// ========================================

StyleDictionary.registerParser({
  name: 'namespace/spacing',
  pattern: /token_Spacing/,
  parser: ({ contents }) => ({ spacing: JSON.parse(contents) })
});

StyleDictionary.registerParser({
  name: 'namespace/radius',
  pattern: /token_Radius/,
  parser: ({ contents }) => ({ radius: JSON.parse(contents) })
});

StyleDictionary.registerParser({
  name: 'namespace/opacity',
  pattern: /token_Opacity/,
  parser: ({ contents }) => ({ opacity: JSON.parse(contents) })
});

StyleDictionary.registerParser({
  name: 'namespace/sizing',
  pattern: /token_Sizing/,
  parser: ({ contents }) => ({ sizing: JSON.parse(contents) })
});

StyleDictionary.registerParser({
  name: 'namespace/stroke-width',
  pattern: /token_StrokeWidth/,
  parser: ({ contents }) => ({ 'stroke-width': JSON.parse(contents) })
});

// ========================================
// CUSTOM FORMATTERS
// ========================================

StyleDictionary.registerFormat({
  name: 'kuda/ios-swift',
  format: iosSwiftFormatter,
});

StyleDictionary.registerFormat({
  name: 'kuda/android-compose',
  format: androidComposeFormatter,
});

// ========================================
// CUSTOM TRANSFORMS
// ========================================

/**
 * iOS: Convert to Swift naming convention (camelCase)
 */
const nameSwiftTransform = {
  name: 'name/swift',
  type: 'name',
  transform: (token) => {
    const path = token.path || [];
    return path.map((part, index) => {
      const str = part.toString().replace(/[,*]/g, '').replace(/-/g, '_');
      if (index === 0) return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    }).join('');
  }
};

/**
 * Android: Convert to Compose naming convention (PascalCase)
 */
const nameComposeTransform = {
  name: 'name/compose',
  type: 'name',
  transform: (token) => {
    const path = token.path || [];
    return path.map(part => {
      const str = part.toString().replace(/[,*]/g, '').replace(/-/g, '_');
      return str.charAt(0).toUpperCase() + str.slice(1);
    }).join('');
  }
};

/**
 * Web: Name with 'k' prefix and kebab-case.
 * Category is already part of the token path thanks to parsers, so
 * the name is simply the full path joined — e.g. --k-spacing-4, --k-radius-md.
 */
const nameKebabKTransform = {
  name: 'name/kebab/k',
  type: 'name',
  transform: (token) => {
    const path = token.path || [];
    const kebabName = path
      .map(part => part.toString().replace(/,/g, '-').replace(/\*/g, ''))
      .join('-');
    return `k-${kebabName}`;
  }
};

/**
 * Font Family - Add fallback stack
 * Path: family.body / family.heading / family.mono
 */
const fontFamilyTransform = {
  name: 'font/family/kuda',
  type: 'value',
  transitive: true,
  filter: (token) => token.path[0] === 'family',
  transform: (token) => {
    const fontName = token.$value || token.value;

    if (fontName === '-') {
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    }

    return `"${fontName}", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  }
};

/**
 * Convert px to rem for web accessibility.
 * Applies to spacing, sizing, radius, and font sizes.
 */
const sizeRemTransform = {
  name: 'size/rem',
  type: 'value',
  transitive: true,
  filter: (token) => {
    const type = token.$type || token.type;
    return (
      type === 'number' &&
      (
        token.path[0] === 'spacing' ||
        token.path[0] === 'sizing'  ||
        token.path[0] === 'radius'  ||
        token.path[0] === 'size'
      )
    );
  },
  transform: (token) => {
    const originalValue = token.$value ?? token.original?.$value;

    if (originalValue !== undefined && originalValue !== null) {
      const numValue = typeof originalValue === 'number' ? originalValue : parseFloat(originalValue);

      if (isNaN(numValue)) return '0rem';

      const baseSize = 16;
      const remValue = numValue / baseSize;
      const cleanValue = remValue % 1 === 0 ? remValue : parseFloat(remValue.toFixed(3));
      return `${cleanValue}rem`;
    }

    return '0rem';
  }
};

/**
 * Letter spacing in em
 * Path: letter-spacing.*
 */
const letterSpacingTransform = {
  name: 'size/letter-spacing',
  type: 'value',
  transitive: true,
  filter: (token) => token.path[0] === 'letter-spacing',
  transform: (token) => {
    const value = token.$value ?? token.value;
    if (value === undefined || value === null) return '0em';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) return '0em';
    const baseSize = 16;
    const emValue = numValue / baseSize;
    return `${emValue.toFixed(3)}em`;
  }
};

/**
 * Opacity: percentage (0–100) to decimal (0–1)
 * Path: opacity.* (set by the namespace/opacity parser)
 */
const opacityTransform = {
  name: 'opacity/decimal',
  type: 'value',
  transitive: true,
  filter: (token) => token.path[0] === 'opacity',
  transform: (token) => {
    const value = token.$value ?? token.value;
    return value / 100;
  }
};

/**
 * Stroke width: add px unit
 * Path: stroke-width.*
 */
const strokeWidthTransform = {
  name: 'size/px',
  type: 'value',
  transitive: true,
  filter: (token) => token.path[0] === 'stroke-width',
  transform: (token) => {
    const value = token.$value ?? token.value;
    return `${value}px`;
  }
};

/**
 * Line height unitless ratio
 * Path: line-height.*
 */
const lineHeightTransform = {
  name: 'lineHeight/unitless',
  type: 'value',
  transitive: true,
  filter: (token) => token.path[0] === 'line-height',
  transform: (token) => {
    const value = token.$value || token.value;
    const baseSize = 16;
    const ratio = value / baseSize;
    return parseFloat(ratio.toFixed(2));
  }
};

// ========================================
// FILTERS
// ========================================

/**
 * Primitives: everything that is not a semantic color or brand token.
 * After parsers run, all primitive categories have clean top-level paths:
 * spacing, radius, opacity, sizing, stroke-width, family, size, weight,
 * line-height, letter-spacing, green, lavender, purple, etc.
 */
const filterPrimitives = (token) => {
  return token.path[0] !== 'color' && token.path[0] !== 'brand';
};

/**
 * Theme: semantic color tokens only
 */
const filterTheme = (token) => token.path[0] === 'color';

// ========================================
// CONFIGURATION FACTORY
// ========================================

const NAMESPACE_PARSERS = [
  'namespace/spacing',
  'namespace/radius',
  'namespace/opacity',
  'namespace/sizing',
  'namespace/stroke-width',
];

const createSDConfig = (sources, platform) => {
  const baseConfig = {
    log: { warnings: 'warn', verbosity: 'default' },
    usesDtcg: true,
    source: sources,
    parsers: NAMESPACE_PARSERS,
    platforms: {}
  };

  if (platform === 'web') {
    baseConfig.platforms.css = {
      transforms: [
        'attribute/cti',
        'attribute/color',
        nameKebabKTransform.name,
        fontFamilyTransform.name,
        sizeRemTransform.name,
        letterSpacingTransform.name,
        opacityTransform.name,
        strokeWidthTransform.name,
        lineHeightTransform.name,
        'color/css',
      ],
      buildPath: 'build/web/',
    };
  }

  if (platform === 'ios') {
    baseConfig.platforms.ios = {
      transforms: [
        'attribute/cti',
        nameSwiftTransform.name,
      ],
      buildPath: 'build/ios/',
    };
  }

  if (platform === 'android') {
    baseConfig.platforms.compose = {
      transforms: [
        'attribute/cti',
        nameComposeTransform.name,
      ],
      buildPath: 'build/android/',
    };
  }

  return baseConfig;
};

// ========================================
// REGISTER CUSTOM TRANSFORMS
// ========================================

const registerTransforms = (sd) => {
  sd.registerTransform(nameKebabKTransform);
  sd.registerTransform(nameSwiftTransform);
  sd.registerTransform(nameComposeTransform);
  sd.registerTransform(fontFamilyTransform);
  sd.registerTransform(sizeRemTransform);
  sd.registerTransform(letterSpacingTransform);
  sd.registerTransform(opacityTransform);
  sd.registerTransform(strokeWidthTransform);
  sd.registerTransform(lineHeightTransform);
};

// ========================================
// BUILD WEB (CSS)
// ========================================

const sdWebPrimitives = new StyleDictionary(createSDConfig(PRIMITIVES, 'web'));
registerTransforms(sdWebPrimitives);
sdWebPrimitives.platforms.css.files = [{
  destination: 'token_Primitives.css',
  format: 'css/variables',
  filter: filterPrimitives,
  options: { showFileHeader: true, outputReferences: false }
}];

const sdWebRetailLight = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_RETAIL, THEME_RETAIL_LIGHT], 'web'));
registerTransforms(sdWebRetailLight);
sdWebRetailLight.platforms.css.files = [{
  destination: 'token_Theme_RetailLight.css',
  format: 'css/variables',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true }
}];

const sdWebRetailDark = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_RETAIL, THEME_RETAIL_DARK], 'web'));
registerTransforms(sdWebRetailDark);
sdWebRetailDark.platforms.css.files = [{
  destination: 'token_Theme_RetailDark.css',
  format: 'css/variables',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true }
}];

const sdWebBusinessLight = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_BUSINESS, THEME_BUSINESS_LIGHT], 'web'));
registerTransforms(sdWebBusinessLight);
sdWebBusinessLight.platforms.css.files = [{
  destination: 'token_Theme_BusinessLight.css',
  format: 'css/variables',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true }
}];

const sdWebBusinessDark = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_BUSINESS, THEME_BUSINESS_DARK], 'web'));
registerTransforms(sdWebBusinessDark);
sdWebBusinessDark.platforms.css.files = [{
  destination: 'token_Theme_BusinessDark.css',
  format: 'css/variables',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true }
}];

// ========================================
// BUILD iOS (Swift)
// ========================================

const sdIOSPrimitives = new StyleDictionary(createSDConfig(PRIMITIVES, 'ios'));
registerTransforms(sdIOSPrimitives);
sdIOSPrimitives.platforms.ios.files = [{
  destination: 'KudaTokens+Primitives.swift',
  format: 'kuda/ios-swift',
  filter: filterPrimitives,
  options: { showFileHeader: true, outputReferences: false, className: 'KudaPrimitives' }
}];

const sdIOSRetailLight = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_RETAIL, THEME_RETAIL_LIGHT], 'ios'));
registerTransforms(sdIOSRetailLight);
sdIOSRetailLight.platforms.ios.files = [{
  destination: 'KudaTokens+RetailLight.swift',
  format: 'kuda/ios-swift',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, className: 'KudaThemeRetailLight' }
}];

const sdIOSRetailDark = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_RETAIL, THEME_RETAIL_DARK], 'ios'));
registerTransforms(sdIOSRetailDark);
sdIOSRetailDark.platforms.ios.files = [{
  destination: 'KudaTokens+RetailDark.swift',
  format: 'kuda/ios-swift',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, className: 'KudaThemeRetailDark' }
}];

const sdIOSBusinessLight = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_BUSINESS, THEME_BUSINESS_LIGHT], 'ios'));
registerTransforms(sdIOSBusinessLight);
sdIOSBusinessLight.platforms.ios.files = [{
  destination: 'KudaTokens+BusinessLight.swift',
  format: 'kuda/ios-swift',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, className: 'KudaThemeBusinessLight' }
}];

const sdIOSBusinessDark = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_BUSINESS, THEME_BUSINESS_DARK], 'ios'));
registerTransforms(sdIOSBusinessDark);
sdIOSBusinessDark.platforms.ios.files = [{
  destination: 'KudaTokens+BusinessDark.swift',
  format: 'kuda/ios-swift',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, className: 'KudaThemeBusinessDark' }
}];

// ========================================
// BUILD Android (Compose)
// ========================================

const sdAndroidPrimitives = new StyleDictionary(createSDConfig(PRIMITIVES, 'android'));
registerTransforms(sdAndroidPrimitives);
sdAndroidPrimitives.platforms.compose.files = [{
  destination: 'KudaTokens.kt',
  format: 'kuda/android-compose',
  filter: filterPrimitives,
  options: { showFileHeader: true, outputReferences: false, packageName: 'com.kuda.design.tokens' }
}];

const sdAndroidRetailLight = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_RETAIL, THEME_RETAIL_LIGHT], 'android'));
registerTransforms(sdAndroidRetailLight);
sdAndroidRetailLight.platforms.compose.files = [{
  destination: 'KudaThemeRetailLight.kt',
  format: 'kuda/android-compose',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, packageName: 'com.kuda.design.tokens' }
}];

const sdAndroidRetailDark = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_RETAIL, THEME_RETAIL_DARK], 'android'));
registerTransforms(sdAndroidRetailDark);
sdAndroidRetailDark.platforms.compose.files = [{
  destination: 'KudaThemeRetailDark.kt',
  format: 'kuda/android-compose',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, packageName: 'com.kuda.design.tokens' }
}];

const sdAndroidBusinessLight = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_BUSINESS, THEME_BUSINESS_LIGHT], 'android'));
registerTransforms(sdAndroidBusinessLight);
sdAndroidBusinessLight.platforms.compose.files = [{
  destination: 'KudaThemeBusinessLight.kt',
  format: 'kuda/android-compose',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, packageName: 'com.kuda.design.tokens' }
}];

const sdAndroidBusinessDark = new StyleDictionary(createSDConfig([...PRIMITIVES, BRAND_BUSINESS, THEME_BUSINESS_DARK], 'android'));
registerTransforms(sdAndroidBusinessDark);
sdAndroidBusinessDark.platforms.compose.files = [{
  destination: 'KudaThemeBusinessDark.kt',
  format: 'kuda/android-compose',
  filter: filterTheme,
  options: { showFileHeader: true, outputReferences: true, packageName: 'com.kuda.design.tokens' }
}];

// ========================================
// BUILD ALL PLATFORMS
// ========================================

console.log('Building design tokens...\n');

console.log('🌐 Building Web (CSS)...');
await sdWebPrimitives.buildAllPlatforms();
await sdWebRetailLight.buildAllPlatforms();
await sdWebRetailDark.buildAllPlatforms();
await sdWebBusinessLight.buildAllPlatforms();
await sdWebBusinessDark.buildAllPlatforms();

console.log('📱 Building iOS (Swift)...');
await sdIOSPrimitives.buildAllPlatforms();
await sdIOSRetailLight.buildAllPlatforms();
await sdIOSRetailDark.buildAllPlatforms();
await sdIOSBusinessLight.buildAllPlatforms();
await sdIOSBusinessDark.buildAllPlatforms();

console.log('🤖 Building Android (Compose)...');
await sdAndroidPrimitives.buildAllPlatforms();
await sdAndroidRetailLight.buildAllPlatforms();
await sdAndroidRetailDark.buildAllPlatforms();
await sdAndroidBusinessLight.buildAllPlatforms();
await sdAndroidBusinessDark.buildAllPlatforms();

console.log('\n✅ Build complete for all platforms!');
console.log('   - Web: build/web/');
console.log('   - iOS: build/ios/');
console.log('   - Android: build/android/');

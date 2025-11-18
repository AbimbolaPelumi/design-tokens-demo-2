import StyleDictionary from 'style-dictionary';

// ========================================
// KUDA DESIGN TOKENS - STYLE DICTIONARY v4 CONFIG
// ========================================
//
// This configuration follows industry best practices:
// ✅ rem units for sizing (accessibility)
// ✅ Unitless line-height (scales with font)
// ✅ em for letter-spacing (relative sizing)
// ✅ Font family fallback stacks
// ✅ Decimal opacity values (0-1 scale)
// ✅ Semantic token references preserved
//
// ========================================

// ========================================
// CUSTOM TRANSFORMS
// ========================================

/**
 * Transform 1: Name with 'k' prefix - Adds 'k' prefix to all token names
 */
const nameKebabKTransform = {
  name: 'name/kebab/k',
  type: 'name',
  transform: (token) => {
    // Convert path to kebab-case and add 'k' prefix
    const path = token.path || [];
    const kebabName = path.map(part => part.toString()).join('-');
    return `k-${kebabName}`;
  }
};

/**
 * Transform 2: Font Family - Add quotes and fallback stack
 */
const fontFamilyTransform = {
  name: 'font/family/kuda',
  type: 'value',
  transitive: true,
  filter: (token) => {
    return token.path[0] === 'font' && token.path[1] === 'family';
  },
  transform: (token) => {
    const fontName = token.$value || token.value;
    
    if (fontName === 'Mulish') {
      return '"Mulish", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    }
    
    if (fontName === '-') {
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    }
    
    return `"${fontName}", sans-serif`;
  }
};

/**
 * Transform 3: Convert px to rem for accessibility
 */
const sizeRemTransform = {
  name: 'size/rem',
  type: 'value',
  transitive: true,
  filter: (token) => {
    const type = token.$type || token.type;
    return (
      type === 'number' &&
      (token.path[0] === 'spacing' ||
       token.path[0] === 'radius' ||
       (token.path[0] === 'font' && token.path[1] === 'size'))
    );
  },
  transform: (token) => {
    // In Style Dictionary v4 with DTCG format, use token.$value for the original px value
    // token.value might be transformed already by the CSS transform group
    const originalValue = token.$value ?? token.original?.$value;
    const transformedValue = token.value;
    
    // If we have the original value (in px), use it directly
    if (originalValue !== undefined && originalValue !== null) {
      const numValue = typeof originalValue === 'number' ? originalValue : parseFloat(originalValue);
      
      if (isNaN(numValue)) {
        console.warn(`Warning: Could not parse original value for token ${token.path.join('.')}:`, originalValue);
        return '0rem';
      }
      
      const baseSize = 16;
      const remValue = numValue / baseSize;
      const cleanValue = remValue % 1 === 0 ? remValue : parseFloat(remValue.toFixed(3));
      return `${cleanValue}rem`;
    }
    
    // Fallback: if original value not available, check if transformed value is already in rem
    // The CSS transform group might have already converted it
    if (transformedValue !== undefined && transformedValue !== null) {
      // If it's already a string with rem, return as-is
      if (typeof transformedValue === 'string' && transformedValue.includes('rem')) {
        return transformedValue;
      }
      // If it's a number that looks like it's already in rem (small value < 10 for spacing/font-size)
      // This is a heuristic - if value is already converted to rem, it will be small
      // But we can't reliably detect this, so we'll use the original value approach above
    }
    
    console.warn(`Warning: No value found for token ${token.path.join('.')}`);
    return '0rem';
  }
};

/**
 * Transform 4: Container widths in px
 */
const containerTransform = {
  name: 'size/container',
  type: 'value',
  transitive: true,
  filter: (token) => {
    return token.path[0] === 'container';
  },
  transform: (token) => {
    const value = token.$value ?? token.value;
    if (value === undefined || value === null) {
      return '0px';
    }
    return `${value}px`;
  }
};

/**
 * Transform 5: Letter spacing in em
 */
const letterSpacingTransform = {
  name: 'size/letter-spacing',
  type: 'value',
  transitive: true,
  filter: (token) => {
    return token.path[0] === 'font' && token.path[1] === 'letter-spacing';
  },
  transform: (token) => {
    const value = token.$value ?? token.value;
    if (value === undefined || value === null) {
      return '0em';
    }
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) {
      return '0em';
    }
    const baseSize = 16;
    const emValue = numValue / baseSize;
    return `${emValue.toFixed(3)}em`;
  }
};

/**
 * Transform 6: Opacity to decimal
 */
const opacityTransform = {
  name: 'opacity/decimal',
  type: 'value',
  transitive: true,
  filter: (token) => {
    return token.path[0] === 'opacity';
  },
  transform: (token) => {
    const value = token.$value || token.value;
    return value / 100;
  }
};

/**
 * Transform 7: Line height unitless
 */
const lineHeightTransform = {
  name: 'lineHeight/unitless',
  type: 'value',
  transitive: true,
  filter: (token) => {
    return token.path[0] === 'font' && token.path[1] === 'line-height';
  },
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

const filterPrimitives = (token) => {
  return (
    token.path[0] === 'palette' ||
    token.path[0] === 'font' ||
    token.path[0] === 'spacing' ||
    token.path[0] === 'radius' ||
    token.path[0] === 'container' ||
    token.path[0] === 'opacity'
  );
};

const filterTheme = (token) => {
  return token.path[0] === 'color';
};

const filterBrand = (token) => {
  return (
    token.path[0] === 'brand-base' || 
    token.path[0] === 'brand-dark' || 
    token.path[0] === 'brand-darker' ||
    token.path[0] === 'brand-light' ||
    token.path[0] === 'brand-lighter' ||
    token.path[0] === 'brand-lightest' ||
    token.path[0] === 'brand-base-alpha' ||
    token.path[0] === 'brand-base-alpha-light' ||
    token.path[0] === 'on-brand-dark'
  );
};

// ========================================
// MAIN CONFIGURATION
// ========================================

// Base configuration factory
const createSDConfig = (sources) => ({
  log: {
    warnings: 'warn',
    verbosity: 'default',
  },
  usesDtcg: true,
  source: sources,
  platforms: {
    css: {
      // Use custom transform group instead of 'css' to avoid conflicts with default size transforms
      transforms: [
        'attribute/cti',
        'attribute/color',
        nameKebabKTransform.name,
        fontFamilyTransform.name,
        sizeRemTransform.name,
        containerTransform.name,
        letterSpacingTransform.name,
        opacityTransform.name,
        lineHeightTransform.name,
        'color/css',
      ],
      buildPath: 'build/web/',
    }
  }
});

// Register transforms (shared across all instances)
const registerTransforms = (sd) => {
  sd.registerTransform(nameKebabKTransform);
  sd.registerTransform(fontFamilyTransform);
  sd.registerTransform(sizeRemTransform);
  sd.registerTransform(containerTransform);
  sd.registerTransform(letterSpacingTransform);
  sd.registerTransform(opacityTransform);
  sd.registerTransform(lineHeightTransform);
};

// Build Primitives
const sdPrimitives = new StyleDictionary(createSDConfig([
  'tokens/token_Primitives_Default.json'
]));
registerTransforms(sdPrimitives);
sdPrimitives.platforms.css.files = [{
  destination: 'token_Primitives_Default.css',
  format: 'css/variables',
  filter: filterPrimitives,
  options: {
    showFileHeader: true,
    outputReferences: false
  }
}];

// Build Theme Light (includes Retail brand as default for brand token references)
const sdThemeLight = new StyleDictionary(createSDConfig([
  'tokens/token_Primitives_Default.json',
  'tokens/token_Brand_Retail.json',
  'tokens/token_Theme_Light.json'
]));
registerTransforms(sdThemeLight);
sdThemeLight.platforms.css.files = [{
  destination: 'token_Theme_Light.css',
  format: 'css/variables',
  filter: filterTheme,
  options: {
    showFileHeader: true,
    outputReferences: true
  }
}];

// Build Theme Dark (includes Retail brand as default for brand token references)
const sdThemeDark = new StyleDictionary(createSDConfig([
  'tokens/token_Primitives_Default.json',
  'tokens/token_Brand_Retail.json',
  'tokens/token_Theme_Dark.json'
]));
registerTransforms(sdThemeDark);
sdThemeDark.platforms.css.files = [{
  destination: 'token_Theme_Dark.css',
  format: 'css/variables',
  filter: filterTheme,
  options: {
    showFileHeader: true,
    outputReferences: true
  }
}];

// Build Brand Retail
const sdBrandRetail = new StyleDictionary(createSDConfig([
  'tokens/token_Primitives_Default.json',
  'tokens/token_Brand_Retail.json'
]));
registerTransforms(sdBrandRetail);
sdBrandRetail.platforms.css.files = [{
  destination: 'token_Brand_Retail.css',
  format: 'css/variables',
  filter: filterBrand,
  options: {
    showFileHeader: true,
    outputReferences: true
  }
}];

// Build Brand Business
const sdBrandBusiness = new StyleDictionary(createSDConfig([
  'tokens/token_Primitives_Default.json',
  'tokens/token_Brand_Business.json'
]));
registerTransforms(sdBrandBusiness);
sdBrandBusiness.platforms.css.files = [{
  destination: 'token_Brand_Business.css',
  format: 'css/variables',
  filter: filterBrand,
  options: {
    showFileHeader: true,
    outputReferences: true
  }
}];

// Build all
console.log('Building design tokens...\n');
await sdPrimitives.buildAllPlatforms();
await sdThemeLight.buildAllPlatforms();
await sdThemeDark.buildAllPlatforms();
await sdBrandRetail.buildAllPlatforms();
await sdBrandBusiness.buildAllPlatforms();
console.log('\n✅ Build complete!');
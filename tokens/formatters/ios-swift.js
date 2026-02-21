/**
 * iOS Swift Formatter
 * Generates Swift code with UIColor extensions
 */

export const iosSwiftFormatter = ({ dictionary, options }) => {
  const { className = 'DesignTokens' } = options;

  // Color tokens: identified by $type
  const colorTokens = dictionary.allTokens.filter(token =>
    (token.type === 'color' || token.$type === 'color') && token.$value
  );

  // Size tokens: spacing, radius (namespaced by parser), font sizes (by path)
  const sizeTokens = dictionary.allTokens.filter(token =>
    (token.path[0] === 'spacing' || token.path[0] === 'radius' || token.path[0] === 'size') &&
    token.$value !== undefined
  );

  // Font weight tokens: path[0] === 'weight'
  const fontWeightTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'weight' && token.$value !== undefined
  );

  // Opacity tokens: namespaced by parser
  const opacityTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'opacity' && token.$value !== undefined
  );

  // Line height tokens: path[0] === 'line-height'
  const lineHeightTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'line-height' && token.$value !== undefined
  );

  return `//
// ${className}.swift
// Auto-generated from design tokens
// Do not edit directly
//

import UIKit

public extension UIColor {
${colorTokens
  .map(token => {
    const color = token.$value;
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /// ${comment}\n` : '';

    if (typeof color !== 'string') {
      return `${commentLine}    // Skipping non-string color: ${name}`;
    }

    const hex = color.replace('#', '');
    let r, g, b, a = 1;

    if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
      a = parseInt(hex.substring(6, 8), 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    } else {
      return `${commentLine}    // Error parsing color: ${color}`;
    }

    return `${commentLine}    static let ${name} = UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a.toFixed(3)})`;
  })
  .join('\n')}
}

public extension CGFloat {
${sizeTokens
  .map(token => {
    const value = parseFloat(token.$value);
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /// ${comment}\n` : '';
    return `${commentLine}    static let ${name}: CGFloat = ${value}`;
  })
  .join('\n')}
}

public extension Int {
${fontWeightTokens
  .map(token => {
    const value = token.$value;
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /// ${comment}\n` : '';
    return `${commentLine}    static let ${name} = ${value}`;
  })
  .join('\n')}
}

public extension Double {
${[...opacityTokens, ...lineHeightTokens]
  .map(token => {
    const value = token.$value;
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /// ${comment}\n` : '';
    return `${commentLine}    static let ${name}: Double = ${value}`;
  })
  .join('\n')}
}
`;
};

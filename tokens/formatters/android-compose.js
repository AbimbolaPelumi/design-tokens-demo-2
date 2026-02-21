/**
 * Android Jetpack Compose Formatter
 * Generates Kotlin code with Compose Color
 */

export const androidComposeFormatter = ({ dictionary, options }) => {
  const { packageName = 'com.kuda.design.tokens', className = 'DesignTokens' } = options;

  // Color tokens: identified by $type
  const colorTokens = dictionary.allTokens.filter(token =>
    (token.type === 'color' || token.$type === 'color') && token.$value
  );

  // Spacing tokens: namespaced by parser
  const spacingTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'spacing' && token.$value !== undefined
  );

  // Radius tokens: namespaced by parser
  const radiusTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'radius' && token.$value !== undefined
  );

  // Font size tokens: path[0] === 'size'
  const fontSizeTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'size' && token.$value !== undefined
  );

  // Font weight tokens: path[0] === 'weight'
  const fontWeightTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'weight' && token.$value !== undefined
  );

  // Line height tokens: path[0] === 'line-height'
  const lineHeightTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'line-height' && token.$value !== undefined
  );

  // Opacity tokens: namespaced by parser
  const opacityTokens = dictionary.allTokens.filter(token =>
    token.path[0] === 'opacity' && token.$value !== undefined
  );

  return `package ${packageName}

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * ${className}
 * Auto-generated from design tokens
 * Do not edit directly
 */

object ${className}Colors {
${colorTokens
  .map(token => {
    const color = token.$value;
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /** ${comment} */\n` : '';

    if (typeof color !== 'string') {
      return `${commentLine}    // Skipping non-string color: ${name}`;
    }

    const hex = color.replace('#', '');
    let colorValue;

    if (hex.length === 8) {
      colorValue = `0x${hex}`;
    } else if (hex.length === 6) {
      colorValue = `0xFF${hex}`;
    } else {
      return `${commentLine}    // Error parsing color: ${color}`;
    }

    return `${commentLine}    val ${name} = Color(${colorValue})`;
  })
  .join('\n')}
}

object ${className}Spacing {
${spacingTokens
  .map(token => {
    const value = parseFloat(token.$value);
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /** ${comment} */\n` : '';
    return `${commentLine}    val ${name}: Dp = ${value}.dp`;
  })
  .join('\n')}
}

object ${className}BorderRadius {
${radiusTokens
  .map(token => {
    const value = parseFloat(token.$value);
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /** ${comment} */\n` : '';
    return `${commentLine}    val ${name}: Dp = ${value}.dp`;
  })
  .join('\n')}
}

object ${className}Typography {
${fontSizeTokens
  .map(token => {
    const value = parseFloat(token.$value);
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /** ${comment} */\n` : '';
    return `${commentLine}    val ${name}: TextUnit = ${value}.sp`;
  })
  .join('\n')}
}

object ${className}FontWeight {
${fontWeightTokens
  .map(token => {
    const value = token.$value;
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /** ${comment} */\n` : '';
    return `${commentLine}    const val ${name} = ${value}`;
  })
  .join('\n')}
}

object ${className}LineHeight {
${lineHeightTokens
  .map(token => {
    const value = token.$value;
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /** ${comment} */\n` : '';
    return `${commentLine}    const val ${name} = ${value}f`;
  })
  .join('\n')}
}

object ${className}Opacity {
${opacityTokens
  .map(token => {
    const value = token.$value;
    const name = token.name;
    const comment = token.comment || token.$description;
    const commentLine = comment ? `    /** ${comment} */\n` : '';
    return `${commentLine}    const val ${name} = ${value}f`;
  })
  .join('\n')}
}
`;
};

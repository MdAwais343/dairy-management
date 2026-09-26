import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Typography, Colors } from '../constants/theme';

interface UrduTextProps extends TextProps {
  weight?: 'regular' | 'medium' | 'bold';
  align?: 'right' | 'center' | 'left';
  color?: string;
  size?: number;
  children: React.ReactNode;
}

export const UrduText: React.FC<UrduTextProps> = ({
  weight = 'regular',
  align = 'right',
  color = Colors.textDark,
  size = 15,
  style,
  children,
  maxFontSizeMultiplier = 1.25,
  ...rest
}) => {
  let fontFamily = Typography.fontFamily;
  if (weight === 'medium') fontFamily = Typography.fontFamilyMedium;
  if (weight === 'bold') fontFamily = Typography.fontFamilyBold;

  const dynamicStyle: TextStyle = {
    fontFamily,
    textAlign: align,
    writingDirection: 'rtl',
    color,
    fontSize: size,
    // Line height to comfortably clear ascenders and descenders
    lineHeight: Math.round(size * 1.55),
    includeFontPadding: false,
  };

  // Add non-breaking space padding to cushion outer Urdu glyphs (like Dal/Te) from canvas clipping
  const content =
    typeof children === 'string'
      ? `\u00A0${children}\u00A0`
      : children;

  return (
    <Text
      style={[dynamicStyle, style]}
      textBreakStrategy="simple"
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
    >
      {content}
    </Text>
  );
};

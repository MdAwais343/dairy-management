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
    // Generous line height and padding to prevent Arabic/Urdu glyph and diacritic clipping
    lineHeight: Math.round(size * 1.65),
    includeFontPadding: true,
    paddingHorizontal: 8,
  };

  return (
    <Text
      style={[dynamicStyle, style]}
      textBreakStrategy="simple"
      {...rest}
    >
      {children}
    </Text>
  );
};

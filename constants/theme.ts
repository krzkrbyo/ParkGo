/**
 * ParkGo App Theme Colors
 * Light: primary #50DB7B, secondary #3C4372, background #EDEEFF, text #737497
 * Dark: primary #50DB7B, secondary #3C4372, background #737497, text #EDEEFF
 */

import { Platform } from 'react-native';

const tintColorLight = '#50DB7B';
const tintColorDark = '#50DB7B';

export const Colors = {
  light: {
    text: '#737497',
    background: '#EDEEFF',
    tint: tintColorLight,
    icon: '#3C4372',
    tabIconDefault: '#3C4372',
    tabIconSelected: tintColorLight,
    primary: '#50DB7B',
    secondary: '#3C4372',
  },
  dark: {
    text: '#EDEEFF',
    background: '#737497',
    tint: tintColorDark,
    icon: '#50DB7B',
    tabIconDefault: '#50DB7B',
    tabIconSelected: tintColorDark,
    primary: '#50DB7B',
    secondary: '#3C4372',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2563EB';
const tintColorDark = '#60A5FA';

const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    backgroundSecondary: '#1F2937',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#374151',
  },
} as const;

export default Colors;

/**
 * Livith Design System Constants
 *
 * 이 파일은 Livith 프로젝트의 디자인 시스템 상수를 정의합니다.
 * Tailwind CSS 클래스와 함께 사용하거나 JavaScript에서 직접 참조할 수 있습니다.
 */

// ============================================
// Colors
// ============================================

export const colors = {
  // Main Colors
  yellow: {
    30: '#FFFF9F',
    60: '#FFEB56',
  },

  // Gray Scale
  black: {
    100: '#14171B',
    90: '#222831',
    80: '#2F3745',
    50: '#8B959E',
    30: '#D8DCDF',
    5: '#F2F4F5',
  },

  white: '#FFFFFF',

  // Gradient
  gradient: {
    start: '#14171B',
    end: '#222831',
  },

  // Lyrics Colors
  lyrics: {
    translation: '#FF8D84',
    original: '#CAD6FF',
  },

  // Caution
  caution: '#E1103A',
} as const;

// ============================================
// Typography
// ============================================

export const typography = {
  fontFamily: {
    primary: 'Noto Sans KR',
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
} as const;

// ============================================
// Grid System
// ============================================

export const grid = {
  // iOS (375*812)
  ios: {
    width: 375,
    height: 812,
    padding: 16,
  },

  // Android (360*780)
  android: {
    width: 360,
    height: 780,
    padding: 16,
  },
} as const;

// ============================================
// Spacing
// ============================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

// ============================================
// Border Radius
// ============================================

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// ============================================
// Tailwind Class Helpers
// ============================================

export const tailwindClasses = {
  // Background colors
  bg: {
    yellow30: 'bg-livith-yellow-30',
    yellow60: 'bg-livith-yellow-60',
    black100: 'bg-livith-black-100',
    black90: 'bg-livith-black-90',
    black80: 'bg-livith-black-80',
    black50: 'bg-livith-black-50',
    black30: 'bg-livith-black-30',
    black5: 'bg-livith-black-5',
    white: 'bg-livith-white',
    caution: 'bg-livith-caution',
  },

  // Text colors
  text: {
    yellow30: 'text-livith-yellow-30',
    yellow60: 'text-livith-yellow-60',
    black100: 'text-livith-black-100',
    black90: 'text-livith-black-90',
    black80: 'text-livith-black-80',
    black50: 'text-livith-black-50',
    black30: 'text-livith-black-30',
    black5: 'text-livith-black-5',
    white: 'text-livith-white',
    caution: 'text-livith-caution',
  },

  // Border colors
  border: {
    yellow30: 'border-livith-yellow-30',
    yellow60: 'border-livith-yellow-60',
    black100: 'border-livith-black-100',
    black90: 'border-livith-black-90',
    black80: 'border-livith-black-80',
    black50: 'border-livith-black-50',
    black30: 'border-livith-black-30',
    black5: 'border-livith-black-5',
    white: 'border-livith-white',
    caution: 'border-livith-caution',
  },

  // Gradient
  gradient: {
    livith: 'bg-gradient-to-b from-livith-gradient-start to-livith-gradient-end',
  },
} as const;

// ============================================
// Type Exports
// ============================================

export type ColorKeys = keyof typeof colors;
export type TypographyKeys = keyof typeof typography;
export type GridKeys = keyof typeof grid;
export type SpacingKeys = keyof typeof spacing;
export type BorderRadiusKeys = keyof typeof borderRadius;

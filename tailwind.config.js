/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors (Teal) - Main brand color for CTAs, active states, success
        primary: {
          50: '#E6F7F9',   // Lightest teal backgrounds, hover states
          100: '#CCF0F3',  // Light teal backgrounds, selected row backgrounds
          200: '#99E0E7',  // Subtle highlights, badges
          300: '#66D1DB',  // Borders, dividers with emphasis
          400: '#33C1CF',  // Hover states for primary actions
          500: '#0091A2',  // PRIMARY - Main brand color, CTAs, active states
          600: '#007482',  // Pressed states, darker emphasis
          700: '#005762',  // Strong emphasis, icons
          800: '#003A41',  // Very dark teal for text on light backgrounds
          900: '#001D21',  // Darkest teal, high contrast text
        },
        // Structural Colors (Black/Charcoal) - Sidebar, header, headings, emphasis
        structural: {
          50: '#F9FAFB',   // Lightest gray, subtle backgrounds
          100: '#F3F4F6',  // Light gray backgrounds, disabled states
          200: '#E5E7EB',  // Borders, dividers
          300: '#D1D5DB',  // Input borders, inactive elements
          400: '#9CA3AF',  // Placeholder text, icons
          500: '#6B7280',  // Secondary text, labels
          600: '#4B5563',  // Body text, headings
          700: '#374151',  // Strong headings, emphasis
          800: '#1F2937',  // STRUCTURAL BASE - Sidebar background, header
          900: '#111827',  // Darkest black, high contrast elements
        },
        // Content Colors (White/Neutral) - Main content areas, cards, forms
        content: {
          white: '#FFFFFF',     // PRIMARY CONTENT - Main panels, cards, forms
          gray: {
            50: '#FAFAFA',      // Alternate row backgrounds, subtle tiles
            100: '#F5F5F5',     // Input backgrounds, disabled fields
            200: '#EEEEEE',     // Borders within white panels
          },
        },
        // Semantic Colors - Status and feedback
        success: {
          50: '#E6F7F9',
          100: '#CCF0F3',
          500: '#0091A2',  // Same as primary for consistency
          600: '#007482',
          700: '#005762',
          800: '#003A41',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
        },
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
        'tile': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'tile-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'progress': 'progress 5s linear',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progress: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

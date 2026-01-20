import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-noto-sans-kr)', 'sans-serif'],
  		},
  		colors: {
  			// Livith Design System Colors
  			livith: {
  				yellow: {
  					30: '#FFFF9F',
  					60: '#FFEB56',
  				},
  				black: {
  					100: '#14171B',
  					90: '#222831',
  					80: '#2F3745',
  					50: '#8B959E',
  					30: '#D8DCDF',
  					5: '#F2F4F5',
  				},
  				white: '#FFFFFF',
  				gradient: {
  					start: '#14171B',
  					end: '#222831',
  				},
  				lyrics: {
  					translation: '#FF8D84',
  					original: '#CAD6FF',
  				},
  				caution: '#E1103A',
  			},
  			// shadcn/ui 호환 색상
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			"accordion-down": {
  				from: { height: "0" },
  				to: { height: "var(--radix-accordion-content-height)" },
  			},
  			"accordion-up": {
  				from: { height: "var(--radix-accordion-content-height)" },
  				to: { height: "0" },
  			},
  			"dropdown-in": {
  				from: { opacity: "0", transform: "translateY(-8px) scale(0.96)" },
  				to: { opacity: "1", transform: "translateY(0) scale(1)" },
  			},
  			"dropdown-out": {
  				from: { opacity: "1", transform: "translateY(0) scale(1)" },
  				to: { opacity: "0", transform: "translateY(-8px) scale(0.96)" },
  			},
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			"dropdown-in": "dropdown-in 0.2s ease-out",
  			"dropdown-out": "dropdown-out 0.15s ease-in",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

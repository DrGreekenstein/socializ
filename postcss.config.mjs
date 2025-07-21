// postcss.config.js
const config = {
  plugins: {
    // Pass configuration options directly to the plugin
    "@tailwindcss/postcss": {
      // This is where you configure Tailwind CSS v4 settings
      darkMode: ['class'], // <--- ADD THIS LINE
      // You might also need to define your content paths here if not already done
      // For example:
      // content: [
      //   './app/**/*.{js,ts,jsx,tsx,mdx}',
      //   './pages/**/*.{js,ts,jsx,tsx,mdx}',
      //   './components/**/*.{js,ts,jsx,tsx,mdx}',
      //   './src/**/*.{js,ts,jsx,tsx,mdx}',
      // ],
    },
    // If you use Autoprefixer or other PostCSS plugins, add them here
    // autoprefixer: {},
  },
};

export default config;
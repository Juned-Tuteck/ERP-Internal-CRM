// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    server: {
      host: env.VITE_HOST || "0.0.0.0",
      // Use VITE_HOST from .env or default to '0.0.0.0'
      port: parseInt(env.VITE_PORT || "3000", 10)
      // Use VITE_PORT from .env or default to 3000
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgYmFzZWQgb24gdGhlIGN1cnJlbnQgbW9kZVxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6IGVudi5WSVRFX0hPU1QgfHwgJzAuMC4wLjAnLCAvLyBVc2UgVklURV9IT1NUIGZyb20gLmVudiBvciBkZWZhdWx0IHRvICcwLjAuMC4wJ1xuICAgICAgcG9ydDogcGFyc2VJbnQoZW52LlZJVEVfUE9SVCB8fCAnMzAwMCcsIDEwKSwgLy8gVXNlIFZJVEVfUE9SVCBmcm9tIC5lbnYgb3IgZGVmYXVsdCB0byAzMDAwXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLGNBQWMsZUFBZTtBQUMvUCxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQzFCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNLElBQUksYUFBYTtBQUFBO0FBQUEsTUFDdkIsTUFBTSxTQUFTLElBQUksYUFBYSxRQUFRLEVBQUU7QUFBQTtBQUFBLElBQzVDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==

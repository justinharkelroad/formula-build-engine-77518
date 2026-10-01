import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
export default defineConfig({ root: __dirname, plugins: [react()],
  server: { host:'127.0.0.1', port: 5187, strictPort: true, fs: { allow: [path.resolve(__dirname,'../../../..')] } },
  resolve: { alias: [
    {find:'@/integrations/supabase/client',replacement:path.resolve(__dirname,'supabase.ts')},
    {find:'@',replacement:path.resolve(__dirname,'../../../../src')},
  ], dedupe:['react','react-dom'] },
});

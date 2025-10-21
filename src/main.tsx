import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Clear console noise from external services in development
if (import.meta.env.DEV) {
  console.clear();
  
  // Handle custom element conflicts from external scripts
  const originalDefine = customElements.define;
  customElements.define = function(name, constructor, options) {
    if (customElements.get(name)) {
      console.warn(`Custom element "${name}" already defined. Skipping redefinition.`);
      return;
    }
    return originalDefine.call(this, name, constructor, options);
  };
}

createRoot(document.getElementById("root")!).render(<App />);

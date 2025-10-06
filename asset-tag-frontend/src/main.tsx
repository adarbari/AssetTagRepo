import React from &apos;react&apos;;
import { createRoot } from &apos;react-dom/client&apos;;
import App from &apos;./App.tsx&apos;;
import &apos;./index.css&apos;;

const rootElement = document.getElementById(&apos;root&apos;);
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

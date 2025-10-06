import { Hono } from &apos;npm:hono&apos;;
import { cors } from &apos;npm:hono/cors&apos;;
import { logger } from &apos;npm:hono/logger&apos;;
// import * as kv from &apos;./kv_store.tsx&apos;;
const app = new Hono();

// Enable logger
app.use(&apos;*&apos;, logger(// console.log));

// Enable CORS for all routes and methods
app.use(
  &apos;/*&apos;,
  cors({
    origin: &apos;*&apos;,
    allowHeaders: [&apos;Content-Type&apos;, &apos;Authorization&apos;],
    allowMethods: [&apos;GET&apos;, &apos;POST&apos;, &apos;PUT&apos;, &apos;DELETE&apos;, &apos;OPTIONS&apos;],
    exposeHeaders: [&apos;Content-Length&apos;],
    maxAge: 600,
  })
);

// Health check endpoint
app.get(&apos;/make-server-668f981a/health&apos;, c => {
  return c.json({ status: &apos;ok&apos; });
});

Deno.serve(app.fetch);

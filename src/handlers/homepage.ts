/**
 * Homepage handler for Cloudflare MCP Toolbox
 * Snowcodes standard landing page design
 */

export function renderHomepage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare MCP Toolbox | 30 Utility Tools for AI Agents</title>
  <meta name="description" content="30 powerful utility tools for AI agents. Date/time, math, text processing, validation, KV storage, and Workers AI - all in one remote MCP server running on Cloudflare Workers.">
  <link rel="icon" href="https://www.jezweb.com.au/wp-content/uploads/2020/03/favicon-100x100.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --background: #09090b;
      --foreground: #fafafa;
      --card: #18181b;
      --card-foreground: #fafafa;
      --muted: #27272a;
      --muted-foreground: #a1a1aa;
      --border: #27272a;
      --primary: #14b8a6;
      --primary-foreground: #fafafa;
      --secondary: #27272a;
      --secondary-foreground: #fafafa;
      --accent: #3b82f6;
      --success: #10b981;
      --warning: #f59e0b;
      --radius: 0.75rem;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: var(--foreground);
      background: var(--background);
      min-height: 100vh;
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse at 20% 0%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 64px 64px;
      pointer-events: none;
      z-index: 0;
    }

    .content {
      position: relative;
      z-index: 1;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    header {
      padding: 1.5rem 0;
      border-bottom: 1px solid var(--border);
      background: rgba(9, 9, 11, 0.8);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--foreground);
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.5);
    }

    .logo-icon svg {
      width: 20px;
      height: 20px;
      color: white;
    }

    .logo-text {
      font-weight: 600;
      font-size: 1.125rem;
      letter-spacing: -0.02em;
    }

    .header-links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-link {
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    .header-link:hover {
      color: var(--foreground);
      background: var(--muted);
    }

    .hero {
      padding: 6rem 0 4rem;
      text-align: center;
    }

    .badges {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: var(--muted);
      border: 1px solid var(--border);
      color: var(--muted-foreground);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
    }

    .badge svg {
      width: 12px;
      height: 12px;
    }

    .badge-primary {
      background: rgba(20, 184, 166, 0.1);
      border-color: rgba(20, 184, 166, 0.2);
      color: #2dd4bf;
    }

    .badge-accent {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .hero-title {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, var(--foreground) 0%, var(--muted-foreground) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-title span {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--muted-foreground);
      max-width: 600px;
      margin: 0 auto 2.5rem;
      line-height: 1.6;
    }

    section {
      padding: 5rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    .section-subtitle {
      color: var(--muted-foreground);
      font-size: 1.0625rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .stats-section {
      background: rgba(24, 24, 27, 0.5);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      text-align: center;
      padding: 1.5rem;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: var(--muted-foreground);
      font-size: 0.875rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      transition: all 0.2s ease;
    }

    .feature-card:hover {
      border-color: rgba(20, 184, 166, 0.3);
      box-shadow: 0 0 30px -10px rgba(20, 184, 166, 0.2);
      transform: translateY(-2px);
    }

    .feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .feature-icon svg {
      width: 20px;
      height: 20px;
      color: var(--primary);
    }

    .feature-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .feature-description {
      color: var(--muted-foreground);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .tools-section {
      background: rgba(24, 24, 27, 0.5);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }

    .tool-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem;
      text-align: center;
      transition: all 0.15s ease;
    }

    .tool-card:hover {
      border-color: rgba(20, 184, 166, 0.3);
    }

    .tool-icon {
      width: 32px;
      height: 32px;
      margin: 0 auto 0.75rem;
      border-radius: 6px;
      background: linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tool-icon svg {
      width: 16px;
      height: 16px;
      color: var(--primary);
    }

    .tool-name {
      font-weight: 500;
      font-size: 0.9375rem;
      margin-bottom: 0.25rem;
    }

    .tool-count {
      color: var(--muted-foreground);
      font-size: 0.75rem;
    }

    .tool-card.highlight {
      border-color: rgba(20, 184, 166, 0.4);
      background: rgba(20, 184, 166, 0.05);
    }

    .tool-card.highlight .tool-name {
      color: #2dd4bf;
    }

    .cta-section {
      text-align: center;
    }

    .cta-card {
      background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
      border: 1px solid rgba(20, 184, 166, 0.2);
      border-radius: var(--radius);
      padding: 3rem 2rem;
      max-width: 700px;
      margin: 0 auto;
    }

    .cta-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .cta-description {
      color: var(--muted-foreground);
      font-size: 1rem;
      margin-bottom: 2rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius);
      font-weight: 500;
      font-size: 0.9375rem;
      text-decoration: none;
      transition: all 0.15s ease;
      border: none;
      cursor: pointer;
    }

    .button-primary {
      background: var(--primary);
      color: var(--primary-foreground);
      box-shadow: 0 0 30px -5px rgba(20, 184, 166, 0.5);
    }

    .button-primary:hover {
      background: #0d9488;
      box-shadow: 0 0 40px -5px rgba(20, 184, 166, 0.6);
      transform: translateY(-2px);
    }

    footer {
      padding: 3rem 0;
      border-top: 1px solid var(--border);
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      text-align: center;
    }

    .footer-links {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-link {
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.15s ease;
    }

    .footer-link:hover {
      color: var(--foreground);
    }

    .footer-text {
      color: var(--muted-foreground);
      font-size: 0.8125rem;
    }

    .footer-text a {
      color: var(--primary);
      text-decoration: none;
    }

    .footer-text a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .header-links {
        display: none;
      }

      .hero {
        padding: 4rem 0 3rem;
      }

      section {
        padding: 3rem 0;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .tools-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .cta-card {
        padding: 2rem 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="content">
    <header>
      <div class="container">
        <div class="header-content">
          <a href="/" class="logo">
            <div class="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <span class="logo-text">MCP Toolbox</span>
          </a>
          <div class="header-links">
            <a href="#tools" class="header-link">Tools</a>
            <a href="#features" class="header-link">Features</a>
            <a href="https://github.com/jezweb/cloudflare-mcp-toolbox" target="_blank" rel="noopener" class="header-link">GitHub</a>
            <a href="#contact" class="header-link">Contact</a>
          </div>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="container">
        <div class="badges">
          <span class="badge badge-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            </svg>
            Remote MCP Server
          </span>
          <span class="badge badge-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            30 Tools
          </span>
          <span class="badge badge-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Production Ready
          </span>
        </div>
        <h1 class="hero-title">Utility Tools<br><span>for AI Agents</span></h1>
        <p class="hero-subtitle">
          Remote Model Context Protocol server providing 30 utility tools for AI agents.
          Date/time, math, text processing, validation, storage, and Workers AI.
        </p>
      </div>
    </section>

    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">30</div>
            <div class="stat-label">Utility Tools</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">6</div>
            <div class="stat-label">Categories</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">100ms</div>
            <div class="stat-label">Edge Latency</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">OAuth</div>
            <div class="stat-label">Google Auth</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">5min</div>
            <div class="stat-label">Setup Time</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">24/7</div>
            <div class="stat-label">Uptime</div>
          </div>
        </div>
      </div>
    </section>

    <section id="features">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Features</h2>
          <p class="section-subtitle">Powerful utilities designed for AI agent workflows.</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div class="feature-title">Edge Deployment</div>
            <div class="feature-description">Runs on Cloudflare Workers for global low-latency access. No cold starts, instant responses worldwide.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="feature-title">OAuth Authentication</div>
            <div class="feature-description">Google OAuth for secure MCP client authentication. Bearer token support for headless integrations.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
                <path d="M3 12A9 3 0 0 0 21 12"/>
              </svg>
            </div>
            <div class="feature-title">KV Storage</div>
            <div class="feature-description">Per-user key-value storage with TTL support. Store preferences, cache data, and maintain state across sessions.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"/>
                <rect width="16" height="12" x="4" y="8" rx="2"/>
                <path d="M2 14h2"/>
                <path d="M20 14h2"/>
                <path d="M15 13v2"/>
                <path d="M9 13v2"/>
              </svg>
            </div>
            <div class="feature-title">Workers AI</div>
            <div class="feature-description">Built-in AI capabilities with Cloudflare Workers AI. Chat, classification, and embeddings with response caching.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" x2="15" y1="20" y2="20"/>
                <line x1="12" x2="12" y1="4" y2="20"/>
              </svg>
            </div>
            <div class="feature-title">Text Processing</div>
            <div class="feature-description">Transform, encode, hash, and extract patterns from text. Full regex support and multiple encoding formats.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <line x1="8" x2="16" y1="6" y2="6"/>
                <line x1="16" x2="16" y1="14" y2="18"/>
                <path d="M16 10h.01"/>
                <path d="M12 10h.01"/>
                <path d="M8 10h.01"/>
                <path d="M12 14h.01"/>
                <path d="M8 14h.01"/>
                <path d="M12 18h.01"/>
                <path d="M8 18h.01"/>
              </svg>
            </div>
            <div class="feature-title">Math & Validation</div>
            <div class="feature-description">Safe expression evaluation, unit conversion, statistics, and comprehensive input validation for emails, URLs, and JSON.</div>
          </div>
        </div>
      </div>
    </section>

    <section id="tools" class="tools-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Available Tools</h2>
          <p class="section-subtitle">30 utility tools across 6 categories for AI agent workflows.</p>
        </div>
        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
            </div>
            <div class="tool-name">Date/Time</div>
            <div class="tool-count">5 tools</div>
          </div>
          <div class="tool-card">
            <div class="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <line x1="8" x2="16" y1="6" y2="6"/>
                <line x1="16" x2="16" y1="14" y2="18"/>
                <path d="M16 10h.01"/>
                <path d="M12 10h.01"/>
                <path d="M8 10h.01"/>
                <path d="M12 14h.01"/>
                <path d="M8 14h.01"/>
                <path d="M12 18h.01"/>
                <path d="M8 18h.01"/>
              </svg>
            </div>
            <div class="tool-name">Math</div>
            <div class="tool-count">6 tools</div>
          </div>
          <div class="tool-card">
            <div class="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" x2="15" y1="20" y2="20"/>
                <line x1="12" x2="12" y1="4" y2="20"/>
              </svg>
            </div>
            <div class="tool-name">Text</div>
            <div class="tool-count">6 tools</div>
          </div>
          <div class="tool-card">
            <div class="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="tool-name">Validation</div>
            <div class="tool-count">6 tools</div>
          </div>
          <div class="tool-card">
            <div class="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
                <path d="M3 12A9 3 0 0 0 21 12"/>
              </svg>
            </div>
            <div class="tool-name">KV Storage</div>
            <div class="tool-count">4 tools</div>
          </div>
          <div class="tool-card highlight">
            <div class="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"/>
                <rect width="16" height="12" x="4" y="8" rx="2"/>
                <path d="M2 14h2"/>
                <path d="M20 14h2"/>
                <path d="M15 13v2"/>
                <path d="M9 13v2"/>
              </svg>
            </div>
            <div class="tool-name">Workers AI</div>
            <div class="tool-count">3 tools</div>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="cta-section">
      <div class="container">
        <div class="cta-card">
          <h2 class="cta-title">Need a Custom MCP Server or AI Agent?</h2>
          <p class="cta-description">
            Jezweb builds custom MCP servers, AI agents, and business automation solutions.
            Whether you need API integrations, data pipelines, or AI-powered tools for your business, we can help.
          </p>
          <a href="mailto:jeremy@jezweb.net?subject=Custom%20MCP%20Server%20Enquiry" class="button button-primary">
            Get in Touch
          </a>
        </div>
      </div>
    </section>

    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-links">
            <a href="https://jezweb.com.au" target="_blank" rel="noopener" class="footer-link">Jezweb</a>
            <a href="https://github.com/jezweb/cloudflare-mcp-toolbox" target="_blank" rel="noopener" class="footer-link">GitHub</a>
            <a href="mailto:jeremy@jezweb.net" class="footer-link">Contact</a>
          </div>
          <p class="footer-text">
            Built by <a href="https://jezweb.com.au" target="_blank" rel="noopener">Jezweb</a> on Cloudflare Workers — AI agents, MCP servers, and business automation.
          </p>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

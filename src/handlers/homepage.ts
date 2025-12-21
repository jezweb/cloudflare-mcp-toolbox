/**
 * Homepage handler
 * Renders the landing page for Cloudflare MCP Toolbox
 */

export function renderHomepage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare MCP Toolbox</title>
  <link rel="icon" href="https://www.jezweb.com.au/wp-content/uploads/2020/03/favicon-100x100.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
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
      --primary: #3b82f6;
      --primary-foreground: #fafafa;
      --secondary: #27272a;
      --secondary-foreground: #fafafa;
      --accent: #7c3aed;
      --success: #10b981;
      --warning: #f59e0b;
      --radius: 0.75rem;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: var(--foreground);
      background: var(--background);
      margin: 0;
      padding: 0;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Animated gradient background */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse at 20% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
      pointer-events: none;
      z-index: -1;
    }

    /* Grid pattern overlay */
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
      z-index: -1;
    }

    /* Header */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(9, 9, 11, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
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
      box-shadow: 0 0 20px -5px rgba(59, 130, 246, 0.5);
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

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-links a {
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.15s ease;
    }

    .nav-links a:hover {
      color: var(--foreground);
    }

    .github-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) - 2px);
      color: var(--foreground);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .github-btn:hover {
      background: #3f3f46;
      border-color: #3f3f46;
    }

    .github-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Hero Section */
    .hero {
      padding: 5rem 0 4rem;
      text-align: center;
    }

    .badges {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .badge-primary {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .badge-accent {
      background: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.2);
      color: #a78bfa;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .hero h1 {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
      background: linear-gradient(180deg, var(--foreground) 0%, var(--muted-foreground) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero h1 span {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: var(--muted-foreground);
      max-width: 600px;
      margin: 0 auto 2rem;
      line-height: 1.7;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: calc(var(--radius) - 2px);
      font-weight: 500;
      font-size: 0.9375rem;
      text-decoration: none;
      transition: all 0.15s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--primary);
      color: var(--primary-foreground);
      box-shadow: 0 0 20px -5px rgba(59, 130, 246, 0.5);
    }

    .btn-primary:hover {
      background: #2563eb;
      box-shadow: 0 0 25px -5px rgba(59, 130, 246, 0.6);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--secondary);
      color: var(--secondary-foreground);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: #3f3f46;
      border-color: #3f3f46;
    }

    /* Section */
    section {
      padding: 4rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .section-header p {
      color: var(--muted-foreground);
    }

    /* Tools Grid */
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .tool-category {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      transition: all 0.2s ease;
    }

    .tool-category:hover {
      border-color: rgba(59, 130, 246, 0.3);
      box-shadow: 0 0 30px -10px rgba(59, 130, 246, 0.2);
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .category-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .category-icon.datetime { background: rgba(59, 130, 246, 0.1); }
    .category-icon.math { background: rgba(124, 58, 237, 0.1); }
    .category-icon.text { background: rgba(16, 185, 129, 0.1); }
    .category-icon.validation { background: rgba(245, 158, 11, 0.1); }
    .category-icon.storage { background: rgba(236, 72, 153, 0.1); }
    .category-icon.ai { background: rgba(99, 102, 241, 0.1); }

    .category-title {
      font-weight: 600;
      font-size: 1rem;
    }

    .category-count {
      font-size: 0.75rem;
      color: var(--muted-foreground);
      background: var(--muted);
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      margin-left: auto;
    }

    .tool-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tool-item {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--muted-foreground);
      background: var(--muted);
      padding: 0.25rem 0.625rem;
      border-radius: 4px;
    }

    /* Quick Start */
    .quick-start {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
    }

    .steps {
      display: grid;
      gap: 1.5rem;
    }

    .step {
      display: flex;
      gap: 1rem;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .step-content h4 {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .step-content p {
      color: var(--muted-foreground);
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    /* Code blocks */
    .code-block {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) - 2px);
      padding: 1rem;
      overflow-x: auto;
      position: relative;
    }

    .code-block code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      color: var(--foreground);
      white-space: pre;
    }

    .code-block .key { color: #a78bfa; }
    .code-block .string { color: #34d399; }
    .code-block .number { color: #fbbf24; }

    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.375rem;
      background: var(--muted);
      border: 1px solid var(--border);
      border-radius: 4px;
      cursor: pointer;
      color: var(--muted-foreground);
      transition: all 0.15s ease;
    }

    .copy-btn:hover {
      background: var(--secondary);
      color: var(--foreground);
    }

    .copy-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 2rem 0;
      margin-top: 4rem;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-links {
      display: flex;
      gap: 1.5rem;
    }

    .footer-links a {
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.15s ease;
    }

    .footer-links a:hover {
      color: var(--foreground);
    }

    .footer-attribution {
      color: var(--muted-foreground);
      font-size: 0.875rem;
    }

    .footer-attribution a {
      color: var(--primary);
      text-decoration: none;
    }

    .footer-attribution a:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 100%;
        max-width: 280px;
        justify-content: center;
      }

      .tools-grid {
        grid-template-columns: 1fr;
      }

      .footer-content {
        flex-direction: column;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <a href="/" class="logo">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <span class="logo-text">MCP Toolbox</span>
      </a>
      <nav class="nav-links">
        <a href="#tools">Tools</a>
        <a href="#quickstart">Quick Start</a>
        <a href="#api">API</a>
        <a href="https://github.com/jezweb/cloudflare-mcp-toolbox" target="_blank" class="github-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <div class="badges">
          <span class="badge badge-primary">30 Tools</span>
          <span class="badge badge-accent">6 Categories</span>
          <span class="badge badge-success">AI Powered</span>
          <span class="badge badge-primary">Edge Computing</span>
        </div>
        <h1>Cloudflare <span>MCP Toolbox</span></h1>
        <p class="hero-subtitle">
          30 powerful utility tools for AI agents. Date/time, math, text processing, validation, storage, and Workers AI - all in one MCP server.
        </p>
        <div class="hero-actions">
          <a href="#quickstart" class="btn btn-primary">Get Started</a>
          <a href="https://github.com/jezweb/cloudflare-mcp-toolbox" target="_blank" class="btn btn-secondary">View on GitHub</a>
        </div>
      </div>
    </section>

    <section id="tools">
      <div class="container">
        <div class="section-header">
          <h2>Tool Categories</h2>
          <p>Comprehensive utility tools for AI agent workflows</p>
        </div>
        <div class="tools-grid">
          <div class="tool-category">
            <div class="category-header">
              <div class="category-icon datetime">&#128197;</div>
              <span class="category-title">Date/Time</span>
              <span class="category-count">5 tools</span>
            </div>
            <div class="tool-list">
              <span class="tool-item">get_current_datetime</span>
              <span class="tool-item">convert_timezone</span>
              <span class="tool-item">calculate_duration</span>
              <span class="tool-item">format_date</span>
              <span class="tool-item">parse_date</span>
            </div>
          </div>

          <div class="tool-category">
            <div class="category-header">
              <div class="category-icon math">&#128290;</div>
              <span class="category-title">Math</span>
              <span class="category-count">6 tools</span>
            </div>
            <div class="tool-list">
              <span class="tool-item">calculate</span>
              <span class="tool-item">convert_units</span>
              <span class="tool-item">statistics</span>
              <span class="tool-item">random_number</span>
              <span class="tool-item">percentage</span>
              <span class="tool-item">roll_dice</span>
            </div>
          </div>

          <div class="tool-category">
            <div class="category-header">
              <div class="category-icon text">&#9999;&#65039;</div>
              <span class="category-title">Text</span>
              <span class="category-count">6 tools</span>
            </div>
            <div class="tool-list">
              <span class="tool-item">transform_text</span>
              <span class="tool-item">encode_decode</span>
              <span class="tool-item">extract_patterns</span>
              <span class="tool-item">hash_text</span>
              <span class="tool-item">count_words</span>
              <span class="tool-item">truncate_text</span>
            </div>
          </div>

          <div class="tool-category">
            <div class="category-header">
              <div class="category-icon validation">&#9989;</div>
              <span class="category-title">Validation</span>
              <span class="category-count">6 tools</span>
            </div>
            <div class="tool-list">
              <span class="tool-item">validate_email</span>
              <span class="tool-item">validate_url</span>
              <span class="tool-item">validate_phone</span>
              <span class="tool-item">validate_json</span>
              <span class="tool-item">sanitize_html</span>
              <span class="tool-item">validate_schema</span>
            </div>
          </div>

          <div class="tool-category">
            <div class="category-header">
              <div class="category-icon storage">&#128190;</div>
              <span class="category-title">KV Storage</span>
              <span class="category-count">4 tools</span>
            </div>
            <div class="tool-list">
              <span class="tool-item">kv_get</span>
              <span class="tool-item">kv_set</span>
              <span class="tool-item">kv_delete</span>
              <span class="tool-item">kv_list</span>
            </div>
          </div>

          <div class="tool-category">
            <div class="category-header">
              <div class="category-icon ai">&#129302;</div>
              <span class="category-title">Workers AI</span>
              <span class="category-count">3 tools</span>
            </div>
            <div class="tool-list">
              <span class="tool-item">ai_chat</span>
              <span class="tool-item">ai_classify</span>
              <span class="tool-item">ai_embed</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="quickstart">
      <div class="container">
        <div class="section-header">
          <h2>Quick Start</h2>
          <p>Get up and running in minutes</p>
        </div>
        <div class="quick-start">
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Claude.ai (OAuth)</h4>
                <p>Add this MCP server directly in Claude.ai settings. OAuth authentication will handle the rest.</p>
                <div class="code-block">
                  <button class="copy-btn" onclick="copyToClipboard(this, 'https://cloudflare-mcp-toolbox.webfonts.workers.dev/sse')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </button>
                  <code>https://cloudflare-mcp-toolbox.webfonts.workers.dev/sse</code>
                </div>
              </div>
            </div>

            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>BetterChat (Bearer Token)</h4>
                <p>Add to "My MCP Servers" in BetterChat settings:</p>
                <div class="code-block">
                  <button class="copy-btn" onclick="copyToClipboard(this, document.getElementById('betterchat-config').textContent)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </button>
                  <code id="betterchat-config">{
  <span class="key">"url"</span>: <span class="string">"https://cloudflare-mcp-toolbox.webfonts.workers.dev/mcp"</span>,
  <span class="key">"headers"</span>: {
    <span class="key">"Authorization"</span>: <span class="string">"Bearer your-auth-token-here"</span>
  }
}</code>
                </div>
              </div>
            </div>

            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Claude Desktop</h4>
                <p>Add to <code style="background: var(--muted); padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.875rem;">claude_desktop_config.json</code>:</p>
                <div class="code-block">
                  <button class="copy-btn" onclick="copyToClipboard(this, document.getElementById('claude-desktop-config').textContent)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </button>
                  <code id="claude-desktop-config">{
  <span class="key">"mcpServers"</span>: {
    <span class="key">"cloudflare-toolbox"</span>: {
      <span class="key">"command"</span>: <span class="string">"npx"</span>,
      <span class="key">"args"</span>: [<span class="string">"-y"</span>, <span class="string">"mcp-remote"</span>, <span class="string">"https://cloudflare-mcp-toolbox.webfonts.workers.dev/mcp"</span>],
      <span class="key">"env"</span>: {
        <span class="key">"MCP_REMOTE_HEADERS"</span>: <span class="string">"{\\"Authorization\\":\\"Bearer your-token\\"}"</span>
      }
    }
  }
}</code>
                </div>
              </div>
            </div>

            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Deploy Your Own</h4>
                <p>Fork the repository and deploy your own instance with custom authentication.</p>
                <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/jezweb/cloudflare-mcp-toolbox" target="_blank" class="btn btn-primary" style="margin-top: 0.5rem;">
                  Deploy to Cloudflare Workers
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="api">
      <div class="container">
        <div class="section-header">
          <h2>API Reference</h2>
          <p>JSON-RPC 2.0 compatible MCP protocol</p>
        </div>
        <div class="tools-grid">
          <div class="tool-category">
            <h4 style="margin-bottom: 1rem;">List Available Tools</h4>
            <div class="code-block">
              <code>{
  <span class="key">"jsonrpc"</span>: <span class="string">"2.0"</span>,
  <span class="key">"id"</span>: <span class="number">1</span>,
  <span class="key">"method"</span>: <span class="string">"tools/list"</span>
}</code>
            </div>
          </div>
          <div class="tool-category">
            <h4 style="margin-bottom: 1rem;">Call a Tool</h4>
            <div class="code-block">
              <code>{
  <span class="key">"jsonrpc"</span>: <span class="string">"2.0"</span>,
  <span class="key">"id"</span>: <span class="number">2</span>,
  <span class="key">"method"</span>: <span class="string">"tools/call"</span>,
  <span class="key">"params"</span>: {
    <span class="key">"name"</span>: <span class="string">"roll_dice"</span>,
    <span class="key">"arguments"</span>: { <span class="key">"notation"</span>: <span class="string">"2d6+5"</span> }
  }
}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-links">
          <a href="https://github.com/jezweb/cloudflare-mcp-toolbox" target="_blank">GitHub</a>
          <a href="https://github.com/jezweb/cloudflare-mcp-toolbox/blob/main/docs/API_ENDPOINTS.md" target="_blank">Documentation</a>
          <a href="https://github.com/jezweb/cloudflare-mcp-toolbox/issues" target="_blank">Issues</a>
          <a href="https://modelcontextprotocol.io" target="_blank">MCP Protocol</a>
        </div>
        <div class="footer-attribution">
          Built with <a href="https://workers.cloudflare.com" target="_blank">Cloudflare Workers</a> by <a href="https://www.jezweb.com.au" target="_blank">Jezweb</a>
        </div>
      </div>
    </div>
  </footer>

  <script>
    function copyToClipboard(button, text) {
      // Clean the text by removing HTML tags
      const cleanText = text.replace(/<[^>]*>/g, '');
      navigator.clipboard.writeText(cleanText).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;"><path d="M20 6L9 17l-5-5"/></svg>';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      });
    }
  </script>
</body>
</html>
  `;
}

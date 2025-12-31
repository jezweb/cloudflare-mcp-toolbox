/**
 * Admin Dashboard UI
 *
 * Server-rendered HTML for the admin dashboard.
 */

import type { AuthToken } from './tokens';
import type { AdminSession } from './session';

interface DashboardProps {
  user: AdminSession;
  tokens: Array<Omit<AuthToken, 'token'> & { token: string }>;
  server: { name: string; version: string; description: string };
  tools: Array<{ name: string; description: string }>;
  resources: Array<{ name: string; description: string }>;
  prompts: Array<{ name: string; description: string }>;
}

export function renderAdminDashboard(props: DashboardProps): string {
  const { user, tokens, server, tools, resources, prompts } = props;

  const tokensHtml = tokens.length > 0
    ? tokens.map((t) => `
        <tr>
          <td>${escapeHtml(t.label)}</td>
          <td><code>${escapeHtml(t.token)}</code></td>
          <td>${new Date(t.createdAt).toLocaleDateString()}</td>
          <td>${escapeHtml(t.createdBy)}</td>
          <td>
            <button onclick="deleteToken('${t.id}')" class="btn btn-danger btn-sm">Delete</button>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" class="text-muted">No tokens created yet</td></tr>';

  const toolsHtml = tools.length > 0
    ? tools.map((t) => `<li><strong>${escapeHtml(t.name)}</strong> - ${escapeHtml(t.description)}</li>`).join('')
    : '<li class="text-muted">No tools available</li>';

  const resourcesHtml = resources.length > 0
    ? resources.map((r) => `<li><strong>${escapeHtml(r.name)}</strong> - ${escapeHtml(r.description)}</li>`).join('')
    : '<li class="text-muted">No resources available</li>';

  const promptsHtml = prompts.length > 0
    ? prompts.map((p) => `<li><strong>${escapeHtml(p.name)}</strong> - ${escapeHtml(p.description)}</li>`).join('')
    : '<li class="text-muted">No prompts available</li>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - ${escapeHtml(server.name)}</title>
  <link rel="icon" href="https://www.jezweb.com.au/wp-content/uploads/2020/03/favicon-100x100.png">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #0a0a0a;
      --card: #141414;
      --border: #262626;
      --text: #fafafa;
      --muted: #a1a1aa;
      --primary: #14b8a6;
      --danger: #ef4444;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .logo { display: flex; align-items: center; gap: 0.75rem; }
    .logo-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--primary), #3b82f6);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-icon svg { width: 20px; height: 20px; color: white; }
    .logo-text { font-weight: 600; font-size: 1.25rem; }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    .user-info img { width: 32px; height: 32px; border-radius: 50%; }
    .user-info a { color: var(--muted); text-decoration: none; }
    .user-info a:hover { color: var(--text); }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .card h2 { font-size: 1.25rem; margin-bottom: 1rem; color: var(--text); }
    .card h3 { font-size: 1rem; margin-bottom: 0.75rem; color: var(--muted); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
    th { color: var(--muted); font-weight: 500; font-size: 0.875rem; }
    code { background: var(--bg); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-danger { background: var(--danger); color: white; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: var(--muted); font-size: 0.875rem; }
    .form-group input {
      width: 100%;
      padding: 0.5rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: 1rem;
    }
    .form-group input:focus { outline: none; border-color: var(--primary); }
    ul { list-style: none; }
    ul li { padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    ul li:last-child { border-bottom: none; }
    .text-muted { color: var(--muted); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: none;
    }
    .alert-success { background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; }
    .alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; }
    .token-display {
      background: var(--bg);
      padding: 1rem;
      border-radius: 8px;
      font-family: monospace;
      word-break: break-all;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <span class="logo-text">${escapeHtml(server.name)} Admin</span>
      </div>
      <div class="user-info">
        ${user.picture ? `<img src="${escapeHtml(user.picture)}" alt="">` : ''}
        <span>${escapeHtml(user.name)}</span>
        <a href="/admin/logout">Logout</a>
      </div>
    </header>

    <div id="alert" class="alert"></div>

    <div class="grid">
      <div class="card">
        <h2>Create Token</h2>
        <form id="createTokenForm">
          <div class="form-group">
            <label for="label">Token Label</label>
            <input type="text" id="label" name="label" placeholder="e.g., ElevenLabs Agent" required>
          </div>
          <button type="submit" class="btn btn-primary">Create Token</button>
        </form>
        <div id="newToken" style="display: none; margin-top: 1rem;">
          <strong>New Token (copy now, won't be shown again):</strong>
          <div class="token-display" id="tokenValue"></div>
        </div>
      </div>

      <div class="card">
        <h2>Server Info</h2>
        <p><strong>Name:</strong> ${escapeHtml(server.name)}</p>
        <p><strong>Version:</strong> ${escapeHtml(server.version)}</p>
        <p><strong>Description:</strong> ${escapeHtml(server.description)}</p>
      </div>
    </div>

    <div class="card">
      <h2>Auth Tokens</h2>
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Token</th>
            <th>Created</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tokensTable">
          ${tokensHtml}
        </tbody>
      </table>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Tools (${tools.length})</h2>
        <ul>${toolsHtml}</ul>
      </div>
      <div class="card">
        <h2>Resources (${resources.length})</h2>
        <ul>${resourcesHtml}</ul>
      </div>
      <div class="card">
        <h2>Prompts (${prompts.length})</h2>
        <ul>${promptsHtml}</ul>
      </div>
    </div>
  </div>

  <script>
    function showAlert(message, type) {
      const alert = document.getElementById('alert');
      alert.textContent = message;
      alert.className = 'alert alert-' + type;
      alert.style.display = 'block';
      setTimeout(() => { alert.style.display = 'none'; }, 5000);
    }

    document.getElementById('createTokenForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const label = document.getElementById('label').value;

      try {
        const res = await fetch('/api/admin/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        document.getElementById('tokenValue').textContent = data.token.token;
        document.getElementById('newToken').style.display = 'block';
        document.getElementById('label').value = '';
        showAlert('Token created successfully', 'success');

        // Reload to show new token in table
        setTimeout(() => location.reload(), 2000);
      } catch (err) {
        showAlert(err.message, 'error');
      }
    });

    async function deleteToken(id) {
      if (!confirm('Delete this token?')) return;

      try {
        const res = await fetch('/api/admin/tokens/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showAlert('Token deleted', 'success');
        location.reload();
      } catch (err) {
        showAlert(err.message, 'error');
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

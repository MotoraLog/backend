import Script from 'next/script';

const pageStyle = {
  fontFamily: 'sans-serif',
  minHeight: '100vh',
  margin: 0,
  background: '#f8fafc'
} as const;

const headerStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #e2e8f0',
  background: '#ffffff'
} as const;

const toolbarStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '0.5rem',
  padding: '0.75rem 1.5rem',
  borderBottom: '1px solid #e2e8f0',
  background: '#f1f5f9',
  alignItems: 'center'
} as const;

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.65rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '0.9rem'
} as const;

const buttonStyle = {
  padding: '0.55rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  cursor: 'pointer',
  fontSize: '0.9rem'
} as const;

export default function DocsPage() {
  return (
    <main style={pageStyle}>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />

      <header style={headerStyle}>
        <strong>API Docs</strong> · Swagger UI em <a href="/api/openapi">/api/openapi</a>
      </header>

      <section style={toolbarStyle}>
        <input id="docs-auth-email" type="email" placeholder="email" style={inputStyle} />
        <input id="docs-auth-password" type="password" placeholder="password" style={inputStyle} />
        <button id="docs-auth-login" type="button" style={buttonStyle}>
          Login e Authorize
        </button>
        <button id="docs-auth-clear" type="button" style={buttonStyle}>
          Limpar token
        </button>
        <div id="docs-auth-status" style={{ fontSize: '0.85rem', color: '#334155' }}>
          Sem token carregado.
        </div>
      </section>

      <div id="swagger-ui" />

      <Script
        src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
      />
      <Script id="swagger-ui-init" strategy="afterInteractive">
        {`
          window.addEventListener('load', function () {
            if (!window.SwaggerUIBundle) {
              return;
            }

            window.ui = window.SwaggerUIBundle({
              url: '/api/openapi',
              dom_id: '#swagger-ui',
              deepLinking: true,
              persistAuthorization: true,
              docExpansion: 'list',
              presets: [
                window.SwaggerUIBundle.presets.apis,
                window.SwaggerUIStandalonePreset
              ],
              layout: 'StandaloneLayout'
            });

            const tokenStorageKey = 'docs_access_token';
            const statusElement = document.getElementById('docs-auth-status');
            const emailInput = document.getElementById('docs-auth-email');
            const passwordInput = document.getElementById('docs-auth-password');
            const loginButton = document.getElementById('docs-auth-login');
            const clearButton = document.getElementById('docs-auth-clear');

            const setStatus = function (message, isError) {
              if (!statusElement) {
                return;
              }

              statusElement.textContent = message;
              statusElement.style.color = isError ? '#b91c1c' : '#0f172a';
            };

            const applyToken = function (token) {
              if (!token || !window.ui) {
                return;
              }

              window.ui.preauthorizeApiKey('bearerAuth', token);
              localStorage.setItem(tokenStorageKey, token);
              setStatus('Token aplicado no Swagger UI.', false);
            };

            const clearToken = function () {
              localStorage.removeItem(tokenStorageKey);
              if (window.ui && window.ui.authActions) {
                window.ui.authActions.logout(['bearerAuth']);
              }
              setStatus('Token removido.', false);
            };

            const savedToken = localStorage.getItem(tokenStorageKey);
            if (savedToken) {
              applyToken(savedToken);
            }

            if (clearButton) {
              clearButton.addEventListener('click', function () {
                clearToken();
              });
            }

            if (loginButton) {
              loginButton.addEventListener('click', async function () {
                const email = emailInput && emailInput.value ? emailInput.value.trim() : '';
                const password = passwordInput && passwordInput.value ? passwordInput.value : '';

                if (!email || !password) {
                  setStatus('Preencha email e senha para autenticar.', true);
                  return;
                }

                setStatus('Autenticando...', false);

                try {
                  const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                      'content-type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                  });

                  const payload = await response.json();

                  if (!response.ok) {
                    const message = payload && payload.error && payload.error.message
                      ? payload.error.message
                      : 'Falha no login.';
                    setStatus(message, true);
                    return;
                  }

                  const token = payload && payload.data && payload.data.tokens
                    ? payload.data.tokens.accessToken
                    : null;

                  if (!token) {
                    setStatus('Resposta de login sem accessToken.', true);
                    return;
                  }

                  applyToken(token);
                } catch (_error) {
                  setStatus('Erro de rede ao autenticar.', true);
                }
              });
            }
          });
        `}
      </Script>
    </main>
  );
}

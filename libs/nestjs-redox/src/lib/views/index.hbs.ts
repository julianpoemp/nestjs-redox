// retrieved from https://redocly.com/docs/redoc/v3.x/deployment/html

export const REDOC_HANDLEBAR = `
<!DOCTYPE html>
<html>
  <head>
    <title>{{ title }}</title>
    <meta charset="utf-8" />
    {{#if redoxOptions.favicon.url }}
    <link rel="shortcut icon" type="image/x-icon" href="{{{ redoxOptions.favicon.url }}}" />
    {{/if}}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style nonce="{{{nonce}}}">
        body, html, #redoc-container {
          padding:0;
          margin:0;
        }
    </style>
  </head>
  <body>
    <div id="redoc-container"></div>

    <script type="module" nonce="{{{nonce}}}">
      import { init } from '{{{ redocScriptUrl }}}';

      const container = document.getElementById('redoc-container');
      const redocOptions = {{{json redocOptions}}};

      function b64ToString(base64String) {
        const binString = atob(base64String);
        const decodedBytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        return new TextDecoder().decode(decodedBytes);
      }

      try {
      {{#if documentURL}}
        init({{{json documentURL}}}, redocOptions, container);
      {{else}}
        const base64Document = \`
{{{ base64Document }}}
\`;
        const spec = JSON.parse(b64ToString(base64Document.replace(/\\s/g, '')));
        init(spec, redocOptions, container);
      {{/if}}
      } catch (e) {
        console.error('NestJSRedox: failed to render Redoc', e);
        container.textContent = 'NestJSRedox: failed to render Redoc: ' + (e?.message ?? e);
      }
    </script>
    {{#if redoxOptions.customCss}}
    <!-- placed at the end of the body so that it overrides the CSS variables Redoc injects into the head -->
    <style nonce="{{{nonce}}}">
{{{ redoxOptions.customCss }}}
    </style>
    {{/if}}
  </body>
</html>
`;

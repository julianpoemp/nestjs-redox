// retrieved from https://github.com/Redocly/redoc/blob/main/docs/deployment/html.md

export const REDOC_HANDLEBAR = `
<!DOCTYPE html>
<html>
  <head>
    <title>{{ document.info.title }}</title>
    <meta charset="utf-8" />
    {{#if redoxOptions.favicon.url }}
    <link rel="shortcut icon" type="image/x-icon" href="{{{ redoxOptions.favicon.url }}}" />
    {{/if}}
    {{#unless redoxOptions.disableGoogleFont}}
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    {{/unless}}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body, html, #redoc-container {
          padding:0;
          margin:0;
        }
    </style>
    {{#unless redoxOptions.standalone}}
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js" nonce="{{{nonce}}}"> </script>
    {{else}}
    <script src="{{baseUrlForRedocUI}}redoc.standalone.js" nonce="{{{nonce}}}"></script>
    {{/unless}}
  </head>
  <body>
    <div id="redoc-container"></div>

    <script type="application/javascript" nonce="{{{nonce}}}">
      function b64ToString(base64String) {
        const binString = atob(base64String);
        const decodedBytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        return new TextDecoder().decode(decodedBytes);
      }

      {{#if documentURL}}
        Redoc.init('{{documentURL}}', {{{json redocOptions}}}, document.getElementById('redoc-container'))
      {{else}}
        const base64Document = \`
{{{ base64Document }}}
\`;

        try {
          const spec = JSON.parse(b64ToString(base64Document));
          Redoc.init(spec, {{{json redocOptions}}}, document.getElementById('redoc-container'))
        } catch (e) {
          alert(e?.message ?? e);
        }
      {{/if}}
    </script>
  </body>
</html>
`;

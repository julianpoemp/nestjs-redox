// retrieved from https://github.com/Redocly/redoc/blob/main/docs/deployment/html.md

export const REDOC_HANDLEBAR = `
<!DOCTYPE html>
<!DOCTYPE html>
<html>
  <head>
    <title>{{ document.info.title }}</title>
    <meta charset="utf-8" />
    {{#if data.redoxOptions.favicon}}
    <link rel="shortcut icon" type="image/x-icon" href="{{ redoxOptions.favicon }}" />
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
  </head>
  <body>
    {{#unless redoxOptions.standalone}}
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
    {{else}}
    <script src="{{baseUrlForRedocUI}}redoc.standalone.js"></script>
    {{/unless}}
    <div id="redoc-container"></div>

    <script>
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

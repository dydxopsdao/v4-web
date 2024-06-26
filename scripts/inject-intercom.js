/* eslint-disable no-console */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const INTERCOM_APP_ID = process.env.INTERCOM_APP_ID;
const INTERCOM_API_BASE = process.env.INTERCOM_API_BASE;

const currentPath = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(currentPath);

if (INTERCOM_APP_ID) {
  try {
    const files = await fs.readdir('entry-points');
    for (const file of files) {
      inject(file);
    };
  } catch (err) {
    console.error('Error injecting Intercom scripts:', err);
  }
}

async function inject(fileName) {
  const htmlFilePath = path.resolve(projectRoot, `../dist/entry-points/${fileName}`);
  const html = await fs.readFile(htmlFilePath, 'utf-8');

  const intercomScripts = `
  <!-- Intercom -->
  <script>
    window.intercomSettings = {
      api_base: '${INTERCOM_API_BASE}',
      app_id: '${INTERCOM_APP_ID}',
      custom_launcher_selector: '.custom_intercom',
      hide_default_launcher: true,
    };
  </script>

  <script>
  // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/${INTERCOM_APP_ID}'
  (function () {
    var w = window;
    var ic = w.Intercom;
    if (typeof ic === 'function') {
      ic('reattach_activator');
      ic('update', w.intercomSettings);
    } else {
      var d = document;
      var i = function () {
        i.c(arguments);
      };
      i.q = [];
      i.c = function (args) {
        i.q.push(args);
      };
      w.Intercom = i;
      var l = function () {
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://widget.intercom.io/widget/${INTERCOM_APP_ID}';
        var x = d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      };
      if (document.readyState === 'complete') {
        l();
      } else if (w.attachEvent) {
        w.attachEvent('onload', l);
      } else {
        w.addEventListener('load', l, false);
      }
    }
  })();
</script>
  `;

  const injectedHtml = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>\n${intercomScripts}\n`
  );

  await fs.writeFile(htmlFilePath, injectedHtml, 'utf-8');

  console.log(`Intercom scripts successfully injected (${fileName}).`);
}
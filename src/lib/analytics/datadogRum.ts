import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

const APPLICATION_ID = import.meta.env.VITE_DATADOG_RUM_APPLICATION_ID;
const CLIENT_TOKEN = import.meta.env.VITE_DATADOG_RUM_CLIENT_TOKEN;
const ENV = import.meta.env.VITE_DATADOG_RUM_ENV;
const SESSION_SAMPLE_RATE = Number(import.meta.env.VITE_DATADOG_RUM_SESSION_SAMPLE_RATE ?? 100);

const SERVICE_NAME = 'v4-web';
const SITE_NAME = 'ap1.datadoghq.com';

// VITE_LAST_TAG looks like "tags/release/v2.7.4" — keep only "v2.7.4".
const rawTag = import.meta.env.VITE_LAST_TAG;
const VERSION = rawTag ? rawTag.split('/').pop() : undefined;

export function initializeDatadogRum() {
  if (!APPLICATION_ID || !CLIENT_TOKEN || !ENV) return;

  datadogRum.init({
    applicationId: APPLICATION_ID,
    clientToken: CLIENT_TOKEN,
    site: SITE_NAME,
    service: SERVICE_NAME,
    env: ENV,
    version: VERSION,
    sessionSampleRate: Number.isFinite(SESSION_SAMPLE_RATE) ? SESSION_SAMPLE_RATE : 100,
    sessionReplaySampleRate: 0,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    plugins: [reactPlugin({ router: false })],
  });
}

import type { ErrorInfo } from 'react';

import { datadogRum } from '@datadog/browser-rum';
import { addReactError, reactPlugin } from '@datadog/browser-rum-react';

const APPLICATION_ID = import.meta.env.VITE_DATADOG_RUM_APPLICATION_ID;
const CLIENT_TOKEN = import.meta.env.VITE_DATADOG_RUM_CLIENT_TOKEN;
const ENV = import.meta.env.VITE_DATADOG_RUM_ENV;
const SESSION_SAMPLE_RATE = Number(import.meta.env.VITE_DATADOG_RUM_SESSION_SAMPLE_RATE ?? 100);

const SERVICE_NAME = 'v4-web';
const SITE_NAME = 'ap1.datadoghq.com';

// VITE_LAST_TAG looks like "tags/release/v2.7.4" — keep only "v2.7.4".
const rawTag = import.meta.env.VITE_LAST_TAG;
const VERSION = rawTag ? rawTag.split('/').pop() : undefined;

let isInitialized = false;

// Locations that reach RUM through a more specific path, so log() must not also
// forward them as generic errors: unhandled rejections are auto-captured by RUM,
// and ErrorBoundary catches are reported via reportRumReactError (addReactError).
const RUM_SKIP_FORWARD_LOCATIONS = new Set([
  'window/onunhandledrejection',
  'window/onrejectionhandled',
  'ErrorBoundary',
]);

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

  isInitialized = true;
}

export function reportRumError(location: string, error?: Error, metadata?: object) {
  if (!isInitialized || RUM_SKIP_FORWARD_LOCATIONS.has(location)) return;
  datadogRum.addError(error ?? new Error(location), { location, ...metadata });
}

// React render errors caught by ErrorBoundary: addReactError reports them as a
// ReactRenderingError with the component stack and `framework: 'react'`.
export function reportRumReactError(error: Error, errorInfo: ErrorInfo) {
  if (!isInitialized) return;
  addReactError(error, errorInfo);
}

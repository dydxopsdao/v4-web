import type { ErrorInfo } from 'react';

import { datadogRum } from '@datadog/browser-rum';
import { addReactError, reactPlugin } from '@datadog/browser-rum-react';

const APPLICATION_ID = import.meta.env.VITE_DATADOG_RUM_APPLICATION_ID;
const CLIENT_TOKEN = import.meta.env.VITE_DATADOG_RUM_CLIENT_TOKEN;
const ENV = import.meta.env.VITE_DATADOG_RUM_ENV;
const SESSION_SAMPLE_RATE = Number(import.meta.env.VITE_DATADOG_RUM_SESSION_SAMPLE_RATE ?? 100);
const SESSION_REPLAY_SAMPLE_RATE = Number(
  import.meta.env.VITE_DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE ?? 0
);

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
    sessionReplaySampleRate: Number.isFinite(SESSION_REPLAY_SAMPLE_RATE)
      ? SESSION_REPLAY_SAMPLE_RATE
      : 0,
    // Sensitive elements opt out via data-dd-privacy="hidden". Must stay 'allow':
    // any mask level also hides <output>-based display values (prices, balances).
    defaultPrivacyLevel: 'allow',
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

// Feature flag evaluations, recorded on RUM views/errors as @feature_flags.<key>.
export function reportRumFeatureFlagEvaluation(key: string, value: unknown) {
  if (!isInitialized) return;
  datadogRum.addFeatureFlagEvaluation(key, value);
}

// identify() property names that define identity go on the RUM user (@usr.*);
// everything else becomes searchable global context (@context.*). Statsig flag
// objects are skipped here — they're already captured via addFeatureFlagEvaluation.
const RUM_USER_PROPERTY_KEYS: Record<string, string> = {
  dydxAddress: 'id',
  walletAddress: 'walletAddress',
  walletType: 'walletType',
  userId: 'userId',
};

const RUM_SKIP_USER_PROPERTIES = new Set(['statsigFlags', 'customFlags']);

// Mirror identify() user properties into RUM. A null/undefined value removes the
// property, so anonymous (never-connected) sessions carry no usr.id at all.
export function reportRumUserProperty(name: string, value: unknown) {
  if (!isInitialized || RUM_SKIP_USER_PROPERTIES.has(name)) return;

  const userKey = RUM_USER_PROPERTY_KEYS[name];
  if (userKey) {
    if (value == null) datadogRum.removeUserProperty(userKey);
    else datadogRum.setUserProperty(userKey, value);
  } else if (value == null) {
    datadogRum.removeGlobalContextProperty(name);
  } else {
    datadogRum.setGlobalContextProperty(name, value);
  }
}

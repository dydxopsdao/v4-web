## App Integrations

### Amplitude

Analytics service used to collect data to help the dYdX Product team make informed product decisions.

<b>To use with dydxprotocol/v4-web:</b>

1. Amplitude account with API key.
2. Add API key in Github > Secrets and Variables > Actions as `AMPLITUDE_API_KEY`
3. In your deploy scripts add `pnpm run build:inject-amplitude` after your pnpm build / vite build command.

### Hotjar

User behavior tracking service used to help the dYdX Product team make informed product decisions.

<b>To use with dydxprotocol/v4-web:</b>

1. Hotjar account with Site Id and Hotjar version.
2. Add Site Id and Hotjar version in Github > Secrets and Variables > Actions as `HOTJAR_SITE_ID` and `HOTJAR_VERSION`
3. In your deploy scripts add `pnpm run build:inject-hotjar` after your pnpm build / vite build command.

### Bugsnag

Error handling service used to collect handled/unhandled errors within the app. The information collected is used to help debug and alert the engineering team of crashes/unhandled errors within the app to improve stability.

<b>To use with dydxprotocol/v4-web:</b>

1. Bugsnag account with API key.
2. Add API key in Github > Secrets and Variables > Actions as `BUGSNAG_API_KEY`
3. In your deploy scripts add `pnpm run build:inject-bugsnag` after your pnpm build / vite build command.
4. If you are using with the Amplitude deployment scripts, your build command may look like the following: `pnpm build && pnpm run build:inject-amplitude && pnpm run build:inject-bugsnag`

### Google Tag Manager

Tag management service that allows you to manage and deploy marketing tags on the website without having to modify and deploy code. Supports tags such as Google Analytics, Adwords conversions, etc. Used for marketing, analytics, and personalization.

<b>To use with dydxprotocol/v4-web:</b>

1. Follow the instructions on google's docs: https://support.google.com/tagmanager/answer/14842164?hl=en&ref_topic=15191151&sjid=3001289320793576310-NA#
2. In your deploy scripts add `pnpm run build:inject-google-tag-manager` after your pnpm build / vite build command.

### StatusPage

Service used to inform users of any status updates to our platform. These status updates are manually set and updated by the On Call engineers.

<b>To use with dydxprotocol/v4-web:</b>

1. StatusPage account and script URI
2. Add API key in Github > Secrets and Variables > Actions as `STATUS_PAGE_SCRIPT_URI`
3. In your deploy scripts add `pnpm run build:inject-statuspage` after your pnpm build / vite build command.
4. If you are using with the Amplitude deployment scripts, your build command may look like the following: `pnpm build && pnpm run build:inject-amplitude && pnpm run build:inject-statuspage`

### Intercom

Service used for live customer support (chat/inbox) as well as home for Help Articles.

<b>To use with dydxprotocol/v4-web:</b>

1. Create Intercom account
2. In Intercom UI
   Getting started > Set up Messenger > will give you your API Key on Step 2
   Customize Intercom Messenger by adding logo and brand colors
3. Add API key in Github > Secrets and Variables > Actions as `INTERCOM_APP_ID`
4. In your deploy scripts add `pnpm run build:inject-intercom` after your pnpm build / vite build command.
5. If you are using with the Amplitude deployment scripts, your build command may look like the following: `pnpm build && pnpm run build:inject-amplitude && pnpm run build:inject-intercom`

DOS is currently using a US workspace but is planning to migrate to the EU. We have introduced a temporary variable INTERCOM_API_BASE that will facilitate a smooth transition during the migration period. The plan after migration is to remove the variable and revert back to using a static definition with api_base set to 'https://api-iam.eu.intercom.io'.

### Smartbanner

Smartbanner to show download links to iOS and/or Android native apps on mobile devices.

<b>To use with dydxprotocol/v4-web:</b>

1. iOS app App Store link or Android app Google Play link.
2. Add configurations in Github > Secrets and Variables > Actions as
   `SMARTBANNER_APP_NAME` for app name
   `SMARTBANNER_ORG_NAME` for organization name
   `SMARTBANNER_ICON_URL` for icon image
   `SMARTBANNER_APPSTORE_URL` for iOS App Store link
   `SMARTBANNER_GOOGLEPLAY_URL` for Android Google Play link
3. In your deploy scripts add `pnpm run build:inject-smartbanner` after your pnpm build / vite build command.
4. If you are using with the Amplitude deployment scripts, your build command may look like the following: `pnpm build && pnpm run build:inject-smartbanner`

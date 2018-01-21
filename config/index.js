export default {
  port: process.env.PORT || '8000',
  publicUrl: process.env.PUBLIC_URL,
  siteName: 'Tussock Test',
  analytics: {
    trackingId: process.env.ANALYTICS_TRACKING_ID,
  },
  github: {
    username: 'nhardy',
    repoUrl: process.env.PROJECT_HOMEPAGE,
    excludedRepos: [
      48929138,
    ],
  },
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITEKEY,
  },
  twitter: {
    handle: '@nhardy96',
  },
  mqtt: {
    // IMPORTANT: This AWS Key has limited permissions required for MQTT and as such is safe to be made public
    accessKeyId: 'AKIAJV2WE5D3ETYCUTMQ',
    secretAccessKey: '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',
    // End IMPORTANT
    endpointAddress: 'a2qk64r47ogbmr.iot.ap-southeast-2.amazonaws.com',
    region: 'ap-southeast-2',
  },
};

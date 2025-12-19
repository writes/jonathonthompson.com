module.exports = {
  sitecoreApiKey: process.env.SITECORE_API_KEY || 'your-api-key-here',
  sitecoreApiHost: process.env.SITECORE_API_HOST || 'http://localhost:3000',
  jssAppName: 'jonathonthompson-microsite',
  defaultLanguage: 'en',
  layoutServiceConfiguration: {
    host: process.env.SITECORE_API_HOST || 'http://localhost:3000',
  },
};

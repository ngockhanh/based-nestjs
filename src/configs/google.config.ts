export default () => ({
  auth: {
    clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_AUTH_REDIRECT_URL,
  },
  keyPath: process.env.GOOGLE_KEY_PATH,
  projectId: process.env.GOOGLE_PROJECT_ID,
  storageBucket: process.env.GOOGLE_STORAGE_BUCKET,
});

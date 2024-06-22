export default () => ({
  entryPoint: process.env.SSO_ENTRYPOINT,
  issuer: process.env.SSO_ISSUER,
  callbackUrl: process.env.SSO_CALLBACK_URL,
  cert: process.env.SSO_CERT,
  successRedirect: process.env.SSO_SUCCESS_REDIRECT,
  failureRedirect: process.env.SSO_FAILURE_REDIRECT,
});

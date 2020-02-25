const { Issuer, generators } = require('openid-client');


module.exports = function(req, res, next) {
 return Issuer.discover('https://www.flowid.co/platform/oidc') // => Promise
  .then(flowIdIssuer => {
    // console.log('Discovered issuer ', flowIdIssuer.issuer, flowIdIssuer.metadata);
    const client = new flowIdIssuer.Client({
      client_id: '87f9d407-b714-45a5-8170-f2108feb3b51',
      client_secret: 'SUMQwZVvLGnXCP4l4oDAOPh+QaxXYXLpi6HKYG8iwK7upz3Z+HgGVMTdgYWSvrpfrGK/Y2DlElJb++ghRxUGqA',
      redirect_uri: 'http://localhost:3000/cb',
      response_types: ['code'],
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    }); // => Client
    const code_verifier = generators.codeVerifier();
  // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
  // it should be httpOnly (not readable by javascript) and encrypted.
  
  const code_challenge = generators.codeChallenge(code_verifier);
    client.authorizationUrl({
      scope: 'openid email profile',
      resource: 'https://www.flowid.co/platform/oidc/authorize',
      code_challenge,
      code_challenge_method: 'S256'
    });
    const params = client.callbackParams(req);
    
    client.callback('http://localhost:4000/cb', params, { code_verifier }) // => Promise
      .then(function (tokenSet) {
        console.log('received and validated tokens %j', tokenSet);
        console.log('validated ID Token claims %j', tokenSet.claims());
      });
    console.log('CLIENT ', client)
  });
}

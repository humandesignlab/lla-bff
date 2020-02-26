const { Issuer, generators } = require('openid-client');


module.exports = Issuer.discover(process.env.AUTH0_DOMAIN) // => Promise
  .then(flowIdIssuer => {
    console.log('Discovered issuer ', flowIdIssuer);
    const client = new flowIdIssuer.Client({
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      redirect_uri: 'http://freeflow.gotocme.com/completeSignin',
      response_types: 'code',

    }); // => Client
    const code_verifier = generators.codeVerifier();
  // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
  // it should be httpOnly (not readable by javascript) and encrypted.
  
  const code_challenge = generators.codeChallenge(code_verifier);
    client.authorizationUrl({
      scope: 'openid',
      resource: 'https://thirdparty.flowid.co/platform/oidc/authorize',
      code_challenge,
      code_challenge_method: 'S256'
    });
    const params = client.callbackParams('https://thirdparty.flowid.co/platform/oidc/token');
    
    client.callback('http://freeflow.gotocme.com/completeSignin', params, { code_verifier }) // => Promise
      .then(function (tokenSet) {
        console.log('received and validated tokens %j', tokenSet);
        console.log('validated ID Token claims %j', tokenSet.claims());
      });
    // console.log('CLIENT ', client)
  });

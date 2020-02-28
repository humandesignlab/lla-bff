const { Issuer, generators } = require('openid-client');


module.exports = Issuer.discover(process.env.AUTH0_DOMAIN) // => Promise
  .then(flowIdIssuer => {
    console.log('Discovered issuer ', flowIdIssuer);
    const client = new flowIdIssuer.Client({
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      redirect_uri: 'http://ec2-3-234-244-10.compute-1.amazonaws.com/',
      response_types: 'code',

    }); // => Client
    const code_verifier = generators.codeVerifier();
  // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
  // it should be httpOnly (not readable by javascript) and encrypted.
  
  const code_challenge = generators.codeChallenge(code_verifier);
    client.authorizationUrl({
      scope: 'openid'
    });
    const params = client.callbackParams('https://thirdparty.flowid.co/platform/oidc/authorize?grant_type=authorization_code&code=Kn4ys9&state=Bwie3MB5GmEJ7KoBNpEuKaWw&');
    console.log('PARAMS ', params)
    client.callback('http://ec2-3-234-244-10.compute-1.amazonaws.com/', params, { code_verifier }) // => Promise
      .then(function (tokenSet) {
        console.log('received and validated tokens %j', tokenSet);
        console.log('validated ID Token claims %j', tokenSet.claims());
      });
    // console.log('CLIENT ', client)
  });

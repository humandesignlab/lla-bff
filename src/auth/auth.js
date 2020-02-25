const  querystring = require('querystring');
const  axios = require('axios');

const form = {
    username: process.env.ACCOUNT_MANAGENEMT_API_USER,
    password: process.env.ACCOUNT_MANAGENEMT_API_PASSWORD
};

const  formData = querystring.stringify(form);
module.exports = auth = () => {
  return axios.request({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: formData,
    url: 'https://anypoint.mulesoft.com/accounts/login',
    method: 'POST'
  }).then((data) => {
    return data.data.access_token;
  });
}


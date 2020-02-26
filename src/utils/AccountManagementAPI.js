const { RESTDataSource } = require('apollo-datasource-rest');

class AccountManagementAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.ACCOUNT_MANAGENEMT_API_URL;
    
  }

  // willSendRequest(request) {
  //   console.log(this.context.token)
  //   request.headers.set('Authorization', this.context.token);
  // }
  
  async billPresentationMedia(id) {
    return this.get(`PA/billFormat`);
  }

  // async getMostViewedMovies(limit = 10) {
  //   const data = await this.get('movies', {
  //     per_page: limit,
  //     order_by: 'most_viewed',
  //   });
  //   return data.results;
  // }
}

module.exports = AccountManagementAPI;
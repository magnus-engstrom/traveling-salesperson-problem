const https = require('https');
const STATSURL = process.env.STATSURL || '';
const ENV = process.env.ENV || 'dev';

module.exports = {
  store: async (clientID, agent, appName, info, value) => {
    if (ENV !== 'prod') return;
    https.get(STATSURL + '/?clientid=' + clientID + '&agent=' + agent + '&app=' + appName + '&info=' + info + '&value=' + value, res => {
      console.log('Status Code:', res.statusCode);
    }).on('error', err => {
      console.log('Error: ', err.message);
    });
  }
}
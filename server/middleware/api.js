const axios = require('axios')


module.exports =  axios.create({
    baseURL: `${process.env.WALLETAPP_URI}`,
    headers: {
        'Content-Type': 'application/json'
    }
  });
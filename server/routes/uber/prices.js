'use strict';

var Request = require('request');

module.exports = {
  handler: function(request, reply) {
    var headers = {'Authorization': 'Token m6y2-yeBTpRFxFnCITJN1h5xCCnlVSztRtaLcLsn'};
    var url = 'https://api.uber.com/v1/estimates/price?start_latitude=' + request.query.start_latitude +'&start_longitude=' + request.query.start_longitude + '&end_latitude=' + request.query.end_latitude + '&end_longitude='+ request.query.end_longitude;
    Request.get({url:url, headers:headers, json:true}, function(err, response, body){
      reply(body);
    });
  }
};

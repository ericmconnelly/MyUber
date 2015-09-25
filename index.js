var express = require('express');
var superagent = require('superagent');
var consolidate = require('consolidate');

var app = express();

var Uber = require('node-uber');
 
var uber = new Uber({
  client_id: 's_mjPTYcY0Py3gc8E6ibnXGx7gxpdKZ4',
  client_secret: 'dZ86HfqQB9mUI9THFRSWcDkJRlHYXnSUPaM0qgQz',
  server_token: '_UqtKdfLiLDmt6O_ZEqbYkzgwsMfg9Flz0XcdIKc',
  redirect_uri: 'http://localhost:8080',
  name: 'MVPSolo'
});

uber.authorization({ authorization_code: 'ababaa' }, 
  function (err, accessToken, refreshToken) {
    uber.getAuthorizeUrl(accessToken, function (err, res) {
      console.log(err);
      console.log(res);
    });
  });

app.use(express.static(__dirname + '/'));

app.listen(8080);


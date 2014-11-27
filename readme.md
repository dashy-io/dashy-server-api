dashy-server-api
================
Dashboard Management Platform - Server API

[![Codeship Status for dashy-io/dashy-server-api](https://codeship.com/projects/669bc9e0-5795-0132-c62d-2aedc25d7739/status)](https://codeship.com/projects/49856)

### GET /status

Returns 200 OK

Example: http://api.dashy.io/status

### GET /dashboards/:dashboard-id
Returns dashboard by id

If dashboard is configured:
```js
{
  "interval" : 15,
  "name" : "Test Dashboard",
  "urls" : [ 
    "http://citydashboard.org/london/",
    "http://www.casa.ucl.ac.uk/cumulus/ipad.html",
    "http://www.gridwatch.templar.co.uk/",
    "http://www.casa.ucl.ac.uk/weather/colours.html"
  ]
}
```
Example: http://api.dashy.io/dashboards/test

If dashboad not configured:
```js
{
    'short_code' : 'SHORT-CODE'
}
```
Example: http://api.dashy.io/dashboards/test-bad

### POST /dashboards/:dashboard-id
Saves dashboard

### POST /user/:user-id/claim/:dashboad-short-code
Claims a dashboard and connects it to a user's account

### GET /user/:user-id
Returns user details and associated dashboard
```js
{
  "id" : "test-user",
  "name" : "Test User",
  "dashboards": [ 
    "test" 
  ]
}
```
Example: http://api.dashy.io/user/test-user

### POST /user/:user-id
Sets user details

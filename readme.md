dashy-server-api
================
Dashboard Management Platform - Server API

[![Codeship Status for dashy-io/dashy-server-api](https://codeship.com/projects/669bc9e0-5795-0132-c62d-2aedc25d7739/status)](https://codeship.com/projects/49856)

### GET /status

Returns 200 OK

Example: http://api.dashy.io/status

### GET /dashboards/:dashboard-id
Returns dashboard by id
```bash
curl http://api.dashy.io/dashboards/test-dashboard
```

If dashboard is configured:
```js
{
  "id" : "test-dashboard",
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
Example: http://api.dashy.io/dashboards/test-dashboard

If dashboad not configured:
```js
{
    'short_code' : 'SHORT-CODE'
}
```
Example: http://api.dashy.io/dashboards/test-bad

### PUT /dashboards/:dashboard-id
Saves dashboard configuration

```bash
curl -X PUT -H 'Content-Type: application/json' http://api.dashy.io/dashboards/test-dashboard -d @- << EOF
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
EOF
```

### POST /dashboards/
Creates a new dashboard

**Note:** Content-Type must be set to application/json.

```bash
curl -X POST -H 'Content-Type: application/json' http://api.dashy.io/dashboards -d @- << EOF
{
  "id" : "test-dashboard",
  "interval" : 15,
  "name" : "Test Dashboard",
  "urls" : [
    "http://citydashboard.org/london/",
    "http://www.casa.ucl.ac.uk/cumulus/ipad.html",
    "http://www.gridwatch.templar.co.uk/",
    "http://www.casa.ucl.ac.uk/weather/colours.html"
  ]
}
EOF
```

### POST /users/:user-id/claims/
Claims a dashboard by providing a SHORT-CODE and connects it to a user's account.

### GET /users/:user-id
Returns user details and associated dashboard
```js
{
  "id" : "test-user",
  "name" : "Test User",
  "dashboards": [
    "test-dashboard"
  ]
}
```
Example: http://api.dashy.io/users/test-user

### POST /users/:user-id
Sets user details

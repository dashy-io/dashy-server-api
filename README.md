dashy-server-api
================
Dashboard Management Platform - Server API

[![Codeship Status for dashy-io/dashy-server-api](https://codeship.com/projects/669bc9e0-5795-0132-c62d-2aedc25d7739/status)](https://codeship.com/projects/49856)

### GET /status

Status check.

Returns:
 - `200 OK` if the system is working

Example: http://api.dashy.io/status

### GET /dashboards/:dashboard-id

Returns a dashboard if it exists or a short-code.

Returns:
 - `200 OK` if the dashboard exists
 - `404 Not Found` if the dashboard was not found

Example: http://api.dashy.io/dashboards/test-dashboard
```bash
curl http://api.dashy.io/dashboards/test-dashboard
```

Example: http://api.dashy.io/dashboards/test-dashboard
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

### POST /dashboards

Creates a new dashboard

**Note:** Content-Type must be set to application/json.

Returns:
 - `201 Created` If a new dashboard was created
 - `409 Conflict` If the posted json data contains an ID property

Example:
```bash
curl -X POST -H 'Content-Type: application/json' http://api.dashy.io/dashboards -d @- << EOF
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

### PUT /dashboards/:dashboard-id
Updates an existing dashboard

**Note:** Content-Type must be set to application/json.

Returns:
 - `200 OK` if the dashboard was updated
 - `404 Not Found` if the dashboard was not found
 - `409 Conflict` If the posted json data contains an ID property

Example:
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

### DELETE /dashboards/:dashboard-id

Deletes a dashboard

Returns:
 - `204 No Content` If the dashboard was deleted
 - `404 Not Found` If the dashboard was not found

### WIP: POST /users/:user-id/claims/

Claims a dashboard by providing a SHORT-CODE and connects it to a user's account.

Example:
```bash
curl -X DELETE http://api.dashy.io/test-dashboard-1
```

### WIP: GET /users/:user-id

Returns user details and associated dashboard

Example: http://api.dashy.io/users/test-user
```js
{
  "id" : "test-user",
  "name" : "Test User",
  "dashboards": [
    "test-dashboard"
  ]
}
```

### WIP: POST /users/:user-id

Sets user details

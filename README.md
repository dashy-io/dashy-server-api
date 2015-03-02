# dashy-server-api
### Aiming to release stable [1.0.0](https://github.com/dashy-io/dashy-server-api/milestones/1.0.0) on 15 March 2015
Dashboard Management Platform - Server API

[![Codeship Status for dashy-io/dashy-server-api](https://codeship.com/projects/669bc9e0-5795-0132-c62d-2aedc25d7739/status)](https://codeship.com/projects/49856)
[![Stories in Ready](https://badge.waffle.io/dashy-io/dashy-server-api.png?label=ready&title=Ready)](https://waffle.io/dashy-io/dashy-server-api)

[![Uptime Report for api.dashy.io: Last 30  days](https://share.pingdom.com/banners/26424ea8)](http://stats.pingdom.com/bg5bhl3d7504/1481718)
[![Response Time Report for api.dashy.io: Last 30 days](https://share.pingdom.com/banners/a3efa098)](http://stats.pingdom.com/bg5bhl3d7504/1481718)

### GET /status

Status check.

Returns:
 - `200 OK` if the system is working

Example: http://api.dashy.io/status
```bash
curl http://api.dashy.io/dashboards/status
```

```js
{
  "env": "production"
}
```

### GET /dashboards/:dashboard-id

Returns a dashboard configuration

Returns:
 - `200 OK` if the dashboard exists
 - `404 Not Found` if the dashboard was not found

Example: http://api.dashy.io/dashboards/example-dashboard
```bash
curl http://api.dashy.io/dashboards/example-dashboard
```

Example: http://api.dashy.io/dashboards/example-dashboard
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

Creates a new dashboard and implicitly an new short-code

**Note:** Content-Type must be set to application/json.

Returns:
 - `201 Created` If a new dashboard was created
 - `409 Conflict` If a dashboard with the same ID already exists
 - `400 Bad Request` If ID not specified in the body
 - `400 Bad Request` If there are unexpected parameters in the body
 
Example:
```bash
curl -X POST -H 'Content-Type: application/json' http://api.dashy.io/dashboards -d @- << EOF
{
  "id" : "c98ba5ef-08c1-4360-9eb3-85c4530e0d1a"
}
EOF
```

### PUT /dashboards/:dashboard-id
Updates an existing dashboard

**Note:** Content-Type must be set to application/json.

Returns:
 - `200 OK` If the dashboard was updated
 - `404 Not Found` If the dashboard was not found
 - `409 Conflict` If the dashboard ID in the body does not match the one in the url
 - `400 Bad Request` If there are unexpected parameters in the body
 - `409 Conflict` If trying to modify the code property

Example:
```bash
curl -X PUT -H 'Content-Type: application/json' http://api.dashy.io/dashboards/example-dashboard -d @- << EOF
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

Returns:
 - `200 OK` if the system is working

Example: http://api.dashy.io/status

### GET /dashboards/:dashboard-id/code

Returns the short-code of a dashboard

Returns:
 - `200 OK` if the dashboard exists
 - `404 Not Found` if the dashboard was not found

Example: http://api.dashy.io/dashboards/example-dashboard/code
```bash
curl http://api.dashy.io/dashboards/example-dashboard/code
```
```js
{
  "code" : "12345678"
}
```

### WIP: POST /users/:user-id/claims/

Claims a dashboard by providing a SHORT-CODE and connects it to a user's account.

Example:
```bash
curl -X DELETE http://api.dashy.io/example-dashboard
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

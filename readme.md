dashy-server-api
================
Dashboard Management Platform - Server API

[![Codeship Status for dashy-io/dashy-server-api](https://codeship.com/projects/669bc9e0-5795-0132-c62d-2aedc25d7739/status)](https://codeship.com/projects/49856)

### GET /status
Returns 200 OK

### GET /dashboards/:dashboard-id
Returns dashboard by id

If no config present:
```js
{
    'short_code' : 'SHORT-CODE'
}
```

If config present:
```js
{
    'interval' : 60
    'urls' : [
        'http://example.com'
    ]
}
```

### POST /dashboards/:dashboard-id
Saves dashboard

### POST /user/:user-id/claim/:dashboad-short-code
Claims a dashboard and connects it to a user's account

### GET /user/:user-id
Returns user details and associated dashboard

### POST /user/:user-id
Sets user details

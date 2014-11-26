dashy-server-api
================
Dashboard Management Platform - Server API

[![Codeship Status for dashy-io/dashy-server-api](https://codeship.com/projects/669bc9e0-5795-0132-c62d-2aedc25d7739/status)](https://codeship.com/projects/49856)

### GET /status
Returns 200 OK

### GET /config?token=UUID
Load config for dashy-client

If no config present:
```js
{
    'short_code': 'SHORT-CODE'
}
```

If config present:
```js
{
    'urls': [
        'http://example.com'
    ]
}
```

### POST /claim/SHORT-CODE
Claims a dashy-client and connects it to a user's account
    
### POST /config?token=UUID
Set config for a specific dashy-client

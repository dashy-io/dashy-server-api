dashy-server-api
================
Dashboard Management Platform - Server API

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

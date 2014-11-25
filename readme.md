Load config for dashy-client
    GET /config?token=UUID

If no config present:
    {
        'short_code': 'SHORT-CODE'
    }

If config present:
    {
        'urls': [
            'http://example.com'
        ]
    }

Claim a dashy-client to user's account
    /claim?code=SHORT-CODE

Set config for dashy-client
    POST /config?token=UUID
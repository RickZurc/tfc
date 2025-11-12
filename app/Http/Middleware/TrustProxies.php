<?php

namespace App\Http\Middleware;

use Fideloper\Proxy\TrustProxies as MiddlewareProxy;
use Illuminate\Http\Request;

class TrustProxies extends MiddlewareProxy
{
    /**
     * The trusted proxies for this application.
     *
     * Use '*' to trust all proxies (safe behind a trusted reverse proxy).
     *
     * @var array|string|null
     */
    protected $proxies = '*';

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_FOR
        | Request::HEADER_X_FORWARDED_HOST
        | Request::HEADER_X_FORWARDED_PORT
        | Request::HEADER_X_FORWARDED_PROTO
        | Request::HEADER_X_FORWARDED_AWS_ELB;
}

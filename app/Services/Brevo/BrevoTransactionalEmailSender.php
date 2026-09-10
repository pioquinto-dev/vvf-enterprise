<?php

namespace App\Services\Brevo;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use RuntimeException;

class BrevoTransactionalEmailSender
{
    public function __construct(private readonly HttpFactory $http) {}

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function send(array $payload): array
    {
        $apiKey = (string) config('services.brevo.api_key', '');

        if ($apiKey === '') {
            throw new RuntimeException('BREVO_API_KEY is not configured.');
        }

        try {
            $response = $this->http
                ->acceptJson()
                // Bound the call so a slow/unreachable Brevo endpoint can never
                // hang the HTTP request it runs inside. This send happens
                // synchronously during the Google sign-in callback (new-user
                // registration email), so an unbounded wait there surfaces to
                // the user as a gateway (504) timeout.
                ->connectTimeout(5)
                ->timeout(15)
                ->withHeaders([
                    'api-key' => $apiKey,
                ])
                ->withOptions([
                    // Match the Apify client: ignore inherited machine proxy
                    // settings unless Brevo is explicitly configured to use one.
                    'proxy' => filled(config('services.brevo.proxy')) ? (string) config('services.brevo.proxy') : '',
                ])
                ->post('https://api.brevo.com/v3/smtp/email', $payload);
        } catch (ConnectionException $e) {
            throw new RuntimeException(
                'Brevo connection failed for https://api.brevo.com/v3/smtp/email. Check BREVO proxy/network settings and whether the upstream endpoint is reachable. Original error: '.$e->getMessage(),
                previous: $e,
            );
        }

        $this->throwIfFailed($response);

        /** @var array<string, mixed> $json */
        $json = $response->json();

        return $json;
    }

    private function throwIfFailed(Response $response): void
    {
        if ($response->successful()) {
            return;
        }

        $message = (string) data_get($response->json(), 'message', $response->body());

        throw new RuntimeException(sprintf(
            'Brevo request failed with status %d: %s',
            $response->status(),
            $message,
        ));
    }
}

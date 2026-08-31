<?php

namespace App\Services\Brevo;

use Illuminate\Http\Client\Factory as HttpFactory;
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

        $response = $this->http
            ->acceptJson()
            ->withHeaders([
                'api-key' => $apiKey,
            ])
            ->post('https://api.brevo.com/v3/smtp/email', $payload);

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

<?php

namespace App\Services\Stripe;

use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Event;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Exception\UnexpectedValueException;

class StripeClient
{
    public function __construct(private readonly \Stripe\StripeClient $client) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createCheckoutSession(array $payload): Session
    {
        /** @var Session $session */
        $session = $this->client->checkout->sessions->create($payload);

        return $session;
    }

    public function retrieveCheckoutSession(string $sessionId): Session
    {
        /** @var Session $session */
        $session = $this->client->checkout->sessions->retrieve($sessionId, []);

        return $session;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createCustomer(array $payload): Customer
    {
        /** @var Customer $customer */
        $customer = $this->client->customers->create($payload);

        return $customer;
    }

    /**
     * @throws SignatureVerificationException
     * @throws UnexpectedValueException
     */
    public function constructWebhookEvent(string $payload, string $signature, string $secret): Event
    {
        return \Stripe\Webhook::constructEvent($payload, $signature, $secret);
    }
}

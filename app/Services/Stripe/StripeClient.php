<?php

namespace App\Services\Stripe;

use Stripe\Collection;
use Stripe\Customer;
use Stripe\Checkout\Session;
use Stripe\Event;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Exception\UnexpectedValueException;
use Stripe\SetupIntent;
use Stripe\Subscription as StripeSubscription;

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
     * @param  array<string, mixed>  $payload
     */
    public function createBillingPortalSession(array $payload): \Stripe\BillingPortal\Session
    {
        /** @var \Stripe\BillingPortal\Session $session */
        $session = $this->client->billingPortal->sessions->create($payload);

        return $session;
    }

    /**
     * @param  array<string, mixed>  $params
     */
    public function listInvoices(array $params): Collection
    {
        /** @var Collection $invoices */
        $invoices = $this->client->invoices->all($params);

        return $invoices;
    }

    /**
     * @param  array<string, mixed>  $params
     */
    public function retrieveInvoice(string $invoiceId, array $params = []): \Stripe\Invoice
    {
        /** @var \Stripe\Invoice $invoice */
        $invoice = $this->client->invoices->retrieve($invoiceId, $params);

        return $invoice;
    }

    /**
     * @param  array<string, mixed>  $params
     */
    public function listPaymentMethods(array $params): Collection
    {
        /** @var Collection $paymentMethods */
        $paymentMethods = $this->client->paymentMethods->all($params);

        return $paymentMethods;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createSetupIntent(array $payload): SetupIntent
    {
        /** @var SetupIntent $intent */
        $intent = $this->client->setupIntents->create($payload);

        return $intent;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updateCustomer(string $customerId, array $payload): Customer
    {
        /** @var Customer $customer */
        $customer = $this->client->customers->update($customerId, $payload);

        return $customer;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updateSubscription(string $subscriptionId, array $payload): StripeSubscription
    {
        /** @var StripeSubscription $subscription */
        $subscription = $this->client->subscriptions->update($subscriptionId, $payload);

        return $subscription;
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

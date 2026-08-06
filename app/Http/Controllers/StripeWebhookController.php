<?php

namespace App\Http\Controllers;

use App\Services\Stripe\StripeClient;
use App\Services\Stripe\StripeWebhookProcessor;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Exception\UnexpectedValueException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly StripeWebhookProcessor $processor,
    ) {}

    public function __invoke(Request $request): Response
    {
        $secret = (string) config('services.stripe.webhook_secret', '');
        $signature = (string) $request->header('Stripe-Signature', '');

        if ($secret === '' || $signature === '') {
            return response('Webhook misconfigured.', SymfonyResponse::HTTP_BAD_REQUEST);
        }

        try {
            $event = $this->stripe->constructWebhookEvent(
                $request->getContent(),
                $signature,
                $secret,
            );
        } catch (UnexpectedValueException|SignatureVerificationException) {
            return response('Invalid webhook payload.', SymfonyResponse::HTTP_BAD_REQUEST);
        }

        $this->processor->handle($event);

        return response('ok', SymfonyResponse::HTTP_OK);
    }
}

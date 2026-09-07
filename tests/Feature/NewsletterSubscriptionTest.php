<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsletterSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_is_saved_and_normalized(): void
    {
        $response = $this->post('/newsletter', [
            'email' => '  Digest@Example.com ',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('status');

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'digest@example.com',
        ]);
    }

    public function test_duplicate_signup_does_not_create_a_second_row(): void
    {
        $this->post('/newsletter', ['email' => 'digest@example.com'])->assertRedirect();
        $this->post('/newsletter', ['email' => 'digest@example.com'])->assertRedirect();

        $this->assertDatabaseCount('newsletter_subscribers', 1);
    }

    public function test_invalid_email_is_rejected(): void
    {
        $response = $this->from('/')->post('/newsletter', [
            'email' => 'not-an-email',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertDatabaseCount('newsletter_subscribers', 0);
    }
}

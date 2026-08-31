<?php

namespace Tests\Unit;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use App\Support\BrevoTransactionalEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class BrevoTransactionalEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_done_uses_fallback_completion_label_when_latest_run_is_missing(): void
    {
        config()->set('brevo_notifications.notifications.search_done.template_id', 20);

        $user = User::factory()->make([
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
        ]);

        $search = new CustomKeywordSearch([
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => 'brand',
            'result_count' => 14,
            'public_id' => 'abcd1234efgh',
        ]);

        $payload = BrevoTransactionalEmail::searchDone($user, $search);

        $this->assertSame('just now', data_get($payload, 'params.latestRunAt'));
    }

    public function test_payload_throws_when_template_id_is_missing(): void
    {
        config()->set('brevo_notifications.notifications.search_done.template_id', null);

        $user = User::factory()->make([
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
        ]);

        $search = new CustomKeywordSearch([
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => 'brand',
            'result_count' => 14,
            'public_id' => 'abcd1234efgh',
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Brevo template ID is not configured for [search_done].');

        BrevoTransactionalEmail::searchDone($user, $search);
    }
}

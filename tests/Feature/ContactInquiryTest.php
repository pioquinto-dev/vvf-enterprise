<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContactInquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_contact_page(): void
    {
        $user = User::factory()->create([
            'name' => 'Taylor',
            'email' => 'taylor@example.com',
        ]);

        $this->actingAs($user)
            ->get('/contact')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Contact')
                ->where('defaults.name', 'Taylor')
                ->where('defaults.email', 'taylor@example.com'));
    }

    public function test_authenticated_user_can_submit_inquiry(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/contact', [
                'name' => 'Taylor',
                'email' => 'taylor@example.com',
                'category' => 'billing',
                'subject' => 'Invoice help',
                'message' => 'I need a copy of my latest invoice.',
            ])
            ->assertRedirect('/contact');

        $this->assertDatabaseHas('inquiries', [
            'user_id' => $user->id,
            'name' => 'Taylor',
            'email' => 'taylor@example.com',
            'category' => 'billing',
            'subject' => 'Invoice help',
        ]);
    }

    public function test_admin_inquiries_listing_renders_saved_rows(): void
    {
        config()->set('admin.root_name', 'Root Admin');
        config()->set('admin.root_email', 'admin@example.com');
        config()->set('admin.root_password', 'super-secret');
        config()->set('admin.session_key', 'admin.authenticated');

        Inquiry::create([
            'name' => 'Taylor',
            'email' => 'taylor@example.com',
            'category' => 'bug-report',
            'subject' => 'Broken dashboard',
            'message' => 'The dashboard does not load after login.',
        ]);

        $this->withSession(['admin.authenticated' => true, 'admin.user' => ['email' => 'admin@example.com']])
            ->get('/x/admin/inquiries')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Listing')
                ->where('title', 'Inquiries')
                ->where('rows.0.contact', 'Taylor / taylor@example.com')
                ->where('rows.0.category', 'Bug Report')
                ->where('pagination.total', 1));
    }
}

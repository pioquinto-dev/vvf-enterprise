<?php

namespace App\Repositories\Admin;

class AdminDashboardRepository
{
    /**
     * @return array<int, array<string, string>>
     */
    public function sections(): array
    {
        return [
            ['group' => 'overview', 'label' => 'Dashboard'],
            ['group' => 'overview', 'label' => 'Activity Log'],
            ['group' => 'content', 'label' => 'Viral Videos'],
            ['group' => 'content', 'label' => 'Searches'],
            ['group' => 'content', 'label' => 'Keyword Index'],
            ['group' => 'content', 'label' => 'Inquiries'],
            ['group' => 'content', 'label' => 'Plans'],
            ['group' => 'subscription-management', 'label' => 'Subscription'],
            ['group' => 'user-management', 'label' => 'Users'],
            ['group' => 'user-management', 'label' => 'Admin Users'],
        ];
    }
}

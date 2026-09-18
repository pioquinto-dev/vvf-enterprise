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
            ['group' => 'catalog', 'label' => 'Viral Videos'],
            ['group' => 'catalog', 'label' => 'Searches'],
            ['group' => 'catalog', 'label' => 'Keyword Index'],
            ['group' => 'catalog', 'label' => 'Plans'],
            ['group' => 'messaging', 'label' => 'Email Templates'],
            ['group' => 'messaging', 'label' => 'Inquiries'],
            ['group' => 'subscription-management', 'label' => 'Subscription'],
            ['group' => 'user-management', 'label' => 'Users'],
            ['group' => 'user-management', 'label' => 'Admin Users'],
        ];
    }
}

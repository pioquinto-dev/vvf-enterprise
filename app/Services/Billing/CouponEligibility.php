<?php

namespace App\Services\Billing;

/**
 * Immutable result of a coupon-program eligibility check. When {@see $allowed}
 * is false the remaining fields describe the block for the dashboard modal.
 */
class CouponEligibility
{
    public function __construct(
        public readonly bool $allowed,
        public readonly ?string $errorKey = null,
        public readonly ?string $title = null,
        public readonly ?string $detail = null,
    ) {}

    public static function allow(): self
    {
        return new self(true);
    }

    public static function block(string $errorKey, string $title, string $detail): self
    {
        return new self(false, $errorKey, $title, $detail);
    }

    /**
     * @return array{errorKey: string, title: string, detail: string}
     */
    public function toPromptArray(string $program): array
    {
        return [
            'errorKey' => (string) $this->errorKey,
            'title' => (string) $this->title,
            'detail' => (string) $this->detail,
            'program' => $program,
        ];
    }
}

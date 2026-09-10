<?php

namespace App\Services\Admin;

use App\Models\CriticalErrorLog;
use Illuminate\Http\Request;

class CriticalErrorLogService
{
    /** @return array<string, mixed> */
    public function recentPayload(int $limit = 5): array
    {
        return [
            'rows' => $this->mapRows(
                CriticalErrorLog::query()
                    ->whereNull('resolved_at')
                    ->latest('created_at')
                    ->limit($limit)
                    ->get()
            ),
            'unresolvedCount' => CriticalErrorLog::query()->whereNull('resolved_at')->count(),
        ];
    }

    /** @return array<string, mixed> */
    public function logPayload(Request $request): array
    {
        $status = (string) $request->query('status', 'unresolved');
        $status = in_array($status, ['unresolved', 'resolved', 'all'], true) ? $status : 'unresolved';
        $event = trim((string) $request->query('event', 'all'));

        $query = CriticalErrorLog::query()
            ->when($status === 'unresolved', fn ($builder) => $builder->whereNull('resolved_at'))
            ->when($status === 'resolved', fn ($builder) => $builder->whereNotNull('resolved_at'))
            ->when($event !== '' && $event !== 'all', fn ($builder) => $builder->where('event', $event))
            ->latest('created_at');

        $logs = $query->paginate(50)->withQueryString();

        return [
            'rows' => $this->mapRows($logs->getCollection()),
            'filters' => ['status' => $status, 'event' => $event ?: 'all'],
            'events' => CriticalErrorLog::query()->distinct()->orderBy('event')->pluck('event')->values()->all(),
            'pagination' => [
                'currentPage' => $logs->currentPage(),
                'lastPage' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ];
    }

    public function resolve(CriticalErrorLog $log): void
    {
        if ($log->resolved_at === null) {
            $log->forceFill(['resolved_at' => now()])->save();
        }
    }

    /** @return list<array<string, mixed>> */
    private function mapRows(iterable $logs): array
    {
        return collect($logs)->map(fn (CriticalErrorLog $log): array => [
            'id' => $log->id,
            'event' => $log->event,
            'message' => $log->message,
            'exceptionClass' => $log->exception_class,
            'file' => $log->file,
            'line' => $log->line,
            'context' => $log->context,
            'date' => $log->created_at?->toIso8601String(),
            'resolvedAt' => $log->resolved_at?->toIso8601String(),
        ])->values()->all();
    }
}

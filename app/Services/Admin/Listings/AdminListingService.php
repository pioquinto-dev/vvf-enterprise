<?php

namespace App\Services\Admin\Listings;

use App\Repositories\Admin\Listings\AdminListingRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class AdminListingService
{
    private const PER_PAGE = 25;

    public function __construct(
        private readonly AdminListingRepository $listings,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function listing(string $resource, Request $request): array
    {
        $search = trim((string) $request->query('search', ''));
        $page = max(1, (int) $request->query('page', 1));
        $definitions = $this->listings->filterDefinitions($resource);
        $activeFilters = [];
        $dateFrom = trim((string) $request->query('date_from', ''));
        $dateTo = trim((string) $request->query('date_to', ''));

        foreach ($definitions as $index => $definition) {
            $value = trim((string) $request->query($definition['name'], ''));

            // The UI renders the chip from the definition, so the selected
            // value has to travel with it — not only in the query bag.
            $definitions[$index]['value'] = $value;

            if ($definition['name'] === 'date') {
                $definitions[$index]['dateFrom'] = $dateFrom;
                $definitions[$index]['dateTo'] = $dateTo;
            }

            if ($value !== '') {
                $activeFilters[$definition['name']] = $value;
            }
        }

        if ($dateFrom !== '') {
            $activeFilters['date_from'] = $dateFrom;
        }

        if ($dateTo !== '') {
            $activeFilters['date_to'] = $dateTo;
        }

        [$rows, $total, $insights] = $this->rows($resource, $search, $activeFilters, $page);

        $lastPage = max(1, (int) ceil($total / self::PER_PAGE));

        return [
            'area' => 'admin',
            'resource' => $resource,
            'title' => $this->listings->title($resource),
            'search' => $search,
            'searchPlaceholder' => $this->listings->searchPlaceholder($resource),
            'filters' => $definitions,
            'columns' => $this->listings->columns($resource),
            'rows' => $rows,
            'capabilities' => $this->listings->capabilities($resource),
            'editableFields' => $this->listings->editableFields($resource),
            'createValues' => $this->listings->createValues($resource),
            'emptyMessage' => $this->listings->emptyMessage($resource),
            'insights' => $insights,
            'pagination' => [
                'page' => min($page, $lastPage),
                'perPage' => self::PER_PAGE,
                'total' => $total,
                'lastPage' => $lastPage,
                'from' => $total === 0 ? 0 : (($page - 1) * self::PER_PAGE) + 1,
                'to' => min($page * self::PER_PAGE, $total),
            ],
            'query' => [
                'search' => $search,
                ...$activeFilters,
            ],
        ];
    }

    /**
     * Values for the edit drawer of a single record.
     *
     * @return array<string, mixed>
     */
    public function editPayload(string $resource, Model $record): array
    {
        return $this->listings->editValues($resource, $record);
    }

    /**
     * @param  array<string, string>  $activeFilters
     * @return array{0: array<int, array<string, mixed>>, 1: int, 2: array<int, array<string, string>>}
     */
    private function rows(string $resource, string $search, array $activeFilters, int $page): array
    {
        $query = $this->listings->query($resource);

        // Config-backed resources (admin users) have no table to page through.
        if ($query === null) {
            $rows = Collection::make($this->listings->staticRows($resource))
                ->filter(fn (array $row) => $search === '' || Collection::make($row)
                    ->contains(fn ($value) => str_contains(mb_strtolower((string) $value), mb_strtolower($search))))
                ->values();

            return [$rows->all(), $rows->count(), []];
        }

        if ($search !== '') {
            $this->listings->applySearch($resource, $query, $search);
        }

        foreach ($activeFilters as $name => $value) {
            $this->listings->applyFilter($resource, $query, $name, $value, $activeFilters);
        }

        $insights = $resource === 'searches'
            ? $this->listings->searchInsights(clone $query, $activeFilters)
            : [];

        $total = (clone $query)->count();

        $records = $query
            ->latest($query->getModel()->getQualifiedCreatedAtColumn())
            ->forPage($page, self::PER_PAGE)
            ->get();

        // The drawer edits in place, so each row carries its own current field
        // values — no second request when the menu is opened.
        $rows = $records->map(fn (Model $record) => [
            ...$this->listings->mapRow($resource, $record),
            'values' => $this->listings->editValues($resource, $record),
            'trashed' => method_exists($record, 'trashed') && $record->trashed(),
            'archived' => isset($record->archived_at) && $record->archived_at !== null,
        ])->all();

        return [$rows, $total, $insights];
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Repositories\Admin\Listings\AdminListingRepository;
use App\Services\Admin\Listings\AdminListingMutator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * One controller for every listing's row actions. The listings already share a
 * definition layer, so per-resource controllers would only duplicate lookup and
 * capability checks.
 */
class AdminRecordController extends Controller
{
    public function __construct(
        private readonly AdminListingMutator $mutator,
        private readonly AdminListingRepository $listings,
    ) {}

    public function update(Request $request, string $resource, string $id): RedirectResponse
    {
        $record = $this->resolve($resource, $id, 'edit');

        $fields = $this->listings->editableFields($resource);
        $rules = [];

        foreach ($fields as $field) {
            // A field can declare its own rules (uniqueness, min length). `{id}`
            // stands in for the record being edited so a unique rule ignores it.
            if (isset($field['rules'])) {
                $rules[$field['name']] = array_map(
                    fn (string $rule): string => str_replace('{id}', (string) $record->getKey(), $rule),
                    $field['rules'],
                );

                continue;
            }

            $rules[$field['name']] = match ($field['type']) {
                'number' => ['nullable', 'numeric', 'min:0'],
                'toggle' => ['nullable', 'boolean'],
                // Options may be plain strings or {value,label} pairs.
                'select' => ['nullable', 'string', 'in:'.implode(',', array_map(
                    fn ($option) => is_array($option) ? $option['value'] : $option,
                    $field['options'] ?? [],
                ))],
                default => ['nullable', 'string', 'max:500'],
            };
        }

        $this->mutator->update($resource, $record, $request->validate($rules));

        return back()->with('status', 'Record updated.');
    }

    public function archive(Request $request, string $resource, string $id): RedirectResponse
    {
        $record = $this->resolve($resource, $id, 'archive');

        $this->mutator->archive($record, (bool) $request->boolean('archived', true));

        return back()->with('status', $request->boolean('archived', true) ? 'Record archived.' : 'Record restored to live.');
    }

    public function destroy(string $resource, string $id): RedirectResponse
    {
        $record = $this->resolve($resource, $id, 'delete');

        $this->mutator->delete($record);

        return back()->with('status', 'Record deleted. It can still be restored.');
    }

    public function restore(string $resource, string $id): RedirectResponse
    {
        $record = $this->resolve($resource, $id, 'delete');

        $this->mutator->restore($record);

        return back()->with('status', 'Record restored.');
    }

    private function resolve(string $resource, string $id, string $capability): \Illuminate\Database\Eloquent\Model
    {
        if (($this->listings->capabilities($resource)[$capability] ?? false) !== true) {
            throw new NotFoundHttpException("This resource does not support {$capability}.");
        }

        $record = $this->mutator->find($resource, $id);

        if ($record === null) {
            throw new NotFoundHttpException('Record not found.');
        }

        return $record;
    }
}

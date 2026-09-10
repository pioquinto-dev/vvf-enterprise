<?php

namespace App\Http\Requests;

use App\Models\CustomKeywordSearch;
use Illuminate\Foundation\Http\FormRequest;

class StoreSavedSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxPhrase = (int) config('custom_keyword_search.limits.max_phrase_length', 120);

        return [
            'type' => ['required', 'in:'.implode(',', CustomKeywordSearch::allowedTypes())],
            'phrase' => ['required', 'string', 'max:'.$maxPhrase],
            'name' => ['nullable', 'string', 'max:'.config('custom_keyword_search.limits.max_name_length', 80)],
            'keywords' => ['required', 'array', 'min:1', 'max:'.config('custom_keyword_search.limits.max_keywords', 12)],
            'keywords.*' => ['string', 'max:'.$maxPhrase],
            'frequency' => ['required', 'in:'.CustomKeywordSearch::FREQUENCY_WEEKLY],
            'refresh_existing' => ['nullable', 'boolean'],
            'sources' => ['nullable', 'array'],
            'sources.tiktokHandle' => ['nullable', 'string', 'max:120'],
            'sources.website' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'keywords.max' => 'A search can carry at most :max keywords.',
            'frequency.in' => 'Choose the weekly refresh.',
        ];
    }
}

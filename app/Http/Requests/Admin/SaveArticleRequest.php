<?php

namespace App\Http\Requests\Admin;

use App\Support\BlogContent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->session()->get(config('admin.session_key')) === true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('tag_ids')) {
            $this->merge(['tag_ids' => []]);
        }
        if (is_array($this->input('blocks'))) {
            $this->merge(['blocks' => array_map(function ($block) {
                if (is_array($block) && ($block['type'] ?? '') === 'list' && ! array_key_exists('items', $block)) {
                    $block['items'] = [];
                }

                return $block;
            }, $this->input('blocks'))]);
        }
        if (is_array($this->input('blocks'))) {
            $this->merge(['blocks' => array_map(function ($block) {
                if (is_array($block) && ($block['type'] ?? '') === 'list' && ! array_key_exists('items', $block)) {
                    $block['items'] = [];
                }

                return $block;
            }, $this->input('blocks'))]);
        }
        if (is_string($this->input('slug'))) {
            $this->merge(['slug' => Str::slug($this->input('slug'))]);
        }
    }

    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('articles')->ignore($this->route('article'))],
            'excerpt' => 'nullable|string|max:500', 'status' => 'required|in:draft,published',
            'is_featured' => 'required|boolean', 'published_at' => 'nullable|date',
            'category_id' => 'nullable|integer|exists:categories,id',
            'tag_ids' => 'present|array|max:100', 'tag_ids.*' => 'integer|distinct|exists:tags,id',
            'layout' => 'required|in:standard,guide,analysis',
            'blocks' => 'required|array|min:1|max:250', 'blocks.*' => 'required|array',
            'blocks.*.type' => ['required', Rule::in(array_keys(BlogContent::FIELDS))],
            'heroImageUpload' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ];
        foreach (array_unique(array_merge(...array_values(BlogContent::FIELDS))) as $field) {
            $rules['blocks.*.'.$field] = 'nullable|string|max:20000';
        }
        $rules['blocks.*.level'] = 'sometimes|integer|between:1,3';
        $rules['blocks.*.style'] = 'sometimes|in:bullet,ordered';
        $rules['blocks.*.tone'] = 'sometimes|in:info,tip,warning';
        $rules['blocks.*.items'] = 'sometimes|array|max:200';
        $rules['blocks.*.items.*'] = 'nullable|string|max:20000';

        return $rules;
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            foreach ($this->input('blocks', []) as $i => $block) {
                foreach (BlogContent::FIELDS[$block['type']] as $field) {
                    $value = $block[$field] ?? '';
                    if ($value === null) {
                        continue;
                    }
                    if (! is_string($value) || mb_strlen($value) > (in_array($field, ['url', 'src', 'button_url']) ? 2048 : 20000)) {
                        $validator->errors()->add("blocks.$i.$field", 'Use text within the allowed length.');
                    } elseif ($value !== '' && in_array($field, ['url', 'src', 'button_url'])) {
                        $valid = $block['type'] === 'embed' ? BlogContent::embedUrl($value) !== null : BlogContent::safeUrl($value, true);
                        if (! $valid) {
                            $validator->errors()->add("blocks.$i.$field", $block['type'] === 'embed' ? 'Use an HTTPS YouTube or Vimeo video URL.' : 'Use an http(s) URL or a local path starting with /.');
                        }
                    }
                }
                if ($block['type'] === 'list' && (! is_array($block['items'] ?? null) || count($block['items']) > 200 || collect($block['items'])->contains(fn ($v) => ! is_string($v) && $v !== null || is_string($v) && mb_strlen($v) > 20000))) {
                    $validator->errors()->add("blocks.$i.items", 'Provide up to 200 text items.');
                }
                if ($block['type'] === 'heading' && ! in_array($block['level'] ?? null, [1, 2, 3, '1', '2', '3'], true)) {
                    $validator->errors()->add("blocks.$i.level", 'Choose heading level 1, 2 or 3.');
                }
                if ($block['type'] === 'callout' && ! in_array($block['tone'] ?? '', ['info', 'tip', 'warning'], true)) {
                    $validator->errors()->add("blocks.$i.tone", 'Choose a valid tone.');
                }
                if ($block['type'] === 'list' && ! in_array($block['style'] ?? '', ['bullet', 'ordered'], true)) {
                    $validator->errors()->add("blocks.$i.style", 'Choose a valid list style.');
                }
            }
        }];
    }
}

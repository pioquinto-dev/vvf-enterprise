# Blog management

The module provides article CRUD and duplication, all ten structured plain-text blocks, categories/tags, bulk actions, featured ordering, and public listing/detail pages. It uses Brand Beacon branding and this application's admin session. Hook Templates and source-site data migration are outside this module.

## Deployment

1. Run `php artisan migrate` to apply the additive blog tables migration. No existing business tables are modified by that migration.
2. Run `npm run build` and deploy the client assets and SSR bundle together. Run the existing Inertia SSR service (`php artisan inertia:start-ssr`) under the application's process supervisor for server-rendered article content and metadata.
3. Configure `BLOG_MEDIA_DISK` if the default (S3 when `AWS_BUCKET` exists, otherwise public) is unsuitable. `BLOG_MEDIA_PREFIX` defaults to `blogs`. Reuse the destination's credentials. For the public disk, ensure `php artisan storage:link` has been run; for S3, ensure its configured URL serves uploaded objects publicly.
4. Open `/x/admin/blogs`, create categories/tags and an article, save a draft, then publish. Check `/blog` and the article URL as a signed-out visitor. Check an uploaded hero URL from the reader page.

The implementation does not run deployment migrations against your configured database, publish sample content, or import source-site records. To migrate existing content, copy taxonomy, articles and pivot links with an explicit ID mapping and preserve slugs/timestamps; copy storage objects before rewriting hero path maps and inline image URLs. Inspect unsupported legacy nodes before conversion. There is no source database in this workspace to import from.

## Behavior decisions

- Every authenticated host admin has the same blog permissions. All read/write routes use `admin.auth`; article save requests also verify the admin session. Blog mutations log action, actor and resource identifiers through Laravel logging, without storing article bodies in the log.
- Publish is immediate; future dates are display metadata, not scheduled releases. Publication date inputs use the displayed application timezone. Draft saves and unpublish clear the date. Single publish preserves an existing date, while bulk publish assigns now.
- A manually edited slug is retained when the title changes. Search and category filters can be combined. Listing selection clears when rows change. Featured order reconciles with new server props after removal; stale membership submissions return a validation error.
- Layout is persisted for compatibility but all three layout options currently use the same public block renderer.
- All text is plain text, escaped by React. No HTML or Markdown input is interpreted. Links/images allow HTTP(S) or local paths. Embeds are restricted to YouTube and Vimeo and converted to HTTPS provider embed URLs. Invalid URLs are rejected on save and stripped during normalization of legacy records.
- Hero uploads accept JPEG, PNG, GIF and WebP up to 5 MiB. Imagick creates 480/960/1600px JPEG variants when installed; otherwise the original is used. Replacement uses new immutable paths, preserving references from duplicates. Deleted/replaced content may leave unused files; automatic cleanup is intentionally absent until media references can be inventoried reliably. An admin-only `POST /x/admin/blogs/images` endpoint accepts `image` and returns `{url}` for integrations; the inline image block UI accepts URLs.
- Public page responses are private and not cached, avoiding session-prop leakage and stale published content after unpublish. A previously downloaded page cannot be withdrawn from a reader's browser. The sitemap contains published article URLs. Filtered index pages are noindex; pagination is included in canonicals.
- Featured reorders lock current rows and validate the complete published-featured set. ID tie-breakers make equal positions deterministic. Concurrent changes to featured membership can require a page reload; there is no cross-request editorial revision/merge workflow.

## Verification

```powershell
php artisan test tests/Feature/BlogManagementTest.php tests/Unit/BlogContentTest.php
npm run build
```

If this Windows PHP installation has SQLite DLLs installed but disabled, use a process-only override without editing php.ini:

```powershell
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/phpunit/phpunit/phpunit tests/Feature/BlogManagementTest.php tests/Unit/BlogContentTest.php
```

Tests use an isolated in-memory SQLite database and cover authorization, publication, block round trips, URL rejection, taxonomy relationships, slug collisions, featured ordering, public filters, duplicate media and page contracts. Production storage access and an actual source-data migration require deployment-specific validation.

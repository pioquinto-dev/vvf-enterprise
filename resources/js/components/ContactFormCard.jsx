import { useForm, usePage } from '@inertiajs/react';

function FieldLabel({ children, optional = false }) {
    return (
        <label className="mb-2 block text-[12px] font-semibold text-[#111827] dark:text-white/92">
            {children}
            {optional ? <span className="ml-1 text-slate-400 dark:text-white/35">(Optional)</span> : null}
        </label>
    );
}

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-2 text-[12px] text-rose-500 dark:text-rose-300">{message}</p>;
}

export default function ContactFormCard({ categories = [], defaults = {}, className = '' }) {
    const { flash = {} } = usePage().props;
    const form = useForm({
        name: defaults.name ?? '',
        email: defaults.email ?? '',
        category: categories[0]?.value ?? 'general',
        subject: '',
        message: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => form.reset('subject', 'message'),
        });
    };

    return (
        <section
            className={`rounded-[30px] border border-black/[.06] bg-white px-5 py-6 text-[#111827] shadow-[0_24px_90px_-45px_rgba(15,23,42,.24)] sm:px-7 sm:py-8 lg:px-10 dark:border-white/[.09] dark:bg-[#0d1324] dark:text-white dark:shadow-[0_24px_90px_-45px_rgba(0,0,0,.95)] ${className}`.trim()}
        >
            <div className="max-w-3xl">
                <p className="text-[11px] font-semibold tracking-[.32em] text-[#ff4d9d] uppercase">Contact</p>
                <h1 className="mt-2 font-display text-[36px] font-bold tracking-[-.04em] text-[#111827] sm:text-[44px] dark:text-white">
                    Contact Us
                </h1>
                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-slate-600 dark:text-white/70">
                    Send a quick note and we&apos;ll follow up by email. If you&apos;re asking about AI analysis,
                    billing, or an account issue, add as much context as you can.
                </p>
            </div>

            {flash.status ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {flash.status}
                </div>
            ) : null}

            <form onSubmit={submit} className="mt-8 space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <FieldLabel>Name</FieldLabel>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#ff4d9d]/60 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25"
                            placeholder="Your name"
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                            className="h-12 w-full rounded-2xl border border-[#ff4d9d]/35 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#ff4d9d] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25"
                            placeholder="you@example.com"
                        />
                        <FieldError message={form.errors.email} />
                    </div>
                </div>

                <div>
                    <FieldLabel>Category</FieldLabel>
                    <select
                        value={form.data.category}
                        onChange={(event) => form.setData('category', event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition focus:border-slate-300 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:focus:border-white/30"
                    >
                        {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    <FieldError message={form.errors.category} />
                </div>

                <div>
                    <FieldLabel optional>Subject</FieldLabel>
                    <input
                        type="text"
                        value={form.data.subject}
                        onChange={(event) => form.setData('subject', event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-slate-300 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25 dark:focus:border-white/30"
                        placeholder="Example: Quick question about my account"
                    />
                    <FieldError message={form.errors.subject} />
                </div>

                <div>
                    <FieldLabel>Message</FieldLabel>
                    <textarea
                        value={form.data.message}
                        onChange={(event) => form.setData('message', event.target.value)}
                        className="min-h-[190px] w-full rounded-3xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-slate-300 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25 dark:focus:border-white/30"
                        placeholder="Tell us how we can help..."
                    />
                    <FieldError message={form.errors.message} />
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.08] dark:text-white/40">
                    <p>We&apos;ll use this message to follow up directly by email.</p>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#ff2f86] px-6 text-[13px] font-semibold text-white transition hover:bg-[#ff4d9d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {form.processing ? 'Sending...' : 'Send Inquiry'}
                    </button>
                </div>
            </form>
        </section>
    );
}

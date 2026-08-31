const TONE_STYLES = {
    warm: 'border-[rgba(230,183,67,.28)] bg-[linear-gradient(135deg,rgba(255,248,225,.96),rgba(255,255,255,.98))] text-[#5e4710]',
    amber: 'border-[rgba(214,153,46,.24)] bg-[linear-gradient(135deg,rgba(255,243,208,.95),rgba(255,255,255,.98))] text-[#6b4d00]',
    rose: 'border-[rgba(204,121,121,.2)] bg-[linear-gradient(135deg,rgba(255,244,241,.96),rgba(255,255,255,.98))] text-[#7b4035]',
    slate: 'border-[rgba(93,104,118,.16)] bg-[linear-gradient(135deg,rgba(247,248,250,.96),rgba(255,255,255,.98))] text-[#475467]',
};

export default function AdminInsightsStrip({ insights = [] }) {
    if (insights.length === 0) {
        return null;
    }

    return (
        <section className="mb-4 grid gap-3 lg:grid-cols-3">
            {insights.map((insight) => (
                <article
                    key={insight.label}
                    className={`rounded-xl border px-4 py-3 shadow-[0_1px_2px_rgba(20,15,0,.03),0_14px_34px_-30px_rgba(20,15,0,.18)] ${TONE_STYLES[insight.tone] ?? TONE_STYLES.slate}`}
                >
                    <p className="text-[10px] font-semibold uppercase tracking-[.16em] opacity-80">AI Insight</p>
                    <h3 className="mt-1 text-[14px] font-semibold text-[var(--ink)]">{insight.label}</h3>
                    <p className="mt-1 text-[13px] leading-5">{insight.body}</p>
                </article>
            ))}
        </section>
    );
}

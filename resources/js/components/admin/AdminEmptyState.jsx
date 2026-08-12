export default function AdminEmptyState({ title, message }) {
    return (
        <div className="px-5 py-14 text-center">
            <h3 className="text-[15px] font-semibold text-white">{title}</h3>
            <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-5 text-white/45">{message}</p>
        </div>
    );
}

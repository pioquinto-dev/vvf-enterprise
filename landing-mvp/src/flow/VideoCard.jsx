import { Play, Heart, Comment, Trend, Arrow } from '../components/Icons.jsx';

export function Thumb({ video, className = '' }) {
  return (
    <div
      className={`group relative flex items-center justify-center overflow-hidden rounded-2xl
        bg-linear-to-br ${video.gradient} shadow-[0_20px_44px_-24px_rgba(0,0,0,.85)] ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent"
      />

      <span className="absolute top-2.5 left-2.5 flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-white/95 px-1.5 font-display text-xs font-bold text-ink">
        {video.rank}
      </span>

      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
        <Play className="h-4 w-4 translate-x-px text-white" />
      </span>

      <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        {video.duration}
      </span>
      <span
        className="absolute bottom-2.5 left-2.5 rounded-md bg-hot px-1.5 py-0.5 text-[10px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(255,61,113,1)]"
        title="Outlier multiplier vs creator baseline"
      >
        {video.multiplier}
      </span>
    </div>
  );
}

export function FeaturedVideo({ video, handleOverride }) {
  return (
    <div className="ring-gradient mt-5 flex flex-col gap-6 rounded-3xl bg-white/70 p-5 backdrop-blur-2xl sm:flex-row sm:p-6 dark:bg-white/[.04]">
      <Thumb video={video} className="aspect-[9/16] w-full shrink-0 sm:w-[160px] lg:w-[184px]" />

      <div className="flex flex-1 flex-col">
        <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-hot/25 bg-hot/10 px-2.5 py-1 font-display text-[10.5px] font-bold tracking-[.1em] text-hot uppercase">
          <Trend className="h-3 w-3" /> Top video this period
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-[38px] leading-none font-bold tracking-[-.03em] text-hot sm:text-[46px]">
            {video.views}
          </span>
          <span className="text-sm font-medium muted">views</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] muted">
          <span className="flex items-center gap-1.5">
            <Heart /> {video.likes}
          </span>
          <span className="flex items-center gap-1.5">
            <Comment /> {video.comments}
          </span>
          <span>{video.posted}</span>
        </div>

        <div className="mt-4 text-sm font-semibold">{handleOverride || video.handle}</div>
        <p className="mt-2 text-[13.5px] leading-relaxed muted">{video.caption}</p>

        <div className="mt-6">
          <button className="btn-accent h-12 px-5 text-sm">
            View on TikTok <Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GridVideo({ video, handleOverride }) {
  return (
    <div className="group">
      <Thumb video={video} className="aspect-[9/16] w-full" />
      <div className="pt-3">
        <div className="flex items-center gap-1.5 font-display text-[16px] font-bold text-hot">
          <Trend className="h-3 w-3" /> {video.views}
        </div>
        <div className="mt-1.5 flex gap-3 text-[11.5px] faint">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {video.likes}
          </span>
          <span className="flex items-center gap-1">
            <Comment className="h-3 w-3" /> {video.comments}
          </span>
        </div>
        <div className="mt-2 truncate text-[12.5px] muted">{handleOverride || video.handle}</div>
        <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow">
          View on TikTok <Arrow className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

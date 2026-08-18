export function detectPlatform(video = {}) {
  const source = String(video.social_media_source || '').toLowerCase();
  if (source === 'tiktok') return 'tiktok';

  const haystacks = [video.embedUrl, video.postUrl, video.videoUrl, video.embed_url, video.post_url, video.video_url]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return haystacks.some((value) => value.includes('tiktok.com')) ? 'tiktok' : null;
}

export function buildTikTokPlayerUrl(videoId, autoplay = false) {
  if (!videoId) return null;

  const url = new URL(`https://www.tiktok.com/player/v1/${videoId}`);
  url.searchParams.set('autoplay', autoplay ? '1' : '0');
  url.searchParams.set('controls', '1');
  url.searchParams.set('progress_bar', '0');
  url.searchParams.set('play_button', '1');
  url.searchParams.set('volume_control', '1');
  url.searchParams.set('fullscreen_button', '0');
  url.searchParams.set('timestamp', '0');
  url.searchParams.set('music_info', '0');
  url.searchParams.set('description', '0');
  url.searchParams.set('rel', '0');
  url.searchParams.set('native_context_menu', '0');
  url.searchParams.set('closed_caption', '0');
  url.searchParams.set('muted', '0');

  return url.toString();
}

export function withTikTokAutoplay(url, autoplay) {
  if (!url) return null;

  try {
    const next = new URL(url);
    next.searchParams.set('autoplay', autoplay ? '1' : '0');
    return next.toString();
  } catch {
    return url;
  }
}

export function previewImageFor(video = {}) {
  return video.thumbnailUrl || video.thumbnail_url || video.cover || null;
}

export function isDashboardPlayable(video = {}) {
  const platform = detectPlatform(video);
  const videoId = video.videoId || video.video_id;

  if (platform === 'tiktok') {
    return Boolean(videoId);
  }

  return Boolean(video.embedUrl || video.embed_url || video.postUrl || video.post_url);
}

export function playerKindFor(video = {}) {
  return detectPlatform(video) === 'tiktok' ? 'tiktok' : 'iframe';
}

export function playerUrlFor(video = {}, autoplay = false) {
  const platform = detectPlatform(video);
  const videoId = video.videoId || video.video_id;

  if (platform === 'tiktok' && videoId) {
    return buildTikTokPlayerUrl(videoId, autoplay);
  }

  if (platform === 'tiktok') {
    return null;
  }

  return video.player_url || video.embedUrl || video.embed_url || null;
}

export function targetOriginFor(iframe) {
  try {
    const origin = new URL(iframe?.src || '').origin;
    return origin && origin !== 'null' ? origin : '*';
  } catch {
    return '*';
  }
}

export function postTikTokMessage(iframe, type) {
  if (!iframe?.contentWindow) return;

  iframe.contentWindow.postMessage(
    { 'x-tiktok-player': true, type },
    targetOriginFor(iframe),
  );
}

export function stopAndResetTikTokPlayer(shell) {
  if (!shell) return;

  const iframe = shell.querySelector('[data-player-frame]');
  const poster = shell.querySelector('[data-player-poster]');
  const overlay = shell.querySelector('[data-player-overlay]');
  const play = shell.querySelector('[data-player-play]');
  const close = shell.querySelector('[data-player-close]');
  const container = shell.querySelector('[data-player-container]');

  if (shell.dataset.playerKind === 'tiktok' && iframe) {
    postTikTokMessage(iframe, 'pause');
    postTikTokMessage(iframe, 'mute');
  }

  delete shell.dataset.playerWantsAudible;
  shell.dataset.playerActive = 'false';

  if (container) container.hidden = true;
  if (close) close.hidden = true;
  if (poster) poster.hidden = false;
  if (overlay) overlay.hidden = false;
  if (play) play.hidden = false;
  if (iframe) iframe.src = 'about:blank';
}

export function activateTikTokPlayer(shell) {
  if (!shell) return;

  const iframe = shell.querySelector('[data-player-frame]');
  const poster = shell.querySelector('[data-player-poster]');
  const overlay = shell.querySelector('[data-player-overlay]');
  const play = shell.querySelector('[data-player-play]');
  const close = shell.querySelector('[data-player-close]');
  const container = shell.querySelector('[data-player-container]');
  const playerSrc = shell.dataset.playerSrc;

  if (!iframe || !playerSrc) return;

  document.querySelectorAll('[data-video-player-shell][data-player-active="true"]').forEach((other) => {
    if (other !== shell) stopAndResetTikTokPlayer(other);
  });

  shell.dataset.playerActive = 'true';
  shell.dataset.playerWantsAudible = 'true';

  if (poster) poster.hidden = true;
  if (overlay) overlay.hidden = true;
  if (play) play.hidden = true;
  if (container) container.hidden = false;
  if (close) close.hidden = false;

  const nextSrc = shell.dataset.playerKind === 'tiktok'
    ? withTikTokAutoplay(playerSrc, true)
    : playerSrc;

  if (!iframe.src || iframe.src === 'about:blank') {
    iframe.src = nextSrc;
  }

  if (shell.dataset.playerKind === 'tiktok') {
    postTikTokMessage(iframe, 'unMute');
    postTikTokMessage(iframe, 'play');
  }
}

export function handleTikTokPlayerReady(event) {
  const payload = event?.data;

  if (!payload || payload['x-tiktok-player'] !== true || payload.type !== 'onPlayerReady') {
    return;
  }

  document.querySelectorAll('[data-video-player-shell][data-player-kind="tiktok"][data-player-active="true"]').forEach((shell) => {
    const iframe = shell.querySelector('[data-player-frame]');

    if (!iframe?.contentWindow || event.source !== iframe.contentWindow || shell.dataset.playerWantsAudible !== 'true') {
      return;
    }

    postTikTokMessage(iframe, 'unMute');
    postTikTokMessage(iframe, 'play');
  });
}

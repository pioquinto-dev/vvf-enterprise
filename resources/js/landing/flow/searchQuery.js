import { SEARCH_TYPES } from '../data/dummy.js';

export const DEFAULT_TYPE = 'brand';

export function resolveType(type) {
  return SEARCH_TYPES[type] ? type : DEFAULT_TYPE;
}

/** Falls back to the sample subject for the type when nothing was typed. */
export function resolveSubject(type, subject) {
  const trimmed = String(subject || '').trim();
  return trimmed || SEARCH_TYPES[resolveType(type)].sample;
}

/** Suggested keywords are the subject stem plus a per-type word list. */
export function buildKeywords(type, subject) {
  const stem = String(subject || '')
    .replace(/^@/, '')
    .trim();

  return SEARCH_TYPES[resolveType(type)].keywords.map((word) => `${stem} ${word}`.trim());
}

/** The handle we swap onto result cards so results echo what was searched. */
export function subjectHandle(type, subject) {
  if (resolveType(type) === 'product') return null;
  return '@' + String(subject).replace(/^@/, '').replace(/\s+/g, '').toLowerCase();
}

export function toQuery({ type, subject, keywords }) {
  const query = {
    type: resolveType(type),
    q: resolveSubject(type, subject),
  };

  if (keywords?.length) query.kw = keywords.join('|');

  return query;
}

export function parseKeywords(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split('|')
    .map((k) => k.trim())
    .filter(Boolean);
}

export function formatName(entry) {
  const first = entry.first_name?.trim() ?? '';
  const last = entry.last_name?.trim() ?? '';

  if (!first && !last) {
    return entry.user_name || 'Unknown Player';
  }

  return `${first} ${last}`.trim();
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

import { supabase } from '../lib/supabaseClient';
import { slugify } from '../utils/formatters';

const TABLE_NAME = 'leaderboard';
const AVATAR_BUCKET = 'private';
const AVATAR_FOLDER = 'pfp';

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, created_at, first_name, last_name, user_name, pfp, score')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getAvatarSignedUrl(path) {
  if (!path) {
    return null;
  }

  const normalizedPath = normalizeAvatarPath(path);
  if (!normalizedPath) {
    return null;
  }

  // If the value is already a non-Supabase absolute URL, use it as-is.
  if (isAbsoluteUrl(normalizedPath)) {
    return normalizedPath;
  }

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(normalizedPath, 60 * 60);

  if (error) {
    return null;
  }

  return data?.signedUrl ?? null;
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(value);
}

function normalizeAvatarPath(rawValue) {
  const value = String(rawValue).trim();
  if (!value) {
    return null;
  }

  // Preferred format stored in DB.
  if (value.startsWith('pfp/')) {
    return value;
  }

  // Accept accidental bucket-prefixed values.
  if (value.startsWith(`${AVATAR_BUCKET}/`)) {
    return value.slice(AVATAR_BUCKET.length + 1);
  }

  // Handle old rows that stored full Supabase Storage URLs.
  if (isAbsoluteUrl(value)) {
    try {
      const parsed = new URL(value);
      const marker = `/${AVATAR_BUCKET}/`;
      const markerIndex = parsed.pathname.indexOf(marker);

      if (markerIndex !== -1) {
        const encodedObjectPath = parsed.pathname.slice(markerIndex + marker.length);
        const objectPath = decodeURIComponent(encodedObjectPath);
        return objectPath;
      }

      // Absolute URL but not in expected Supabase format.
      return value;
    } catch {
      return value;
    }
  }

  // Fallback for malformed values like ".../private/pfp/file.png".
  const privateIndex = value.indexOf(`${AVATAR_BUCKET}/`);
  if (privateIndex !== -1) {
    return value.slice(privateIndex + AVATAR_BUCKET.length + 1);
  }

  return value;
}

export async function fetchAuthSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function isAdminUser(user) {
  return user?.app_metadata?.role === 'admin';
}

async function uploadAvatarIfProvided(file, username) {
  if (!file) {
    return null;
  }

  const extension = file.name.split('.').pop() || 'png';
  const cleanUsername = slugify(username || 'player');
  const timestamp = Date.now();
  const storagePath = `${AVATAR_FOLDER}/${cleanUsername}-${timestamp}.${extension}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(storagePath, file, {
    upsert: false,
    cacheControl: '3600',
  });

  if (error) {
    throw error;
  }

  return storagePath;
}

export async function createLeaderboardEntry(payload) {
  const avatarPath = await uploadAvatarIfProvided(payload.avatarFile, payload.user_name);

  const insertPayload = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    user_name: payload.user_name,
    score: Number(payload.score) || 0,
    pfp: avatarPath,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(insertPayload)
    .select('id, created_at, first_name, last_name, user_name, pfp, score')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteLeaderboardEntry(entryId) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', entryId);

  if (error) {
    throw error;
  }
}

export async function updateLeaderboardScore(entryId, score) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ score: Number(score) || 0 })
    .eq('id', entryId)
    .select('id, created_at, first_name, last_name, user_name, pfp, score')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function subscribeToLeaderboardChanges(onChange) {
  const channel = supabase
    .channel('leaderboard-live')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
      },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

# NCAT Poker Club Leaderboard

React + Vite app with Supabase-backed leaderboard and admin controls.

## Features

- Public leaderboard view from `public.leaderboard`
- Signed avatar display from `private/pfp/*` storage paths
- Admin button on the main page for login/logout
- Admin-only add and remove actions for leaderboard rows
- Modular code structure (no single giant file)


## Admin Usage

1. Open app.
2. Click `Admin` in the header.
3. Sign in with your account.
4. Use the add form to enter first name, last name, username, score, and optional avatar image.
5. Remove entries with the `Remove` button in the table.

## Notes

- The app uploads avatar files to `storage` bucket `private` under `pfp/`.
- Signed URLs are generated for viewing avatars in the public leaderboard.
- Vite 7 recommends Node `20.19+` or `22.12+`.

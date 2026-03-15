import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminModal from '../components/admin/AdminModal';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import { supabase } from '../lib/supabaseClient';
import {
  createLeaderboardEntry,
  deleteLeaderboardEntry,
  fetchAuthSession,
  fetchLeaderboard,
  getAvatarSignedUrl,
  isAdminUser,
  signInAdmin,
  signOutAdmin,
  subscribeToLeaderboardChanges,
  updateLeaderboardScore,
} from '../services/leaderboardService';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [avatarUrls, setAvatarUrls] = useState({});
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [rankMovements, setRankMovements] = useState({});
  const previousRanksRef = useRef({});

  const adminEnabled = useMemo(() => isAdminUser(sessionUser), [sessionUser]);

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await fetchLeaderboard();
      setRows(data);

      const avatarEntries = await Promise.all(
        data.map(async (entry) => [entry.id, await getAvatarSignedUrl(entry.pfp)])
      );

      setAvatarUrls(Object.fromEntries(avatarEntries));
    } catch (error) {
      console.error(error);
      setLoadError(error.message || 'Unable to load leaderboard right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboardChanges(() => {
      loadLeaderboard();
    });

    return () => unsubscribe();
  }, [loadLeaderboard]);

  useEffect(() => {
    let mounted = true;

    async function setCurrentSession() {
      try {
        const session = await fetchAuthSession();
        if (mounted) {
          setSessionUser(session?.user ?? null);
        }
      } catch (error) {
        console.error(error);
      }
    }

    setCurrentSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const currentRanks = {};
    const movementSnapshot = {};

    rows.forEach((entry, index) => {
      const newRank = index + 1;
      const previousRank = previousRanksRef.current[entry.id];

      currentRanks[entry.id] = newRank;

      if (previousRank && previousRank !== newRank) {
        movementSnapshot[entry.id] = previousRank > newRank ? 'up' : 'down';
      }
    });

    if (Object.keys(movementSnapshot).length > 0) {
      setRankMovements(movementSnapshot);
      const timeoutId = window.setTimeout(() => {
        setRankMovements({});
      }, 1800);
      previousRanksRef.current = currentRanks;
      return () => window.clearTimeout(timeoutId);
    }

    previousRanksRef.current = currentRanks;
    return undefined;
  }, [rows]);

  async function handleSignIn(email, password) {
    setIsSubmitting(true);
    setAdminError('');
    setAdminMessage('');

    try {
      const data = await signInAdmin(email, password);
      if (!isAdminUser(data.user)) {
        await signOutAdmin();
        throw new Error('This account does not have admin role access.');
      }

      setSessionUser(data.user);
      setAdminMessage('Admin signed in. You can now add or remove leaderboard players.');
    } catch (error) {
      setAdminError(error.message || 'Sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSubmitting(true);
    setAdminError('');
    setAdminMessage('');

    try {
      await signOutAdmin();
      setSessionUser(null);
      setShowAdminModal(false);
    } catch (error) {
      setAdminError(error.message || 'Sign-out failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateEntry(form) {
    setIsSubmitting(true);
    setAdminError('');
    setAdminMessage('');

    try {
      await createLeaderboardEntry(form);
      await loadLeaderboard();
      setAdminMessage('Leaderboard entry created successfully.');
    } catch (error) {
      setAdminError(error.message || 'Unable to create leaderboard entry.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteEntry(id) {
    setIsSubmitting(true);
    setAdminError('');
    setAdminMessage('');

    try {
      await deleteLeaderboardEntry(id);
      await loadLeaderboard();
      setAdminMessage('Leaderboard entry removed.');
    } catch (error) {
      setAdminError(error.message || 'Unable to remove leaderboard entry.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateScore(id, nextScore) {
    setIsSubmitting(true);
    setAdminError('');
    setAdminMessage('');

    try {
      await updateLeaderboardScore(id, nextScore);
      await loadLeaderboard();
      setAdminMessage('Score updated successfully.');
    } catch (error) {
      setAdminError(error.message || 'Unable to update score.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return rows.filter((entry) => {
      if (!normalizedSearch) {
        return true;
      }

      const username = entry.user_name?.toLowerCase() || '';
      return username.includes(normalizedSearch);
    });
  }, [rows, searchValue]);

  const podiumRows = filteredRows.slice(0, 3);

  function renderPodiumAvatar(entry) {
    const avatarUrl = avatarUrls[entry.id];
    if (avatarUrl) {
      return <img src={avatarUrl} alt={entry.user_name || 'player'} className="podium-avatar" />;
    }

    const initial = (entry.user_name || '?').charAt(0).toUpperCase();
    return <span className="podium-avatar podium-fallback">{initial}</span>;
  }

  return (
    <div className="leaderboard-page">
      <div className="lb-noise" />
      <div className="corner-actions">
        <Link to="/" className="secondary-button lb-link-button">
          Home
        </Link>
        <button type="button" className="primary-button" onClick={() => setShowAdminModal(true)}>
          {adminEnabled ? 'Admin Panel' : 'Admin Sign In'}
        </button>
      </div>
      <header className="lb-header">
        <div>
          <p className="lb-kicker">NCAT Poker Club</p>
          <h1>Online Poker Tournament Leaderboard</h1>
          <p className="lb-sub">The scores for our semester-long poker tournament will be regularly updated here. Games are on Poker Patio every Thursday at 5 PM. 
            <br></br>See game details and rules <a className="rules-link" href="https://docs.google.com/document/d/1eXLOqMDk2CkJpstuZqdd7LE9i9U_P5rUR7TjAkwsWC4/edit?usp=sharing" target="_blank" rel="noopener noreferrer">here</a>.
          </p>
        </div>
        <div className="lb-header-actions">
          <button type="button" className="secondary-button" onClick={loadLeaderboard}>
            Refresh
          </button>
        </div>
      </header>

      <section className="lb-controls">
        <label>
          Search Player
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by username"
          />
        </label>
      </section>

      <section className="podium-grid">
        {podiumRows.map((entry, index) => (
          <article key={entry.id} className={`podium-card podium-${index + 1}`}>
            <span className="podium-rank">
              {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
            </span>
            <span className="podium-medal" aria-hidden="true">
              {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
            </span>
            {renderPodiumAvatar(entry)}
            <h3>@{entry.user_name}</h3>
            <p className="podium-score">{entry.score} pts</p>
          </article>
        ))}
      </section>

      {loadError ? <p className="error-text">{loadError}</p> : null}
      {isLoading ? <p className="loading-text">Loading leaderboard...</p> : null}

      {!isLoading ? (
        <LeaderboardTable
          rows={filteredRows}
          avatarUrls={avatarUrls}
          isAdminView={adminEnabled}
          onDelete={handleDeleteEntry}
          onUpdateScore={handleUpdateScore}
          isSubmitting={isSubmitting}
          rankMovements={rankMovements}
        />
      ) : null}

      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        adminEnabled={adminEnabled}
        sessionUser={sessionUser}
        isSubmitting={isSubmitting}
        adminError={adminError}
        adminMessage={adminMessage}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onCreateEntry={handleCreateEntry}
      />
    </div>
  );
}

import { motion } from 'framer-motion';
import { useState } from 'react';

const MotionTbody = motion.tbody;
const MotionTr = motion.tr;

function AvatarCell({ avatarUrl, userName }) {
  if (avatarUrl) {
    return <img className="avatar" src={avatarUrl} alt={`${userName} profile`} loading="lazy" />;
  }

  const initial = (userName || '?').charAt(0).toUpperCase();
  return <span className="avatar avatar-fallback">{initial}</span>;
}

export default function LeaderboardTable({
  rows,
  avatarUrls,
  isAdminView,
  onDelete,
  onUpdateScore,
  isSubmitting,
  rankMovements = {},
}) {
  const [scoreDrafts, setScoreDrafts] = useState({});

  function movementBadge(direction) {
    if (direction === 'up') {
      return <span className="rank-chip rank-up">Up</span>;
    }

    if (direction === 'down') {
      return <span className="rank-chip rank-down">Down</span>;
    }

    return null;
  }

  return (
    <div className="leaderboard-shell">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Avatar</th>
            <th>Username</th>
            <th>Score</th>
            {isAdminView ? <th>Actions</th> : null}
          </tr>
        </thead>
        <MotionTbody layout>
          {rows.map((entry, index) => (
            <MotionTr key={entry.id} layout transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
              <td>
                #{index + 1}
                {movementBadge(rankMovements[entry.id])}
              </td>
              <td>
                <AvatarCell avatarUrl={avatarUrls[entry.id]} userName={entry.user_name} />
              </td>
              <td>@{entry.user_name || 'unknown'}</td>
              <td>{entry.score}</td>
              {isAdminView ? (
                <td>
                  <button
                    className="danger-button"
                    onClick={() => onDelete(entry.id)}
                    type="button"
                    aria-label={`Remove ${entry.user_name}`}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                  <div className="score-edit-row">
                    <input
                      className="score-input"
                      type="number"
                      min="0"
                      value={scoreDrafts[entry.id] ?? entry.score}
                      onChange={(event) =>
                        setScoreDrafts((previous) => ({
                          ...previous,
                          [entry.id]: Number(event.target.value),
                        }))
                      }
                    />
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => onUpdateScore(entry.id, scoreDrafts[entry.id] ?? entry.score)}
                      disabled={isSubmitting}
                    >
                      Save Score
                    </button>
                  </div>
                </td>
              ) : null}
            </MotionTr>
          ))}
        </MotionTbody>
      </table>
      {rows.length === 0 ? <p className="empty-state">No leaderboard entries yet.</p> : null}
    </div>
  );
}

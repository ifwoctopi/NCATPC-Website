import { useEffect } from 'react';
import AdminEntryForm from './AdminEntryForm';
import AdminLoginPanel from './AdminLoginPanel';

export default function AdminModal({
  isOpen,
  onClose,
  adminEnabled,
  sessionUser,
  isSubmitting,
  adminError,
  adminMessage,
  onSignIn,
  onSignOut,
  onCreateEntry,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Admin controls"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Admin Controls</h3>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>

        {!adminEnabled ? (
          <AdminLoginPanel onSignIn={onSignIn} isLoading={isSubmitting} errorMessage={adminError} />
        ) : (
          <div className="admin-authenticated">
            <p className="success-text">Signed in as admin: {sessionUser?.email}</p>
            <button
              type="button"
              className="secondary-button"
              onClick={onSignOut}
              disabled={isSubmitting}
            >
              Sign Out
            </button>
            <AdminEntryForm
              onCreateEntry={onCreateEntry}
              isLoading={isSubmitting}
              errorMessage={adminError}
            />
          </div>
        )}

        {adminMessage ? <p className="success-text">{adminMessage}</p> : null}
      </div>
    </div>
  );
}

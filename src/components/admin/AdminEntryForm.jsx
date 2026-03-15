import { useState } from 'react';

const initialState = {
  first_name: '',
  last_name: '',
  user_name: '',
  score: 0,
  avatarFile: null,
};

export default function AdminEntryForm({ onCreateEntry, isLoading, errorMessage }) {
  const [form, setForm] = useState(initialState);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === 'score' ? Number(value) : value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    setForm((previous) => ({
      ...previous,
      avatarFile: file,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreateEntry(form);
    setForm(initialState);
  }

  return (
    <form className="admin-panel" onSubmit={handleSubmit}>
      <h3>Add Leaderboard Player</h3>
      <label>
        First Name
        <input required name="first_name" value={form.first_name} onChange={handleChange} />
      </label>
      <label>
        Last Name
        <input required name="last_name" value={form.last_name} onChange={handleChange} />
      </label>
      <label>
        Username
        <input required name="user_name" value={form.user_name} onChange={handleChange} />
      </label>
      <label>
        Score
        <input
          required
          type="number"
          min="0"
          name="score"
          value={form.score}
          onChange={handleChange}
        />
      </label>
      <label>
        Avatar (uploads to private/pfp)
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Player'}
      </button>
    </form>
  );
}

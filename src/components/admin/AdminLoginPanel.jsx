import { useState } from 'react';

export default function AdminLoginPanel({ onSignIn, isLoading, errorMessage }) {
  const [form, setForm] = useState({ email: '', password: '' });

  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSignIn(form.email, form.password);
  }

  return (
    <form className="admin-panel" onSubmit={handleSubmit}>
      <h3>Admin Login</h3>
      <label>
        Email
        <input
          required
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />
      </label>
      <label>
        Password
        <input
          required
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
      </label>
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in as Admin'}
      </button>
    </form>
  );
}

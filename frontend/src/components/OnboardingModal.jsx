import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LEVELS = ['ROOKIE', 'SCOUT', 'VETERAN'];

const LEVEL_META = {
  ROOKIE: { emoji: '🌱', color: '#4ade80', desc: 'Just getting started' },
  SCOUT:  { emoji: '🔭', color: '#fad538', desc: 'Know the basics' },
  VETERAN:{ emoji: '⚔️', color: '#ff7574', desc: 'Battle-tested trader' },
};

export default function OnboardingModal({ userId }) {
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [level, setLevel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!handle.trim()) {
      setError('TRADER HANDLE IS REQUIRED');
      return;
    }
    if (!level) {
      setError('SELECT YOUR EXPERIENCE LEVEL');
      return;
    }

    setSaving(true);
    try {
      // Upsert into the users table (which extends auth.users)
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          username: handle.trim(),
        }, { onConflict: 'id' });

      if (dbError) throw dbError;

      // Store the session token for the api interceptor
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('sb-auth-token', JSON.stringify({
          access_token: session.access_token,
        }));
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'FAILED TO SAVE PROFILE');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        padding: '24px',
      }}
    >
      {/* Modal Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fefcf4',
          border: '4px solid black',
          boxShadow: '8px 8px 0px black',
          position: 'relative',
          transform: 'rotate(-0.5deg)',
        }}
      >
        {/* Header Band */}
        <div
          style={{
            background: '#685b9c',
            border: 'none',
            borderBottom: '4px solid black',
            padding: '20px 28px',
          }}
        >
          <h2
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '1.75rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'white',
              letterSpacing: '-0.5px',
              margin: 0,
            }}
          >
            ⚡ Set Up Your Profile
          </h2>
          <p
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.8)',
              marginTop: 4,
            }}
          >
            Almost there, Captain.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
          {/* Trader Handle */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '0.7rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
                color: '#000',
              }}
            >
              Trader Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Captain_Jack"
              maxLength={24}
              style={{
                width: '100%',
                background: '#fefcf4',
                border: '4px solid black',
                padding: '12px 14px',
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                outline: 'none',
                transition: 'background 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.background = '#fad538')}
              onBlur={(e) => (e.target.style.background = '#fefcf4')}
            />
          </div>

          {/* Experience Level */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '0.7rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
                color: '#000',
              }}
            >
              Experience Level
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              {LEVELS.map((lvl) => {
                const meta = LEVEL_META[lvl];
                const isActive = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    style={{
                      flex: 1,
                      border: '4px solid black',
                      background: isActive ? meta.color : '#fefcf4',
                      padding: '14px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isActive
                        ? '6px 6px 0px black'
                        : '3px 3px 0px black',
                      transform: isActive ? 'translate(-2px, -2px)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{meta.emoji}</span>
                    <span
                      style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#000',
                      }}
                    >
                      {lvl}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.55rem',
                        textTransform: 'uppercase',
                        color: 'rgba(0,0,0,0.55)',
                      }}
                    >
                      {meta.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#be2d06',
                background: '#fefcf4',
                border: '3px solid #be2d06',
                padding: '10px 14px',
                marginBottom: 16,
                textTransform: 'uppercase',
              }}
            >
              ✕ {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              background: saving ? '#65655f' : '#b6353a',
              color: 'white',
              border: '4px solid black',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900,
              textTransform: 'uppercase',
              padding: '14px',
              fontSize: '1.1rem',
              letterSpacing: '0.04em',
              cursor: saving ? 'wait' : 'pointer',
              boxShadow: '4px 4px 0px black',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.target.style.boxShadow = '8px 8px 0px black';
                e.target.style.transform = 'translate(-2px, -2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '4px 4px 0px black';
              e.target.style.transform = 'none';
            }}
            onMouseDown={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'translate(4px, 4px)';
            }}
            onMouseUp={(e) => {
              e.target.style.boxShadow = '4px 4px 0px black';
              e.target.style.transform = 'none';
            }}
          >
            {saving ? 'Saving...' : 'Enter The Arena →'}
          </button>
        </form>
      </div>
    </div>
  );
}

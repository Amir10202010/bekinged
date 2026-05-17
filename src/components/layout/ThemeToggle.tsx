"use client"
import React from 'react'
import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      style={{
        width: 32, height: 32,
        borderRadius: 8,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

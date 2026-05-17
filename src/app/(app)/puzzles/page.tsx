"use client"
import React, { useState } from 'react'
import { getTodaysPuzzle } from '@/lib/puzzles'

export default function Page() {
  const puzzle = getTodaysPuzzle()
  const [completed, setCompleted] = useState(false)

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const todayIdx = (new Date().getDay() + 6) % 7 // convert Sun(0) -> 6, Mon(1) -> 0

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Daily Puzzle</h2>
        <div style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleDateString()}</div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>{puzzle.difficulty === 'easy' ? '🟢' : puzzle.difficulty === 'medium' ? '🔵' : '🔴'}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 16 }}>{puzzle.title}</div>
              <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 8 }}>{puzzle.description}</div>
            </div>

            <div style={{ marginLeft: 12 }}>
              {!completed ? (
                <button onClick={() => setCompleted(true)} style={{ background: '#6366f1', color: 'white', padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600 }}>Solve Puzzle →</button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48 }}>✅</div>
                  <div style={{ fontSize: 20, color: '#10b981', fontWeight: 700 }}>Puzzle Solved!</div>
                  <div style={{ fontSize: 14, color: '#f59e0b', marginTop: 6 }}>+1 Streak 🔥</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Come back tomorrow for a new puzzle</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {days.map((d, i) => (
                <div key={d} style={{ width: 32, height: 32, borderRadius: 9999, background: i === todayIdx ? '#6366f1' : 'var(--bg-elevated)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {days.map((d) => (
                <div key={d} style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

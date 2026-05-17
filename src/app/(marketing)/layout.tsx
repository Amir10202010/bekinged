import React from 'react'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14' }}>
      {children}
    </div>
  )
}

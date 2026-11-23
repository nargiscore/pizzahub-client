'use client';
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="card"><h2>Dashboard data could not be loaded</h2><p className="muted">Check your connection and try again.</p><button className="btn" onClick={() => reset()}>Retry</button></div>; }

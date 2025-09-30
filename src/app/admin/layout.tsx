import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Kaizen',
  description: 'Administrative panel for managing Kaizen platform',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}
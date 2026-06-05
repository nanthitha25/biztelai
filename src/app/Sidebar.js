'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UploadCloud, FileText } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload Document', icon: UploadCloud },
    { href: '/documents', label: 'Review Queue', icon: FileText },
  ];

  return (
    <div style={{ width: '260px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3rem', paddingLeft: '0.75rem' }}>
        Biztel<span style={{ color: 'var(--accent-blue)' }}>AI</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map(link => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname.startsWith('/documents') && link.href === '/documents');
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
              onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={20} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

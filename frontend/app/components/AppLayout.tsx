'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    label: 'Inicio',
    href: '/dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth="1.7"/>
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth="1.7"/>
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth="1.7"/>
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth="1.7"/>
      </svg>
    ),
  },
  {
    label: 'Libro de Incidencias',
    href: '/incidencias',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13V4Z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Seguimientos IA',
    href: '/seguimientos',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3 8-8M21 12a9 9 0 1 1-6.2-8.5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Familiares',
    href: '/familiares',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Residentes',
    href: '/residentes/dolores-gomez',
    href2: '/residentes',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.7"/>
        <path d="M5 20a7 7 0 0 1 14 0" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Valoraciones (PAI)',
    href: '/pai',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h16M4 17h10" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Agentes IA',
    href: '/agentes',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#fff" strokeWidth="1.7"/>
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2l-.4-2.6H8.9l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 4 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.2l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" stroke="#fff" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: 'Analítica',
    href: '/analitica',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Turnos',
    href: '/turnos',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.7"/>
        <path d="M12 8v4l3 2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Expediente',
    href: '/expediente/dolores-gomez',
    href2: '/expediente',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M7 3h7l5 5v13H7z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M14 3v5h5" stroke="#fff" strokeWidth="1.7"/>
      </svg>
    ),
  },
  {
    label: 'Audit Log',
    href: '/audit-log',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#fff" strokeWidth="1.7"/>
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2l-.4-2.6H8.9l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 4 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.2l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" stroke="#fff" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    if (item.href2 && pathname.startsWith(item.href2)) return true;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7' }}>
      {/* Sidebar */}
      <div style={{
        width: 194,
        flexShrink: 0,
        background: '#1D1D1F',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '15px 11px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '3px 8px 16px', textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(150deg,#0071E3,#0FB5A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.1A.5.5 0 0 1 5.2 18.2V15.5A2.5 2.5 0 0 1 4 13.4Z" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>ResidIA</span>
        </Link>

        {/* Nav items */}
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 11px',
                borderRadius: 10,
                fontSize: 13,
                cursor: 'default',
                marginBottom: 2,
                background: active ? 'rgba(31,111,229,.24)' : 'transparent',
                fontWeight: active ? 600 : 400,
                opacity: active ? 1 : 0.6,
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '9px 8px',
          borderTop: '1px solid rgba(255,255,255,.1)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#0071E3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 11,
          }}>LB</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Laura B.</div>
            <div style={{ fontSize: 10.5, color: '#8BA0B6' }}>Coordinadora</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 194, padding: '20px 24px', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}

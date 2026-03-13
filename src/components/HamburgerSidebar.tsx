"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export interface NavLink {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}

interface HamburgerSidebarProps {
    title: string;
    titleIcon: React.ReactNode;
    accentColor: string;
    navLinks: NavLink[];
    userEmail: string;
}

export default function HamburgerSidebar({
    title,
    titleIcon,
    navLinks,
    userEmail,
}: HamburgerSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            <style>{`
                /* ── TOPBAR ── */
                .hb-topbar {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 300;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 1.5rem; height: 56px;
                    background: rgba(10,12,15,0.92);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }
                .hb-topbar-left { display: flex; align-items: center; gap: 1rem; }
                .hb-topbar-right { display: flex; align-items: center; gap: 0.75rem; }
                .hb-email-badge { font-size: 0.78rem; color: #6b7280; }

                /* Hamburger — animates to X */
                .hb-hamburger {
                    display: flex; flex-direction: column; justify-content: center;
                    gap: 5px; cursor: pointer; padding: 6px; width: 34px; height: 34px;
                    border-radius: 8px; transition: background 0.2s;
                    border: none; background: none;
                }
                .hb-hamburger:hover { background: #181c22; }
                .hb-hamburger span {
                    display: block; width: 20px; height: 2px;
                    background: #6b7280; border-radius: 2px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-origin: center;
                }
                .hb-hamburger.open span:nth-child(1) {
                    transform: translateY(7px) rotate(45deg);
                    background: #f0f4ff;
                }
                .hb-hamburger.open span:nth-child(2) {
                    opacity: 0;
                    transform: scaleX(0);
                }
                .hb-hamburger.open span:nth-child(3) {
                    transform: translateY(-7px) rotate(-45deg);
                    background: #f0f4ff;
                }

                .hb-logo {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #f0f4ff;
                    letter-spacing: 0.02em;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* ── OVERLAY ── */
                .hb-overlay {
                    position: fixed; inset: 0; z-index: 350;
                    background: rgba(0,0,0,0.55);
                    backdrop-filter: blur(2px);
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s;
                }
                .hb-overlay.open {
                    opacity: 1;
                    pointer-events: auto;
                }

                /* ── SIDEBAR DRAWER ── */
                .hb-sidebar {
                    position: fixed; top: 0; left: 0; bottom: 0;
                    width: 240px; z-index: 400;
                    background: #0d1014;
                    border-right: 1px solid rgba(255,255,255,0.07);
                    display: flex; flex-direction: column;
                    transform: translateX(-240px);
                    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 4px 0 40px rgba(0,0,0,0.5);
                }
                .hb-sidebar.open { transform: translateX(0); }

                /* Sidebar header */
                .hb-sidebar-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 1.25rem; height: 56px;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    flex-shrink: 0;
                }
                .hb-sidebar-brand {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #f0f4ff;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .hb-sidebar-close {
                    background: none; border: none; color: #6b7280; cursor: pointer;
                    font-size: 1rem; padding: 6px; border-radius: 6px; transition: all 0.15s;
                    line-height: 1;
                }
                .hb-sidebar-close:hover { background: #181c22; color: #f0f4ff; }

                /* Sidebar email */
                .hb-sidebar-email {
                    padding: 0.85rem 1.25rem;
                    font-size: 0.72rem; color: #374151;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    word-break: break-all;
                }

                /* Nav items */
                .hb-nav-section { flex: 1; padding: 0.5rem 0; overflow-y: auto; }
                .hb-nav-item {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 0.7rem 1.25rem;
                    font-size: 0.875rem; color: #6b7280;
                    cursor: pointer; transition: all 0.15s; text-decoration: none;
                    position: relative;
                }
                .hb-nav-item:hover { background: #111418; color: #f0f4ff; }
                .hb-nav-item.active {
                    background: #181c22; color: #f0f4ff;
                }
                .hb-nav-item.active::before {
                    content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
                    width: 3px; background: #3b82f6; border-radius: 0 3px 3px 0;
                }
                .hb-nav-icon {
                    font-size: 0.95rem; width: 22px; text-align: center; flex-shrink: 0;
                }
                .hb-nav-badge {
                    font-size: 0.6rem;
                    font-weight: 700;
                    background: #ef4444;
                    color: white;
                    padding: 0.15rem 0.4rem;
                    border-radius: 999px;
                    min-width: 18px;
                    text-align: center;
                    margin-left: auto;
                }

                /* Sign out */
                .hb-signout-area {
                    padding: 0.75rem 1.25rem;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    flex-shrink: 0;
                }
                .hb-signout-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 0.85rem; color: #6b7280;
                    background: none; border: none; cursor: pointer;
                    padding: 0.6rem 0.5rem; border-radius: 8px;
                    transition: all 0.15s; width: 100%;
                    font-family: 'DM Sans', sans-serif;
                }
                .hb-signout-btn:hover {
                    background: rgba(239,68,68,0.08);
                    color: #ef4444;
                }

                @media (max-width: 640px) {
                    .hb-topbar { padding: 0 1rem; }
                    .hb-email-badge { display: none; }
                }
            `}</style>

            {/* Top Navbar */}
            <header className="hb-topbar">
                <div className="hb-topbar-left">
                    <button
                        className={`hb-hamburger ${isOpen ? "open" : ""}`}
                        onClick={() => setIsOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <div className="hb-logo">
                        {titleIcon}
                        {title}
                    </div>
                </div>
                <div className="hb-topbar-right">
                    <span className="hb-email-badge">{userEmail}</span>
                </div>
            </header>

            {/* Overlay */}
            <div
                className={`hb-overlay ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Drawer */}
            <div className={`hb-sidebar ${isOpen ? "open" : ""}`}>
                {/* Sidebar Header */}
                <div className="hb-sidebar-header">
                    <div className="hb-sidebar-brand">
                        {titleIcon}
                        {title}
                    </div>
                    <button
                        className="hb-sidebar-close"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                {/* Email */}
                <div className="hb-sidebar-email">{userEmail}</div>

                {/* Nav Links */}
                <div className="hb-nav-section">
                    {navLinks.map((link) => {
                        const isActive =
                            link.href === pathname ||
                            (link.href !== "/" &&
                                pathname.startsWith(link.href) &&
                                link.href.split("/").length >= pathname.split("/").length);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`hb-nav-item ${isActive ? "active" : ""}`}
                            >
                                <span className="hb-nav-icon">{link.icon}</span>
                                {link.label}
                                {link.badge && link.badge > 0 ? (
                                    <span className="hb-nav-badge">{link.badge}</span>
                                ) : null}
                            </Link>
                        );
                    })}
                </div>

                {/* Sign Out */}
                <div className="hb-signout-area">
                    <form action="/auth/signout" method="post">
                        <button type="submit" className="hb-signout-btn">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

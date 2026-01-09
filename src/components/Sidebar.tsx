import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileCheck, BookOpen, Search, Zap, Settings } from 'lucide-react';
import clsx from 'clsx';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )
        }
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </NavLink>
);

export function Sidebar() {
    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-screen p-4">
            <div className="flex items-center gap-2 px-4 mb-8">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <FileCheck className="text-primary-foreground" size={20} />
                </div>
                <h1 className="font-bold text-lg tracking-tight">CSW Assistant</h1>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem to="/" icon={Home} label="Home" />
                <NavItem to="/checker" icon={FileCheck} label="Compliance Checker" />
                <NavItem to="/reference" icon={BookOpen} label="Reference Guide" />
                <NavItem to="/search" icon={Search} label="Search" />
                <NavItem to="/tools" icon={Zap} label="Quick Tools" />
            </nav>

            <div className="mt-auto pt-4 border-t border-border">
                <NavItem to="/settings" icon={Settings} label="Settings" />
            </div>
        </aside>
    );
}
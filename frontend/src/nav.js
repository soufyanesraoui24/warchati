import { LayoutDashboard, MessageSquare, Package, Bot, BarChart3, Radio, Smartphone, MessageCircle } from 'lucide-react';
import { ROLES } from './context/AuthContext';

export const NAV_ITEMS = [
    {
        label: 'لوحة التحكم',
        path: '/dashboard',
        icon: LayoutDashboard,
        category: 'main',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN]
    },
    {
        label: 'صندوق الوارد',
        path: '/inbox',
        icon: MessageSquare,
        category: 'main',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN, ROLES.EMPLOYEE]
    },
    {
        label: 'المنتجات',
        path: '/products',
        icon: Package,
        category: 'main',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN, ROLES.EMPLOYEE]
    },
    {
        label: 'إعدادات البوت',
        path: '/bot-settings',
        icon: Bot,
        category: 'settings',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN]
    },
    {
        label: 'الإحصائيات',
        path: '/analytics',
        icon: BarChart3,
        category: 'marketing',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN]
    },
    {
        label: 'القنوات',
        path: '/channels',
        icon: Radio,
        category: 'settings',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN]
    },
    {
        label: 'محاكاة الزبون',
        path: '/simulator',
        icon: Smartphone,
        category: 'main',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN, ROLES.EMPLOYEE]
    },
    {
        label: 'القوالب',
        path: '/templates',
        icon: MessageCircle,
        category: 'settings',
        allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADMIN]
    }
];

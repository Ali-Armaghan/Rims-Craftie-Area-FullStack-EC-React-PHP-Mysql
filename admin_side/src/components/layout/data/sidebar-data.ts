import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Percent,
  Activity,
  Users,
  Settings,
  UserCog,
  Wrench,
  Palette,
  Bell,
  Monitor,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@ateeqo.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Ateeqo Store',
      logo: ShoppingBag,
      plan: 'Admin Panel',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Products',
          url: '/products',
          icon: ShoppingBag,
        },
        {
          title: 'Orders',
          url: '/orders',
          icon: ShoppingCart,
        },
        {
          title: 'ReSale',
          icon: Percent,
          items: [
            {
              title: 'Commissions',
              url: '/resale/commissions',
            },
            {
              title: 'Ledger',
              url: '/resale/ledger',
            },
          ],
        },
        {
          title: 'Tracking',
          icon: Activity,
          items: [
            {
              title: 'Live Traffic',
              url: '/tracking/live',
            },
            {
              title: 'Visitor Sessions',
              url: '/tracking/sessions',
            },
          ],
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}

import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Star,
  Activity,
  Users,
  Timer,
  FolderTree,
  ClipboardList,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@craftiearea.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Craftie._.Area',
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
          title: 'Categories',
          url: '/categories',
          icon: FolderTree,
        },
        {
          title: 'Orders',
          url: '/orders',
          icon: ShoppingCart,
        },
        {
          title: 'Abandoned Checkouts',
          url: '/checkout-drafts',
          icon: ClipboardList,
        },
        {
          title: 'Reviews',
          url: '/reviews',
          icon: Star,
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
            {
              title: 'Page Analytics',
              url: '/tracking/page-analytics',
            },
          ],
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Sale Countdown',
          url: '/settings/sale-countdown',
          icon: Timer,
        },
      ],
    },
  ],
}

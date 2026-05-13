import { useQuery } from '@tanstack/react-query'
import { Activity, Monitor, RefreshCw, Users } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type LiveTrafficRow = {
  session_id: number | string
  session_uuid: string
  current_page?: string | null
  current_page_title?: string | null
  is_logged_in?: number | string | boolean | null
  last_ping_at: string
  ip_address?: string | null
  device_type?: string | null
  browser?: string | null
  os?: string | null
  landing_page?: string | null
  first_seen?: string | null
  page_count?: number | string | null
  total_duration?: number | string | null
  user_name?: string | null
  user_email?: string | null
}

function formatDuration(value?: number | string | null) {
  const seconds = Number(value ?? 0)
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60

  return `${minutes}m ${remaining}s`
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function isLoggedIn(value: LiveTrafficRow['is_logged_in']) {
  return value === true || value === 1 || value === '1'
}

export function LiveTraffic() {
  const {
    data: visitors = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<LiveTrafficRow[]>({
    queryKey: ['live-traffic'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/live-traffic')
      return response.data
    },
    refetchInterval: 15000,
  })

  const loggedInVisitors = visitors.filter((visitor) =>
    isLoggedIn(visitor.is_logged_in)
  ).length
  const guestVisitors = Math.max(visitors.length - loggedInVisitors, 0)
  const mobileVisitors = visitors.filter(
    (visitor) => visitor.device_type?.toLowerCase() === 'mobile'
  ).length

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Live Traffic
            </h2>
            <p className='text-muted-foreground'>
              Active visitors updated automatically every 15 seconds.
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>

        <div className='mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Visitors
              </CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{visitors.length}</div>
              <p className='text-xs text-muted-foreground'>
                Seen in last 5 minutes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Logged In</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loggedInVisitors}</div>
              <p className='text-xs text-muted-foreground'>
                Customers with accounts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Guests</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{guestVisitors}</div>
              <p className='text-xs text-muted-foreground'>
                Anonymous visitors
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Mobile</CardTitle>
              <Monitor className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{mobileVisitors}</div>
              <p className='text-xs text-muted-foreground'>
                Active mobile sessions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='rounded-md border'>
          {isLoading ? (
            <div className='p-8 text-center text-muted-foreground'>
              Loading live visitors...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Current Page</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Last Ping</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.length ? (
                  visitors.map((visitor) => (
                    <TableRow key={visitor.session_id}>
                      <TableCell>
                        <div className='font-medium'>
                          {visitor.user_name || 'Guest'}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {visitor.user_email ||
                            visitor.ip_address ||
                            visitor.session_uuid}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='font-medium'>
                          {visitor.current_page_title ||
                            visitor.current_page ||
                            'Unknown page'}
                        </div>
                        <div className='max-w-[260px] truncate text-xs text-muted-foreground'>
                          {visitor.current_page || visitor.landing_page || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='capitalize'>
                          {visitor.device_type || 'Unknown'}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {[visitor.browser, visitor.os]
                            .filter(Boolean)
                            .join(' / ') || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{visitor.page_count ?? 0} pages</div>
                        <div className='text-xs text-muted-foreground'>
                          {formatDuration(visitor.total_duration)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(visitor.last_ping_at)}</TableCell>
                      <TableCell>
                        <Badge variant='secondary'>Online</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      No active visitors right now.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Main>
    </>
  )
}

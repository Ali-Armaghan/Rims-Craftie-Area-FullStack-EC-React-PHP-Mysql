import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, MousePointerClick, RefreshCw, Timer, Users } from 'lucide-react'
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
  CardDescription,
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

type VisitorSession = {
  id: number | string
  session_uuid: string
  user_name?: string | null
  user_email?: string | null
  ip_address?: string | null
  device_type?: string | null
  browser?: string | null
  os?: string | null
  referer_url?: string | null
  landing_page?: string | null
  page_count?: number | string | null
  actual_page_views?: number | string | null
  total_duration?: number | string | null
  is_active?: number | string | boolean | null
  first_seen?: string | null
  last_seen?: string | null
  ended_at?: string | null
}

type PageView = {
  id: number | string
  page_path: string
  page_url?: string | null
  page_title?: string | null
  referrer_url?: string | null
  stay_duration?: number | string | null
  entered_at?: string | null
  exited_at?: string | null
  exit_type?: string | null
}

type VisitorEvent = {
  id: number | string
  event_type: string
  event_name?: string | null
  page_path?: string | null
  event_data?: string | null
  occurred_at?: string | null
}

type VisitorSessionDetails = VisitorSession & {
  page_views: PageView[]
  events: VisitorEvent[]
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

function activeStatus(value: VisitorSession['is_active']) {
  return value === true || value === 1 || value === '1'
}

export function VisitorSessions() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const {
    data: sessions = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<VisitorSession[]>({
    queryKey: ['visitor-sessions'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/visitor-sessions')
      return response.data
    },
  })

  const { data: selectedSession, isFetching: isLoadingDetails } =
    useQuery<VisitorSessionDetails>({
      queryKey: ['visitor-session', selectedSessionId],
      queryFn: async () => {
        const response = await apiClient.get('/admin/visitor-session', {
          params: { id: selectedSessionId },
        })
        return response.data
      },
      enabled: !!selectedSessionId,
    })

  const activeSessions = sessions.filter((session) =>
    activeStatus(session.is_active)
  ).length
  const loggedInSessions = sessions.filter(
    (session) => session.user_email
  ).length
  const avgDuration = sessions.length
    ? Math.round(
        sessions.reduce(
          (total, session) => total + Number(session.total_duration ?? 0),
          0
        ) / sessions.length
      )
    : 0

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
              Visitor Sessions
            </h2>
            <p className='text-muted-foreground'>
              Session history with page visits, duration, devices, and events.
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
                Total Sessions
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{sessions.length}</div>
              <p className='text-xs text-muted-foreground'>Latest 200 records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active</CardTitle>
              <Eye className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{activeSessions}</div>
              <p className='text-xs text-muted-foreground'>Currently open</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Logged In</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loggedInSessions}</div>
              <p className='text-xs text-muted-foreground'>Customer sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg Duration
              </CardTitle>
              <Timer className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatDuration(avgDuration)}
              </div>
              <p className='text-xs text-muted-foreground'>Per session</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              Click view to inspect a visitor's page views and events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              {isLoading ? (
                <div className='p-8 text-center text-muted-foreground'>
                  Loading sessions...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Landing Page</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.length ? (
                      sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className='font-medium'>
                              {session.user_name || 'Guest'}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {session.user_email ||
                                session.ip_address ||
                                session.session_uuid}
                            </div>
                          </TableCell>
                          <TableCell className='max-w-[260px] truncate'>
                            {session.landing_page || '-'}
                          </TableCell>
                          <TableCell>
                            <div className='capitalize'>
                              {session.device_type || 'Unknown'}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {[session.browser, session.os]
                                .filter(Boolean)
                                .join(' / ') || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.page_count ??
                              session.actual_page_views ??
                              0}
                          </TableCell>
                          <TableCell>
                            {formatDuration(session.total_duration)}
                          </TableCell>
                          <TableCell>{formatDate(session.last_seen)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                activeStatus(session.is_active)
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {activeStatus(session.is_active)
                                ? 'Active'
                                : 'Ended'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setSelectedSessionId(String(session.id))
                              }
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className='h-24 text-center'>
                          No visitor sessions recorded yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedSessionId ? (
          <Card className='mt-4'>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                {selectedSession
                  ? `${selectedSession.user_name || 'Guest'} - ${
                      selectedSession.session_uuid
                    }`
                  : 'Loading selected session...'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {isLoadingDetails || !selectedSession ? (
                <div className='p-8 text-center text-muted-foreground'>
                  Loading session details...
                </div>
              ) : (
                <>
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <InfoCard
                      label='Started'
                      value={formatDate(selectedSession.first_seen)}
                    />
                    <InfoCard
                      label='Last Seen'
                      value={formatDate(selectedSession.last_seen)}
                    />
                    <InfoCard
                      label='Duration'
                      value={formatDuration(selectedSession.total_duration)}
                    />
                    <InfoCard
                      label='Referrer'
                      value={selectedSession.referer_url || 'Direct'}
                    />
                  </div>

                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead>Referrer</TableHead>
                          <TableHead>Stay</TableHead>
                          <TableHead>Entered</TableHead>
                          <TableHead>Exit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSession.page_views.length ? (
                          selectedSession.page_views.map((page) => (
                            <TableRow key={page.id}>
                              <TableCell>
                                <div className='font-medium'>
                                  {page.page_title || page.page_path}
                                </div>
                                <div className='max-w-[320px] truncate text-xs text-muted-foreground'>
                                  {page.page_url || page.page_path}
                                </div>
                              </TableCell>
                              <TableCell className='max-w-[220px] truncate'>
                                {page.referrer_url || 'Direct'}
                              </TableCell>
                              <TableCell>
                                {formatDuration(page.stay_duration)}
                              </TableCell>
                              <TableCell>{formatDate(page.entered_at)}</TableCell>
                              <TableCell className='capitalize'>
                                {page.exit_type ||
                                  (page.exited_at ? 'closed' : 'active')}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className='h-20 text-center'>
                              No page views for this session.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <div className='mb-2 flex items-center gap-2'>
                      <MousePointerClick className='h-4 w-4 text-muted-foreground' />
                      <h3 className='font-semibold'>Recent Events</h3>
                    </div>
                    <div className='rounded-md border'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Page</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedSession.events.length ? (
                            selectedSession.events.map((event) => (
                              <TableRow key={event.id}>
                                <TableCell>
                                  <div className='font-medium'>
                                    {event.event_name || event.event_type}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {event.event_type}
                                  </div>
                                </TableCell>
                                <TableCell className='max-w-[320px] truncate'>
                                  {event.page_path || '-'}
                                </TableCell>
                                <TableCell>
                                  {formatDate(event.occurred_at)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className='h-20 text-center'>
                                No events for this session.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : null}
      </Main>
    </>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='mt-1 truncate text-sm font-medium'>{value}</div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
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
import { AnalyticsChart } from './analytics-chart'

const emptyChart = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
  (name) => ({ name, clicks: 0, uniques: 0 })
)

type AnalyticsData = {
  chart: { name: string; clicks: number; uniques: number }[]
  total_clicks: number
  total_clicks_change: number
  unique_visitors: number
  unique_visitors_change: number
  bounce_rate: number
  bounce_rate_change: number
  avg_session: number
  avg_session_change: number
  referrers: { name: string; value: number | string }[]
  devices: { name: string; value: number | string }[]
  page_views: {
    id: number | string
    page_path: string
    page_title?: string | null
    referrer_url?: string | null
    stay_duration: number | string
    entered_at: string
    exited_at?: string | null
    exit_type?: string | null
    session_uuid: string
    ip_address?: string | null
    device_type?: string | null
    browser?: string | null
    os?: string | null
    user_name: string
    user_email?: string | null
  }[]
}

function formatChange(value: number, suffix = '%') {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}${suffix} vs last week`
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

export function Analytics() {
  const { data = {
    chart: emptyChart,
    total_clicks: 0,
    total_clicks_change: 0,
    unique_visitors: 0,
    unique_visitors_change: 0,
    bounce_rate: 0,
    bounce_rate_change: 0,
    avg_session: 0,
    avg_session_change: 0,
    referrers: [],
    devices: [],
    page_views: [],
  } } = useQuery<AnalyticsData>({
    queryKey: ['traffic-analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/analytics')
      return response.data
    },
  })

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>Weekly clicks and unique visitors</CardDescription>
        </CardHeader>
        <CardContent className='px-6'>
          <AnalyticsChart data={data.chart ?? emptyChart} />
        </CardContent>
      </Card>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Clicks</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M3 3v18h18' />
              <path d='M7 15l4-4 4 4 4-6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{Number(data.total_clicks).toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>
              {formatChange(Number(data.total_clicks_change))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Unique Visitors
            </CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <circle cx='12' cy='7' r='4' />
              <path d='M6 21v-2a6 6 0 0 1 12 0v2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{Number(data.unique_visitors).toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>
              {formatChange(Number(data.unique_visitors_change))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Bounce Rate</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M3 12h6l3 6 3-6h6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{Number(data.bounce_rate)}%</div>
            <p className='text-xs text-muted-foreground'>
              {formatChange(Number(data.bounce_rate_change))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg. Session</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <circle cx='12' cy='12' r='10' />
              <path d='M12 6v6l4 2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatDuration(Number(data.avg_session))}
            </div>
            <p className='text-xs text-muted-foreground'>
              {formatChange(Number(data.avg_session_change), 's')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
            <CardDescription>Top sources driving traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={data.referrers.map((item) => ({
                name: item.name,
                value: Number(item.value),
              }))}
              barClass='bg-primary'
              valueFormatter={(n) => `${n}`}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>How users access your app</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={data.devices.map((item) => ({
                name: item.name,
                value: Number(item.value),
              }))}
              barClass='bg-muted-foreground'
              valueFormatter={(n) => `${n}%`}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Page Visits</CardTitle>
          <CardDescription>
            Recent pages visited by anonymous and logged-in users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Stay</TableHead>
                  <TableHead>Visited At</TableHead>
                  <TableHead>Exit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.page_views.length ? (
                  data.page_views.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <div className='font-medium'>
                          {visit.page_title || visit.page_path}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {visit.page_path}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{visit.user_name || 'Guest'}</div>
                        <div className='text-xs text-muted-foreground'>
                          {visit.user_email || visit.ip_address || visit.session_uuid}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='capitalize'>{visit.device_type || 'Unknown'}</div>
                        <div className='text-xs text-muted-foreground'>
                          {[visit.browser, visit.os].filter(Boolean).join(' / ') || '-'}
                        </div>
                      </TableCell>
                      <TableCell className='max-w-[180px] truncate'>
                        {visit.referrer_url || 'Direct'}
                      </TableCell>
                      <TableCell>{formatDuration(Number(visit.stay_duration))}</TableCell>
                      <TableCell>
                        {new Date(visit.entered_at).toLocaleString()}
                      </TableCell>
                      <TableCell className='capitalize'>
                        {visit.exit_type || (visit.exited_at ? 'closed' : 'active')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center'>
                      No page visits recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  if (!items.length) {
    return (
      <div className='py-6 text-center text-sm text-muted-foreground'>
        No tracking data yet.
      </div>
    )
  }

  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-3'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 truncate text-xs text-muted-foreground'>
                {i.name}
              </div>
              <div className='h-2.5 w-full rounded-full bg-muted'>
                <div
                  className={`h-2.5 rounded-full ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-medium tabular-nums'>
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

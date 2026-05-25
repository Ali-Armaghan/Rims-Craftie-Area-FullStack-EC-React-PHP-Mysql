import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Clock3, Eye, Users } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PageAnalyticsRow = {
  page_path: string
  page_title?: string | null
  label: string
  page_views: number
  unique_visitors: number
  avg_stay_seconds: number
}

type PageAnalyticsResponse = {
  days: number
  total_page_views: number
  total_unique_visitors: number
  overall_avg_stay_seconds: number
  pages: PageAnalyticsRow[]
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function formatPageLabel(path: string) {
  const normalized = path?.trim() || '/'
  if (normalized === '/') return 'Home'

  const [pathPart, queryPart = ''] = normalized.split('?')
  const segments = pathPart.split('/').filter(Boolean)
  const last = segments[segments.length - 1] ?? 'page'

  if (segments.length > 1 && /^\d+$/.test(last)) {
    const parent = segments[segments.length - 2]
    const base = `${parent.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} #${last}`
    return queryPart ? `${base} (${queryPart.slice(0, 14)})` : base
  }

  const label = queryPart
    ? `${pathPart} (${queryPart.slice(0, 14)}${queryPart.length > 14 ? '..' : ''})`
    : pathPart

  return label.length > 40 ? `${label.slice(0, 37)}...` : label
}

function PageMetricChart({
  data,
  dataKey,
  barClassName,
  valueFormatter,
}: {
  data: PageAnalyticsRow[]
  dataKey: 'page_views' | 'unique_visitors' | 'avg_stay_seconds'
  barClassName: string
  valueFormatter?: (value: number) => string
}) {
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        chartLabel: formatPageLabel(row.page_path),
      })),
    [data]
  )

  const chartHeight = Math.max(280, chartData.length * 48)

  return (
    <ResponsiveContainer width='100%' height={chartHeight}>
      <BarChart
        data={chartData}
        layout='vertical'
        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray='3 3' horizontal={false} />
        <XAxis
          type='number'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            valueFormatter ? valueFormatter(Number(value)) : String(value)
          }
        />
        <YAxis
          type='category'
          dataKey='chartLabel'
          width={180}
          interval={0}
          stroke='#888888'
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) =>
            dataKey === 'avg_stay_seconds'
              ? formatDuration(Number(value ?? 0))
              : Number(value ?? 0).toLocaleString()
          }
          labelFormatter={(_, payload) => {
            const row = payload?.[0]?.payload as PageAnalyticsRow | undefined
            return row?.page_path ?? ''
          }}
        />
        <Bar
          dataKey={dataKey}
          fill='currentColor'
          radius={[0, 4, 4, 0]}
          className={barClassName}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PageAnalytics() {
  const [days, setDays] = useState('7')

  const { data, isLoading } = useQuery<PageAnalyticsResponse>({
    queryKey: ['page-analytics', days],
    queryFn: async () => {
      const response = await apiClient.get('/admin/page-analytics', {
        params: { days },
      })
      return response.data
    },
    refetchInterval: 60000,
  })

  const pages = data?.pages ?? []

  const sortedByViews = useMemo(
    () => [...pages].sort((a, b) => b.page_views - a.page_views),
    [pages]
  )
  const sortedByUniques = useMemo(
    () => [...pages].sort((a, b) => b.unique_visitors - a.unique_visitors),
    [pages]
  )
  const sortedByStay = useMemo(
    () => [...pages].sort((a, b) => b.avg_stay_seconds - a.avg_stay_seconds),
    [pages]
  )

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
        <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Page Analytics</h2>
            <p className='text-muted-foreground'>
              Compare page visits, unique visitors, and average stay time.
            </p>
          </div>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Date range' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7'>Last 7 days</SelectItem>
              <SelectItem value='14'>Last 14 days</SelectItem>
              <SelectItem value='30'>Last 30 days</SelectItem>
              <SelectItem value='90'>Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='mb-6 grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Total Page Views</CardTitle>
              <Eye className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {isLoading ? '...' : (data?.total_page_views ?? 0).toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>All tracked pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Unique Visitors</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {isLoading
                  ? '...'
                  : (data?.total_unique_visitors ?? 0).toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>Distinct sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Avg Stay Time</CardTitle>
              <Clock3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {isLoading
                  ? '...'
                  : formatDuration(data?.overall_avg_stay_seconds ?? 0)}
              </div>
              <p className='text-xs text-muted-foreground'>Across all pages</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className='rounded-md border p-10 text-center text-muted-foreground'>
            Loading page analytics...
          </div>
        ) : pages.length === 0 ? (
          <div className='rounded-md border p-10 text-center text-muted-foreground'>
            No page visit data yet. Traffic will appear after storefront visitors browse the site.
          </div>
        ) : (
          <div className='grid gap-6 xl:grid-cols-1'>
            <Card>
              <CardHeader>
                <CardTitle>Page Views Comparison</CardTitle>
                <CardDescription>
                  Which pages received the most visits in the last {days} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PageMetricChart
                  data={sortedByViews}
                  dataKey='page_views'
                  barClassName='fill-primary'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unique Visitors by Page</CardTitle>
                <CardDescription>
                  How many different sessions visited each page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PageMetricChart
                  data={sortedByUniques}
                  dataKey='unique_visitors'
                  barClassName='fill-emerald-500'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Stay Time by Page</CardTitle>
                <CardDescription>
                  Pages where users spend the most time on average
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PageMetricChart
                  data={sortedByStay}
                  dataKey='avg_stay_seconds'
                  barClassName='fill-amber-500'
                  valueFormatter={(value) => formatDuration(value)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  )
}

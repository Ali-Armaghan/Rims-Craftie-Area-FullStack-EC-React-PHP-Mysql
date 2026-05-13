import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import apiClient from '@/lib/api-client'

type Commission = {
  id: number
  name: string
  email: string
  resale_code: string
  resale_balance: string
  total_referrals: number
  total_commissions: string
}

export function Commissions() {
  const { data: commissions = [], isLoading } = useQuery<Commission[]>({
    queryKey: ['commissions'],
    queryFn: async () => {
      const response = await apiClient.get('/resale')
      return response.data
    },
  })

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
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>ReSale Commissions</h2>
          <p className='text-muted-foreground'>
            Overview of user referrals and earned commissions (5%).
          </p>
        </div>

        <div className='rounded-md border'>
          {isLoading ? (
            <div className='p-8 text-center text-muted-foreground'>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Resale Code</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Total Commissions</TableHead>
                  <TableHead>Current Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length ? (
                  commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className='font-medium'>{c.name}</TableCell>
                      <TableCell className='text-muted-foreground'>{c.email}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='font-mono'>
                          {c.resale_code}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.total_referrals}</TableCell>
                      <TableCell className='text-green-600 font-medium'>
                        PKR {parseFloat(c.total_commissions).toFixed(2)}
                      </TableCell>
                      <TableCell className='font-medium'>
                        PKR {parseFloat(c.resale_balance).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      No commission data yet.
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

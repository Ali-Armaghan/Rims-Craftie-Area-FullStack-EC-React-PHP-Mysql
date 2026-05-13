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

type LedgerEntry = {
  id: number
  user_name: string
  resale_code: string
  type: 'credit' | 'debit'
  amount: string
  description: string
  created_at: string
}

export function Ledger() {
  const { data: entries = [], isLoading } = useQuery<LedgerEntry[]>({
    queryKey: ['resale-ledger'],
    queryFn: async () => {
      const response = await apiClient.get('/resale/ledger')
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
          <h2 className='text-2xl font-bold tracking-tight'>ReSale Ledger</h2>
          <p className='text-muted-foreground'>
            Full transaction history for resale balance credits and debits.
          </p>
        </div>

        <div className='rounded-md border'>
          {isLoading ? (
            <div className='p-8 text-center text-muted-foreground'>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length ? (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className='font-medium'>{entry.user_name}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='font-mono text-xs'>
                          {entry.resale_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.type === 'credit' ? 'default' : 'destructive'}
                          className='capitalize'
                        >
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          entry.type === 'credit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                        }
                      >
                        {entry.type === 'credit' ? '+' : '-'} PKR {parseFloat(entry.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm max-w-xs truncate'>
                        {entry.description}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      No ledger entries yet.
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

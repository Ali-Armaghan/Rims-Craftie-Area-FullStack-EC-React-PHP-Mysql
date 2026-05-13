import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ContentSection } from '../components/content-section'

type SaleCountdownSettings = {
  enabled: boolean
  ends_at: string | null
}

export function SettingsSaleCountdown() {
  const [enabled, setEnabled] = useState(false)
  const [endsAt, setEndsAt] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery<SaleCountdownSettings>({
    queryKey: ['sale-countdown-settings'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/sale-countdown')
      return response.data
    },
  })

  useEffect(() => {
    if (!data) return

    setEnabled(Boolean(data.enabled))
    setEndsAt(data.ends_at ?? '')
  }, [data])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await apiClient.post('/admin/sale-countdown', {
        enabled,
        ends_at: endsAt,
      })
      toast.success('Sale countdown updated')
    } catch {
      toast.error('Failed to update sale countdown')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ContentSection
      title='Sale Countdown'
      desc='Enable a sale countdown that appears on product pages.'
    >
      <Card>
        <CardContent className='grid gap-6 pt-6'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <Label className='text-base'>Show sale countdown</Label>
              <p className='text-sm text-muted-foreground'>
                When enabled, product pages show “Sales ends in” beside the
                price.
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={isLoading || saving}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='sale-countdown-ends-at'>Sale end time</Label>
            <Input
              id='sale-countdown-ends-at'
              type='datetime-local'
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              disabled={isLoading || saving}
            />
            <p className='text-xs text-muted-foreground'>
              Countdown will hide automatically after this time passes.
            </p>
          </div>

          <Button onClick={saveSettings} disabled={isLoading || saving}>
            {saving ? 'Saving...' : 'Save Countdown'}
          </Button>
        </CardContent>
      </Card>
    </ContentSection>
  )
}

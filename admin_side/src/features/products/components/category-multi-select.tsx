import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

type CategoryOption = {
  id: number | string
  name: string
}

type CategoryMultiSelectProps = {
  categories: CategoryOption[]
  value: number[]
  onChange: (value: number[]) => void
  disabled?: boolean
  className?: string
}

export function CategoryMultiSelect({
  categories,
  value,
  onChange,
  disabled = false,
  className,
}: CategoryMultiSelectProps) {
  const toggleCategory = (categoryId: number, checked: boolean) => {
    if (checked) {
      onChange(Array.from(new Set([...value, categoryId])))
      return
    }

    onChange(value.filter((id) => id !== categoryId))
  }

  return (
    <div
      className={cn(
        'max-h-48 space-y-2 overflow-y-auto rounded-md border p-3',
        disabled && 'opacity-60',
        className
      )}
    >
      {categories.length ? (
        categories.map((category) => {
          const categoryId = Number(category.id)
          const checked = value.includes(categoryId)

          return (
            <label
              key={category.id}
              className='flex cursor-pointer items-center gap-3 rounded-md px-1 py-1 hover:bg-muted/60'
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(next) =>
                  toggleCategory(categoryId, next === true)
                }
              />
              <span className='text-sm'>{category.name}</span>
            </label>
          )
        })
      ) : (
        <p className='text-sm text-muted-foreground'>No categories available.</p>
      )}
    </div>
  )
}

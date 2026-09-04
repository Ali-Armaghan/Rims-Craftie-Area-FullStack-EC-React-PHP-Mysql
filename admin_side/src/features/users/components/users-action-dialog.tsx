'use client'

import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { type User } from '../data/schema'

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First Name is required.'),
    lastName: z.string().min(1, 'Last Name is required.'),
    phoneNumber: z.string().min(1, 'Phone number is required.'),
    email: z.email({
      error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
    }),
    status: z.enum(['active', 'inactive']),
    password: z.string(),
    confirmPassword: z.string(),
    isEdit: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const password = data.password.trim()
    const confirmPassword = data.confirmPassword.trim()

    if (data.isEdit && !password) return

    if (!password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password is required.',
        path: ['password'],
      })
      return
    }

    if (password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters long.',
        path: ['password'],
      })
    }

    if (!/[a-z]/.test(password)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one lowercase letter.',
        path: ['password'],
      })
    }

    if (!/\d/.test(password)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one number.',
        path: ['password'],
      })
    }

    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: "Passwords don't match.",
        path: ['confirmPassword'],
      })
    }
  })
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const nameParts = useMemo(() => {
    const full = currentRow?.name?.trim() ?? ''
    if (!full) return { firstName: '', lastName: '' }
    const [firstName, ...rest] = full.split(/\s+/)
    return { firstName, lastName: rest.join(' ') }
  }, [currentRow?.name])

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          email: currentRow.email,
          password: '',
          confirmPassword: '',
          phoneNumber: currentRow.phone ?? '',
          status: currentRow.status,
          isEdit,
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          status: 'active',
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })

  useEffect(() => {
    if (!open) return

    if (isEdit && currentRow) {
      form.reset({
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        email: currentRow.email,
        phoneNumber: currentRow.phone ?? '',
        status: currentRow.status,
        password: '',
        confirmPassword: '',
        isEdit: true,
      })
      return
    }

    form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      status: 'active',
      password: '',
      confirmPassword: '',
      isEdit: false,
    })
  }, [open, isEdit, currentRow, form, nameParts])

  const onSubmit = async (values: UserForm) => {
    try {
      const payload = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phoneNumber,
        password: values.password.trim() || undefined,
        status: values.status,
      }

      if (isEdit && currentRow) {
        await apiClient.put('/admin/users', {
          ...payload,
          id: currentRow.id,
        })
      } else {
        await apiClient.post('/admin/users', payload)
      }

      await queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(isEdit ? 'User updated successfully' : 'User created successfully')
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response!.data!.message!
          : isEdit
            ? 'Failed to update user.'
            : 'Failed to create user.'
      toast.error(message)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password
  const generatePassword = () => {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let password = 'Cr'
    for (let i = 0; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    password += '1'
    form.setValue('password', password, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('confirmPassword', password, {
      shouldDirty: true,
      shouldValidate: true,
    })
    toast.message('Password generated', {
      description: `Share this login password with the user: ${password}`,
      duration: 12000,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='flex max-h-[90vh] w-[95vw] max-w-3xl flex-col gap-4 overflow-hidden sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update user account profile information and access status.'
              : 'Create a new customer or user account.'}
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto pe-1'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='grid gap-4 md:grid-cols-2'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John' autoComplete='off' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Doe' autoComplete='off' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='john.doe@gmail.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='+123456789' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      isControlled
                      items={[
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Password</FormLabel>
                    <div className='flex gap-2'>
                      <FormControl>
                        <PasswordInput
                          placeholder={
                            isEdit
                              ? 'Leave blank to keep current password'
                              : 'User login password'
                          }
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={generatePassword}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {isEdit
                        ? 'Optional on edit. Blank = password unchanged.'
                        : 'Password used by customer to log into the storefront.'}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder={
                          isEdit
                            ? 'Confirm only if changing password'
                            : 'Confirm login password'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='submit' form='user-form' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

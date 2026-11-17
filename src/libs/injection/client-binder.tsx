'use client'

import { createClientBinder } from '@/libraries/nextjs/client-binder'
import { provideLazy } from './client'

export const ClientBinder = createClientBinder(provideLazy)

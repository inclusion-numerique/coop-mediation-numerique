'use client'

import { createClientBinder } from '@/libraries/nextjs/injection/client-binder'
import { provideLazy } from '../../libraries/nextjs/injection/client'

export const ClientBinder = createClientBinder(provideLazy)

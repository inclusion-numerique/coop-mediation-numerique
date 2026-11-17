'use client'

import { createClientBinder } from '@app/web/libraries/nextjs/client-binder'
import { provideLazy } from './client'

export const ClientBinder = createClientBinder(provideLazy)

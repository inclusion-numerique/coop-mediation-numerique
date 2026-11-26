import type { PayloadInexploitable } from '../../../domain/errors'

export type AucunAgent = { readonly _tag: 'AucunAgent' }

export const AucunAgent = (): AucunAgent => ({ _tag: 'AucunAgent' })

export type EchecDeRecevoirWebhookRdv = PayloadInexploitable | AucunAgent

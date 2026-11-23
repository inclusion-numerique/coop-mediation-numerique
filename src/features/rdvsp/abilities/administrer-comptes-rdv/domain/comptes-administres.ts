import type { SanteCompteRdv } from '@/features/rdvsp/domain/compte/sante-compte'

type OrganisationDuCompte = {
  readonly organisation: {
    readonly id: number
    readonly name: string
    readonly email: string | null
  }
}

type DerniereSynchronisation = {
  readonly id: string
  readonly started: Date
  readonly ended: Date | null
  readonly error: string | null
  readonly drift: number
  readonly duration: number | null
}

export type ComptesAdministres = {
  readonly users: readonly {
    readonly id: string
    readonly name: string | null
    readonly email: string
    readonly sante: SanteCompteRdv
    readonly rdvAccount: {
      readonly id: number
      readonly _count: { readonly rdvs: number }
      readonly organisations: readonly OrganisationDuCompte[]
      readonly lastSync: DerniereSynchronisation | null
    }
  }[]
  readonly rdvs: { readonly total: number }
}

type EntiteSynchronisee =
  | 'rdvs'
  | 'organisations'
  | 'webhooks'
  | 'users'
  | 'motifs'
  | 'lieux'

type Mouvement = 'Count' | 'Drift' | 'Noop' | 'Created' | 'Updated' | 'Deleted'

type Synchronisation = {
  readonly id: string
  readonly started: Date
  readonly ended: Date | null
  readonly error: string | null
  readonly drift: number
  readonly log: string | null
} & { readonly [K in `${EntiteSynchronisee}${Mouvement}`]: number }

type OrganisationsDesWebhooks = {
  readonly count: number
  readonly organisations: readonly OrganisationDuCompte[]
}

export type CompteAdministre = {
  readonly user: {
    readonly id: string
    readonly name: string | null
    readonly email: string
    readonly rdvAccount: {
      readonly id: number
      readonly _count: { readonly rdvs: number }
      readonly syncLogs: readonly Synchronisation[]
      readonly created: Date
      readonly syncFrom: Date | null
      readonly accessToken: string | null
      readonly refreshToken: string | null
      readonly error: string | null
      readonly includeRdvsInActivitesList: boolean
      readonly organisations: readonly OrganisationDuCompte[]
    }
    readonly webhookStatus: {
      readonly valid: OrganisationsDesWebhooks
      readonly invalid: OrganisationsDesWebhooks
      readonly status: 'error' | 'success'
    }
  }
}

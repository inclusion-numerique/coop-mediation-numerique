import { telephoneDisplayString } from '@/libraries/telephone'

export type IdentiteDuProfil = {
  readonly nom: string | null
  readonly courriel: string
  readonly telephone: string | null
}

export type SectionsDuProfil = {
  readonly contrat: boolean
  readonly mediation: boolean
  readonly suppression: boolean
}

export const identiteDuProfil = ({
  name,
  email,
  phone,
}: {
  readonly name: string | null
  readonly email: string
  readonly phone: string | null
}): IdentiteDuProfil => ({
  nom: name,
  courriel: email,
  telephone: phone ? telephoneDisplayString(phone) : null,
})

export const sectionsDuProfil = ({
  coordinateur,
  conseillerNumerique,
}: {
  readonly coordinateur: boolean
  readonly conseillerNumerique: boolean
}): SectionsDuProfil => ({
  contrat: coordinateur || conseillerNumerique,
  mediation: coordinateur,
  suppression: !conseillerNumerique,
})

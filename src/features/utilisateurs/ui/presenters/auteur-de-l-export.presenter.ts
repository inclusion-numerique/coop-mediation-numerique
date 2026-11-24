import type { AuteurDExport } from '@/libraries/tableur/add-export-metadata'
import { libelleDuRole } from '../labels/role-utilisateur.labels'

export const auteurDeLExport = (utilisateur: {
  readonly firstName: string | null
  readonly lastName: string | null
  readonly role: string
  readonly isConseillerNumerique: boolean
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}): AuteurDExport => ({
  nom: utilisateur.lastName,
  prenom: utilisateur.firstName,
  role: libelleDuRole(utilisateur),
})

import type {
  AuteurId,
  MessageDeMaintenance,
} from '@/features/maintenance-mode/domain'

export type DemandeDeReglage =
  | { readonly _tag: 'Activer'; readonly message: MessageDeMaintenance | null }
  | { readonly _tag: 'Desactiver' }

export type PeriodeEnCours = { readonly id: string }

export type Ouverture = {
  readonly _tag: 'Ouvrir'
  readonly message: MessageDeMaintenance | null
  readonly auteurId: AuteurId
  readonly debut: Date
}

export type ChangementDeMessage = {
  readonly _tag: 'ChangerLeMessage'
  readonly periodeId: string
  readonly message: MessageDeMaintenance | null
}

export type Cloture = {
  readonly _tag: 'Clore'
  readonly periodeId: string
  readonly fin: Date
}

export type Reglage =
  | Ouverture
  | ChangementDeMessage
  | Cloture
  | { readonly _tag: 'RienAFaire' }

export const reglageDeLaMaintenance = ({
  periodeEnCours,
  demande,
  auteurId,
  maintenant,
}: {
  readonly periodeEnCours: PeriodeEnCours | null
  readonly demande: DemandeDeReglage
  readonly auteurId: AuteurId
  readonly maintenant: Date
}): Reglage => {
  if (demande._tag === 'Desactiver')
    return periodeEnCours === null
      ? { _tag: 'RienAFaire' }
      : { _tag: 'Clore', periodeId: periodeEnCours.id, fin: maintenant }

  return periodeEnCours === null
    ? { _tag: 'Ouvrir', message: demande.message, auteurId, debut: maintenant }
    : {
        _tag: 'ChangerLeMessage',
        periodeId: periodeEnCours.id,
        message: demande.message,
      }
}

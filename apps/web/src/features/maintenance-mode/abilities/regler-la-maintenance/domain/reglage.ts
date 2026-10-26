import type { MessageDeMaintenance } from '@app/web/features/maintenance-mode/domain'

export type DemandeDeReglage =
  | { readonly _tag: 'Activer'; readonly message: MessageDeMaintenance | null }
  | { readonly _tag: 'Desactiver' }

export type Reglage =
  | { readonly _tag: 'Ouvrir'; readonly message: MessageDeMaintenance | null }
  | {
      readonly _tag: 'ChangerLeMessage'
      readonly periodeId: string
      readonly message: MessageDeMaintenance | null
    }
  | { readonly _tag: 'Clore'; readonly periodeId: string }
  | { readonly _tag: 'RienAFaire' }

export const reglageDeLaMaintenance = ({
  periodeEnCours,
  demande,
}: {
  readonly periodeEnCours: { readonly id: string } | null
  readonly demande: DemandeDeReglage
}): Reglage => {
  if (demande._tag === 'Desactiver') {
    return periodeEnCours == null
      ? { _tag: 'RienAFaire' }
      : { _tag: 'Clore', periodeId: periodeEnCours.id }
  }
  return periodeEnCours == null
    ? { _tag: 'Ouvrir', message: demande.message }
    : {
        _tag: 'ChangerLeMessage',
        periodeId: periodeEnCours.id,
        message: demande.message,
      }
}

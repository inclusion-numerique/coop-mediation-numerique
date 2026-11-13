import { keyFor } from '@app/web/libs/injection/client'

export const OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY = keyFor<
  () => (rendezVous: { id: number; collectif: boolean }) => void
>('activites.ouvrir-la-saisie-du-statut-du-rdv')

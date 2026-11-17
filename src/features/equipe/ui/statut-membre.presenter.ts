import { dateAsDay } from '@app/web/utils/dateAsDay'
import type { StatutMembre } from '../domain'

export const libelleStatutMembre = (statut: StatutMembre): string => {
  switch (statut.type) {
    case 'Invitation':
      return `Invitation envoyée le ${dateAsDay(statut.envoyeeLe)}`
    case 'Inactif':
      return statut.derniereActivite.type === 'Aucune'
        ? 'Inactif'
        : `Inactif depuis le ${dateAsDay(statut.derniereActivite.date)}`
    case 'AncienMembre':
      return `Ancien membre depuis le ${dateAsDay(statut.jusquA)}`
    case 'ProfilSupprime':
      return `Profil supprimé le ${dateAsDay(statut.le)}`
    default:
      return 'Actif'
  }
}

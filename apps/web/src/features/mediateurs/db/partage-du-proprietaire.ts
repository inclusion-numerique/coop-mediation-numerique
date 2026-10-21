import type { ProprietairePartage } from '../domain'

export const partageDuProprietaire = (proprietaire: ProprietairePartage) =>
  proprietaire._tag === 'Mediateur'
    ? { mediateurId: proprietaire.mediateurId }
    : { coordinateurId: proprietaire.coordinateurId }

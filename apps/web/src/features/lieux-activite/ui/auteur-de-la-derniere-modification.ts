import { nomAffiche } from '@app/web/libraries/nom-affiche'
import type { LieuEnListe } from '../domain/lieu-en-liste'

export const auteurDeLaDerniereModification = ({
  derniereModificationPar,
}: Pick<LieuEnListe, 'derniereModificationPar'>): string | null =>
  derniereModificationPar == null
    ? null
    : nomAffiche({
        prenom: derniereModificationPar.firstName,
        nom: derniereModificationPar.lastName,
        nomComplet: derniereModificationPar.name,
        courriel: derniereModificationPar.email,
      })

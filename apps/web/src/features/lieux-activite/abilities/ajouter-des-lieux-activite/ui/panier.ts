import type { LieuActiviteSearchResult } from '@app/web/structure/searchLieuActiviteCombined'
import type { LieuxAAjouterData } from '../action/ajouter-des-lieux-activite.validation'

export type LieuAuPanier = LieuxAAjouterData['lieux'][number]

/**
 * Un résultat de recherche devient une entrée du panier.
 *
 * L'id de cartographie n'est retenu que pour les résultats qui en viennent
 * vraiment : la coop et l'annuaire des entreprises portent leur propre
 * identifiant dans le même champ, et le prendre pour un id carto ferait
 * chercher le lieu dans l'Entrepôt, où il n'est pas.
 */
export const auPanier = (resultat: LieuActiviteSearchResult): LieuAuPanier => ({
  id: resultat.structures.at(0)?.id ?? null,
  structureCartographieNationaleId:
    resultat.source === 'api' || resultat.source === 'structure_locale'
      ? null
      : resultat.id,
  nom: resultat.nom,
  siret: resultat.pivot,
  adresse: resultat.adresse,
  commune: resultat.commune,
  codePostal: resultat.codePostal,
  codeInsee: resultat.codeInsee,
})

/** Deux entrées désignent le même lieu si l'une de leurs identités coïncide. */
export const memeLieu = (un: LieuAuPanier, autre: LieuAuPanier): boolean =>
  (un.id != null && un.id === autre.id) ||
  (un.structureCartographieNationaleId != null &&
    un.structureCartographieNationaleId ===
      autre.structureCartographieNationaleId)

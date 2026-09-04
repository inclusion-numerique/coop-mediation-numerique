import { geocodeStructureAdresse } from '@app/web/external-apis/ban/geocodeStructureAdresse'
import type { LieuActiviteSearchResult } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
import type { LieuxAAjouterData } from '../action/ajouter-des-lieux-activite.validation'

export type LieuAuPanier = LieuxAAjouterData['lieux'][number]

/**
 * Un résultat de recherche devient une entrée du panier, selon sa provenance.
 *
 * Un lieu que la coop connaît déjà se rattache par son id : rien de son adresse
 * ne sera réécrit, et la lui redemander refuserait le rattachement pour un
 * défaut de données dont cet ajout n'est pas responsable.
 *
 * Tout autre lieu sera CRÉÉ, et l'on ne crée plus de lieu dont l'adresse n'a pas
 * été reconnue par la Base Adresse Nationale — cartographie nationale comprise,
 * qui ne porte pas d'identifiant BAN. Sans lui, rien ne distingue une adresse
 * validée d'une adresse saisie à l'estime, et un lieu qu'on ne sait pas situer
 * n'apparaît sur aucune carte. Rend `null` à défaut : à l'écran de renvoyer
 * l'utilisateur vers la saisie manuelle.
 *
 * L'id de cartographie n'est retenu que pour les résultats qui en viennent
 * vraiment : la coop et l'annuaire des entreprises portent leur propre
 * identifiant dans le même champ, et le prendre pour un id carto ferait
 * chercher le lieu dans l'Entrepôt, où il n'est pas.
 */
export const auPanier = async (
  resultat: LieuActiviteSearchResult,
): Promise<LieuAuPanier | null> => {
  const lieuCoop = resultat.structures.at(0)

  if (lieuCoop)
    return {
      id: lieuCoop.id,
      structureCartographieNationaleId: null,
      nom: resultat.nom,
      siret: resultat.pivot,
      adresse: resultat.adresse,
      commune: resultat.commune,
      codePostal: resultat.codePostal,
      codeInsee: resultat.codeInsee,
    }

  const adresseBan = await geocodeStructureAdresse(resultat)

  if (!adresseBan) return null

  return {
    id: null,
    structureCartographieNationaleId:
      resultat.source === 'cartographie_nationale' ? resultat.id : null,
    nom: resultat.nom,
    siret: resultat.pivot,
    adresse: adresseBan.nom,
    commune: adresseBan.commune,
    codePostal: adresseBan.codePostal,
    codeInsee: adresseBan.codeInsee,
    banId: adresseBan.id,
    latitude: adresseBan.latitude,
    longitude: adresseBan.longitude,
  }
}

/** Deux entrées désignent le même lieu si l'une de leurs identités coïncide. */
export const memeLieu = (un: LieuAuPanier, autre: LieuAuPanier): boolean =>
  (un.id != null && un.id === autre.id) ||
  (un.structureCartographieNationaleId != null &&
    un.structureCartographieNationaleId ===
      autre.structureCartographieNationaleId)

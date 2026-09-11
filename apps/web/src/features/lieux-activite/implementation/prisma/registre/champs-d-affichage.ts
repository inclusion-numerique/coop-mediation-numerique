import {
  adresseDeLInscription,
  type InscriptionPourLaFiche,
} from './fiche-du-registre'

/**
 * N'y figure pas `visiblePourCartographieNationale`. C'est le seul champ dont
 * la coop reste l'auteur et le registre le miroir : l'interrupteur de partage
 * écrit la colonne coop, et c'est elle que `lieuxPublies` interroge à la
 * moisson. La lire au registre ferait annoncer par la liste une publication que
 * la carte ne ferait pas.
 */
export type ChampsDAffichage = {
  readonly nom: InscriptionPourLaFiche['nom']
  readonly nomUsage: InscriptionPourLaFiche['nomUsage']
  readonly adresse: string | null
  readonly complementAdresse: string | null
  readonly commune: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
  readonly typologies: InscriptionPourLaFiche['typologies']
  readonly structureCartographieNationaleId: InscriptionPourLaFiche['structureCartographieNationaleId']
}

export const champsDAffichage = (
  inscription: InscriptionPourLaFiche,
): ChampsDAffichage => {
  const adresse = adresseDeLInscription(inscription)

  return {
    nom: inscription.nom,
    nomUsage: inscription.nomUsage,
    adresse: adresse?.voie ?? null,
    complementAdresse: adresse?.complement_adresse ?? null,
    commune: adresse?.commune ?? null,
    codePostal: adresse?.code_postal ?? null,
    codeInsee: adresse?.code_insee ?? null,
    typologies: inscription.typologies,
    structureCartographieNationaleId:
      inscription.structureCartographieNationaleId,
  }
}

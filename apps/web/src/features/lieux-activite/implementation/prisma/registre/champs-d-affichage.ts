import {
  adresseDeLInscription,
  type InscriptionPourLaFiche,
} from './fiche-du-registre'

export type ChampsDAffichage = {
  readonly nom: InscriptionPourLaFiche['nom']
  readonly nomUsage: InscriptionPourLaFiche['nomUsage']
  readonly adresse: string | null
  readonly complementAdresse: string | null
  readonly commune: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
  readonly typologies: InscriptionPourLaFiche['typologies']
  readonly visiblePourCartographieNationale: InscriptionPourLaFiche['visiblePourCartographieNationale']
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
    visiblePourCartographieNationale:
      inscription.visiblePourCartographieNationale,
    structureCartographieNationaleId:
      inscription.structureCartographieNationaleId,
  }
}

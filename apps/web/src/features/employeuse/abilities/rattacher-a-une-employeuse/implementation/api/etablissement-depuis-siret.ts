import { fetchSiretApiData } from '@app/web/external-apis/siret/fetchSiretData'
import type { EtablissementSirene } from '../../../../domain/identite-employeuse'

/**
 * Traduit une réponse de l'API Recherche d'entreprises en établissement du
 * domaine. Adaptateur pur transport : il n'a pas d'avis sur ce qui fait une
 * identité valable — c'est `identiteDepuisEtablissement` qui juge.
 *
 * `null` quand l'API n'a rien à dire (erreur, indisponibilité) : l'appelant ne
 * doit pas échouer pour autant.
 */
export const etablissementDepuisSiret = async (
  siret: string,
): Promise<EtablissementSirene | null> => {
  const reponse = await fetchSiretApiData(siret)

  if ('error' in reponse) {
    // biome-ignore lint/suspicious/noConsole: trace d'appel externe
    console.error(
      `Recherche d’entreprises indisponible pour le SIRET ${siret} :`,
      reponse.error.statusCode,
      reponse.error.message,
    )
    return null
  }

  const {
    data: {
      unite_legale: { personne_morale_attributs },
      etat_administratif,
      adresse,
    },
  } = reponse

  return {
    siret,
    raisonSociale: personne_morale_attributs?.raison_sociale ?? null,
    // `F` = fermé, dans le vocabulaire SIRENE.
    ferme: etat_administratif === 'F',
    voie:
      [
        adresse.numero_voie,
        adresse.indice_repetition_voie,
        adresse.type_voie,
        adresse.libelle_voie,
        adresse.complement_adresse,
      ]
        // L'API sérialise parfois l'absence par la chaîne « null ».
        .filter((part) => Boolean(part) && part !== 'null')
        .join(' ') || null,
    commune: adresse.libelle_commune ?? null,
    codePostal: adresse.code_postal ?? null,
    codeInsee: adresse.code_commune ?? null,
  }
}

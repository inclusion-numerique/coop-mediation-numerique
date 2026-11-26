import { fetchSiretApiData } from '@/features/employeuse/implementations/api-entreprise/fetch-siret-data.query'
import { failure, success } from '@/libraries/result'
import { EmployeuseIndisponible } from '../../domain/errors'
import type { LireLEtablissement } from '../../domain/ports'

export const etablissementDepuisSiret: LireLEtablissement = async (siret) => {
  const reponse = await fetchSiretApiData(siret)

  if ('error' in reponse) {
    // biome-ignore lint/suspicious/noConsole: trace d'appel externe
    console.error(
      `Recherche d’entreprises indisponible pour le SIRET ${siret} :`,
      reponse.error.statusCode,
      reponse.error.message,
    )
    return failure(EmployeuseIndisponible())
  }

  const {
    data: {
      unite_legale: { personne_morale_attributs },
      etat_administratif,
      adresse,
    },
  } = reponse

  return success({
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
  })
}

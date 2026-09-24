import { fetchSiretApiData } from '@app/web/external-apis/siret/fetchSiretData'
import { throttleApiEntreprise } from '@app/web/libraries/siret'
import type { InterrogerSirene } from '../domain/reprise-du-siret'

const SIRET_ABSENT_DES_RESULTATS = 404

const ETABLISSEMENT_FERME = 'F'

const SUFFIXES: Readonly<Record<string, string>> = {
  B: 'bis',
  T: 'ter',
  Q: 'quater',
}

const suffixe = (indice: string | null | undefined): string | null =>
  indice == null ? null : (SUFFIXES[indice.toUpperCase()] ?? indice)

const renseigne = (partie: string | null | undefined): partie is string =>
  partie != null && partie !== '' && partie !== 'null'

export const interrogerSirene: InterrogerSirene = async (siret) => {
  const reponse = await fetchSiretApiData(siret)

  await throttleApiEntreprise()

  if ('error' in reponse)
    return reponse.error.statusCode === SIRET_ABSENT_DES_RESULTATS
      ? { etat: 'inconnu' }
      : { etat: 'injoignable' }

  const { unite_legale, etat_administratif, adresse } = reponse.data

  if (etat_administratif === ETABLISSEMENT_FERME) return { etat: 'ferme' }

  return {
    etat: 'ouvert',
    etablissement: {
      nom:
        unite_legale.personne_morale_attributs?.raison_sociale ??
        unite_legale.nom_complet,
      voie: [
        adresse.numero_voie,
        suffixe(adresse.indice_repetition_voie),
        adresse.type_voie,
        adresse.libelle_voie,
      ]
        .filter(renseigne)
        .join(' '),
      codePostal: adresse.code_postal ?? '',
      commune: adresse.libelle_commune ?? '',
      codeInsee: adresse.code_commune ?? '',
    },
  }
}

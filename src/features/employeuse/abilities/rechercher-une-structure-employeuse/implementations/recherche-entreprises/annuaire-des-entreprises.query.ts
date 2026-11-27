import { rechercheApiEntreprise } from '@/configuration/recherche-entreprises'
import { Siret } from '@/libraries/insee'
import {
  type EtablissementDepuisUniteLegale,
  etablissementsDepuisUniteLegale,
} from '@/libraries/recherche-entreprises'
import { failure, success } from '@/libraries/result'
import { AnnuaireIndisponible } from '../../domain/errors'

const structureDeLAnnuaire = ({
  siret,
  ...etablissement
}: EtablissementDepuisUniteLegale) => {
  const siretDecode = Siret.safe(siret)

  return siretDecode === null
    ? []
    : [{ ...etablissement, siret: siretDecode, source: 'api' as const }]
}

export const lireLAnnuaireDesEntreprises = (recherche: string) =>
  rechercheApiEntreprise({
    q: recherche,
    minimal: true,
    include: 'complements,matching_etablissements',
  })
    .then((reponse) =>
      success({
        structures: reponse.results
          .flatMap(etablissementsDepuisUniteLegale)
          .flatMap(structureDeLAnnuaire),
        total: reponse.total_results ?? 0,
      }),
    )
    .catch(() => failure(AnnuaireIndisponible()))

import z from 'zod'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '../../domain/filtres-des-activites'

const ActivitesFiltersLus = z.object({
  du: ActivitesFilterValidations.du.catch(undefined),
  au: ActivitesFilterValidations.au.catch(undefined),
  types: ActivitesFilterValidations.types.catch(undefined),
  rdvs: ActivitesFilterValidations.rdvs.catch(undefined),
  mediateurs: ActivitesFilterValidations.mediateurs.catch(undefined),
  beneficiaires: ActivitesFilterValidations.beneficiaires.catch(undefined),
  communes: ActivitesFilterValidations.communes.catch(undefined),
  departements: ActivitesFilterValidations.departements.catch(undefined),
  lieux: ActivitesFilterValidations.lieux.catch(undefined),
  conseiller_numerique:
    ActivitesFilterValidations.conseiller_numerique.catch(undefined),
  demarches_administratives:
    ActivitesFilterValidations.demarches_administratives.catch(undefined),
  thematiqueNonAdministratives:
    ActivitesFilterValidations.thematiqueNonAdministratives.catch(undefined),
  thematiqueAdministratives:
    ActivitesFilterValidations.thematiqueAdministratives.catch(undefined),
  tags: ActivitesFilterValidations.tags.catch(undefined),
  structuresEmployeuses:
    ActivitesFilterValidations.structuresEmployeuses.catch(undefined),
  rdv: ActivitesFilterValidations.rdv.catch(undefined),
  source: ActivitesFilterValidations.source.catch(undefined),
})

export const validateActivitesFilters = (
  parametres: Readonly<Record<string, unknown>>,
): ActivitesFilters => ActivitesFiltersLus.parse(parametres)

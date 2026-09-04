import { DescriptionShape } from './DescriptionValidation'
import { IdentiteLieuShape } from './InformationsGeneralesValidation'
import { InformationsPratiquesShape } from './InformationsPratiquesValidation'
import { ModalitesAccesAuServiceShape } from './ModalitesAccesAuServiceValidation'
import { ServicesEtAccompagnementShape } from './ServicesEtAccompagnementValidation'
import { TypesDePublicsAccueillisShape } from './TypesDePublicsAccueillisValidation'
import { VisiblePourCartographieNationaleShape } from './VisiblePourCartographieNationaleValidation'

/**
 * Ce qui se saisit à la création d'un lieu d'activité, quel que soit le parcours
 * qui y mène (inscription ou gestion des lieux). Aucune immatriculation : on ne
 * crée un lieu que lorsque la recherche par nom, adresse ou SIRET n'a rien rendu.
 */
export const CreerLieuShape = {
  ...IdentiteLieuShape,
  ...VisiblePourCartographieNationaleShape,
  ...DescriptionShape,
  ...InformationsPratiquesShape,
  ...ModalitesAccesAuServiceShape,
  ...ServicesEtAccompagnementShape,
  ...TypesDePublicsAccueillisShape,
}

/** Un lieu visible sur la cartographie doit annoncer au moins un service. */
export const auMoinsUnServiceSiVisible: [
  (data: {
    visiblePourCartographieNationale?: boolean
    services?: unknown[] | null
  }) => boolean,
  { message: string; path: (string | number)[] },
] = [
  (data) =>
    !data.visiblePourCartographieNationale || (data.services?.length ?? 0) > 0,
  {
    message:
      'Au moins un service doit être renseigné pour que le lieu d’activité soit visible sur la cartographie.',
    path: ['services'],
  },
]

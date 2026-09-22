import type { UserId } from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import {
  AdresseNonReconnue,
  type AjouterStructureEmployeuseEnLieuError,
  EmployeuseIntrouvable,
} from '../domain'
import type { EmployeuseId } from '../domain/employeuse-id'
import type { GeocoderLAdresse } from '../domain/ports'
import {
  delierStructureEmployeuseEnLieu,
  lierStructureEmployeuseEnLieu,
  lireEmployeuseActuelle,
  lireLAdresseDeLEmployeuse,
} from '../implementation'

/**
 * Le géocodeur est le seul recours au réseau de ce cas d'usage : il se passe
 * en port pour qu'un scénario puisse répondre à sa place, comme la vérification
 * des SIRET le fait de l'annuaire des entreprises. Tout le reste est la base,
 * que les scénarios interrogent pour de vrai.
 */
export type PortsDeMaterialisation = {
  readonly geocoderLAdresse: GeocoderLAdresse
}

/**
 * L'adresse de l'employeuse vient de SIRENE, qui mêle au libellé de voie le nom
 * du bâtiment, la boîte postale ou le service. La Base Adresse Nationale la
 * reconnaît, ou personne ne la reconnaîtra : on ne matérialise pas un lieu dont
 * l'adresse n'a jamais été validée, pas plus ici qu'à la recherche par SIRET.
 */
const adresseDuLieuAMaterialiser = async (
  structureEmployeuseId: EmployeuseId,
  { geocoderLAdresse }: PortsDeMaterialisation,
) => {
  const adresse = await lireLAdresseDeLEmployeuse(structureEmployeuseId)

  return adresse == null ? null : geocoderLAdresse(adresse)
}

/**
 * Cas d'usage « la structure employeuse est-elle un lieu d'activité ? ». Étape
 * intermédiaire du parcours lieux-activité : aucune transition d'état ni
 * franchissement — le seul choix est de rattacher (Oui) ou détacher (Non) la
 * structure employeuse comme lieu. La matérialisation est entièrement infra,
 * d'où l'absence de décideur pur ; couvert en BDD.
 *
 * L'employeuse se résout depuis l'acteur : c'est ce qui rend structurel
 * l'invariant « on ne déclare que sa propre employeuse ». La recevoir en
 * paramètre reviendrait à accepter de l'appelant une décision d'autorisation.
 */
export const ajouterStructureEmployeuseEnLieu = async (
  {
    userId,
    estLieuActivite,
  }: {
    readonly userId: UserId
    readonly estLieuActivite: boolean
  },
  ports: PortsDeMaterialisation,
): Promise<Result<void, AjouterStructureEmployeuseEnLieuError>> => {
  const structureEmployeuseId = await lireEmployeuseActuelle(userId)

  if (structureEmployeuseId === null)
    return failure(EmployeuseIntrouvable(userId))

  if (!estLieuActivite) {
    await delierStructureEmployeuseEnLieu({ userId, structureEmployeuseId })
    return success<void>(undefined)
  }

  const adresseBan = await adresseDuLieuAMaterialiser(
    structureEmployeuseId,
    ports,
  )

  if (adresseBan == null)
    return failure(AdresseNonReconnue(structureEmployeuseId))

  await lierStructureEmployeuseEnLieu({
    userId,
    structureEmployeuseId,
    adresseBan,
  })

  return success<void>(undefined)
}

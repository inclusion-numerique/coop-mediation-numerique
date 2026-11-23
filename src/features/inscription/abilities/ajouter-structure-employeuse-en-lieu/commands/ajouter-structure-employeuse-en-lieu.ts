import type { UserId } from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  AdresseNonReconnue,
  type AjouterStructureEmployeuseEnLieuError,
  EmployeuseIntrouvable,
  ServiceAdresseIndisponible,
} from '../domain'
import { EmployeuseId } from '../domain/employeuse-id'
import type {
  ConsulterEmployeuseActuelle,
  DetacherDuLieuDecrit,
  Geocodage,
  GeocoderLAdresse,
  RattacherAuLieuDecrit,
} from '../domain/ports'
import {
  lieuDepuisEmployeuse,
  lireLAdresseDeLEmployeuse,
} from '../implementations'

/**
 * Le géocodeur est le seul recours au réseau de ce cas d'usage : il se passe
 * en port pour qu'un scénario puisse répondre à sa place, comme la vérification
 * des SIRET le fait de l'annuaire des entreprises. Tout le reste est la base,
 * que les scénarios interrogent pour de vrai.
 */
export type PortsDeMaterialisation = {
  readonly geocoderLAdresse: GeocoderLAdresse
  readonly consulterEmployeuseActuelle: ConsulterEmployeuseActuelle
  readonly rattacherAuLieuDecrit: RattacherAuLieuDecrit
  readonly detacherDuLieuDecrit: DetacherDuLieuDecrit
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
): Promise<Geocodage> => {
  const adresse = await lireLAdresseDeLEmployeuse(structureEmployeuseId)

  return adresse == null
    ? { _tag: 'AdresseInconnue' }
    : geocoderLAdresse(adresse)
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
  const actuelle = await ports.consulterEmployeuseActuelle({ userId })

  if (actuelle === null) return failure(EmployeuseIntrouvable(userId))

  const { employeuse } = actuelle
  const structureEmployeuseId = EmployeuseId(employeuse.id)
  const trace = { userId, structureId: employeuse.id }

  if (!estLieuActivite) {
    await ports.detacherDuLieuDecrit({
      userId,
      lieu: lieuDepuisEmployeuse(employeuse),
      trace,
    })
    return success<void>(undefined)
  }

  const geocodage = await adresseDuLieuAMaterialiser(
    structureEmployeuseId,
    ports,
  )

  if (geocodage._tag === 'ServiceIndisponible')
    return failure(ServiceAdresseIndisponible(structureEmployeuseId))

  if (geocodage._tag === 'AdresseInconnue')
    return failure(AdresseNonReconnue(structureEmployeuseId))

  await ports.rattacherAuLieuDecrit({
    userId,
    lieu: lieuDepuisEmployeuse(employeuse, geocodage.adresse),
    trace,
  })

  return success<void>(undefined)
}

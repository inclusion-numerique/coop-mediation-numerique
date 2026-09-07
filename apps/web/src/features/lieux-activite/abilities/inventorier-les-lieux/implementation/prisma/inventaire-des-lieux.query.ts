import { prismaClient } from '@app/web/prismaClient'
import type { LigneDuLieu } from '../../../../implementation/prisma/ligne-du-lieu'
import * as vocabulaire from '../../../../implementation/prisma/vocabulaire'

/**
 * Les nomenclatures rendues dans les valeurs du schéma national, et non sous
 * les noms que la base leur donne.
 *
 * L'inventaire sert des clients d'API : c'est le vocabulaire du standard qu'ils
 * attendent, comme le reste de la coop. La traduction se fait donc ici, dans
 * l'implémentation, plutôt que chez l'appelant — qui n'a alors plus rien à
 * connaître de la façon dont on stocke.
 *
 * `LigneDuLieu` porte la garde d'alignement : si les noms stockés et ceux du
 * vocabulaire divergeaient, cette conversion cesserait de compiler.
 */
const auVocabulaireDuStandard = <Ligne extends LigneDuLieu>(ligne: Ligne) => ({
  ...ligne,
  typologies: vocabulaire.traduites(
    ligne.typologies,
    vocabulaire.typologie.versStandard,
  ),
  services: vocabulaire.traduites(
    ligne.services,
    vocabulaire.service.versStandard,
  ),
  publicsSpecifiquementAdresses: vocabulaire.traduites(
    ligne.publicsSpecifiquementAdresses,
    vocabulaire.publicSpecifiquementAdresse.versStandard,
  ),
  priseEnChargeSpecifique: vocabulaire.traduites(
    ligne.priseEnChargeSpecifique,
    vocabulaire.priseEnChargeSpecifique.versStandard,
  ),
  modalitesAcces: vocabulaire.traduites(
    ligne.modalitesAcces,
    vocabulaire.modaliteAcces.versStandard,
  ),
  fraisACharge: vocabulaire.traduites(
    ligne.fraisACharge,
    vocabulaire.fraisACharge.versStandard,
  ),
  itinerance: vocabulaire.traduites(
    ligne.itinerance,
    vocabulaire.itinerance.versStandard,
  ),
  dispositifProgrammesNationaux: vocabulaire.traduites(
    ligne.dispositifProgrammesNationaux,
    vocabulaire.dispositifProgrammeNational.versStandard,
  ),
  formationsLabels: vocabulaire.traduites(
    ligne.formationsLabels,
    vocabulaire.formationLabel.versStandard,
  ),
  modalitesAccompagnement: vocabulaire.traduites(
    ligne.modalitesAccompagnement,
    vocabulaire.modaliteAccompagnement.versStandard,
  ),
})

/**
 * L'inventaire des lieux, tel que les clients d'API le parcourent.
 *
 * Deux différences avec ce que publie la cartographie : on rend TOUT, y compris
 * les lieux supprimés — un client qui tient un miroir a besoin de savoir qu'une
 * ligne a disparu, et son horodatage de suppression est la seule façon de le
 * lui dire —, et on ne filtre pas sur la visibilité, qui ne regarde que la
 * carte.
 *
 * L'ordre est celui du curseur : création décroissante, l'identifiant
 * départageant les créations simultanées.
 */
export const inventaireDesLieux = async ({
  ids,
  creeDepuis,
  modifieDepuis,
  take,
  skip,
  curseur,
}: {
  readonly ids: readonly string[]
  readonly creeDepuis?: Date
  readonly modifieDepuis?: Date
  readonly take: number
  readonly skip?: number
  readonly curseur?: { readonly creation: string; readonly id: string }
}) => {
  const where = {
    ...(ids.length > 0 ? { id: { in: [...ids] } } : {}),
    ...(creeDepuis ? { creation: { gte: creeDepuis } } : {}),
    ...(modifieDepuis ? { modification: { gte: modifieDepuis } } : {}),
  }

  const lieux = await prismaClient.lieuInclusion.findMany({
    orderBy: [{ creation: 'desc' }, { id: 'desc' }],
    take,
    skip,
    where,
    include: {
      _count: {
        select: {
          mediateursEnActivite: { where: { suppression: null, fin: null } },
        },
      },
    },
    cursor: curseur
      ? { creation_id: { creation: curseur.creation, id: curseur.id } }
      : undefined,
  })

  const totalCount = await prismaClient.lieuInclusion.count({ where })

  return { lieux: lieux.map(auVocabulaireDuStandard), totalCount }
}

export type LieuInventorie = Awaited<
  ReturnType<typeof inventaireDesLieux>
>['lieux'][number]

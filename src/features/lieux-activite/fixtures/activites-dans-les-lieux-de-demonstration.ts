import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { mergeUuids } from '@/libraries/fixtures'
import { centreSocial, mediateque } from './lieux-de-demonstration'

export type MediateursDesPersonas = {
  readonly conseillerNumerique: string
  readonly coordinateurHorsDispositifInscritAvecTout: string
  readonly coordinateurInscriptionAvecTout: string
  readonly coordinateurInscritAvecTout: string
  readonly exConseillerApresRupture: string
  readonly mediateurAvecActivite: string
  readonly mediateurSansActivites: string
}

export type MembresDeLEquipeCoordonnee = {
  readonly inviteEnAttente: string
  readonly conseillerNumeriqueActif: string
  readonly mediateurActif: string
  readonly conseillerNumeriqueInactif: string
  readonly mediateurInactif: string
  readonly mediateurAQuitte: string
  readonly conseillerNumeriqueAQuitte: string
  readonly mediateurProfilSupprime: string
  readonly conseillerNumeriqueProfilSupprime: string
}

type ActiviteDansUnLieu = Prisma.MediateurEnActiviteCreateManyInput & {
  readonly id: string
  readonly mediateurId: string
}

const ilYASixMois = (): Date => {
  const maintenant = new Date()
  return new Date(
    maintenant.getFullYear(),
    maintenant.getMonth() - 6,
    maintenant.getDate(),
    maintenant.getHours(),
    maintenant.getMinutes(),
    maintenant.getSeconds(),
    maintenant.getMilliseconds(),
  )
}

const activite = (
  id: string,
  mediateurId: string,
  lieu: { readonly id: string },
  debut: Date = new Date(),
): ActiviteDansUnLieu => ({ id, mediateurId, structureId: lieu.id, debut })

export const activitesDesPersonas = (
  mediateurs: MediateursDesPersonas,
): ActiviteDansUnLieu[] => [
  activite(
    '86643b16-de10-421e-b056-d820994572d1',
    mediateurs.conseillerNumerique,
    mediateque,
  ),
  activite(
    'ef672b71-807b-41a6-9aca-3fac76478616',
    mediateurs.conseillerNumerique,
    centreSocial,
  ),
  activite(
    '088db964-eb01-4738-bd4c-511fbe2eda65',
    mediateurs.coordinateurHorsDispositifInscritAvecTout,
    mediateque,
  ),
  activite(
    '80a86dd3-b358-4abb-9757-eb23b0fb32e4',
    mediateurs.coordinateurHorsDispositifInscritAvecTout,
    centreSocial,
  ),
  activite(
    '0a090e89-4ac6-477b-8bf9-4c7252142270',
    mediateurs.coordinateurInscriptionAvecTout,
    mediateque,
  ),
  activite(
    'ec85721f-2d0f-4bbb-8450-e417cdae15b5',
    mediateurs.coordinateurInscriptionAvecTout,
    centreSocial,
  ),
  activite(
    '205a4bcb-d5e8-48e2-ba18-9601cd057ba9',
    mediateurs.coordinateurInscritAvecTout,
    mediateque,
  ),
  activite(
    'b8e84702-10c3-4497-8960-8079aed42b23',
    mediateurs.coordinateurInscritAvecTout,
    centreSocial,
  ),
  activite(
    '01e3e68a-b42b-4d00-bcb7-e51c5f682371',
    mediateurs.exConseillerApresRupture,
    mediateque,
  ),
  activite(
    '4bad4ee5-f446-4739-ae93-9974d81aa0c0',
    mediateurs.mediateurAvecActivite,
    mediateque,
  ),
  activite(
    '10a8ef22-2b40-41cb-a093-ae82686f24b1',
    mediateurs.mediateurSansActivites,
    mediateque,
  ),
]

export const activitesDeLEquipeCoordonnee = (
  membres: MembresDeLEquipeCoordonnee,
): ActiviteDansUnLieu[] => [
  activite(
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    membres.inviteEnAttente,
    mediateque,
  ),
  activite(
    'a7b8c9d0-e1f2-3456-0123-567890123456',
    membres.conseillerNumeriqueActif,
    mediateque,
  ),
  activite(
    'e1f2a3b4-c5d6-7890-4567-901234567890',
    membres.mediateurActif,
    mediateque,
  ),
  activite(
    'c5d6e7f8-a9b0-1234-8901-345678901234',
    membres.conseillerNumeriqueInactif,
    mediateque,
    ilYASixMois(),
  ),
  activite(
    'a9b0c1d2-e3f4-5678-2345-789012345678',
    membres.mediateurInactif,
    mediateque,
    ilYASixMois(),
  ),
  activite(
    'e3f4a5b6-c7d8-9012-6789-123456789012',
    membres.mediateurAQuitte,
    mediateque,
  ),
  activite(
    'c7d8e9f0-a1b2-3456-0123-567890123456',
    membres.conseillerNumeriqueAQuitte,
    mediateque,
  ),
  activite(
    'a1b2c3d4-e5f6-7890-4567-901234567890',
    membres.mediateurProfilSupprime,
    mediateque,
    ilYASixMois(),
  ),
  activite(
    'e5f6a7b8-c9d0-1234-8901-234567890123',
    membres.conseillerNumeriqueProfilSupprime,
    mediateque,
    ilYASixMois(),
  ),
]

export const activitesDesEquipesProduit = (
  mediateurIds: readonly string[],
): ActiviteDansUnLieu[] =>
  mediateurIds.map((mediateurId) =>
    activite(mergeUuids(mediateurId, mediateque.id), mediateurId, mediateque),
  )

const mediateursPresents = async (
  transaction: Prisma.TransactionClient,
  activites: readonly ActiviteDansUnLieu[],
): Promise<ReadonlySet<string>> =>
  new Set(
    (
      await transaction.mediateur.findMany({
        where: { id: { in: activites.map(({ mediateurId }) => mediateurId) } },
        select: { id: true },
      })
    ).map(({ id }) => id),
  )

export const semerLesActivitesDansLesLieux = async (
  transaction: Prisma.TransactionClient,
  activites: readonly ActiviteDansUnLieu[],
) => {
  const presents = await mediateursPresents(transaction, activites)

  return transaction.mediateurEnActivite.createMany({
    data: activites.filter(({ mediateurId }) => presents.has(mediateurId)),
    skipDuplicates: true,
  })
}

export const semerLesActivitesDuPersonaDansLesLieux =
  (mediateurs: MediateursDesPersonas) => (mediateurId: string) =>
    semerLesActivitesDansLesLieux(
      prismaClient,
      activitesDesPersonas(mediateurs).filter(
        (activiteDuPersona) => activiteDuPersona.mediateurId === mediateurId,
      ),
    )

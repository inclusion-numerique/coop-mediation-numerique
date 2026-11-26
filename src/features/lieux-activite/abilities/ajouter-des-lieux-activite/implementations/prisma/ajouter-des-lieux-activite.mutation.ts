import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import {
  lieuDisparu,
  preparerLeLieu,
} from '../../../../implementations/prisma/destination-du-lieu.mutation'
import {
  fromAdresse,
  lieuFromDomain,
} from '../../../../implementations/prisma/lieu.transfer'
import { colonnesRapporteesParLaCartographie } from '../../../../implementations/prisma/registre/colonnes-a-ecrire.select'
import { ecrireLeLieuAuRegistre } from '../../../../implementations/prisma/registre/ecrire-au-registre.mutation'
import type {
  AdresseValidee,
  CreationDemandee,
  DestinationDuLieu,
  RattachementAuxLieux,
  RattacherAuxLieux,
} from '../../domain'
import { rattacherSiAbsent } from './destinations.mutation'

const adresseValidee = ({ adresse, localisation, banId }: AdresseValidee) => ({
  ...fromAdresse(adresse),
  banId,
  latitude: localisation.latitude,
  longitude: localisation.longitude,
})

const donneesDuLieu = (id: LieuId, { demande, carto }: CreationDemandee) =>
  carto === null
    ? {
        id,
        nom: demande.nom,
        siret: demande.siret ?? null,
        ...adresseValidee(demande),
      }
    : { ...lieuFromDomain(carto), ...adresseValidee(demande) }

const creerLeLieu =
  (transaction: Prisma.TransactionClient, maintenant: Date) =>
  async (
    id: LieuId,
    creation: CreationDemandee,
  ): Promise<{ readonly id: string }> => {
    const cree = await transaction.lieuInclusion.create({
      data: donneesDuLieu(id, creation),
    })

    const identifiantCartographie =
      creation.demande.structureCartographieNationaleId ?? null

    await ecrireLeLieuAuRegistre(transaction, {
      colonnes: colonnesRapporteesParLaCartographie,
      ligne: {
        ...cree,
        inscriptionRegistre:
          identifiantCartographie === null
            ? null
            : { structureCartographieNationaleId: identifiantCartographie },
      },
      maintenant,
    })

    return { id: cree.id }
  }

export const appliquerLesDestinations = async (
  transaction: Prisma.TransactionClient,
  {
    utilisateurId,
    destinations,
    maintenant,
  }: {
    readonly utilisateurId: string
    readonly destinations: readonly DestinationDuLieu<CreationDemandee>[]
    readonly maintenant: Date
  },
): Promise<void> => {
  await destinations.reduce(async (precedentes, destination) => {
    await precedentes
    await preparerLeLieu(transaction, destination, {
      maintenant,
      creer: creerLeLieu(transaction, maintenant),
    })
    await rattacherSiAbsent(transaction, {
      utilisateurId,
      lieuId: destination.id,
      debut: maintenant,
      creationParId: utilisateurId,
      journaliser: () => undefined,
    })
  }, Promise.resolve())
}

export const rattacherAuxLieux: RattacherAuxLieux = ({
  utilisateurId,
  destinations,
  ajouteLe,
}) =>
  prismaClient.$transaction(
    async (transaction): Promise<RattachementAuxLieux> => {
      const disparu = await lieuDisparu(transaction, destinations)

      if (disparu !== null) return { _tag: 'LieuDisparu', lieuId: disparu }

      await appliquerLesDestinations(transaction, {
        utilisateurId,
        destinations,
        maintenant: ajouteLe,
      })

      return { _tag: 'Rattaches' }
    },
  )

import { correler } from '@app/web/libraries/lieu-identite'
import type { Prisma } from '@prisma/client'
import { serialiserIdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../../domain/lieu'
import {
  candidatDuRegistre,
  inscriptionPourLaCorrelation,
} from './candidat-du-registre'

const auMemeEndroit = (codeInsee: string, codePostal: string) => ({
  structureCoopId: null,
  deletedAt: null,
  adresse: { OR: [{ codeInsee }, { codePostal }] },
})

export const identifiantCarto = (lieu: Lieu): string | null =>
  lieu.idsCartographieNationale == null
    ? null
    : serialiserIdsCartographieNationale(lieu.idsCartographieNationale)

const parIdentifiantCarto = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<number | null> => {
  const identifiant = identifiantCarto(lieu)

  if (identifiant == null) return null

  const porteur = await transaction.lieuInclusionRegistreMain.findUnique({
    where: { structureCartographieNationaleId: identifiant },
    select: { id: true, structureCoopId: true, deletedAt: true },
  })

  return porteur != null &&
    porteur.structureCoopId == null &&
    porteur.deletedAt == null
    ? porteur.id
    : null
}

const parCorrelationDAdresse = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<number | null> => {
  const adresse = lieu.fiche.adresse

  if (adresse?.code_insee == null) return null

  const inscriptions = await transaction.lieuInclusionRegistreMain.findMany({
    where: auMemeEndroit(adresse.code_insee, adresse.code_postal),
    orderBy: { createdAt: 'asc' },
    ...inscriptionPourLaCorrelation,
  })

  const correle = correler(
    inscriptions.flatMap((inscription) => {
      const candidature = candidatDuRegistre(inscription)

      return candidature == null ? [] : [candidature]
    }),
    {
      nom: lieu.fiche.nom,
      adresse: adresse.voie,
      commune: adresse.commune,
      codePostal: adresse.code_postal,
      codeInsee: adresse.code_insee,
      latitude: lieu.fiche.localisation?.latitude ?? null,
      longitude: lieu.fiche.localisation?.longitude ?? null,
      typologies: lieu.fiche.typologies,
    },
  )

  return correle == null ? null : Number(correle.id)
}

export const inscriptionCorrelee = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
): Promise<number | null> =>
  (await parIdentifiantCarto(transaction, lieu)) ??
  (await parCorrelationDAdresse(transaction, lieu))

import type { Prisma } from '@prisma/client'
import type { Lieu } from '../../../domain/lieu'
import { lieuCoopToDomain } from '../lieu.transfer'
import type { LigneDuLieuCoop } from '../ligne-du-lieu'
import { adresseDuRegistre } from './adresse-du-registre'
import type { ColonnesAEcrire } from './colonnes-a-ecrire'
import { identifiantCartoRevendique } from './identifiant-carto-revendique'
import { inscriptionVisee } from './inscription-visee'
import {
  type ColonnesDuRegistre,
  lieuVersRegistre,
} from './lieu.registre.transfer'
import { signatureCoop } from './signature-coop'

const signatureDuLieu = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
  maintenant: Date,
) => ({
  adresseId: await adresseDuRegistre(transaction, lieu),
  ...signatureCoop(maintenant),
})

type SignatureDuLieu = Awaited<ReturnType<typeof signatureDuLieu>>

type ColonnesSignees = Partial<ColonnesDuRegistre> & SignatureDuLieu

type LigneSignee = ColonnesDuRegistre & SignatureDuLieu

const mettreAJour = async (
  transaction: Prisma.TransactionClient,
  id: number,
  colonnes: ColonnesSignees,
): Promise<void> => {
  await transaction.lieuInclusionRegistreMain.update({
    where: { id },
    data: colonnes,
  })
}

const adopter = async (
  transaction: Prisma.TransactionClient,
  id: number,
  lieu: Lieu,
  colonnes: ColonnesSignees,
): Promise<void> => {
  await transaction.lieuInclusionRegistreMain.update({
    where: { id },
    data: {
      ...colonnes,
      structureCartographieNationaleId: await identifiantCartoRevendique(
        transaction,
        lieu,
        id,
      ),
      structureCoopId: lieu.id,
    },
  })
}

const inscrire = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
  ligne: LigneSignee,
  maintenant: Date,
): Promise<void> => {
  await transaction.lieuInclusionRegistreMain.create({
    data: {
      ...ligne,
      structureCartographieNationaleId: await identifiantCartoRevendique(
        transaction,
        lieu,
        null,
      ),
      structureCoopId: lieu.id,
      createdAt: maintenant,
    },
  })
}

export const ecrireAuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    lieu,
    colonnes,
    maintenant,
  }: {
    readonly lieu: Lieu
    readonly colonnes: ColonnesAEcrire
    readonly maintenant: Date
  },
): Promise<void> => {
  const toutes = lieuVersRegistre(lieu)
  const signature = await signatureDuLieu(transaction, lieu, maintenant)
  const choisies = { ...colonnes(toutes), ...signature }
  const visee = await inscriptionVisee(transaction, lieu)

  if (visee._tag === 'DejaInscrite')
    return mettreAJour(transaction, visee.id, choisies)

  if (visee._tag === 'AAdopter')
    return adopter(transaction, visee.id, lieu, choisies)

  return inscrire(transaction, lieu, { ...toutes, ...signature }, maintenant)
}

export const ecrireLeLieuAuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    ligne,
    colonnes,
    maintenant,
  }: {
    readonly ligne: LigneDuLieuCoop
    readonly colonnes: ColonnesAEcrire
    readonly maintenant: Date
  },
): Promise<void> =>
  ecrireAuRegistre(transaction, {
    lieu: lieuCoopToDomain(ligne),
    colonnes,
    maintenant,
  })

import { prismaClient } from '@/configuration/prisma'
import type { Lieu } from '../../domain/lieu'
import type { SectionDeLaFiche } from '../../domain/section-de-la-fiche'
import {
  type ColonnesDuLieu,
  colonnesDuLieuDesSections,
  colonnesDuRegistreDesSections,
} from './colonnes-par-section.select'
import { lieuFromDomain } from './lieu.transfer'
import { ecrireAuRegistre } from './registre/ecrire-au-registre.mutation'

const colonnesDeTracabilite = ({
  modification,
  derniereModificationParId,
  derniereModificationSource,
}: ColonnesDuLieu) => ({
  modification,
  derniereModificationParId,
  derniereModificationSource,
})

export const enregistrerLesSections = async ({
  lieu,
  sections,
  maintenant,
}: {
  readonly lieu: Lieu
  readonly sections: readonly SectionDeLaFiche[]
  readonly maintenant: Date
}): Promise<void> => {
  const colonnes = lieuFromDomain(lieu)

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieu.id },
      data: {
        ...colonnesDuLieuDesSections(colonnes, sections),
        ...colonnesDeTracabilite(colonnes),
      },
    })

    await ecrireAuRegistre(transaction, {
      lieu,
      colonnes: (toutes) => colonnesDuRegistreDesSections(toutes, sections),
      maintenant,
    })
  })
}

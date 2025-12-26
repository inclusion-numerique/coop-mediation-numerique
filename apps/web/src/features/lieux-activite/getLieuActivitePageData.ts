import { prismaClient } from '@app/web/prismaClient'

export const getLieuActivitePageData = async ({ id }: { id: string }) => {
  const structure = await prismaClient.structure.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      complementAdresse: true,
      codeInsee: true,
      latitude: true,
      longitude: true,
      siret: true,
      rna: true,
      typologies: true,
      visiblePourCartographieNationale: true,
      structureCartographieNationaleId: true,
      telephone: true,
      courriels: true,
      itinerance: true,
      fraisACharge: true,
      modalitesAcces: true,
      presentationResume: true,
      presentationDetail: true,
      siteWeb: true,
      horaires: true,
      services: true,
      structureParente: true,
      publicsSpecifiquementAdresses: true,
      priseEnChargeSpecifique: true,
      modalitesAccompagnement: true,
      ficheAccesLibre: true,
      priseRdv: true,
      dispositifProgrammesNationaux: true,
      formationsLabels: true,
      autresFormationsLabels: true,
    },
  })
  if (!structure) {
    return null
  }

  return {
    structure,
  }
}

export type LieuActivitePageData = Exclude<
  Awaited<ReturnType<typeof getLieuActivitePageData>>,
  null
>

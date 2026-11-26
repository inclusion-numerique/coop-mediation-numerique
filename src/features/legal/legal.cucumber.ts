import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'

setDefaultTimeout(60_000)

const domaineDesComptesSemes = '@legal.cucumber.example'

export type EtatDeLActivite = 'saisie' | 'supprimée' | 'importée de la v1'

export type BeneficiaireAccompagne = 'suivi' | 'anonyme' | 'importé de la v1'

const etats: Readonly<
  Record<
    EtatDeLActivite,
    { readonly suppression: Date | null; readonly v1CraId: () => string | null }
  >
> = {
  saisie: { suppression: null, v1CraId: () => null },
  supprimée: { suppression: new Date(), v1CraId: () => null },
  'importée de la v1': { suppression: null, v1CraId: () => v4() },
}

const beneficiaires: Readonly<
  Record<
    BeneficiaireAccompagne,
    { readonly anonyme: boolean; readonly v1Imported: Date | null }
  >
> = {
  suivi: { anonyme: false, v1Imported: null },
  anonyme: { anonyme: true, v1Imported: null },
  'importé de la v1': { anonyme: true, v1Imported: new Date('2024-01-01') },
}

export const semerUneActivite = async ({
  etat,
  accompagnes,
}: {
  readonly etat: EtatDeLActivite
  readonly accompagnes: readonly BeneficiaireAccompagne[]
}): Promise<void> => {
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: {
      user: { create: { email: `${v4()}${domaineDesComptesSemes}` } },
    },
    select: { id: true },
  })
  await prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      typeLieu: 'Autre',
      date: new Date(),
      duree: 60,
      suppression: etats[etat].suppression,
      v1CraId: etats[etat].v1CraId(),
      accompagnements: {
        create: accompagnes.map((accompagne) => ({
          beneficiaire: {
            create: { mediateurId, ...beneficiaires[accompagne] },
          },
        })),
      },
    },
  })
}

export const semerUnBeneficiaireSansAccompagnement = async ({
  accompagne,
}: {
  readonly accompagne: BeneficiaireAccompagne
}): Promise<void> => {
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: {
      user: { create: { email: `${v4()}${domaineDesComptesSemes}` } },
    },
    select: { id: true },
  })
  await prismaClient.beneficiaire.create({
    data: { mediateurId, ...beneficiaires[accompagne] },
  })
}

const semes = {
  mediateur: { user: { email: { endsWith: domaineDesComptesSemes } } },
}

After(async () => {
  await prismaClient.accompagnement.deleteMany({
    where: { activite: semes },
  })
  await prismaClient.activite.deleteMany({ where: semes })
  await prismaClient.beneficiaire.deleteMany({ where: semes })
  await prismaClient.mediateur.deleteMany({
    where: { user: { email: { endsWith: domaineDesComptesSemes } } },
  })
  await prismaClient.user.deleteMany({
    where: { email: { endsWith: domaineDesComptesSemes } },
  })
})

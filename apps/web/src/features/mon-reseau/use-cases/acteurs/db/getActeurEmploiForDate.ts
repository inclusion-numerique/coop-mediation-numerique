import {
  ContactReferent,
  referentAffichage,
} from '@app/web/features/employeuse'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

// Sélection main pour l'affichage employeuse (ADR-002 périmètre élargi) : nom via denomination, adresse
// via la relation adresse main, référents via le jsonb `contact`.
export const emploiStructureMainSelect = {
  id: true,
  denominationSirene: true,
  denominationAntenne: true,
  siret: true,
  rna: true,
  contact: true,
  adresse: {
    select: {
      nomVoie: true,
      codePostal: true,
      codeInsee: true,
      nomCommune: true,
    },
  },
} satisfies Prisma.StructureAdministrativeMainSelect

// Forme normalisée exposée aux consommateurs. `id` = int `main.structure_administrative.id` (sert de
// clé à l'écriture `structure_employeuse_main_id` de l'activité). `complementAdresse` toujours `null`
// (main ne le porte pas — décision 6).
export type EmploiStructureEmployeuse = {
  id: number | null
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  complementAdresse: string | null
  siret: string | null
  rna: string | null
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
}

type StructureMainPayload = Prisma.StructureAdministrativeMainGetPayload<{
  select: typeof emploiStructureMainSelect
}>

export const toEmploiStructureEmployeuse = (
  structureMain: StructureMainPayload | null,
): EmploiStructureEmployeuse => ({
  id: structureMain?.id ?? null,
  nom:
    structureMain?.denominationAntenne ??
    structureMain?.denominationSirene ??
    '',
  adresse: structureMain?.adresse?.nomVoie ?? '',
  commune: structureMain?.adresse?.nomCommune ?? '',
  codePostal: structureMain?.adresse?.codePostal ?? '',
  codeInsee: structureMain?.adresse?.codeInsee ?? null,
  complementAdresse: null,
  siret: structureMain?.siret ?? null,
  rna: structureMain?.rna ?? null,
  ...referentAffichage(ContactReferent(structureMain?.contact ?? null)),
})

// L'employeuse d'un acteur à une date, lue en PUR MAIN (ADR-002 périmètre élargi). Plus aucune
// référence à `coop.employes_structures` : l'employeuse courante vient de l'affectation active, et
// l'employeuse À UNE DATE du contrat `main.contrat` qui couvre cette date (renseigné pour les CN).
const personneEmployeuseForDateSelect = {
  affectationsEmploi: {
    where: { estActive: true },
    select: {
      source: true,
      createdAt: true,
      structureAdministrative: { select: emploiStructureMainSelect },
    },
  },
  contrats: {
    select: {
      dateDebut: true,
      dateFin: true,
      dateRupture: true,
      structureAdministrative: { select: emploiStructureMainSelect },
    },
  },
} satisfies Prisma.PersonneMainSelect

type PersonneEmploiPayload = Prisma.PersonneMainGetPayload<{
  select: typeof personneEmployeuseForDateSelect
}>

export type ActeurEmploi = { structure: EmploiStructureEmployeuse }

// Priorité d'affectation courante : idposte (dispositif CN) > coop, à priorité égale la plus récente.
const SOURCE_RANK: Record<string, number> = { idposte: 0, coop: 1 }

const affectationCourante = (personne: PersonneEmploiPayload) =>
  personne.affectationsEmploi
    .toSorted((a, b) => {
      const bySource =
        (SOURCE_RANK[a.source] ?? 2) - (SOURCE_RANK[b.source] ?? 2)
      if (bySource !== 0) return bySource
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    })
    .at(0) ?? null

// Contrat couvrant la date (`dateDebut <= date <= dateFin|dateRupture`, fin ouverte si nulle).
const contratCouvrant = (personne: PersonneEmploiPayload, date: Date) =>
  personne.contrats.find((contrat) => {
    if (!contrat.dateDebut || !contrat.structureAdministrative) return false
    const fin = contrat.dateFin ?? contrat.dateRupture
    return contrat.dateDebut <= date && (fin === null || fin >= date)
  }) ?? null

// Employeuse à la date : le contrat qui couvre la date (CN) ; à défaut (non-CN sans dates, ou trou),
// l'employeuse COURANTE (affectation active). `null` si la personne n'a aucune employeuse.
export const resolveEmployeuseForDate = (
  personne: PersonneEmploiPayload | null,
  date: Date,
): EmploiStructureEmployeuse | null => {
  if (!personne) return null

  const contrat = contratCouvrant(personne, date)
  if (contrat?.structureAdministrative) {
    return toEmploiStructureEmployeuse(contrat.structureAdministrative)
  }

  const affectation = affectationCourante(personne)
  if (affectation) {
    return toEmploiStructureEmployeuse(affectation.structureAdministrative)
  }

  return null
}

export const getActeurEmploiForDate = async ({
  userId,
  date,
}: {
  userId: string
  date: Date
}): Promise<ActeurEmploi | null> => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { personneMain: { select: personneEmployeuseForDateSelect } },
  })

  const structure = resolveEmployeuseForDate(user?.personneMain ?? null, date)
  return structure ? { structure } : null
}

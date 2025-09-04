import type { ConseillerNumeriqueCraWithStructure } from '@app/web/external-apis/conseiller-numerique/conseillersNumeriquesCraQueries'
import type { Prisma } from '@prisma/client'

type SousThemeKey =
  | 'equipement informatique'
  | 'accompagner enfant'
  | 'sante'
  | 'traitement texte'
  | 'annotation'

const getSousTheme = (
  sousThemes: Record<string, string[]>[] | undefined,
  key: SousThemeKey,
) => {
  if (!sousThemes) return []
  const sousThemeObject = sousThemes.find((sousTheme) => key in sousTheme)

  return sousThemeObject ? (sousThemeObject[key] ?? []) : []
}

const flattenOrganismes = (
  organismes?: unknown,
): Prisma.InputJsonObject | undefined => {
  if (!Array.isArray(organismes)) {
    return undefined
  }

  return Object.fromEntries(
    organismes.flatMap((record) => {
      if (typeof record !== 'object' || record === null) {
        return []
      }
      return [...Object.entries(record as Record<string, number>)]
    }),
  ) as Record<string, number>
}

const dureeToMinutes = (duree: string | number | null) => {
  if (!duree) {
    return 0
  }

  if (typeof duree === 'number') {
    return duree
  }

  if (duree === '0-30') {
    return 15
  }

  if (duree === '30-60') {
    return 45
  }

  return Number.parseInt(duree, 10) || 0
}

export const craConseillerNumeriqueToPrismaModel = ({
  item: { id, conseillerId, cra, createdAt, updatedAt, structure, permanence },
  importedAt,
}: {
  item: ConseillerNumeriqueCraWithStructure
  importedAt: Date
}) => {
  if (!cra.nomCommune || !cra.codeCommune || !cra.codePostal) {
    throw new Error('Missing commune data for V1 cra')
  }

  const result = {
    importedAt,
    id,
    createdAt,
    updatedAt,
    v1ConseillerNumeriqueId: conseillerId,
    canal: cra.canal ?? '',
    activite: cra.activite ?? '',
    nbParticipants: cra.nbParticipants ?? 0,
    nbParticipantsRecurrents: cra.nbParticipantsRecurrents ?? 0,

    ageMoins12Ans: cra.age.moins12ans ?? 0,
    ageDe12a18Ans: cra.age.de12a18ans ?? 0,
    ageDe18a35Ans: cra.age.de18a35ans ?? 0,
    ageDe35a60Ans: cra.age.de35a60ans ?? 0,
    agePlus60Ans: cra.age.plus60ans ?? 0,

    statutEtudiant: cra.statut.etudiant ?? 0,
    statutSansEmploi: cra.statut.sansEmploi ?? 0,
    statutEnEmploi: cra.statut.enEmploi ?? 0,
    statutRetraite: cra.statut.retraite ?? 0,
    statutHeterogene: cra.statut.heterogene ?? 0,

    themes: cra.themes,
    sousThemesEquipementInformatique: getSousTheme(
      cra.sousThemes,
      'equipement informatique',
    ),
    sousThemesSante: getSousTheme(cra.sousThemes, 'sante'),
    sousThemesAccompagner: getSousTheme(cra.sousThemes, 'accompagner enfant'),
    sousThemesTraitementTexte: getSousTheme(cra.sousThemes, 'traitement texte'),

    annotation: getSousTheme(cra.sousThemes, 'annotation').join(', ') || null,

    duree: cra.duree,
    dureeMinutes: dureeToMinutes(cra.duree),

    accompagnementIndividuel: cra.accompagnement.individuel ?? 0,
    accompagnementAtelier: cra.accompagnement.atelier ?? 0,
    accompagnementRedirection: cra.accompagnement.redirection ?? 0,

    codePostal: cra.codePostal,
    nomCommune: cra.nomCommune,
    dateAccompagnement: cra.dateAccompagnement,
    codeCommune: cra.codeCommune,

    organismes: flattenOrganismes(cra.organismes),

    // Structure employeuse
    structureId: structure?.id,
    structureIdPg: structure?.idPG,
    structureType: structure?.type,
    structureStatut: structure?.statut,
    structureNom: structure?.nom,
    structureSiret: structure?.siret,
    structureCodePostal: structure?.codePostal,
    structureNomCommune: structure?.nomCommune,
    structureCodeCommune: structure?.codeCommune,
    structureCodeDepartement: structure?.codeDepartement,
    structureCodeRegion: structure?.codeRegion,

    // Lieu d’activité / permanence
    permanenceId: permanence?._id.toString(),
    permanenceEstStructure: permanence?.estStructure,
    permanenceNomEnseigne: permanence?.nomEnseigne,
    permanenceNumeroTelephone: permanence?.numeroTelephone,
    permanenceEmail: permanence?.email,
    permanenceSiteWeb: permanence?.siteWeb,
    permanenceSiret: permanence?.siret,
    permanenceAdresse: permanence?.adresse
      ? `${permanence.adresse.numeroRue} ${permanence.adresse.rue}`.trim()
      : null,
    permanenceCodePostal: permanence?.adresse?.codePostal,
    permanenceNomCommune: permanence?.adresse?.ville,
    permanenceCodeCommune: permanence?.adresse?.codeCommune,
    permanenceLatitude:
      Number(permanence?.location?.coordinates[1]) || undefined,
    permanenceLongitude:
      Number(permanence?.location?.coordinates[0]) || undefined,
    permanenceStructureId: permanence?.structure?.id,
    permanenceStructureIdPg: permanence?.structure?.idPG,
    permanenceStructureType: permanence?.structure?.type,
    permanenceStructureStatut: permanence?.structure?.statut,
    permanenceStructureNom: permanence?.structure?.nom,
    permanenceStructureSiret: permanence?.structure?.siret,
    permanenceStructureCodePostal: permanence?.structure?.codePostal,
    permanenceStructureNomCommune: permanence?.structure?.nomCommune,
    permanenceStructureCodeCommune: permanence?.structure?.codeCommune,
    permanenceStructureCodeDepartement: permanence?.structure?.codeDepartement,
    permanenceStructureCodeRegion: permanence?.structure?.codeRegion,
  } satisfies Prisma.CraConseillerNumeriqueV1CreateManyInput

  return result
}

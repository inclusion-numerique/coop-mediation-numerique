import {
  type ColonnesDuRegistre,
  lieuFromDomain,
} from '../../../../implementation'
import type { SectionDeLaFiche } from '../../domain/modification-lieu'

export type ColonnesDuLieu = ReturnType<typeof lieuFromDomain>

type DecoupeDeLaSection = {
  readonly coop: readonly (keyof ColonnesDuLieu & string)[]
  readonly registre: readonly (keyof ColonnesDuRegistre & string)[]
}

const COLONNES_PAR_SECTION = {
  InformationsGenerales: {
    coop: [
      'nom',
      'adresse',
      'commune',
      'codePostal',
      'codeInsee',
      'complementAdresse',
      'latitude',
      'longitude',
      'banId',
      'itinerance',
      'typologies',
      'siret',
      'rna',
      'nomUsage',
    ],
    registre: [
      'nom',
      'nomUsage',
      'complementAdresse',
      'typologies',
      'itinerance',
      'siretALEnrichissement',
    ],
  },
  VisibiliteCartographie: {
    coop: ['visiblePourCartographieNationale', 'services'],
    registre: ['visiblePourCartographieNationale', 'services'],
  },
  InformationsPratiques: {
    coop: ['siteWeb', 'ficheAccesLibre', 'priseRdv', 'horaires'],
    registre: ['contact', 'ficheAccesLibre', 'priseRdv', 'horaires'],
  },
  Description: {
    coop: ['presentationResume', 'presentationDetail', 'formationsLabels'],
    registre: ['presentationResume', 'presentationDetail', 'formationsLabels'],
  },
  ServicesEtAccompagnement: {
    coop: ['services', 'modalitesAccompagnement'],
    registre: ['services', 'modalitesAccompagnement'],
  },
  ModalitesAccesAuService: {
    coop: ['telephone', 'courriels', 'modalitesAcces', 'fraisACharge'],
    registre: ['contact', 'modalitesAcces', 'fraisACharge'],
  },
  TypesDePublicsAccueillis: {
    coop: ['publicsSpecifiquementAdresses', 'priseEnChargeSpecifique'],
    registre: ['publicsSpecifiquementAdresses', 'priseEnChargeSpecifique'],
  },
} as const satisfies Record<SectionDeLaFiche, DecoupeDeLaSection>

const clefsDesSections = (
  sections: readonly SectionDeLaFiche[],
  cote: keyof DecoupeDeLaSection,
): ReadonlySet<string> =>
  new Set(sections.flatMap((section) => COLONNES_PAR_SECTION[section][cote]))

export const colonnesDuLieuDesSections = (
  colonnes: ColonnesDuLieu,
  sections: readonly SectionDeLaFiche[],
): Partial<ColonnesDuLieu> => {
  const clefs = clefsDesSections(sections, 'coop')

  return Object.fromEntries(
    Object.entries(colonnes).filter(([colonne]) => clefs.has(colonne)),
  )
}

export const colonnesDuRegistreDesSections = (
  colonnes: ColonnesDuRegistre,
  sections: readonly SectionDeLaFiche[],
): Partial<ColonnesDuRegistre> => {
  const clefs = clefsDesSections(sections, 'registre')

  return Object.fromEntries(
    Object.entries(colonnes).filter(([colonne]) => clefs.has(colonne)),
  )
}

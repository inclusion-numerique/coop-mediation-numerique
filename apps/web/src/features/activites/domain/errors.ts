import type { DateDActivite } from './date-d-activite'

export type DateTropLointaine = {
  readonly _tag: 'DateTropLointaine'
  readonly auPlusTard: DateDActivite
}

export const DateTropLointaine = (
  auPlusTard: DateDActivite,
): DateTropLointaine => ({ _tag: 'DateTropLointaine', auPlusTard })

export type AucuneThematique = { readonly _tag: 'AucuneThematique' }

export const AucuneThematique = (): AucuneThematique => ({
  _tag: 'AucuneThematique',
})

export type ThematiqueEnDouble = { readonly _tag: 'ThematiqueEnDouble' }

export const ThematiqueEnDouble = (): ThematiqueEnDouble => ({
  _tag: 'ThematiqueEnDouble',
})

export type MaterielEnDouble = { readonly _tag: 'MaterielEnDouble' }

export const MaterielEnDouble = (): MaterielEnDouble => ({
  _tag: 'MaterielEnDouble',
})

export type AucunMaterielAvecMateriel = {
  readonly _tag: 'AucunMaterielAvecMateriel'
}

export const AucunMaterielAvecMateriel = (): AucunMaterielAvecMateriel => ({
  _tag: 'AucunMaterielAvecMateriel',
})

export type AxeDeRepartition = 'genre' | 'trancheDAge' | 'statutSocial'

export type RepartitionExcedeLeTotal = {
  readonly _tag: 'RepartitionExcedeLeTotal'
  readonly axe: AxeDeRepartition
}

export const RepartitionExcedeLeTotal = (
  axe: AxeDeRepartition,
): RepartitionExcedeLeTotal => ({ _tag: 'RepartitionExcedeLeTotal', axe })

export type DejaAccompagnesExcedeLeTotal = {
  readonly _tag: 'DejaAccompagnesExcedeLeTotal'
}

export const DejaAccompagnesExcedeLeTotal =
  (): DejaAccompagnesExcedeLeTotal => ({
    _tag: 'DejaAccompagnesExcedeLeTotal',
  })

export type TropDeParticipantsAnonymes = {
  readonly _tag: 'TropDeParticipantsAnonymes'
}

export const TropDeParticipantsAnonymes = (): TropDeParticipantsAnonymes => ({
  _tag: 'TropDeParticipantsAnonymes',
})

export type AtelierSansParticipant = { readonly _tag: 'AtelierSansParticipant' }

export const AtelierSansParticipant = (): AtelierSansParticipant => ({
  _tag: 'AtelierSansParticipant',
})

export type BeneficiaireEnDouble = { readonly _tag: 'BeneficiaireEnDouble' }

export const BeneficiaireEnDouble = (): BeneficiaireEnDouble => ({
  _tag: 'BeneficiaireEnDouble',
})

export type ActiviteIntrouvable = { readonly _tag: 'ActiviteIntrouvable' }

export const ActiviteIntrouvable = (): ActiviteIntrouvable => ({
  _tag: 'ActiviteIntrouvable',
})

export type TypeDActiviteIncompatible = {
  readonly _tag: 'TypeDActiviteIncompatible'
}

export const TypeDActiviteIncompatible = (): TypeDActiviteIncompatible => ({
  _tag: 'TypeDActiviteIncompatible',
})

export type AucunChoix = { readonly _tag: 'AucunChoix' }

export const AucunChoix = (): AucunChoix => ({ _tag: 'AucunChoix' })

export type ChoixEnDouble = { readonly _tag: 'ChoixEnDouble' }

export const ChoixEnDouble = (): ChoixEnDouble => ({ _tag: 'ChoixEnDouble' })

export type AucunIntervenant = { readonly _tag: 'AucunIntervenant' }

export const AucunIntervenant = (): AucunIntervenant => ({
  _tag: 'AucunIntervenant',
})

export type AucuneStructurePartenaire = {
  readonly _tag: 'AucuneStructurePartenaire'
}

export const AucuneStructurePartenaire = (): AucuneStructurePartenaire => ({
  _tag: 'AucuneStructurePartenaire',
})

export type TagInutilisable = { readonly _tag: 'TagInutilisable' }

export const TagInutilisable = (): TagInutilisable => ({
  _tag: 'TagInutilisable',
})

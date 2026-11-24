import type { ComponentProps, ReactNode } from 'react'
import type { ActivitesFilters } from '@/features/statistiques/domain/filtres-des-activites'
import type Filters from '@/features/statistiques/ui/components/filtres/Filters'
import type { VocabulaireDeLaBarre } from '@/features/statistiques/ui/labels/barre.labels'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { TagScope } from '../labels/portee-de-tag.labels'
import { activiteSourceOptions } from '../labels/source-de-l-activite.labels'

export type OptionDeBeneficiaire = SelectOption<{
  id?: string | null
} | null>

export type MediateurOption = {
  label: string
  value: { mediateurId: string } | null
  isDisabled?: boolean
}

export type LieuxChoisisDeLaBarre = {
  readonly lieuxActiviteOptions: SelectOption[]
  readonly communesOptions: SelectOption[]
  readonly departementsOptions: SelectOption[]
}

type PorteeDuTag = 'Personnel' | 'Equipe' | 'Departemental' | 'National'

type MembreAFiltrer = {
  readonly mediateurId: string
  readonly nom: string
  readonly email: string
  readonly situation: 'Demandeur' | 'Membre' | 'AncienMembre'
}

type EmployeuseDesActivites = {
  readonly id: number
  readonly nom: string | null
  readonly commune: string | null
}

export type FournisseursDesOptions<OptionDeBeneficiaire> = {
  readonly lieuxChoisis: () => Promise<LieuxChoisisDeLaBarre>
  readonly tags: () => Promise<
    readonly {
      readonly id: string
      readonly nom: string
      readonly portee: { readonly _tag: PorteeDuTag }
    }[]
  >
  readonly beneficiaires: () => Promise<OptionDeBeneficiaire[]>
  readonly membres: () => Promise<readonly MembreAFiltrer[]>
  readonly activitesDuPerimetre: () => Promise<{
    readonly employeuses: readonly EmployeuseDesActivites[]
    readonly premiere: string | null
    readonly derniere: string | null
  }>
}

const SCOPE: Readonly<Record<PorteeDuTag, TagScope>> = {
  Personnel: TagScope.Personnel,
  Equipe: TagScope.Equipe,
  Departemental: TagScope.Departemental,
  National: TagScope.National,
}

export const optionsDeTags = (
  tags: readonly {
    readonly id: string
    readonly nom: string
    readonly portee: { readonly _tag: PorteeDuTag }
  }[],
) =>
  tags.map(({ id, nom, portee }) => ({
    id,
    nom,
    scope: SCOPE[portee._tag],
  }))

const libelleDuMembre = ({ nom, situation }: MembreAFiltrer): string =>
  situation === 'Demandeur'
    ? `${nom} (Mes statistiques)`
    : situation === 'AncienMembre'
      ? `Ancien membre - ${nom}`
      : nom

export const optionsDesStatistiques = async <OptionDeBeneficiaire>(
  fournisseurs: FournisseursDesOptions<OptionDeBeneficiaire>,
) => {
  const [
    { communesOptions, departementsOptions, lieuxActiviteOptions },
    tags,
    initialBeneficiairesOptions,
    membres,
    { employeuses, premiere, derniere },
  ] = await Promise.all([
    fournisseurs.lieuxChoisis(),
    fournisseurs.tags(),
    fournisseurs.beneficiaires(),
    fournisseurs.membres(),
    fournisseurs.activitesDuPerimetre(),
  ])
  return {
    communesOptions,
    departementsOptions,
    tagsOptions: optionsDeTags(tags),
    initialBeneficiairesOptions,
    initialMediateursOptions: membres.map((membre) => ({
      label: libelleDuMembre(membre),
      value: { mediateurId: membre.mediateurId },
    })),
    lieuxActiviteOptions,
    structuresEmployeusesOptions: employeuses.map(({ id, nom, commune }) => ({
      id: String(id),
      nom: nom ?? '',
      commune,
    })),
    activiteDates: {
      first: premiere === null ? undefined : new Date(premiere),
      last: derniere === null ? undefined : new Date(derniere),
    },
    activiteSourceOptions,
  }
}

export type OptionsDeLaBarre = {
  activitesFilters: ActivitesFilters
  communesOptions: SelectOption[]
  departementsOptions: SelectOption[]
  lieuxActiviteOptions: SelectOption[]
  structuresEmployeusesOptions: ComponentProps<
    typeof Filters
  >['structuresEmployeusesOptions']
  tagsOptions: ComponentProps<typeof Filters>['tagsOptions']
  initialMediateursOptions: ComponentProps<
    typeof Filters
  >['initialMediateursOptions']
  initialBeneficiairesOptions: ComponentProps<
    typeof Filters
  >['initialBeneficiairesOptions']
  activiteSourceOptions: SelectOption[]
  activiteDates: { first: Date | undefined }
  vocabulaire: VocabulaireDeLaBarre
  filtreDeLieu: ReactNode
}

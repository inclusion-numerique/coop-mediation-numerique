import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { TagScope } from './portee-de-tag'
import { activiteSourceOptions } from './source'

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

export type FournisseursDesOptions<
  OptionDeBeneficiaire,
  OptionDeLieu extends SelectOption,
> = {
  readonly communesEtDepartements: () => Promise<{
    communesOptions: SelectOption[]
    departementsOptions: SelectOption[]
  }>
  readonly lieux: () => Promise<OptionDeLieu[]>
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

export const optionsDesStatistiques = async <
  OptionDeBeneficiaire,
  OptionDeLieu extends SelectOption,
>(
  fournisseurs: FournisseursDesOptions<OptionDeBeneficiaire, OptionDeLieu>,
) => {
  const [
    { communesOptions, departementsOptions },
    lieuxActiviteOptions,
    tags,
    initialBeneficiairesOptions,
    membres,
    { employeuses, premiere, derniere },
  ] = await Promise.all([
    fournisseurs.communesEtDepartements(),
    fournisseurs.lieux(),
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
      value: { mediateurId: membre.mediateurId, email: membre.email },
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

export type OptionsDesStatistiques = Awaited<
  ReturnType<typeof optionsDesStatistiques>
>

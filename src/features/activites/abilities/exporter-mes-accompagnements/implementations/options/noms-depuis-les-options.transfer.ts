import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { BeneficiaireId, LieuActiviteId } from '../../../../domain'
import {
  type BeneficiaireNomme,
  type CommuneNommee,
  type DepartementNomme,
  type LieuNomme,
  NomDeFiltre,
} from '../../domain'

type Option = { readonly label: string; readonly value: string }

export const lieuxDepuisLesOptions = (
  options: readonly Option[],
): readonly LieuNomme[] =>
  options.flatMap((option) => {
    const id = LieuActiviteId.safe(option.value)
    const nom = NomDeFiltre.safe(option.label)
    return id === null || nom === null ? [] : [{ id, nom }]
  })

const communesDepuisLesOptions = (
  options: readonly Option[],
): readonly CommuneNommee[] =>
  options.flatMap((option) => {
    const codeInsee = CodeInsee.safe(option.value)
    const nom = NomDeFiltre.safe(option.label)
    return codeInsee === null || nom === null ? [] : [{ codeInsee, nom }]
  })

const departementsDepuisLesOptions = (
  options: readonly Option[],
): readonly DepartementNomme[] =>
  options.flatMap((option) => {
    const code = CodeDepartement.safe(option.value)
    const nom = NomDeFiltre.safe(option.label)
    return code === null || nom === null ? [] : [{ code, nom }]
  })

export const communesEtDepartementsDepuisLesOptions = ({
  communesOptions,
  departementsOptions,
}: {
  readonly communesOptions: readonly Option[]
  readonly departementsOptions: readonly Option[]
}) => ({
  communes: communesDepuisLesOptions(communesOptions),
  departements: departementsDepuisLesOptions(departementsOptions),
})

export const beneficiairesDepuisLesOptions = (
  options: readonly {
    readonly label: string
    readonly value: { readonly id?: string | null } | null
  }[],
): readonly BeneficiaireNomme[] =>
  options.flatMap(({ label, value }) => {
    const id =
      value?.id === undefined || value.id === null
        ? null
        : BeneficiaireId.safe(value.id)
    const nom = NomDeFiltre.safe(label)
    return id === null || nom === null ? [] : [{ id, nom }]
  })

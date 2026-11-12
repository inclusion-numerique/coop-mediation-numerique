import {
  Commune,
  type EmployeuseDeLaDate,
  EmployeuseId,
  NomDeTag,
  TagId,
  type TagsUtilisables,
} from '../domain'

type TagFourni = { readonly id: string; readonly nom: string }

type EmployeuseFournie = {
  readonly id: number
  readonly adresse: {
    readonly commune: string
    readonly codePostal: string
    readonly codeInsee: string
  } | null
}

export const tagsUtilisablesDepuis =
  (
    tagsVisibles: (tagIds: readonly string[]) => Promise<readonly TagFourni[]>,
  ): TagsUtilisables =>
  async (tagIds) =>
    (await tagsVisibles(tagIds)).map(({ id, nom }) => ({
      id: TagId(id),
      nom: NomDeTag(nom),
    }))

export const employeuseDeLaDateDepuis =
  (
    employeuseALaDate: (date: Date) => Promise<EmployeuseFournie | null>,
  ): EmployeuseDeLaDate =>
  async (date) => {
    const employeuse = await employeuseALaDate(
      new Date(`${date}T00:00:00.000Z`),
    )
    if (employeuse === null) return null
    const { adresse } = employeuse
    return {
      id: EmployeuseId(employeuse.id),
      commune:
        adresse === null
          ? null
          : Commune.safe({
              nom: adresse.commune,
              codePostal: adresse.codePostal,
              codeInsee: adresse.codeInsee,
            }),
    }
  }

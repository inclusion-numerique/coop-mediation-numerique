type ParametresDeLaPage = Readonly<
  Record<string, string | string[] | undefined>
>

type CompteRendezVous = { readonly includeRdvsInActivitesList: boolean }

const conserves =
  (cles: readonly string[]) =>
  (parametres: ParametresDeLaPage): Record<string, string> =>
    Object.fromEntries(
      cles.flatMap((cle) => {
        const valeur = parametres[cle]
        return typeof valeur === 'string' ? [[cle, valeur]] : []
      }),
    )

export const parametresDeNavigation = conserves([
  'page',
  'lignes',
  'ordre',
  'tri',
  'voir-rdvs',
])

export const parametresDePagination = conserves(['page', 'lignes'])

export const rendezVousFiltrablesDansLaListe = ({
  compte,
  voirLesRdvs,
  statutsDemandes,
}: {
  readonly compte: CompteRendezVous | null
  readonly voirLesRdvs: boolean
  readonly statutsDemandes: number
}): boolean =>
  compte !== null &&
  (compte.includeRdvsInActivitesList || statutsDemandes > 0 || voirLesRdvs)

export const rendezVousFiltrablesDansLeTableau = ({
  compte,
  voirLesRdvs,
}: {
  readonly compte: CompteRendezVous | null
  readonly voirLesRdvs: boolean
}): boolean =>
  compte !== null && (compte.includeRdvsInActivitesList || voirLesRdvs)

import {
  filtresDesUtilisateurs,
  type ValeursDesUtilisateurs,
} from '@/features/utilisateurs/ui/filtres/utilisateurs.filtre'
import type { AdresseCourante } from '@/libraries/etat-d-url'
import type { SelectOption } from '@/libraries/ui/form'

export type OptionsDesFiltres = {
  readonly employeuses: readonly SelectOption[]
  readonly coordinateurs: readonly SelectOption[]
  readonly lieux: readonly SelectOption[]
  readonly communes: readonly SelectOption[]
  readonly departements: readonly SelectOption[]
}

const libelles = (options: readonly SelectOption[]) =>
  new Map(options.map(({ value, label }) => [value, label]))

const parmi = (
  options: readonly SelectOption[],
  valeurs: readonly unknown[],
): readonly SelectOption[] => {
  const choisies = new Set(valeurs.map(String))
  return options.filter(({ value }) => choisies.has(value))
}

export const barreDesUtilisateurs = ({
  adresse,
  valeurs,
  options,
}: {
  adresse: AdresseCourante
  valeurs: ValeursDesUtilisateurs
  options: OptionsDesFiltres
}) => {
  const etiquettes = filtresDesUtilisateurs.etiquettes(adresse, valeurs, {
    employeuses: libelles(options.employeuses),
    coordinateurs: libelles(options.coordinateurs),
    lieux: libelles(options.lieux),
    communes: libelles(options.communes),
    departements: libelles(options.departements),
  })

  return {
    etiquettes,
    sansFiltres: filtresDesUtilisateurs.sansFiltres(adresse),
    export: {
      libelles: etiquettes.map(
        ({ prefixe, libelle }) => `${prefixe}${libelle}`,
      ),
      requete: filtresDesUtilisateurs.requete(valeurs),
      recherche: valeurs.recherche === '' ? null : valeurs.recherche,
    },
    choisies: {
      employeuses: parmi(options.employeuses, valeurs.employeuses),
      coordinateurs: parmi(options.coordinateurs, valeurs.coordinateurs),
      lieux: parmi(options.lieux, valeurs.lieux),
      communes: parmi(options.communes, valeurs.communes),
      departements: parmi(options.departements, valeurs.departements),
    },
  }
}

export type BarreDesUtilisateursPresentee = ReturnType<
  typeof barreDesUtilisateurs
>

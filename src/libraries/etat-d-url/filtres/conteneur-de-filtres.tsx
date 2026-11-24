'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react'

export type ChampDeFiltre = {
  readonly valider: () => void
  readonly effacer: () => void
}

type Reference = { readonly current: ChampDeFiltre }

type Registre = {
  readonly enregistrer: (champ: Reference) => () => void
  readonly valider: () => void
  readonly effacer: () => void
}

const Contexte = createContext<Registre | null>(null)

const nouveauRegistre = (): Registre => {
  const champs: { current: readonly Reference[] } = { current: [] }

  return {
    enregistrer: (champ) => {
      champs.current = [...champs.current, champ]
      return () => {
        champs.current = champs.current.filter((autre) => autre !== champ)
      }
    },
    valider: () => champs.current.map((champ) => champ.current.valider()),
    effacer: () => champs.current.map((champ) => champ.current.effacer()),
  }
}

export const useRegistreDeFiltres = (): Registre => {
  const registre = useRef<Registre | null>(null)
  registre.current = registre.current ?? nouveauRegistre()
  return registre.current
}

export const ChampsDeFiltres = ({
  registre,
  children,
}: {
  registre: Registre
  children: ReactNode
}) => <Contexte.Provider value={registre}>{children}</Contexte.Provider>

export const useChampDeFiltre = (champ: ChampDeFiltre) => {
  const registre = useContext(Contexte)
  const dernier = useRef(champ)
  dernier.current = champ

  useEffect(() => registre?.enregistrer(dernier), [registre])
}

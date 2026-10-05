import { cookies } from 'next/headers'
import { nouvelleFonctionnaliteCookiePrefix } from './nouvelleFonctionnaliteCookie'

export const nouvellesFonctionnalitesMasquees = async (): Promise<
  readonly string[]
> =>
  (await cookies())
    .getAll()
    .filter(({ name }) => name.startsWith(nouvelleFonctionnaliteCookiePrefix))
    .map(({ name }) => name.slice(nouvelleFonctionnaliteCookiePrefix.length))

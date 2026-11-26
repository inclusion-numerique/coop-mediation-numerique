export type NonAuthentifie = { readonly _tag: 'NonAuthentifie' }

export const NonAuthentifie = (): NonAuthentifie => ({ _tag: 'NonAuthentifie' })

export type NonAutorise = { readonly _tag: 'NonAutorise' }

export const NonAutorise = (): NonAutorise => ({ _tag: 'NonAutorise' })

export type EchecDAuthentifierUnClientApi = NonAuthentifie | NonAutorise

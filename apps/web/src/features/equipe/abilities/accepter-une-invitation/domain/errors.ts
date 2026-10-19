export type MauvaisDestinataire = { readonly _tag: 'MauvaisDestinataire' }

export const MauvaisDestinataire = (): MauvaisDestinataire => ({
  _tag: 'MauvaisDestinataire',
})

export type InscriptionNonValidee = { readonly _tag: 'InscriptionNonValidee' }

export const InscriptionNonValidee = (): InscriptionNonValidee => ({
  _tag: 'InscriptionNonValidee',
})

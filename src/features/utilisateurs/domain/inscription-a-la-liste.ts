import type { ContactAImporter } from './contact-brevo'

export type InscriptionALaListe =
  | { readonly _tag: 'ContactInscrit'; readonly contact: ContactAImporter }
  | { readonly _tag: 'SansContactAInscrire' }

export const inscriptionALaListe = (
  contact: ContactAImporter | null,
): InscriptionALaListe =>
  contact === null
    ? { _tag: 'SansContactAInscrire' }
    : { _tag: 'ContactInscrit', contact }

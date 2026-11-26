import type { ContactAImporter } from '@/features/utilisateurs/domain'

export type InscriptionALaListe =
  | { readonly _tag: 'ContactInscrit'; readonly contact: ContactAImporter }
  | { readonly _tag: 'SansContactAInscrire' }

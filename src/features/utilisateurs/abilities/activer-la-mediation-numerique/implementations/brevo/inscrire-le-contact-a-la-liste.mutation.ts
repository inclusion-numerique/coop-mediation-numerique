import { brevoActif } from '@/configuration/brevo'
import type { ContactAImporter } from '@/features/utilisateurs/domain'
import { importerDansLaListe } from '@/features/utilisateurs/implementations/brevo/liste-de-diffusion.mutation'

export const inscrireLeContactALaListe = async (
  contact: ContactAImporter,
): Promise<void> => {
  if (!brevoActif()) return
  await importerDansLaListe([contact])
}

import { brevoActif } from '@/configuration/brevo'
import { contactASynchroniser } from '@/features/utilisateurs/domain'
import { importerDansLaListe } from '@/features/utilisateurs/implementations/brevo/liste-de-diffusion.mutation'
import { inscritAInscrire } from '../prisma/inscrit-a-inscrire.query'

export const inscrireALaListeDeDiffusion = async (
  utilisateurId: string,
): Promise<void> => {
  if (!brevoActif()) return

  const inscrit = await inscritAInscrire(utilisateurId)
  if (inscrit === null) return

  const contact = contactASynchroniser(inscrit)
  if (contact._tag === 'AImporter') await importerDansLaListe([contact.contact])
}

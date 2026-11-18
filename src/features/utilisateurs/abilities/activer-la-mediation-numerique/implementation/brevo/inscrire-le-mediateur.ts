import { deploymentCanCreateBrevoContact } from '@/configuration/brevo/createBrevoContact'
import { contactASynchroniser } from '@/features/utilisateurs/domain'
import { importerDansLaListe } from '@/features/utilisateurs/implementation/brevo/liste-de-diffusion'
import { inscritAInscrire } from '../prisma/inscrit-a-inscrire.query'

export const inscrireLeMediateur = async (
  utilisateurId: string,
): Promise<void> => {
  if (!deploymentCanCreateBrevoContact()) return

  const inscrit = await inscritAInscrire(utilisateurId)
  if (inscrit === null) return

  const contact = contactASynchroniser(inscrit)
  if (contact._tag === 'AImporter') await importerDansLaListe([contact.contact])
}

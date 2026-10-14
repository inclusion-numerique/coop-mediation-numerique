import type { ContratConseillerNumerique } from '@app/web/conseiller-numerique/contratConseillerNumerique'
import { lireContratsConseillerNumerique } from '@app/web/conseiller-numerique/lireContratsConseillerNumerique'
import { subDays } from 'date-fns'
import {
  type EquipeSearchParams,
  findAllMediateursCoordonneBy,
  type MediateurFound,
} from '../EquipeListePage/searchMediateursCoordonneBy'

export type EquipeExportMembre = {
  prenom: string | null
  nom: string | null
  role: 'Conseiller numérique' | 'Médiateur numérique'
  typeContrat: string | null
  dateDebutContrat: Date | null
  dateFinContrat: Date | null
  email: string
  telephone: string | null
  structureEmployeuse: {
    nom: string | null
    adresse: string | null
    commune: string | null
    codePostal: string | null
    codeInsee: string | null
  } | null
  statut: string
}

const formatDate = (date: Date | null): string => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}

const computeStatut = ({
  type,
  creation,
  suppression,
  userDeleted,
  dateDerniereActivite,
}: {
  type: 'coordinated' | 'invited'
  creation: Date
  suppression: Date | null
  userDeleted: Date | null
  dateDerniereActivite: Date | null
}): string => {
  if (type === 'invited') return `Invitation envoyée le ${formatDate(creation)}`
  if (userDeleted) return `Profil supprimé le ${formatDate(userDeleted)}`
  if (suppression) return `Ancien membre depuis le ${formatDate(suppression)}`
  if (!dateDerniereActivite) return 'Inactif'
  if (dateDerniereActivite < subDays(new Date(), 30))
    return `Inactif depuis le ${formatDate(dateDerniereActivite)}`
  return 'Actif'
}

const toExportMembre = (
  membre: MediateurFound,
  contrat: ContratConseillerNumerique | undefined,
): EquipeExportMembre => {
  const hasStructure =
    membre.structure_employeuse ||
    membre.structure_employeuse_adresse ||
    membre.structure_employeuse_commune ||
    membre.structure_employeuse_code_postal ||
    membre.structure_employeuse_code_insee

  return {
    prenom: membre.first_name,
    nom: membre.last_name,
    role: membre.is_conseiller_numerique
      ? 'Conseiller numérique'
      : 'Médiateur numérique',
    typeContrat: contrat?.type ?? null,
    dateDebutContrat: contrat?.debut ?? null,
    dateFinContrat: contrat?.fin ?? null,
    email: membre.email,
    telephone: membre.phone,
    structureEmployeuse: hasStructure
      ? {
          nom: membre.structure_employeuse,
          adresse: membre.structure_employeuse_adresse,
          commune: membre.structure_employeuse_commune,
          codePostal: membre.structure_employeuse_code_postal,
          codeInsee: membre.structure_employeuse_code_insee,
        }
      : null,
    statut: computeStatut({
      type: membre.type,
      creation: membre.creation,
      suppression: membre.suppression,
      userDeleted: membre.deleted,
      dateDerniereActivite: membre.date_derniere_activite,
    }),
  }
}

export const getEquipeExportData = async ({
  coordinateurId,
  searchParams = {},
}: {
  coordinateurId: string
  searchParams?: EquipeSearchParams
}): Promise<EquipeExportMembre[]> => {
  const mediateurs = await findAllMediateursCoordonneBy({ id: coordinateurId })(
    searchParams,
  )

  const contrats = await lireContratsConseillerNumerique(
    mediateurs.flatMap(({ user_id }) => (user_id == null ? [] : [user_id])),
  )

  return mediateurs.map((membre) =>
    toExportMembre(
      membre,
      membre.user_id == null ? undefined : contrats.get(membre.user_id),
    ),
  )
}

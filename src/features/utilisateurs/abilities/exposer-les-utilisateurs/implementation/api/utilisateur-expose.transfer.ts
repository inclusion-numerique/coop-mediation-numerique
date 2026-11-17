import {
  contratPourEmployeuse,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import type { UtilisateurExpose } from '../prisma/utilisateurs-exposes.query'

export type UtilisateurAttributes = {
  email: string
  prenom: string | null
  nom: string | null
  inscription_validee: string | null
  telephone: string | null
  creation: string
  modification: string
  suppression: string | null
  dataspace_id: number | null
  emplois: Array<{
    id: string
    structure_id: number | null
    debut: string | null
    fin: string | null
    creation: string
    modification: string
    suppression: string | null
  }>
  mediateur: {
    id: string
    user_id: string
    creation: string
    modification: string
    is_visible: boolean
    en_activite: Array<{
      id: string
      structure_id: string
      debut: string
      fin: string | null
      creation: string
      modification: string
      suppression: string | null
    }>
    coordinations: Array<{
      id: string
      user_id: string
      creation: string
      modification: string
      suppression: string | null
      coordinateur_id: string
    }>
  } | null
  coordinateur: {
    id: string
    user_id: string
    creation: string
    modification: string
    mediateurs_coordonnes: Array<{
      id: string
      user_id: string
      creation: string
      modification: string
      suppression: string | null
      mediateur_id: string
    }>
  } | null
  conseiller_numerique: {
    is_conseiller_numerique: boolean
    id_pg: number | null
  }
}

const iso = (date: Date | null): string | null => date?.toISOString() ?? null

const emploisDe = (
  personne: UtilisateurExpose['personneMain'],
): UtilisateurAttributes['emplois'] =>
  (personne?.affectationsEmploi ?? []).map((affectation) => {
    const contrat = contratPourEmployeuse(
      personne?.contrats ?? [],
      affectation.structureAdministrativeId,
    )
    const creation = (affectation.createdAt ?? new Date(0)).toISOString()
    return {
      id: String(affectation.id),
      structure_id: affectation.structureAdministrativeId,
      debut: iso(contrat?.dateDebut ?? null),
      fin: iso(contrat?.dateFin ?? contrat?.dateRupture ?? null),
      creation,
      modification: creation,
      suppression: null,
    }
  })

const mediateurDe = (
  utilisateur: UtilisateurExpose,
): UtilisateurAttributes['mediateur'] =>
  utilisateur.mediateur === null
    ? null
    : {
        id: utilisateur.mediateur.id,
        user_id: utilisateur.id,
        creation: utilisateur.mediateur.creation.toISOString(),
        modification: utilisateur.mediateur.modification.toISOString(),
        is_visible: utilisateur.mediateur.isVisible,
        en_activite: utilisateur.mediateur.enActivite.map((lien) => ({
          id: lien.id,
          structure_id: lien.structureId,
          debut: lien.debut.toISOString(),
          fin: iso(lien.fin),
          creation: lien.creation.toISOString(),
          modification: lien.modification.toISOString(),
          suppression: iso(lien.suppression),
        })),
        coordinations: utilisateur.mediateur.coordinations.map((lien) => ({
          id: lien.id,
          user_id: lien.mediateur.userId,
          creation: lien.creation.toISOString(),
          modification: lien.modification.toISOString(),
          suppression: iso(lien.suppression),
          coordinateur_id: lien.coordinateurId,
        })),
      }

const coordinateurDe = (
  utilisateur: UtilisateurExpose,
): UtilisateurAttributes['coordinateur'] =>
  utilisateur.coordinateur === null
    ? null
    : {
        id: utilisateur.coordinateur.id,
        user_id: utilisateur.id,
        creation: utilisateur.coordinateur.creation.toISOString(),
        modification: utilisateur.coordinateur.modification.toISOString(),
        mediateurs_coordonnes:
          utilisateur.coordinateur.mediateursCoordonnes.map((lien) => ({
            id: lien.id,
            user_id: lien.mediateur.userId,
            creation: lien.creation.toISOString(),
            modification: lien.modification.toISOString(),
            suppression: iso(lien.suppression),
            mediateur_id: lien.mediateurId,
          })),
      }

export const utilisateurExpose = (
  utilisateur: UtilisateurExpose,
): UtilisateurAttributes => ({
  email: utilisateur.email,
  prenom: utilisateur.firstName,
  nom: utilisateur.lastName,
  inscription_validee: iso(utilisateur.inscriptionValidee),
  telephone: utilisateur.phone,
  creation: utilisateur.created.toISOString(),
  modification: utilisateur.updated.toISOString(),
  suppression: iso(utilisateur.deleted),
  dataspace_id: utilisateur.personneMain?.id ?? null,
  emplois: emploisDe(utilisateur.personneMain),
  mediateur: mediateurDe(utilisateur),
  coordinateur: coordinateurDe(utilisateur),
  conseiller_numerique: {
    is_conseiller_numerique: personneEstConseillerNumerique(
      utilisateur.personneMain,
    ),
    id_pg: utilisateur.personneMain?.cnPgId ?? null,
  },
})

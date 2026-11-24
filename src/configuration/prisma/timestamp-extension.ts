import { Prisma } from '@/generated/prisma/client'

// Extension Prisma qui pose automatiquement la date de dernière modification
// (`modification` ou `updated` selon le modèle) sur chaque update/updateMany/upsert.
// Ces colonnes ne sont PAS auto-gérées par Prisma (pas de `@updatedAt`) : sans cette
// extension le bump est manuel et donc oublié sur de nombreux chemins (fusions, jobs,
// fins d'emploi/activité…). Les tables `Rdv*` (auto-gérées via `@updatedAt`) et les
// tables sans champ de modification ne figurent pas dans la carte et sont ignorées.

type TimestampField = 'modification' | 'updated'

// Carte modèle (PascalCase, tel que fourni par l'extension) → champ à poser.
const MODIFICATION_FIELD: Record<string, TimestampField> = {
  Activite: 'modification',
  ActiviteCoordination: 'modification',
  Tag: 'modification',
  LieuInclusion: 'modification',
  Mediateur: 'modification',
  Coordinateur: 'modification',
  MediateurCoordonne: 'modification',
  MediateurEnActivite: 'modification',
  Beneficiaire: 'modification',
  User: 'updated',
  ApiClient: 'updated',
}

// Champs « non-contenu » : marqueurs techniques. Si une mise à jour ne touche QUE ces
// champs, on ne bumpe pas (ex. `lastSeen`/`lastLogin`).
const NON_CONTENT_FIELDS = new Set<string>([
  'derniereCreationActivite',
  'derniereCreationBeneficiaire',
  'lastLogin',
  'lastSeen',
  // Marqueurs techniques de synchronisation externe : ils tracent « quand on a
  // synchronisé », pas une modification du contenu métier → ne doivent pas bumper.
  'synchronisationSiret',
  // `lastSyncedFromDataspace` a disparu avec la synchro Dataspace elle-même (ADR-002).
  'importedLieuxFromDataspace',
])

const withTimestamp = (
  model: string | undefined,
  data: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined => {
  const field = model && MODIFICATION_FIELD[model]

  // Modèle non suivi, data absente, ou champ déjà posé explicitement par l'appelant
  // (ex. fusionnerBeneficiaires qui fixe `modification` lui-même) → on n'y touche pas.
  if (!field || data == null || field in data) {
    return data
  }

  // Mise à jour ne touchant que des champs non-contenu → pas de bump.
  const keys = Object.keys(data)
  if (keys.length > 0 && keys.every((key) => NON_CONTENT_FIELDS.has(key))) {
    return data
  }

  return { ...data, [field]: new Date() }
}

// NB : les hooks `$allModels` n'interceptent QUE l'opération de premier niveau. Les
// écritures imbriquées via relation (ex. `mediateur.update({ data: { user: { update } } })`)
// ne sont pas auto-bumpées et doivent poser le champ manuellement, comme c'est déjà le cas.
// De même, le SQL pur (`$executeRaw`) n'est pas intercepté (géré manuellement).
export const timestampExtension = Prisma.defineExtension({
  name: 'auto-modification-timestamp',
  query: {
    $allOperations({ model, operation, args, query }) {
      if (operation === 'update' || operation === 'updateMany') {
        const data = withTimestamp(model, args.data as Record<string, unknown>)
        return query({ ...args, data } as typeof args)
      }
      if (operation === 'upsert') {
        const update = withTimestamp(
          model,
          args.update as Record<string, unknown>,
        )
        return query({ ...args, update } as typeof args)
      }
      return query(args)
    },
  },
})

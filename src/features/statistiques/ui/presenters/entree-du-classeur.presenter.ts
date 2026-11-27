import type { AuteurDExport } from '@/libraries/tableur'

type EtiquetteDuFiltre = { readonly titre: string; readonly libelle: string }

export const entreeDuClasseur = <Statistiques>({
  statistiques,
  etiquettes,
  auteur,
  fuseau,
  genereLe,
}: {
  statistiques: Statistiques
  etiquettes: readonly EtiquetteDuFiltre[]
  auteur: AuteurDExport
  fuseau: string
  genereLe: Date
}) => ({
  statistiques,
  auteur,
  filters: etiquettes.map(({ titre, libelle }) => ({
    type: titre,
    label: libelle,
  })),
  fuseau,
  worksheetGenerationDate: genereLe,
})

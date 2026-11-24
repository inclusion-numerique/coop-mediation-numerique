import type { AuteurDExport } from '@/libraries/tableur/add-export-metadata'

type EtiquetteDuFiltre = { readonly titre: string; readonly libelle: string }

export const entreeDuClasseur = <Statistiques>({
  statistiques,
  etiquettes,
  auteur,
  fuseau,
}: {
  statistiques: Statistiques
  etiquettes: readonly EtiquetteDuFiltre[]
  auteur: AuteurDExport
  fuseau: string
}) => ({
  statistiques,
  auteur,
  filters: etiquettes.map(({ titre, libelle }) => ({
    type: titre,
    label: libelle,
  })),
  fuseau,
})

export const getStructureDisplayName = (structure: {
  nom: string
  nomUsage?: string | null
}) => structure.nomUsage || structure.nom

import departementsRegionData from './departements-region.json'

export type DepartementRegion = {
  code: string
  nom: string
  region: string
}

export const departementsRegion: DepartementRegion[] =
  departementsRegionData.map((dep) => ({
    code: String(dep.num_dep),
    nom: dep.dep_name,
    region: dep.region_name,
  }))

export const departementsRegionByCode = new Map<string, DepartementRegion>(
  departementsRegion.map((dep) => [dep.code, dep]),
)

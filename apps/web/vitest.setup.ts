import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const depuisIci = (chemin: string) =>
  fileURLToPath(new URL(chemin, import.meta.url))

config({ path: depuisIci('../../.env'), quiet: true })

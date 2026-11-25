import { keyFor } from '@/libraries/nextjs/injection'

export const SE_DECONNECTER_KEY =
  keyFor<(destination?: string) => Promise<void>>('se-deconnecter')

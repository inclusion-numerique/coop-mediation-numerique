import { environnementClient } from '@/configuration/environnement'

export const branche = () => environnementClient().NEXT_PUBLIC_BRANCH ?? ''
export const estMain = () => branche() === 'main'
export const estDev = () => branche() === 'dev'
export const estLocal = () => branche() === ''
export const estPreview = () => !estMain() && !estDev() && !estLocal()

import { Command } from '@commander-js/extra-typings'
import { output } from '@/libraries/console'
import { imageNameForBranch, isProtectedImage } from './registry-retention'
import {
  deleteImage,
  listWebAppImages,
  webAppImagePrefix,
} from './scaleway-registry'

const protectedBranches = ['main', 'dev']

export const deleteRegistryImage = new Command()
  .command('infrastructure:delete-registry-image')
  .description('Delete the container image of a preview branch')
  .argument('<branch>', 'Branch whose image to delete')
  .action(async (branch) => {
    if (
      isProtectedImage({ prefix: webAppImagePrefix, branch, protectedBranches })
    ) {
      throw new Error(`The image of ${branch} is never deleted`)
    }

    const name = imageNameForBranch(webAppImagePrefix, branch)
    const image = (await listWebAppImages()).find(
      (candidate) => candidate.name === name,
    )

    if (!image) {
      output(`No image ${name} in the registry`)
      return
    }

    await deleteImage(image.id)
    output(`Image ${name} deleted`)
  })

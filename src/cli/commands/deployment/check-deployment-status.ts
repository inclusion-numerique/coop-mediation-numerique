import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import { getAvecNouvellesTentatives } from '@/cli/get-avec-nouvelles-tentatives'
import { projectTitle } from '@/configuration/projet'
import { output } from '@/libraries/console'

export const checkDeploymentStatus = new Command()
  .command('deployment:check-status')
  .argument('<url>', 'deployment url')
  .action(async (url) => {
    const client = axios.create({
      baseURL: url,
      headers: {
        Accept: 'text/html',
      },
    })

    const statusResponse = await getAvecNouvellesTentatives<{ status: string }>(
      client,
      '/health',
    )
    output(`Status is ${statusResponse.data.status}`)

    const homePageResponse = await getAvecNouvellesTentatives<string>(
      client,
      '/',
    )
    if (!homePageResponse.data.startsWith('<!DOCTYPE html>')) {
      throw new Error('Home page is not valid html')
    }

    if (!homePageResponse.data.includes(projectTitle())) {
      throw new Error(
        `Project title "${projectTitle()}" is not present on the homepage`,
      )
    }

    output(`Homepage looks like valid html`)
  })

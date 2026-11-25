import { mkdir, writeFile } from 'node:fs/promises'
import { Session } from 'node:inspector/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const dossier = process.env.COUVERTURE_V8

const sources = pathToFileURL(join(process.cwd(), 'src/')).href

const session = new Session()

session.connect()

await session.post('Profiler.enable')
await session.post('Profiler.startPreciseCoverage', {
  callCount: true,
  detailed: true,
})
await session.post('Debugger.enable')

const avecSonCode = async (script) => ({
  url: script.url,
  functions: script.functions,
  code: (
    await session.post('Debugger.getScriptSource', {
      scriptId: script.scriptId,
    })
  ).scriptSource,
})

const enregistrer = async () => {
  const { result } = await session.post('Profiler.takePreciseCoverage')
  const scripts = await Promise.all(
    result.filter(({ url }) => url.startsWith(sources)).map(avecSonCode),
  )
  session.disconnect()
  await mkdir(dossier, { recursive: true })
  await writeFile(join(dossier, `${process.pid}.json`), JSON.stringify(scripts))
}

process.once('beforeExit', enregistrer)

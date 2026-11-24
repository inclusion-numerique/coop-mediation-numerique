import childProcess from 'node:child_process'
import path from 'node:path'
import {
  decodeSerializableState,
  EncodedState,
  encodeSerializableState,
} from '../../src/libraries/etat-encode/encode-serializable-state'
import { logToFile } from './logToFile'

const dossierE2e = path.resolve(import.meta.dirname, '..')

const executeTask = (task: string, input: unknown) => {
  const taskCommand = `tsx ${dossierE2e}/tasks/taskExecutor.ts ${task} '${encodeSerializableState(input)}'`

  logToFile({ task, input, taskCommand })

  const commandEnv = {
    ...process.env,
    NODE_OPTIONS: undefined,
    TSX_TSCONFIG_PATH: path.resolve(dossierE2e, 'tsconfig.json'),
  }

  return new Promise((resolve, reject) => {
    childProcess.exec(
      taskCommand,
      { env: commandEnv },
      (error, stdout, stderr) => {
        if (error) {
          logToFile({ errorOutput: error, stderr })
          reject(error)
          return
        }

        const rawOutput = stdout.trim()
        const lastOutputLine = rawOutput.split('\n').pop()

        logToFile({ rawOutput, lastOutputLine })
        const decodedOutput = decodeSerializableState(
          lastOutputLine as EncodedState<unknown>,
          null,
        )
        logToFile({ decodedOutput })
        resolve(decodedOutput)
      },
    )
  })
}

export const taskManager = new Proxy(
  {},
  {
    get: (_, property) => (input: unknown) =>
      executeTask(property as string, input),
  },
)

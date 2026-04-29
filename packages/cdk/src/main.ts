#!/usr/bin/env node
import { WebAppStack } from '@app/cdk/WebAppStack'
import { App } from 'cdktf'
import { getBranch } from './utils'

const app = new App()

const branch = getBranch()

new WebAppStack(app, branch)
// ProjectStack migré vers infra incubateur

app.synth()

import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    core.startGroup('Install melpa-check CLI')
    await exec.exec('nix-env', [
      '-iA',
      'cli.gh-action',
      '-f',
      'https://github.com/akirak/melpa-check/archive/v3.tar.gz'
    ])
    core.info('Running melpa-check --version')
    await exec.exec('melpa-check', ['--version'])
    core.endGroup()

    core.startGroup('Install dependencies of melpa-check')
    await exec.exec('melpa-check', ['deps'])
    core.endGroup()

    core.startGroup('Check the configuration')
    const file = core.getInput('config-file')
    await exec.exec('melpa-check', ['config', '-f', file])
    core.endGroup()
  } catch (e) {
    core.setFailed(e.message)
  }
}

run()

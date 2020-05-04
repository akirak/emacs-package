import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'

// Run a system process and return its standard output.
async function getCommandOutput(cmd: string, args: string[]): Promise<string> {
  let output = ''
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      }
    }
  }
  await exec.exec(cmd, args, options)
  return output
}

// Test if melpa-check is installed using niv.
async function hasMelpaCheck(): Promise<boolean> {
  const output = await getCommandOutput('nix-instantiate', [
    '--eval',
    '--expr',
    'builtins.typeOf (import ./nix/sources.nix).melpa-check'
  ])
  return /^"set"\s*$/.test(output)
}

// Retrieve the store path of the CLI from nix-build.
async function getStorePath(): Promise<string> {
  const output = await getCommandOutput('nix-build', [
    '--expr',
    '(import (import ./nix/sources.nix).melpa-check {}).cli',
    '-A',
    'gh-action'
  ])
  const m = output.match(/^[^\s]+/)
  if (!m) {
    throw new Error('null output')
  }
  return m[0]
}

async function run(): Promise<void> {
  try {
    core.startGroup('Install melpa-check CLI')

    // Check if nix/sources.nix (which is created by niv) exists
    // and melpa-check is installed by it
    if (fs.existsSync('nix/sources.nix') && (await hasMelpaCheck())) {
      core.info('Installing melpa-check specified in nix/sources.nix...')
      const path = await getStorePath()
      await exec.exec('nix-env', ['-i', path])
    } else {
      core.info('Installing the latest version of melpa-check...')
      await exec.exec('nix-env', [
        '-iA',
        'cli.gh-action',
        '-f',
        'https://github.com/akirak/melpa-check/archive/v3.tar.gz'
      ])
    }

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

/*
 * @adonisjs/core
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import Configure from '../../commands/configure.js'
import { AceFactory } from '../../factories/core/ace.js'

const BASE_URL = new URL('./tmp/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Configure command | stubs', (group) => {
  group.tap((t) => t.disableTimeout())

  test('publish stub using configure command', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    /**
     * Creating a dummy config stub
     */
    await fs.create(
      'stubs/cors/config.stub',
      [
        '{{{',
        "exports({ to: app.configPath('cors.ts') })",
        '}}}',
        'export default { cors: true }',
      ].join('\n')
    )

    const command = await ace.create(Configure, ['../dummy-pkg.js'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    /**
     * Publishing the stub
     */
    await command.publishStub('cors/config.stub')

    assert.deepEqual(command.ui.logger.getLogs(), [
      {
        message: 'green(DONE:)    create config/cors.ts',
        stream: 'stdout',
      },
    ])
    assert.fileExists('config/cors.ts')
  })

  test('skip publishing when file already exists', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    /**
     * Creating a dummy config stub
     */
    await fs.create(
      'stubs/cors/config.stub',
      [
        '{{{',
        "exports({ to: app.configPath('cors.ts') })",
        '}}}',
        'export default { cors: true }',
      ].join('\n')
    )

    await fs.create('config/cors.ts', 'export default { cors: true }')

    const command = await ace.create(Configure, ['../dummy-pkg.js'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    /**
     * Publishing the stub
     */
    await command.publishStub('cors/config.stub')

    assert.deepEqual(command.ui.logger.getLogs(), [
      {
        message: 'cyan(SKIPPED:) create config/cors.ts dim((File already exists))',
        stream: 'stdout',
      },
    ])
  })

  test('force publish when file already exists', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    /**
     * Creating a dummy config stub
     */
    await fs.create(
      'stubs/cors/config.stub',
      [
        '{{{',
        "exports({ to: app.configPath('cors.ts') })",
        '}}}',
        'export default { cors: true }',
      ].join('\n')
    )

    await fs.create('config/cors.ts', 'export default { cors: true }')

    const command = await ace.create(Configure, ['../dummy-pkg.js', '--force'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    /**
     * Publishing the stub
     */
    await command.publishStub('cors/config.stub')

    assert.deepEqual(command.ui.logger.getLogs(), [
      {
        message: 'green(DONE:)    create config/cors.ts',
        stream: 'stdout',
      },
    ])
  })
})

test.group('Configure command | list dependencies', (group) => {
  group.tap((t) => t.disableTimeout())

  test('list development dependencies to install', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(Configure, ['../dummy-pkg.js'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    command.listPackagesToInstall([
      {
        name: '@japa/runner',
        isDevDependency: true,
      },
      {
        name: '@japa/preset-adonis',
        isDevDependency: true,
      },
      {
        name: 'playwright',
        isDevDependency: true,
      },
    ])

    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message: [
          'Please install following packages',
          'dim(# npm)',
          'yellow(npm i -D) @japa/runner @japa/preset-adonis playwright',
          ' ',
          'dim(# yarn)',
          'yellow(yarn add -D) @japa/runner @japa/preset-adonis playwright',
          ' ',
          'dim(# pnpm)',
          'yellow(pnpm add -D) @japa/runner @japa/preset-adonis playwright',
        ].join('\n'),
        stream: 'stdout',
      },
    ])
  })

  test('list development and prod dependencies to install', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(Configure, ['../dummy-pkg.js'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    command.listPackagesToInstall([
      {
        name: '@japa/runner',
        isDevDependency: true,
      },
      {
        name: '@japa/preset-adonis',
        isDevDependency: true,
      },
      {
        name: 'playwright',
        isDevDependency: false,
      },
    ])

    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message: [
          'Please install following packages',
          'dim(# npm)',
          'yellow(npm i -D) @japa/runner @japa/preset-adonis',
          'yellow(npm i) playwright',
          ' ',
          'dim(# yarn)',
          'yellow(yarn add -D) @japa/runner @japa/preset-adonis',
          'yellow(yarn add) playwright',
          ' ',
          'dim(# pnpm)',
          'yellow(pnpm add -D) @japa/runner @japa/preset-adonis',
          'yellow(pnpm add) playwright',
        ].join('\n'),
        stream: 'stdout',
      },
    ])
  })

  test('list prod dependencies to install', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(Configure, ['../dummy-pkg.js'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    command.listPackagesToInstall([
      {
        name: 'playwright',
        isDevDependency: false,
      },
    ])

    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message: [
          'Please install following packages',
          'dim(# npm)',
          'yellow(npm i) playwright',
          ' ',
          'dim(# yarn)',
          'yellow(yarn add) playwright',
          ' ',
          'dim(# pnpm)',
          'yellow(pnpm add) playwright',
        ].join('\n'),
        stream: 'stdout',
      },
    ])
  })
})

test.group('Configure command | run', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = BASE_PATH
  })

  group.tap((t) => t.disableTimeout())

  test('throw error when unable to import package', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(filePath)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(Configure, ['./dummy-pkg.js'])
    await command.exec()

    assert.match(command.error.message, /Cannot find module/)
    assert.equal(command.exitCode, 1)
  })

  test('fail when package has configure method but not the stubsRoot', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(new URL(filePath, fs.baseUrl).href)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create('dummy-pkg.js', `export function configure() {}`)

    const command = await ace.create(Configure, ['./dummy-pkg.js'])
    await command.exec()

    assert.equal(command.exitCode, 1)
    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message:
          '[ red(error) ] Missing "stubsRoot" export from "./dummy-pkg.js" package. The stubsRoot variable is required to lookup package stubs',
        stream: 'stderr',
      },
    ])
  })

  test('warn when package cannot be configured', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(new URL(filePath, fs.baseUrl).href)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create('dummy-pkg.js', `export const stubsRoot = './'`)

    const command = await ace.create(Configure, ['./dummy-pkg.js?v=1'])
    await command.exec()

    assert.equal(command.exitCode, 0)
    assert.deepEqual(ace.ui.logger.getLogs(), [
      {
        message:
          '[ yellow(warn) ] Cannot configure "./dummy-pkg.js?v=1" package. The package does not export the configure hook',
        stream: 'stdout',
      },
    ])
  })

  test('run package configure method', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(new URL(filePath, fs.baseUrl).href)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create(
      'dummy-pkg.js',
      `
      export const stubsRoot = './'
      export function configure (command) {
        command.result = 'configured'
      }
    `
    )

    const command = await ace.create(Configure, ['./dummy-pkg.js?v=2'])
    await command.exec()
    assert.equal(command.result, 'configured')
  })

  test('install packages', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(new URL(filePath, fs.baseUrl).href)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.createJson('package.json', { type: 'module' })
    await fs.create(
      'dummy-pkg.js',
      `
      export const stubsRoot = './'
      export async function configure (command) {
        await command.installPackages([
          { name: 'is-odd@2.0.0', isDevDependency: true },
          { name: 'is-even@1.0.0', isDevDependency: false }
        ])
      }
    `
    )

    const command = await ace.create(Configure, ['./dummy-pkg.js?v=3'])
    command.verbose = true
    await command.exec()

    assert.equal(command.exitCode, 0)
    const packageJson = await fs.contentsJson('package.json')
    assert.deepEqual(packageJson.dependencies, { 'is-even': '^1.0.0' })
    assert.deepEqual(packageJson.devDependencies, { 'is-odd': '^2.0.0' })
  })

  test('install packages using pnpm when pnpm-lock file exists', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(new URL(filePath, fs.baseUrl).href)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create('pnpm-lock.yaml', '')
    await fs.createJson('package.json', { type: 'module' })
    await fs.create(
      'dummy-pkg.js',
      `
      export const stubsRoot = './'
      export async function configure (command) {
        await command.installPackages([
          { name: 'is-odd@2.0.0', isDevDependency: true, },
        ])
      }
    `
    )

    const command = await ace.create(Configure, ['./dummy-pkg.js?v=4'])
    command.verbose = true
    await command.exec()

    const logs = ace.ui.logger.getLogs()
    assert.equal(command.exitCode, 0)
    assert.deepInclude(logs, {
      message: '[ cyan(wait) ] installing dependencies using pnpm .  ',
      stream: 'stdout',
    })
  })

  test('install packages using npm when package-lock file exists', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(new URL(filePath, fs.baseUrl).href)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.createJson('package-lock.json', {})
    await fs.createJson('package.json', { type: 'module' })
    await fs.create(
      'dummy-pkg.js',
      `
      export const stubsRoot = './'
      export async function configure (command) {
        await command.installPackages([
          { name: 'is-odd@2.0.0', isDevDependency: true, },
        ])
      }
    `
    )

    const command = await ace.create(Configure, ['./dummy-pkg.js?v=5'])
    command.verbose = true
    await command.exec()

    const logs = ace.ui.logger.getLogs()

    assert.equal(command.exitCode, 0)
    assert.deepInclude(logs, {
      message: '[ cyan(wait) ] installing dependencies using npm .  ',
      stream: 'stdout',
    })
  })

  test('display error when installing packages', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => {
        return import(new URL(filePath, fs.baseUrl).href)
      },
    })

    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.createJson('package-lock.json', {})
    await fs.createJson('package.json', { type: 'module' })
    await fs.create(
      'dummy-pkg.js',
      `
      export const stubsRoot = './'
      export async function configure (command) {
        await command.installPackages([
          { name: 'is-odd@15.0.0', isDevDependency: true, },
        ])
      }
    `
    )

    const command = await ace.create(Configure, ['./dummy-pkg.js?v=6'])
    command.verbose = true
    await command.exec()

    const logs = ace.ui.logger.getLogs()
    assert.deepInclude(logs, {
      message: '[ cyan(wait) ] unable to install dependencies ...',
      stream: 'stdout',
    })

    const lastLog = logs[logs.length - 1]
    assert.equal(command.exitCode, 1)
    assert.deepInclude(
      lastLog.message,
      '[ red(error) ] Command failed with exit code 1: npm install -D is-odd@15.0.0'
    )
  })
})

test.group('Configure command | vinejs', (group) => {
  group.tap((t) => t.disableTimeout())

  test('register vinejs provider', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.createJson('tsconfig.json', {})
    await fs.create('adonisrc.ts', 'export default defineConfig({})')

    const command = await ace.create(Configure, ['vinejs'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    await command.run()

    assert.deepEqual(command.ui.logger.getLogs(), [
      {
        message: 'green(DONE:)    update adonisrc.ts file',
        stream: 'stdout',
      },
    ])

    await assert.fileContains('adonisrc.ts', '@adonisjs/core/providers/vinejs_provider')
  })

  test('register edge provider', async ({ assert, fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, {
      importer: (filePath) => import(filePath),
    })
    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.createJson('tsconfig.json', {})
    await fs.create('adonisrc.ts', 'export default defineConfig({})')

    const command = await ace.create(Configure, ['edge'])
    command.stubsRoot = join(fs.basePath, 'stubs')

    await command.run()

    assert.deepEqual(command.ui.logger.getLogs(), [
      {
        message: 'green(DONE:)    update adonisrc.ts file',
        stream: 'stdout',
      },
    ])

    await assert.fileContains('adonisrc.ts', '@adonisjs/core/providers/edge_provider')
    await assert.fileContains(
      'adonisrc.ts',
      `metaFiles: [{
    pattern: 'resources/views/**/*.edge',
    reloadServer: false,
  }]`
    )
  })
})
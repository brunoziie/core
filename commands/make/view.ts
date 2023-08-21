/*
 * @adonisjs/core
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import BaseCommand from './_base.js'
import { args } from '../../modules/ace/main.js'

/**
 * Make a new EdgeJS template file
 */
export default class MakeView extends BaseCommand {
  static commandName = 'make:view'
  static description = 'Create a new Edge.js template file'

  @args.string({ description: 'Name of the template' })
  declare name: string

  /**
   * The stub to use for generating the template
   */
  protected stubPath: string = 'make/view/main.stub'

  async run() {
    await this.generate(this.stubPath, {
      entity: this.app.generators.createEntity(this.name),
    })
  }
}

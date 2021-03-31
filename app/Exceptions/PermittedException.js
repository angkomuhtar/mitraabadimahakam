'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class PermittedException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  handle (error, { response }) {
    response.route('/401')
  }
}

module.exports = PermittedException

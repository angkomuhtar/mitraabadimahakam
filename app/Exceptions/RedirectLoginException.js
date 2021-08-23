'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class RedirectLoginException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  // handle () {}
  handle (error, { response }) {
    return response.redirect('/login')
  }
}

module.exports = RedirectLoginException

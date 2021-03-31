'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class OwnerException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  handle (error, { response }) {
    return response.json(500).json({success: false, message: 'User Not Authoized...'})
  }
}

module.exports = OwnerException

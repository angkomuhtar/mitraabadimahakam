'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

const message = 'The item is in an status where modifications are disallowed'
const status = 403
const code = 'E_DUPLIKASI_FIELD'

class DuplikasiException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  
  // constructor () {
  //   super(message, status, code)
  // }
  handle (error, { response, request, session }) {
    // session.withErrors({ kd_group: 'Username is required' }).flashAll()
    session.flash({ notification: 'E_DUPLIKASI_FIELD' })
    return response.redirect('back')
  }
}

module.exports = DuplikasiException

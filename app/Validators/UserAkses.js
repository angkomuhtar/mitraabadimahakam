'use strict'

class UserAkses {
  get rules () {
    return {
      group: 'required',
      permission: 'required',
      resource: 'required'
    }
  }

  get messages () {
    return {
      'required': '{{ field }} tidak boleh kosong.',
    }
  }

  async fails (errorMessages) {
    this.ctx.session.flash({ notification: 'error' })
    this.ctx.session.withErrors(errorMessages).flashAll()
    console.log('errorMessages ', errorMessages)
    // return this.ctx.response.redirect('back')
    return this.ctx.response.status(500).json({error: true, errorMessages})
  }
}

module.exports = UserAkses

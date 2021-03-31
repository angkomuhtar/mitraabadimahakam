'use strict'

class BisnisUnit {
  get rules () {
    return {
      initial: 'required|min:2|max:4',
      name: 'required|max:50',
      email: 'required|email',
      alamat: 'required',
      phone: 'required|min:10|max:25',
    }
  }

  get messages () {
    return {
      'required': '{{ field }} tidak boleh kosong.',
      'email': '{{ field }} format tdk valid.',
      'min': '{{ field }} karakter minimal tdk valid.',
      'max': '{{ field }} karakter minimal tdk valid.',
    }
  }

  async fails (errorMessages) {
    this.ctx.session.flash({ notification: 'error' })
    this.ctx.session.withErrors(errorMessages).flashAll()
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.redirect('back')
  }
}

module.exports = BisnisUnit

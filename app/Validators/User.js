'use strict'

class User {
  get rules () {
    return {
      username: 'required|min:2|max:25|unique:users',
      email: 'required|email|unique:users',
      user_group: 'required',
      fullname: 'required',
      // password: 'required',
      bisnis_id: 'required'
    }
  }

  get messages () {
    return {
      'required': '{{ field }} tidak boleh kosong.',
      'email': '{{ field }} format tdk valid.',
      'unique': '{{ field }} sudah terdaftar.',
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

module.exports = User

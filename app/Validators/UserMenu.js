'use strict'

class UserMenu {
  get rules () {
    return {
      user_id: 'required'
    }
  }

  get messages () {
    return {
      'user_id.required': 'Tentukan user yang akan diberikan akses...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = UserMenu

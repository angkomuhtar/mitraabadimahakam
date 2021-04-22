'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
  static boot () {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */

  static get hidden () {
    return ['password']
  }

  tokens () {
    return this.hasMany('App/Models/Token')
  }

  profile () {
    return this.hasOne("App/Models/Profile", "id", "user_id")
  }

  user_menu () {
    return this.belongsToMany("App/Models/SysMenu", "user_id", "menu_id").pivotTable('usr_menus')
  }

  user_menuDetail () {
    return this.belongsToMany("App/Models/SysMenuDetail", "user_id", "submenu_id").pivotTable('usr_menu_details')
  }

  // sysgroup_user () {
  //   return this.belongsToMany("App/Models/UsersGroup", "user_id", "group_id").pivotTable('sys_users_groups')
  // }

  // sysgroup_user_mod () {
  //   return this.belongsToMany("App/Models/SysModule", "user_id", "mod_id").pivotTable('sys_users_groups')
  // }
tipe_akses(){
  return this.belongsToMany("App/Models/SysModule", "user_tipe", "mod_id").pivotTable('sys_users_groups')
}
  
}

module.exports = User

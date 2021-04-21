'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', 'WelcomeController.index').as('home').middleware(['MM'])
Route.get('/json', 'WelcomeController.jsonData').as('home')
Route.get('/login', 'AuthController.show').as('auth.login')
Route.post('/login', 'AuthController.login')
Route.get('/logout', 'AuthController.loggingOut').as('auth.logout')

Route.get('/test/user-group', 'TestingDatumController.userGroup')
Route.get('/test/user-module', 'TestingDatumController.userModule')

// MASTER
Route.group(() => {
    // User
    Route.get('/user', 'UserController.index').as('mas.user.index')

    Route.post('/user', 'UserController.store').as('mas.user.store')

    Route.get('/user/search', 'UserController.list').as('mas.user.list')

    Route.get('/user/:id/show', 'UserController.show').as('mas.user.show')

    Route.post('/user/:id/update', 'UserController.update').as('mas.user.update')

    // Equipment Unit
    Route.get('/equipment', 'MasEquipmentController.index').as('mas.equipment.index')
    
    Route.post('/equipment', 'MasEquipmentController.store').as('mas.equipment.store').validator('Equipment-Post')
    
    Route.get('/equipment/:id', 'MasEquipmentController.show').as('mas.equipment.show')

    Route.get('/equipment/search', 'MasEquipmentController.list').as('mas.equipment.list')

    Route.post('/equipment/:id/update', 'MasEquipmentController.update').as('mas.equipment.update')

    Route.post('/equipment/:id/delete', 'MasEquipmentController.delete').as('mas.equipment.delete')

    // Employee
    Route.get('/employee', 'MasEmployeeController.index').as('mas.employee.index')

    Route.post('/employee', 'MasEmployeeController.store').as('mas.employee.store').validator('Employee-Post')
    
    Route.get('/employee/search', 'MasEmployeeController.list').as('mas.employee.list')

    Route.get('/employee/:id/show', 'MasEmployeeController.show').as('mas.employee.show')

    Route.post('/employee/:id/update', 'MasEmployeeController.update').as('mas.employee.update')

    Route.post('/employee/:id/delete', 'MasEmployeeController.delete').as('mas.employee.delete')

}).prefix('master').namespace('master').middleware(['MM'])

// SETTING
Route.group(() => {
    Route.get('/sys-options', 'SysOptionController.index').as('set.sys-options.index')

    Route.post('/sys-options', 'SysOptionController.create').as('set.sys-options.create').validator('Options')

    Route.get('/sys-options/list', 'SysOptionController.list').as('set.sys-options.list')

    Route.get('/sys-options/:id/show', 'SysOptionController.show').as('set.sys-options.show')

    Route.post('/sys-options/:id/update', 'SysOptionController.update').as('set.sys-options.update')

    // User Menu
    Route.get('/usr-menu', 'SysMenuController.index').as('set.usr-menu.index')

    Route.get('/usr-menu/create', 'SysMenuController.create').as('set.usr-menu.create')

    Route.post('/usr-menu/create', 'SysMenuController.store').as('set.usr-menu.store').validator('UserMenu')

}).prefix('setting').namespace('setting').middleware(['MM'])

// OPERATION
Route.group(() => {

    Route.get('/daily-activity', 'DailyActivityController.index').as('opr.daily-activity.index')

}).prefix('operation').namespace('operation').middleware(['MM'])

// AJAX
Route.group(() => {

    Route.get('/sys-options', 'AjaxOptionController.index').as('set.sys-options.index')

    Route.get('/dealer', 'AjaxDealerController.getDealers').as('dealer.getDealers')
    Route.get('/dealer/:id', 'AjaxDealerController.getDealerId').as('dealer.getDealerId')

}).prefix('ajax').namespace('ajax').middleware(['MM'])



Route.get('/401', ({ view }) => view.render('401'))

Route.any('*', ({ view }) => view.render('404'))
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
    Route.get('/user', 'UserController.index').as('mas.user.index').middleware('R')

    Route.post('/user', 'UserController.store').as('mas.user.store').middleware('C')

    Route.get('/user/search', 'UserController.list').as('mas.user.list')

    Route.get('/user/:id/show', 'UserController.show').as('mas.user.show').middleware('R')

    Route.post('/user/:id/update', 'UserController.update').as('mas.user.update').middleware('U')

    Route.post('/user/:id/delete', 'UserController.delete').as('mas.user.delete').middleware('D')

    // Equipment Unit
    Route.get('/equipment', 'MasEquipmentController.index').as('mas.equipment.index').middleware('R')
    
    Route.post('/equipment', 'MasEquipmentController.store').as('mas.equipment.store').validator('Equipment-Post').middleware('C')
    
    Route.get('/equipment/:id', 'MasEquipmentController.show').as('mas.equipment.show').middleware('R')

    Route.get('/equipment/search', 'MasEquipmentController.list').as('mas.equipment.list')

    Route.post('/equipment/:id/update', 'MasEquipmentController.update').as('mas.equipment.update').middleware('U')

    Route.post('/equipment/:id/delete', 'MasEquipmentController.delete').as('mas.equipment.delete').middleware('D')

    // Employee
    Route.get('/employee', 'MasEmployeeController.index').as('mas.employee.index').middleware('R')

    Route.post('/employee', 'MasEmployeeController.store').as('mas.employee.store').validator('Employee-Post').middleware('C')
    
    Route.get('/employee/search', 'MasEmployeeController.list').as('mas.employee.list')

    Route.get('/employee/:id/show', 'MasEmployeeController.show').as('mas.employee.show').middleware('R')

    Route.post('/employee/:id/update', 'MasEmployeeController.update').as('mas.employee.update').middleware('U')

    Route.post('/employee/:id/delete', 'MasEmployeeController.delete').as('mas.employee.delete').middleware('D')

}).prefix('master').namespace('master').middleware(['MM'])

// SETTING
Route.group(() => {
    Route.get('/sys-options', 'SysOptionController.index').as('set.sys-options.index').middleware('R')

    Route.post('/sys-options', 'SysOptionController.create').as('set.sys-options.create').validator('Options').middleware('C')

    Route.get('/sys-options/list', 'SysOptionController.list').as('set.sys-options.list').middleware('R')

    Route.get('/sys-options/:id/show', 'SysOptionController.show').as('set.sys-options.show').middleware('R')

    Route.post('/sys-options/:id/update', 'SysOptionController.update').as('set.sys-options.update').middleware('U')

    // User Akses
    Route.get('/usr-akses', 'SysUserAkseController.index').as('set.usr-akses.index').middleware('R')

    Route.get('/usr-akses/list', 'SysUserAkseController.list').as('set.usr-akses.list')

    // User Menu
    Route.get('/usr-menu', 'SysMenuController.index').as('set.usr-menu.index').middleware('R')

    Route.get('/usr-menu/create', 'SysMenuController.create').as('set.usr-menu.create').middleware('R')

    Route.post('/usr-menu/create', 'SysMenuController.store').as('set.usr-menu.store').validator('UserMenu').middleware('C')


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
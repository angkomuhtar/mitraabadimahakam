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

// Master
Route.group(() => {
    // User
    Route.get('/user', 'UserController.index').as('mas.user.index')

    // Employee
    Route.get('/employee', 'MasEmployeeController.index').as('mas.employee.index')

    Route.post('/employee', 'MasEmployeeController.store').as('mas.employee.store').validator('employee-add')

}).prefix('master').namespace('master').middleware(['MM'])

Route.group(() => {
    Route.get('/sys-options', 'SysOptionController.index').as('set.sys-options.index')

    Route.post('/sys-options', 'SysOptionController.create').as('set.sys-options.create').validator('Options')

    Route.get('/sys-options/:id/show', 'SysOptionController.show').as('set.sys-options.show')

    Route.post('/sys-options/:id/update', 'SysOptionController.update').as('set.sys-options.update')

    // User Menu
    Route.get('/usr-menu', 'SysMenuController.index').as('set.usr-menu.index')

}).prefix('setting').namespace('setting').middleware(['MM'])

Route.group(() => {

    Route.get('/sys-options', 'AjaxOptionController.index').as('set.sys-options.index')

}).prefix('ajax').namespace('ajax').middleware(['MM'])



Route.get('/401', ({ view }) => view.render('401'))

Route.any('*', ({ view }) => view.render('404'))
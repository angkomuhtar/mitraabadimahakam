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
Route.post('/profile', 'AuthController.updatePassword').as('auth.upd-pass')
Route.get('/profile/:id', 'AuthController.profile').as('auth.profile').middleware(['auth'])

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
    
    Route.get('/equipment/list', 'MasEquipmentController.list').as('mas.equipment.list')
    
    Route.get('/equipment/:id/show', 'MasEquipmentController.show').as('mas.equipment.show').middleware('R')
    
    Route.post('/equipment/:id/update', 'MasEquipmentController.update').as('mas.equipment.update').middleware('U')

    Route.post('/equipment/:id/delete', 'MasEquipmentController.delete').as('mas.equipment.delete').middleware('D')

    // Employee
    Route.get('/employee', 'MasEmployeeController.index').as('mas.employee.index').middleware('R')

    Route.post('/employee', 'MasEmployeeController.store').as('mas.employee.store').validator('Employee-Post').middleware('C')
    
    Route.get('/employee/list', 'MasEmployeeController.list').as('mas.employee.list')

    Route.get('/employee/:id/show', 'MasEmployeeController.show').as('mas.employee.show').middleware('R')

    Route.post('/employee/:id/update', 'MasEmployeeController.update').as('mas.employee.update').middleware('U')

    Route.post('/employee/:id/delete', 'MasEmployeeController.delete').as('mas.employee.delete').middleware('D')

    // Site
    Route.get('/site', 'MasSiteController.index').as('mas.site.index').middleware('R')

    Route.post('/site', 'MasSiteController.store').as('mas.site.store').middleware('C').validator('Site')

    Route.get('/site/list', 'MasSiteController.list').as('mas.site.list').middleware('R')

    Route.get('/site/:id/show', 'MasSiteController.show').as('mas.site.show').middleware('R')

    Route.post('/site/:id/update', 'MasSiteController.update').as('mas.site.update').middleware('U').validator('Site')

    Route.post('/site/:id/delete', 'MasSiteController.delete').as('mas.site.delete').middleware('D')

    // PIT
    Route.get('/pit', 'MasPitController.index').as('mas.pit.index').middleware('R')

    Route.post('/pit', 'MasPitController.store').as('mas.pit.store').middleware('C').validator('Pit')

    Route.get('/pit/list', 'MasPitController.list').as('mas.pit.list').middleware('R')

    Route.get('/pit/:id/show', 'MasPitController.show').as('mas.pit.show').middleware('R')

    Route.post('/pit/:id/update', 'MasPitController.update').as('mas.pit.update').middleware('U')

    Route.post('/pit/:id/delete', 'MasPitController.delete').as('mas.pit.delete').middleware('D')

    // Shift Schedule
    Route.get('/shift', 'MasShiftController.index').as('mas.shift.index').middleware('R')

    Route.post('/shift', 'MasShiftController.store').as('mas.shift.store').middleware('C').validator('Shift')

    Route.get('/shift/list', 'MasShiftController.list').as('mas.shift.list').middleware('R')

    Route.get('/shift/:id/show', 'MasShiftController.show').as('mas.shift.show').middleware('R')

    Route.post('/shift/:id/update', 'MasShiftController.update').as('mas.shift.update').middleware('U')

    Route.post('/shift/:id/delete', 'MasShiftController.delete').as('mas.shift.delete').middleware('D')

    // Activity
    Route.get('/activity', 'MasActivityController.index').as('mas.activity.index').middleware('R')

    Route.post('/activity', 'MasActivityController.store').as('mas.activity.store').middleware('C')

    Route.get('/activity/list', 'MasActivityController.list').as('mas.activity.list').middleware('R')

    Route.get('/activity/:id/show', 'MasActivityController.show').as('mas.activity.show').middleware('U')

    Route.post('/activity/:id/update', 'MasActivityController.update').as('mas.activity.update').middleware('U')

    Route.post('/activity/:id/delete', 'MasActivityController.delete').as('mas.activity.delete').middleware('D')

    // Fleet
    Route.get('/fleet', 'MasFleetController.index').as('mas.fleet.index').middleware('R')

    Route.post('/fleet', 'MasFleetController.store').as('mas.fleet.store').middleware('C')

    Route.get('/fleet/list', 'MasFleetController.list').as('mas.fleet.list').middleware('R')

    Route.get('/fleet/:id/show', 'MasFleetController.show').as('mas.fleet.show').middleware('U')

    Route.post('/fleet/:id/update', 'MasFleetController.update').as('mas.fleet.update').middleware('U')

    Route.post('/fleet/:id/delete', 'MasFleetController.delete').as('mas.fleet.delete').middleware('D')

    // Event
    Route.get('/event', 'MasEventController.index').as('mas.event.index').middleware('R')

    Route.post('/event', 'MasEventController.store').as('mas.event.store').middleware('C')

    Route.get('/event/list', 'MasEventController.list').as('mas.event.list').middleware('R')

    Route.get('/event/create', 'MasEventController.create').as('mas.event.create').middleware('R')

    Route.get('/event/:id/show', 'MasEventController.show').as('mas.event.show').middleware('U')

    Route.post('/event/:id/update', 'MasEventController.update').as('mas.event.update').middleware('U')

    Route.post('/event/:id/delete', 'MasEventController.delete').as('mas.event.delete').middleware('D')

    // Seam
    Route.get('/seam', 'MasSeamController.index').as('mas.seam.index').middleware('R')

    Route.post('/seam', 'MasSeamController.store').as('mas.seam.store').middleware('C')

    Route.get('/seam/list', 'MasSeamController.list').as('mas.seam.list').middleware('R')

    Route.get('/seam/create', 'MasSeamController.create').as('mas.seam.create').middleware('R')

    Route.get('/seam/:id/show', 'MasSeamController.show').as('mas.seam.show').middleware('U')

    Route.post('/seam/:id/update', 'MasSeamController.update').as('mas.seam.update').middleware('U')

    Route.post('/seam/:id/delete', 'MasSeamController.delete').as('mas.seam.delete').middleware('D')

    // Sub Contractor
    Route.get('/subcont', 'MasSubcontractorController.index').as('mas.subcont.index').middleware('R')

    Route.post('/subcont', 'MasSubcontractorController.storeSubcon').as('mas.subcont.storeSubcon').middleware('C')

    Route.get('/subcont/create', 'MasSubcontractorController.createSubcon').as('mas.subcont.createSubcon').middleware('R')

    Route.get('/subcont/list-subcont', 'MasSubcontractorController.listSubcon').as('mas.subcont.listSubcon').middleware('R')

    Route.get('/subcont/list-equipment', 'MasSubcontractorController.listEquipment').as('mas.subcont.listEquipment').middleware('R')

    Route.get('/subcont/list-employee', 'MasSubcontractorController.listEmployee').as('mas.subcont.listEmployee').middleware('R')
    
    Route.get('/subcont/create-equipment', 'MasSubcontractorController.createEquipment').as('mas.subcont.createEquipment').middleware('R')

    Route.get('/subcont/create-employee', 'MasSubcontractorController.createEmployee').as('mas.subcont.createEmployee').middleware('R')

    Route.post('/subcont/store-equipment', 'MasSubcontractorController.storeEquipment').as('mas.subcont.storeEquipment').middleware('C')

    Route.post('/subcont/store-employee', 'MasSubcontractorController.storeEmployee').as('mas.subcont.storeEmployee').middleware('C')
    
    Route.get('/subcont/:id/show-subcont', 'MasSubcontractorController.showSubcon').as('mas.subcont.showSubcon').middleware('R')

    Route.get('/subcont/:id/show-equipment', 'MasSubcontractorController.showEquipment').as('mas.subcont.showEquipment').middleware('R')

    Route.get('/subcont/:id/show-employee', 'MasSubcontractorController.showEmployee').as('mas.subcont.showEmployee').middleware('R')
    
    Route.post('/subcont/:id/update-subcont', 'MasSubcontractorController.updateSubcon').as('mas.subcont.updateSubcon').middleware('U')

    Route.post('/subcont/:id/update-equipment', 'MasSubcontractorController.updateEquipment').as('mas.subcont.updateEquipment').middleware('U')

    Route.post('/subcont/:id/update-employee', 'MasSubcontractorController.updateEmployee').as('mas.subcont.updateEmployee').middleware('U')

    Route.get('/subcont/:id/show', 'MasSubcontractorController.show').as('mas.subcont.show').middleware('U')

    Route.post('/subcont/:id/update', 'MasSubcontractorController.update').as('mas.subcont.update').middleware('U')

    Route.post('/subcont/:id/delete', 'MasSubcontractorController.delete').as('mas.subcont.delete').middleware('D')

    // Dokumentasi
    Route.get('/doc-details', 'MasDocumentationDetailsController.index').as('mas.doc-details.index').middleware('R')

    Route.post('/doc-details', 'MasDocumentationDetailsController.store').as('mas.doc-details.store').middleware('C')

    Route.get('/doc-details/list', 'MasDocumentationDetailsController.list').as('mas.doc-details.list').middleware('R')

    Route.get('/doc-details/create', 'MasDocumentationDetailsController.create').as('mas.doc-details.create').middleware('R')

    Route.get('/doc-details/:id/show', 'MasDocumentationDetailsController.show').as('mas.doc-details.show').middleware('U')

    Route.post('/doc-details/:id/update', 'MasDocumentationDetailsController.update').as('mas.doc-details.update').middleware('U')

    Route.delete('/doc-details/:id/destroy', 'MasDocumentationDetailsController.destroy').as('mas.doc-details.destroy').middleware('D')

    // Documentasi Fitur
    Route.get('/doc', 'MasDocumentationController.index').as('mas.doc.index').middleware('R')

    Route.post('/doc', 'MasDocumentationController.store').as('mas.doc.store').middleware('C')

    Route.get('/doc/list', 'MasDocumentationController.list').as('mas.doc.list').middleware('R')

    Route.get('/doc/create', 'MasDocumentationController.create').as('mas.doc.create').middleware('R')

    Route.get('/doc/:id/show', 'MasDocumentationController.show').as('mas.doc.show').middleware('U')

    Route.post('/doc/:id/update', 'MasDocumentationController.update').as('mas.doc.update').middleware('U')

    Route.delete('/doc/:id/destroy', 'MasDocumentationController.destroy').as('mas.doc.destroy').middleware('D')

}).prefix('master').namespace('master').middleware(['MM'])

// DUCUMENTATIONS
Route.group(() => {
    // Web Apps Documentations
    Route.get('/webapps', 'WebappsDocumentController.index').as('doc.webapps')

}).prefix('documentation').namespace('documentation').middleware(['MM'])

// SETTING
Route.group(() => {
    Route.get('/sys-options', 'SysOptionController.index').as('set.sys-options.index').middleware('R')

    Route.post('/sys-options', 'SysOptionController.create').as('set.sys-options.create').validator('Options').middleware('C')

    Route.get('/sys-options/list', 'SysOptionController.list').as('set.sys-options.list').middleware('R')

    Route.get('/sys-options/:id/show', 'SysOptionController.show').as('set.sys-options.show').middleware('R')

    Route.post('/sys-options/:id/update', 'SysOptionController.update').as('set.sys-options.update').middleware('U')

    // User Akses
    Route.get('/usr-akses', 'SysUserAkseController.index').as('set.usr-akses.index').middleware('R')

    Route.post('/usr-akses', 'SysUserAkseController.store').as('set.usr-akses.store').middleware('C')

    Route.get('/usr-akses/list', 'SysUserAkseController.list').as('set.usr-akses.list')

    // User Menu
    Route.get('/usr-menu', 'SysMenuController.index').as('set.usr-menu.index').middleware('R')

    Route.get('/usr-menu/create', 'SysMenuController.create').as('set.usr-menu.create').middleware('R')

    Route.post('/usr-menu/create', 'SysMenuController.store').as('set.usr-menu.store').validator('UserMenu').middleware('C')


}).prefix('setting').namespace('setting').middleware(['MM'])

// OPERATION
Route.group(() => {

    Route.get('/daily-activity', 'DailyActivityController.index').as('opr.daily-activity.index')

    Route.get('/daily-activity/list', 'DailyActivityController.list').as('opr.daily-activity.list')

    // Daily Fleet
    Route.get('/daily-fleet', 'DailyFleetController.index').as('opr.daily-fleet.index').middleware('R')

    Route.post('/daily-fleet', 'DailyFleetController.store').as('opr.daily-fleet.store').middleware('C')

    Route.get('/daily-fleet/list', 'DailyFleetController.list').as('opr.daily-fleet.list').middleware('R')

    Route.get('/daily-fleet/create', 'DailyFleetController.create').as('opr.daily-fleet.create').middleware('R')

    Route.get('/daily-fleet/:id/show', 'DailyFleetController.show').as('opr.daily-fleet.show').middleware('U')

    Route.post('/daily-fleet/:id/update', 'DailyFleetController.update').as('opr.daily-fleet.update').middleware('U')

    Route.post('/daily-fleet/:id/delete', 'DailyFleetController.delete').as('opr.daily-fleet.delete').middleware('D')

    // Daily Ritase OB
    Route.get('/daily-ritase-ob', 'DailyRitaseController.index').as('opr.daily-ritase-ob.index').middleware('R')

    Route.post('/daily-ritase-ob', 'DailyRitaseController.store').as('opr.daily-ritase-ob.store').middleware('C')

    Route.get('/daily-ritase-ob/list', 'DailyRitaseController.list').as('opr.daily-ritase-ob.list').middleware('R')

    Route.get('/daily-ritase-ob/create', 'DailyRitaseController.create').as('opr.daily-ritase-ob.create').middleware('R')

    Route.get('/daily-ritase-ob/:id/show', 'DailyRitaseController.show').as('opr.daily-ritase-ob.show').middleware('U')
    
    Route.post('/daily-ritase-ob/:id/update', 'DailyRitaseController.update').as('opr.daily-ritase-ob.update').middleware('U')

    Route.post('/daily-ritase-ob/:id/delete', 'DailyRitaseController.delete').as('opr.daily-ritase-ob.delete').middleware('D')
    
    Route.get('/daily-ritase-ob/list/pit/:pit_id', 'DailyRitaseController.listByPIT').as('opr.daily-ritase-ob.listByPIT').middleware('R')
    
    Route.get('/daily-ritase-ob/list/fleet/:fleet_id', 'DailyRitaseController.listByFLEET').as('opr.daily-ritase-ob.listByFLEET').middleware('R')
    
    Route.get('/daily-ritase-ob/list/shift/:shift_id', 'DailyRitaseController.listBySHIFT').as('opr.daily-ritase-ob.listBySHIFT').middleware('R')
    
    Route.get('/daily-ritase-ob/ritase/show/equipment', 'DailyRitaseController.listUnitByRitase').as('opr.daily-ritase-ob.listUnitByRitase').middleware('R')

    Route.post('/daily-ritase-ob/ritase-detail/:id/update', 'DailyRitaseController.updateDetails').as('opr.daily-ritase-ob-details.updateDetails').middleware('U')

    Route.delete('/daily-ritase-ob/ritase-detail/:id/destroy', 'DailyRitaseController.detailDestroy').as('opr.daily-ritase-ob-details.detailDestroy').middleware('U')
    

    // Daily Ritase COAL
    Route.get('/daily-ritase-coal', 'DailyRitaseCoalController.index').as('opr.daily-ritase-coal.index').middleware('R')

    Route.post('/daily-ritase-coal', 'DailyRitaseCoalController.store').as('opr.daily-ritase-coal.store').middleware('C')

    Route.get('/daily-ritase-coal/list', 'DailyRitaseCoalController.list').as('opr.daily-ritase-coal.list').middleware('R')

    Route.get('/daily-ritase-coal/create', 'DailyRitaseCoalController.create').as('opr.daily-ritase-coal.create').middleware('R')

    Route.get('/daily-ritase-coal/:id/show', 'DailyRitaseCoalController.show').as('opr.daily-ritase-coal.show').middleware('U')

    Route.get('/daily-ritase-coal/:id/view', 'DailyRitaseCoalController.view').as('opr.daily-ritase-coal.show').middleware('R')
    
    Route.post('/daily-ritase-coal/:id/update', 'DailyRitaseCoalController.update').as('opr.daily-ritase-coal.update').middleware('U')
    
    Route.post('/daily-ritase-coal/:id/delete', 'DailyRitaseCoalController.delete').as('opr.daily-ritase-coal.delete').middleware('D')
    
    Route.get('/daily-ritase-coal/list/pit/:pit_id', 'DailyRitaseCoalController.listByPIT').as('opr.daily-ritase-coal.listByPIT').middleware('R')

    Route.get('/daily-ritase-coal/list/fleet/:fleet_id', 'DailyRitaseCoalController.listByFLEET').as('opr.daily-ritase-coal.listByFLEET').middleware('R')

    Route.get('/daily-ritase-coal/list/shift/:shift_id', 'DailyRitaseCoalController.listBySHIFT').as('opr.daily-ritase-coal.listBySHIFT').middleware('R')

    // Daily TimeSheet
    Route.get('/daily-timesheet', 'DailyTimesheetController.index').as('opr.daily-timesheet.index').middleware('R')

    Route.post('/daily-timesheet', 'DailyTimesheetController.store').as('opr.daily-timesheet.store').middleware('C')

    Route.get('/daily-timesheet/list', 'DailyTimesheetController.list').as('opr.daily-timesheet.list').middleware('R')

    Route.get('/daily-timesheet/list-p2h', 'DailyTimesheetController.listP2H').as('opr.daily-timesheet.listP2H').middleware('R')

    Route.get('/daily-timesheet/create', 'DailyTimesheetController.create').as('opr.daily-timesheet.create').middleware('R')

    Route.get('/daily-timesheet/:id/show', 'DailyTimesheetController.show').as('opr.daily-timesheet.show').middleware('U')

    Route.post('/daily-timesheet/:id/update', 'DailyTimesheetController.update').as('opr.daily-timesheet.update').middleware('U')

    Route.post('/daily-timesheet/:id/delete', 'DailyTimesheetController.delete').as('opr.daily-timesheet.delete').middleware('D')

    // Monthly Plan
    Route.get('/monthly-plan', 'MonthlyPlanController.index').as('opr.monthly-plan.index').middleware('R')

    Route.post('/monthly-plan', 'MonthlyPlanController.store').as('opr.monthly-plan.store').middleware('R')

    Route.get('/monthly-plan/list', 'MonthlyPlanController.listBulanan').as('opr.monthly-plan.listBulanan').middleware('R')
    
    Route.get('/monthly-plan/create', 'MonthlyPlanController.create').as('opr.monthly-plan.create').middleware('R')
    
    Route.get('/monthly-plan/list-daily', 'MonthlyPlanController.listHarian').as('opr.monthly-plan.listHarian').middleware('R')
    
    Route.get('/monthly-plan/:id/show', 'MonthlyPlanController.show').as('opr.monthly-plan.show').middleware('R')

    Route.post('/monthly-plan/:id/update', 'MonthlyPlanController.update').as('opr.monthly-plan.update').middleware('U')

    // Fuel Distribution
    Route.get('/fuel-dist', 'FuelDistributeController.index').as('opr.fuel-distribution.index').middleware('R')

    Route.post('/fuel-dist', 'FuelDistributeController.store').as('opr.fuel-distribution.store').middleware('C')

    Route.get('/fuel-dist/list', 'FuelDistributeController.list').as('opr.fuel-distribution.list').middleware('R')

    Route.get('/fuel-dist/create', 'FuelDistributeController.create').as('opr.fuel-distribution.create').middleware('R')

    Route.get('/fuel-dist/:id/show', 'FuelDistributeController.show').as('opr.fuel-distribution.show').middleware('R')

    Route.post('/fuel-dist/:id/update', 'FuelDistributeController.update').as('opr.fuel-distribution.update').middleware('R')
    
    // Monthly Survey
    Route.get('/monthly-survey', 'MonthlySurveyController.index').as('opr.monthly-survey.index').middleware('R')

    Route.post('/monthly-survey', 'MonthlySurveyController.store').as('opr.monthly-survey.store').middleware('C')

    Route.get('/monthly-survey/list', 'MonthlySurveyController.list').as('opr.monthly-survey.list').middleware('R')

    Route.get('/monthly-survey/create', 'MonthlySurveyController.create').as('opr.monthly-survey.create').middleware('R')

    Route.get('/monthly-survey/:id/show', 'MonthlySurveyController.show').as('opr.monthly-survey.show').middleware('R')

    Route.post('/monthly-survey/:id/update', 'MonthlySurveyController.update').as('opr.monthly-survey.update').middleware('R')

}).prefix('operation').namespace('operation').middleware(['MM'])

// AJAX
Route.group(() => {

    Route.get('/sys-options', 'AjaxOptionController.index').as('set.sys-options.index')

    Route.get('/usr', 'AjaxUserAkseController.getOptionUsers').as('set.sys-options.getOptionUsers')

    Route.get('/fuelman', 'AjaxUserAkseController.getOptionFuelman').as('set.sys-options.getOptionFuelman')
    
    Route.get('/usr-module', 'AjaxUserAkseController.getUserModule').as('set.sys-options.getUserModule')

    Route.get('/site', 'AjaxSiteController.getSites').as('site.getSites')

    Route.get('/pit', 'AjaxPitController.getPits').as('pit.getPits')

    Route.get('/fleet', 'AjaxFleetController.getFleets').as('fleet.getFleets')

    Route.get('/activity', 'AjaxActivityController.getActivities').as('actitivity.getActivities')
    
    Route.get('/activity/:id', 'AjaxActivityController.getActivitiesID').as('actitivity.getActivitiesID')
    
    Route.get('/employee', 'AjaxEmployeeController.all').as('employee.all')

    Route.get('/employee/operator', 'AjaxEmployeeController.operator').as('employee.operator')

    Route.get('/shift', 'AjaxShiftController.getShift').as('shift.getShift')

    Route.get('/shift/:id', 'AjaxShiftController.getShiftID').as('shift.getShiftID')

    Route.get('/dealer', 'AjaxDealerController.getDealers').as('dealer.getDealers')

    Route.get('/dealer/:id', 'AjaxDealerController.getDealerId').as('dealer.getDealerId')

    Route.get('/event', 'AjaxEventController.getALL').as('event.getALL')

    Route.get('/material', 'AjaxMaterialController.getMaterial').as('equipment.getMaterial')

    Route.get('/equipment', 'AjaxEquipmentController.getEquipment').as('equipment.getEquipment')

    Route.get('/fuel-type', 'AjaxFuelController.getFuelType').as('fuel.getFuelType')

    Route.get('/fuel-agen', 'AjaxFuelController.getFuelAgen').as('fuel.getFuelAgen')

    Route.get('/subcon', 'AjaxSubcontractorController.getSubcon').as('subcon.getSubcon')

    Route.get('/daily-fleet/:id', 'AjaxDailyFleetController.getDailyfleet').as('daily-fleet.getDailyfleet')

    

    Route.get('/grafik1', 'AjaxChartController.grafik_OB_MTD')
    
    Route.get('/grafik2', 'AjaxChartController.grafik_OB_RITASE_EQUIPMENT')
    
    Route.get('/grafik3', 'AjaxChartController.grafik_COAL_MTD')

    Route.get('/grafik4', 'AjaxChartController.grafik_FUEL_MTD')

    Route.get('/grafik5', 'AjaxChartController.grafik_EVENT_MTD')

    Route.get('/grafik6', 'AjaxChartController.grafik_COST_VS_PROD')

    Route.get('/doc/platform', 'AjaxDocumentationController.getPlatform')

    Route.get('/doc/fitur', 'AjaxDocumentationController.getFitur')
    
}).prefix('ajax').namespace('ajax').middleware(['MM'])

//  API MOBILE

Route.group(() => {

    // Route.post('/login', 'AuthApiController.login').middleware('auth:session,api')
    Route.post('/login', 'AuthApiController.login')

    Route.post('/update-password', 'AuthApiController.updatePassword')

    Route.post('/logout', 'AuthApiController.logout')

    Route.get('/', async () => ({ greeting: 'Welcome to Restfull API with Adonis.js.....' }))

}).prefix('api').namespace('api')

Route.group(() => {
    
    Route.get('/', 'ApiWeatherController.getWeather')

    Route.get('/city', 'ApiWeatherController.getWeatherCity')

}).prefix('api/weather').namespace('api')

Route.group(() => {

    Route.post('/error/add', 'SysErrorController.store')

    Route.post('/log/add', 'SysLogController.store')

}).prefix('api/system').namespace('setting')

Route.group(() => {

    Route.get('/', 'UserApiController.index')
    
    Route.get('/search', 'UserApiController.search')
    
    Route.get('/:id/show', 'UserApiController.show')

}).prefix('api/users').namespace('api')

Route.group(() => {

    Route.get('/', 'ProfileApiController.index')
    
    Route.get('/:id/show', 'ProfileApiController.show')

    Route.post('/:id/update', 'ProfileApiController.update')

    Route.post('/:id/update-avatar', 'ProfileApiController.uploadAvatar')

}).prefix('api/profile').namespace('api')

Route.group(() => {

    Route.get('/', 'MasP2HApiController.index')

    Route.post('/', 'MasP2HApiController.create')

    Route.get('/:id/show', 'MasP2HApiController.show')

    Route.post('/:id/update', 'MasP2HApiController.update')

}).prefix('api/p2h').namespace('api')

Route.group(() => {

    Route.get('/', 'MaterialApiController.index')

    Route.post('/', 'MaterialApiController.create')

    Route.get('/:id/show', 'MaterialApiController.show')

    Route.post('/:id/update', 'MaterialApiController.update')

}).prefix('api/material').namespace('api')

Route.group(() => {

    Route.get('/', 'MasEventApiController.index')

    Route.post('/', 'MasEventApiController.create')

    Route.get('/:id/show', 'MasEventApiController.show')

    Route.post('/:id/update', 'MasEventApiController.update')

}).prefix('api/event').namespace('api')

Route.group(() => {

    Route.get('/', 'EmployeeApiController.index')

    Route.post('/', 'EmployeeApiController.create')
    
    Route.get('/operator', 'EmployeeApiController.operator')

    Route.get('/:id/show', 'EmployeeApiController.show')

    Route.post('/:id/update', 'EmployeeApiController.update')

}).prefix('api/employee').namespace('api')

Route.group(() => {

    Route.get('/', 'PitApiController.index')

    Route.get('/:id/show', 'PitApiController.show')
    
    Route.post('/:id/update', 'PitApiController.update')

}).prefix('api/pit').namespace('api')

Route.group(() => {

    Route.get('/', 'MasSeamApiController.index')

    Route.get('/:id/show', 'MasSeamApiController.show')

    Route.post('/:id/update', 'MasSeamApiController.update')

    Route.get('/:pit_id/pit', 'MasSeamApiController.getSeamByPit')

}).prefix('api/seam').namespace('api')

Route.group(() => {

    Route.get('/', 'FleetApiController.index')

    Route.get('/:id/show', 'FleetApiController.show')

    Route.post('/:id/update', 'FleetApiController.update')

}).prefix('api/fleet').namespace('api')

Route.group(() => {

    Route.get('/', 'SubconApiController.index')

    Route.get('/:id/show', 'SubconApiController.show')

    Route.get('/:id/equipment', 'SubconApiController.showEquipment')

    Route.get('/equipment/all', 'SubconApiController.showEquipmentAll')

    Route.get('/employee/all', 'SubconApiController.subconEmployeeAll')
    
}).prefix('api/subcon').namespace('api')

Route.group(() => {

    Route.get('/', 'EquipmentApiController.index')

    Route.get('/available-fleet', 'EquipmentApiController.availableForFleet')

    Route.get('/:id/show', 'EquipmentApiController.show')

    Route.get('/:idequip/last-smu', 'EquipmentApiController.lastEquipmentSMU')
    
    Route.post('/:id/update', 'EquipmentApiController.update')
    
    Route.get('/available-fleet/:idfleet/onfleet', 'EquipmentApiController.equipment_onFleet')

    Route.post('/available-fleet/:idfleet/event-all-equipment', 'EquipmentApiController.equipmentEventAll')

    Route.delete('/daily-event/:dailyevent_id/destroy', 'EquipmentApiController.destroyEquipmentEventId')
    
    Route.post('/available-fleet/:idfleet/equipment/:idequip', 'EquipmentApiController.equipmentEventId')

    Route.get('/:id/event', 'EquipmentApiController.getEventByEquipmentID')

}).prefix('api/equipment').namespace('api')

Route.group(() => {

    Route.get('/', 'ActivitiesApiController.index')

    Route.get('/:id/show', 'ActivitiesApiController.show')

    Route.post('/:id/update', 'ActivitiesApiController.update')

}).prefix('api/activities').namespace('api')

Route.group(() => {

    Route.get('/', 'ShiftApiController.index')

    Route.get('/:id/show', 'ShiftApiController.show')

    Route.post('/:id/update', 'ShiftApiController.update')

}).prefix('api/shift').namespace('api')

Route.group(() => {

    Route.get('/', 'DailyFleetApiController.index')

    Route.post('/', 'DailyFleetApiController.create')

    Route.get('/:id/show', 'DailyFleetApiController.show')

    Route.get('/filter-date', 'DailyFleetApiController.filterByDate')

    Route.post('/:id/update', 'DailyFleetApiController.update')

}).prefix('api/daily-fleet').namespace('api')

Route.group(() => {

    Route.get('/', 'DailyFleetEquipmentApiController.index')

    Route.post('/', 'DailyFleetEquipmentApiController.create')

    Route.get('/:id/show', 'DailyFleetEquipmentApiController.show')

    Route.post('/:id/update', 'DailyFleetEquipmentApiController.update')

    Route.delete('/:id/destroy', 'DailyFleetEquipmentApiController.destroy')

    Route.post('/move-to-other-fleet', 'DailyFleetEquipmentApiController.moveUnitToOtherFleet')

}).prefix('api/daily-fleet-equipment').namespace('api')

Route.group(() => {

    Route.get('/', 'DailyRitaseApiController.index')

    Route.post('/', 'DailyRitaseApiController.create')

    Route.get('/:id/show', 'DailyRitaseApiController.show')

    Route.post('/:id/update', 'DailyRitaseApiController.update')

    Route.get('/filter-date', 'DailyRitaseApiController.filterByDate')

    Route.delete('/:id/destroy', 'DailyRitaseApiController.destroy')

}).prefix('api/daily-ritase').namespace('api')


Route.group(() => {

    Route.get('/', 'DailyRitaseDetailApiController.index')

    Route.post('/', 'DailyRitaseDetailApiController.create')

    Route.get('/:id/show', 'DailyRitaseDetailApiController.show')

    Route.get('/:id/show', 'DailyRitaseDetailApiController.show')

    Route.get('/:id/rit/ob', 'DailyRitaseDetailApiController.getByRitID')

    Route.delete('/:id/destroy', 'DailyRitaseDetailApiController.destroy')

}).prefix('api/daily-ritase-details').namespace('api')

Route.group(() => {

    Route.get('/', 'DailyRitaseCoalApiController.index')

    Route.post('/', 'DailyRitaseCoalApiController.create')

    Route.get('/:id/show', 'DailyRitaseCoalApiController.show')

    Route.get('/filter-date', 'DailyRitaseCoalApiController.filterByDate')

    Route.post('/:id/update', 'DailyRitaseCoalApiController.update')

    Route.delete('/:id/destroy', 'DailyRitaseCoalApiController.destroy')

}).prefix('api/daily-ritase-coal').namespace('api')

Route.group(() => {

    Route.get('/', 'DailyRitaseCoalDetailApiController.index')

    Route.post('/', 'DailyRitaseCoalDetailApiController.create')

    Route.get('/:id/show', 'DailyRitaseCoalDetailApiController.show')

    Route.get('/:id/rit/coal', 'DailyRitaseCoalDetailApiController.getByRitID')

    Route.post('/:id/update', 'DailyRitaseCoalDetailApiController.update')

    Route.delete('/:id/destroy', 'DailyRitaseCoalDetailApiController.destroy')

}).prefix('api/daily-ritase-coal-details').namespace('api')

Route.group(() => {

    Route.get('/', 'TimeSheetApiController.index')

    Route.post('/', 'TimeSheetApiController.create')
    
    Route.post('/create/v2', 'TimeSheetApiController.create_v2')

    Route.get('/all', 'TimeSheetApiController.allTimeSheet')

    Route.get('/ranges-date', 'TimeSheetApiController.filterDate')
    
    Route.get('/:id/show', 'TimeSheetApiController.show')

    Route.post('/:id/update', 'TimeSheetApiController.update')

    Route.delete('/:id/destroy', 'TimeSheetApiController.destroy')

}).prefix('api/daily-time-sheet').namespace('api')

Route.group(() => {

    Route.get('/', 'DailyEventApiController.index')

    Route.post('/:id/time-sheet', 'DailyEventApiController.store')
    
    Route.get('/:timesheetID/time-sheet', 'DailyEventApiController.timesheetID')

    Route.get('/:equipmentID/equipment', 'DailyEventApiController.equipmentID')

    Route.delete('/:dailyEventID/destroy', 'DailyEventApiController.destroy')

}).prefix('api/daily-event').namespace('api')

Route.group(() => {

    Route.get('/', 'MonthlyPlanApiController.index')

    Route.post('/', 'MonthlyPlanApiController.create')

    Route.post('/:id/update', 'MonthlyPlanApiController.update')

    Route.delete('/:id/destroy', 'MonthlyPlanApiController.destroy')

    Route.get('/weekly/ob', 'MonthlyPlanApiController.getWeeklyOBProduction')

    Route.get('/weekly/coal', 'MonthlyPlanApiController.getWeeklyCoalProduction')

    Route.get('/weekly/fuel', 'MonthlyPlanApiController.getWeeklyFuelConsumption')
    
    Route.get('/monthly/recap', 'MonthlyPlanApiController.getMonthlyRecap')

    Route.get('/report/daily', 'MonthlyPlanApiController.getDailyReport')
    
}).prefix('api/monthly-plan').namespace('api')

Route.group(() => {

    Route.get('/', 'DailyFuelFillingApiController.index')

    Route.post('/', 'DailyFuelFillingApiController.store')

    Route.post('/:id/update', 'DailyFuelFillingApiController.update')
    
}).prefix('api/daily-refueling').namespace('api')

Route.group(() => {

    Route.post('/shift/morning', 'NotificationController.morningShiftNotification')
    Route.post('/shift/night', 'NotificationController.nightShiftNotification')

    Route.post('/user/device-id/update', 'NotificationController.storeUserDevice')
    
}).prefix('api/notifications').namespace('api')

// Route.get('/mobileapps', ({ view }) => view.render('mobile-documentation'))

Route.get('/mobileapps', 'MobileappsDocumentController.index').namespace('documentation')

Route.get('/401', ({ view }) => view.render('401'))

Route.any('*', ({ view }) => view.render('404'))


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
Route.get('/json', 'WelcomeController.check').as('home')
Route.get('/login', 'AuthController.show').as('auth.login')
Route.post('/login', 'AuthController.login')
Route.get('/logout', 'AuthController.loggingOut').as('auth.logout')
Route.post('/profile', 'AuthController.updatePassword').as('auth.upd-pass')
Route.get('/:token/logout', 'AuthController.loggingOutToken').as('auth.loggingOutToken')
Route.get('/profile/:id', 'AuthController.profile').as('auth.profile').middleware(['auth'])
Route.post('/profile/:id/update-avatar', 'AuthController.updateAvatar').as('auth.updateAvatar').middleware(['auth'])
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

  // Route.post('/employee', 'MasEmployeeController.store').as('mas.employee.store').validator('Employee-Post').middleware('C')
  Route.post('/employee', 'MasEmployeeController.store').as('mas.employee.store').middleware('C')

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

  Route.get('/site/all', 'MasSiteController.getAllSite').as('mas.site.all').middleware('R')

  // PIT
  Route.get('/pit', 'MasPitController.index').as('mas.pit.index').middleware('R')

  Route.post('/pit', 'MasPitController.store').as('mas.pit.store').middleware('C').validator('Pit')

  Route.get('/pit/list', 'MasPitController.list').as('mas.pit.list').middleware('R')

  Route.get('/pit/:id/show', 'MasPitController.show').as('mas.pit.show').middleware('R')

  Route.post('/pit/:id/update', 'MasPitController.update').as('mas.pit.update').middleware('U')

  Route.post('/pit/:id/delete', 'MasPitController.delete').as('mas.pit.delete').middleware('D')

  Route.get('/pit/all', 'MasPitController.getAllPit').as('mas.pit.all').middleware('R')

  // Shift Schedule
  Route.get('/shift', 'MasShiftController.index').as('mas.shift.index').middleware('R')

  Route.post('/shift', 'MasShiftController.store').as('mas.shift.store').middleware('C').validator('Shift')

  Route.get('/shift/list', 'MasShiftController.list').as('mas.shift.list').middleware('R')

  Route.get('/shift/:id/show', 'MasShiftController.show').as('mas.shift.show').middleware('R')

  Route.post('/shift/:id/update', 'MasShiftController.update').as('mas.shift.update').middleware('U')

  Route.post('/shift/:id/delete', 'MasShiftController.delete').as('mas.shift.delete').middleware('D')

  Route.get('/shift/all', 'MasShiftController.getAllShift').as('mas.shift.all').middleware('R')

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

  Route.get('/event/all', 'MasEventController.getAllEvent').as('mas.event.all').middleware('R')

  // Seam
  Route.get('/seam', 'MasSeamController.index').as('mas.seam.index').middleware('R')

  Route.post('/seam', 'MasSeamController.store').as('mas.seam.store').middleware('C')

  Route.get('/seam/list', 'MasSeamController.list').as('mas.seam.list').middleware('R')

  Route.get('/seam/create', 'MasSeamController.create').as('mas.seam.create').middleware('R')

  Route.get('/seam/:id/show', 'MasSeamController.show').as('mas.seam.show').middleware('U')

  Route.post('/seam/:id/update', 'MasSeamController.update').as('mas.seam.update').middleware('U')

  Route.post('/seam/:id/delete', 'MasSeamController.delete').as('mas.seam.delete').middleware('D')

  // Material
  Route.get('/material', 'MasMaterialController.index').as('mas.material.index').middleware('R')

  Route.post('/material', 'MasMaterialController.store').as('mas.material.store').middleware('C')

  Route.get('/material/list', 'MasMaterialController.list').as('mas.material.list').middleware('R')

  Route.get('/material/create', 'MasMaterialController.create').as('mas.material.create').middleware('R')

  Route.get('/material/:id/show', 'MasMaterialController.show').as('mas.material.show').middleware('U')

  Route.post('/material/:id/update', 'MasMaterialController.update').as('mas.material.update').middleware('U')

  Route.post('/material/:id/delete', 'MasMaterialController.delete').as('mas.material.delete').middleware('D')

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

  // Barang
  Route.get('/barang', 'MasBarangController.index').as('mas.barang.index').middleware('R')

  Route.post('/barang', 'MasBarangController.store').as('mas.barang.store').middleware('C')

  Route.get('/barang/list', 'MasBarangController.list').as('mas.barang.list').middleware('R')

  Route.get('/barang/create', 'MasBarangController.create').as('mas.barang.create').middleware('R')

  Route.get('/barang/:id/show', 'MasBarangController.show').as('mas.barang.show').middleware('U')

  Route.post('/barang/:id/update', 'MasBarangController.update').as('mas.barang.update').middleware('U')

  Route.post('/barang/:id/delete', 'MasBarangController.delete').as('mas.barang.delete').middleware('D')

  // Supplier
  Route.get('/supplier', 'MasSupplierController.index').as('mas.supplier.index').middleware('R')

  Route.post('/supplier', 'MasSupplierController.store').as('mas.supplier.store').middleware('C')

  Route.get('/supplier/list', 'MasSupplierController.list').as('mas.supplier.list').middleware('R')

  Route.get('/supplier/create', 'MasSupplierController.create').as('mas.supplier.create').middleware('R')

  Route.get('/supplier/:id/show', 'MasSupplierController.show').as('mas.supplier.show').middleware('U')

  Route.post('/supplier/:id/update', 'MasSupplierController.update').as('mas.supplier.update').middleware('U')

  Route.post('/supplier/:id/delete', 'MasSupplierController.delete').as('mas.supplier.delete').middleware('D')

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
})
  .prefix('master')
  .namespace('master')
  .middleware(['MM'])

// CMS
Route.group(() => {
  Route.get('/main-cms', 'PanelMainCMSController.index').as('cms.main.index')
  Route.post('/main-cms/:id/update', 'PanelMainCMSController.update').as('cms.main.update')

  /** CAROUSEL **/
  Route.get('/carousel-img', 'PanelCarouselController.index').as('cms.carousel.index')
  Route.post('/carousel-img', 'PanelCarouselController.store').as('cms.carousel.store')
  Route.get('/carousel-img/list', 'PanelCarouselController.list').as('cms.carousel.list')
  Route.get('/carousel-img/create', 'PanelCarouselController.create').as('cms.carousel.create')
  Route.get('/carousel-img/:id/show', 'PanelCarouselController.show').as('cms.carousel.show')
  Route.post('/carousel-img/:id/update', 'PanelCarouselController.update').as('cms.carousel.update')
  Route.post('/carousel-img/:id/destroy', 'PanelCarouselController.destroy').as('cms.carousel.destroy')

  /** FEATURE **/
  Route.get('/feature', 'PanelFeatureController.index').as('cms.feature.index')
  Route.post('/feature', 'PanelFeatureController.store').as('cms.feature.store')
  Route.get('/feature/list', 'PanelFeatureController.list').as('cms.feature.list')
  Route.get('/feature/create', 'PanelFeatureController.create').as('cms.feature.create')
  Route.get('/feature/:id/show', 'PanelFeatureController.show').as('cms.feature.show')
  Route.post('/feature/:id/update', 'PanelFeatureController.update').as('cms.feature.update')
  Route.post('/feature/:id/destroy', 'PanelFeatureController.destroy').as('cms.feature.destroy')

  /** FACT **/
  Route.get('/fact', 'PanelFactController.index').as('cms.fact.index')
  Route.post('/fact', 'PanelFactController.store').as('cms.fact.store')
  Route.get('/fact/list', 'PanelFactController.list').as('cms.fact.list')
  Route.get('/fact/create', 'PanelFactController.create').as('cms.fact.create')
  Route.get('/fact/:id/show', 'PanelFactController.show').as('cms.fact.show')
  Route.post('/fact/:id/update', 'PanelFactController.update').as('cms.fact.update')
  Route.post('/fact/:id/destroy', 'PanelFactController.destroy').as('cms.fact.destroy')

  /** FAQ **/
  Route.get('/faq', 'PanelFaqController.index').as('cms.faq.index')
  Route.post('/faq', 'PanelFaqController.store').as('cms.faq.store')
  Route.get('/faq/list', 'PanelFaqController.list').as('cms.faq.list')
  Route.get('/faq/create', 'PanelFaqController.create').as('cms.faq.create')
  Route.get('/faq/:id/show', 'PanelFaqController.show').as('cms.faq.show')
  Route.post('/faq/:id/update', 'PanelFaqController.update').as('cms.faq.update')
  Route.post('/faq/:id/destroy', 'PanelFaqController.destroy').as('cms.faq.destroy')

  /** TESTIMONIAL **/
  Route.get('/testimonial', 'PanelTestimonialController.index').as('cms.testimonial.index')
  Route.post('/testimonial', 'PanelTestimonialController.store').as('cms.testimonial.store')
  Route.get('/testimonial/list', 'PanelTestimonialController.list').as('cms.testimonial.list')
  Route.get('/testimonial/create', 'PanelTestimonialController.create').as('cms.testimonial.create')
  Route.get('/testimonial/:id/show', 'PanelTestimonialController.show').as('cms.testimonial.show')
  Route.post('/testimonial/:id/update', 'PanelTestimonialController.update').as('cms.testimonial.update')
  Route.post('/testimonial/:id/destroy', 'PanelTestimonialController.destroy').as('cms.testimonial.destroy')

  /** ABOUT US **/
  Route.get('/about-us', 'PanelAboutUsController.index').as('cms.about-us.index')
  Route.post('/about-us', 'PanelAboutUsController.store').as('cms.about-us.store')
  Route.get('/about-us/list', 'PanelAboutUsController.list').as('cms.about-us.list')
  Route.get('/about-us/create', 'PanelAboutUsController.create').as('cms.about-us.create')
  Route.get('/about-us/:id/show', 'PanelAboutUsController.show').as('cms.about-us.show')
  Route.post('/about-us/:id/update', 'PanelAboutUsController.update').as('cms.about-us.update')
  Route.post('/about-us/:id/destroy', 'PanelAboutUsController.destroy').as('cms.about-us.destroy')

  /** SERVICE **/
  Route.get('/service', 'PanelServiceController.index').as('cms.service.index')
  Route.post('/service', 'PanelServiceController.store').as('cms.service.store')
  Route.get('/service/list', 'PanelServiceController.list').as('cms.service.list')
  Route.get('/service/create', 'PanelServiceController.create').as('cms.service.create')
  Route.get('/service/:id/show', 'PanelServiceController.show').as('cms.service.show')
  Route.post('/service/:id/update', 'PanelServiceController.update').as('cms.service.update')
  Route.post('/service/:id/destroy', 'PanelServiceController.destroy').as('cms.service.destroy')

  /** TEAM **/
  Route.get('/team', 'PanelTeamController.index').as('cms.team.index')
  Route.post('/team', 'PanelTeamController.store').as('cms.team.store')
  Route.get('/team/list', 'PanelTeamController.list').as('cms.team.list')
  Route.get('/team/create', 'PanelTeamController.create').as('cms.team.create')
  Route.get('/team/:id/show', 'PanelTeamController.show').as('cms.team.show')
  Route.post('/team/:id/update', 'PanelTeamController.update').as('cms.team.update')
  Route.post('/team/:id/destroy', 'PanelTeamController.destroy').as('cms.team.destroy')

  /** PROJECT **/
  Route.get('/project', 'PanelProjectController.index').as('cms.project.index')
  Route.post('/project', 'PanelProjectController.store').as('cms.project.store')
  Route.get('/project/list', 'PanelProjectController.list').as('cms.project.list')
  Route.get('/project/create', 'PanelProjectController.create').as('cms.project.create')
  Route.get('/project/:id/show', 'PanelProjectController.show').as('cms.project.show')
  Route.post('/project/:id/update', 'PanelProjectController.update').as('cms.project.update')
  Route.post('/project/:id/destroy', 'PanelProjectController.destroy').as('cms.project.destroy')
})
  .prefix('cms')
  .namespace('cms')
  .middleware(['MM'])

  Route.group(() => {

    /** MATERIAL REQUEST **/
    Route.get('/material-request', 'MaterialRequestController.index').as('log.material-request.index')
    Route.post('/material-request', 'MaterialRequestController.store').as('log.material-request.store')
    Route.get('/material-request/list', 'MaterialRequestController.list').as('log.material-request.list')
    Route.get('/material-request/create', 'MaterialRequestController.create').as('log.material-request.create')
    Route.get('/material-request/:id/show', 'MaterialRequestController.show').as('log.material-request.show')
    Route.get('/material-request/:id/view', 'MaterialRequestController.view').as('log.material-request.view')
    Route.post('/material-request/:id/check', 'MaterialRequestController.check').as('log.material-request.check')
    Route.get('/material-request/:id/print', 'MaterialRequestController.print').as('log.material-request.print')
    Route.post('/material-request/:id/update', 'MaterialRequestController.update').as('log.material-request.update')
    Route.post('/material-request/:id/destroy', 'MaterialRequestController.destroy').as('log.material-request.destroy')
    Route.get('/material-request/create/items', 'MaterialRequestController.createItems').as('log.material-request.createItems')

    /** CHECK LOGISTIK MATERIAL REQUEST **/
    Route.get('/material-request-check', 'CheckMaterialRequestController.index').as('log.check-material-request.index')
    Route.post('/material-request-check', 'CheckMaterialRequestController.store').as('log.check-material-request-check.store')
    Route.get('/material-request-check/list', 'CheckMaterialRequestController.list').as('log.check-material-request-check.list')
    Route.get('/material-request-check/create', 'CheckMaterialRequestController.create').as('log.check-material-request-check.create')
    Route.get('/material-request-check/:id/show', 'CheckMaterialRequestController.show').as('log.check-material-request-check.show')
    Route.get('/material-request-check/:id/view', 'CheckMaterialRequestController.view').as('log.check-material-request-check.view')
    Route.post('/material-request-check/:id/check', 'CheckMaterialRequestController.check').as('log.check-material-request-check.check')
    // Route.post('/material-request-check/:id/print', 'CheckMaterialRequestController.print').as('log.check-material-request-check.print')
    Route.post('/material-request-check/:id/update', 'CheckMaterialRequestController.update').as('log.check-material-request-check.update')
    Route.post('/material-request-check/:id/destroy', 'CheckMaterialRequestController.destroy').as('log.check-material-request-check.destroy')
    Route.post('/material-request-check/:id/barang-out', 'CheckMaterialRequestController.barangOut').as('log.check-material-request-check.barangOut')
    Route.post('/material-request-check/:id/purchasing-request', 'CheckMaterialRequestController.purchasingRequest').as('log.check-material-request-check.purchasingRequest')
    Route.get('/material-request-check/check-items', 'CheckMaterialRequestController.checkItems').as('log.check-material-request.checkItems')

    /** PURCHASING REQUEST **/
    Route.get('/purchasing-request', 'PurchasingRequestController.index').as('log.purchasing-request.index')
    Route.post('/purchasing-request', 'PurchasingRequestController.store').as('log.purchasing-request.store')
    Route.get('/purchasing-request/list', 'PurchasingRequestController.list').as('log.purchasing-request.list')
    Route.get('/purchasing-request/create', 'PurchasingRequestController.create').as('log.purchasing-request.create')
    Route.get('/purchasing-request/:id/show', 'PurchasingRequestController.show').as('log.purchasing-request.show')
    Route.get('/purchasing-request/:id/update', 'PurchasingRequestController.update').as('log.purchasing-request.update')
    Route.get('/purchasing-request/:id/add-stock', 'PurchasingRequestController.addStok').as('log.purchasing-request.addStok')
    Route.post('/purchasing-request/:id/add-stock', 'PurchasingRequestController.barangIn').as('log.purchasing-request.barangIn')
    Route.post('/purchasing-request/:id/destroy', 'PurchasingRequestController.destroy').as('log.purchasing-request.destroy')

    /** PURCHASING ORDER **/
    Route.get('/purchasing-order', 'PurchasingOrderController.index').as('log.purchasing-order.index')
    Route.post('/purchasing-order', 'PurchasingOrderController.store').as('log.purchasing-order.store')
    Route.get('/purchasing-order/list', 'PurchasingOrderController.list').as('log.purchasing-order.list')
    Route.get('/purchasing-order/create', 'PurchasingOrderController.create').as('log.purchasing-order.create')
    Route.get('/purchasing-order/:id/show', 'PurchasingOrderController.show').as('log.purchasing-order.show')
    Route.get('/purchasing-order/:id/update', 'PurchasingOrderController.update').as('log.purchasing-order.update')
    Route.post('/purchasing-order/:id/destroy', 'PurchasingOrderController.destroy').as('log.purchasing-order.destroy')
    // Route.post('/purchasing-order/item/:id/destroy-items', 'PurchasingOrderController.destroyItems').as('log.purchasing-order.destroyItems')

    /** STOCK MONITORING **/
    Route.get('/monitoring-stok', 'StockMonitoringController.index').as('log.monitoring-stok.index')
    Route.post('/monitoring-stok', 'StockMonitoringController.store').as('log.monitoring-stok.store')
    Route.get('/monitoring-stok/list', 'StockMonitoringController.list').as('log.monitoring-stok.list')
    Route.get('/monitoring-stok/create', 'StockMonitoringController.create').as('log.monitoring-stok.create')
    Route.get('/monitoring-stok/create/items', 'StockMonitoringController.createItems').as('log.monitoring-stok.createItems')
    Route.get('/monitoring-stok/:id/show', 'StockMonitoringController.show').as('log.monitoring-stok.show')
    Route.get('/monitoring-stok/:id/update', 'StockMonitoringController.update').as('log.monitoring-stok.update')
    Route.get('/monitoring-stok/:id/destroy', 'StockMonitoringController.destroy').as('log.monitoring-stok.destroy')
    Route.get('/monitoring-stok/history/:id/in/:gudang_id', 'StockMonitoringController.historyIn').as('log.monitoring-stok.historyIn')
    Route.get('/monitoring-stok/history/:id/out/:gudang_id', 'StockMonitoringController.historyOut').as('log.monitoring-stok.historyOut')
  })
  .prefix('logistik')
  .namespace('logistik')
  .middleware(['MM'])

// DUCUMENTATIONS
Route.group(() => {
  // Web Apps Documentations
  Route.get('/webapps', 'WebappsDocumentController.index').as('doc.webapps')
})
  .prefix('documentation')
  .namespace('documentation')
  .middleware(['MM'])

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

  Route.delete('/usr-akses', 'SysUserAkseController.destroy').as('set.usr-akses.destroy')

  // User Menu
  Route.get('/usr-menu', 'SysMenuController.index').as('set.usr-menu.index').middleware('R')

  Route.get('/usr-menu/create', 'SysMenuController.create').as('set.usr-menu.create').middleware('R')

  Route.post('/usr-menu/create', 'SysMenuController.store').as('set.usr-menu.store').validator('UserMenu').middleware('C')
})
  .prefix('setting')
  .namespace('setting')
  .middleware(['MM'])

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

  Route.post('/daily-ritase-ob/upload/excel', 'DailyRitaseController.storeUploadExcel').as('opr.daily-ritase-ob.storeUploadExcel').middleware('C')

  Route.get('/daily-ritase-ob/upload/backdate', 'DailyRitaseController.showBackDateUpload').as('opr.daily-ritase-ob.backDateUpload').middleware('R')

  Route.post('/daily-ritase-ob/back-date-upload', 'DailyRitaseController.storeBackDate').as('opr.daily-ritase-ob.storeBackDate').middleware('C')

  Route.get('/daily-ritase-ob/list', 'DailyRitaseController.list').as('opr.daily-ritase-ob.list').middleware('R')

  Route.get('/daily-ritase-ob/create', 'DailyRitaseController.create').as('opr.daily-ritase-ob.create').middleware('R')
  
  Route.get('/daily-ritase-ob/create/addItems', 'DailyRitaseController.addItems').as('opr.daily-ritase-ob.addItems').middleware('R')
  
  Route.get('/daily-ritase-ob/:id/list-detail', 'DailyRitaseController.listDetails').as('opr.daily-ritase-ob.listDetails').middleware('R')

  Route.get('/daily-ritase-ob/:id/show', 'DailyRitaseController.show').as('opr.daily-ritase-ob.show').middleware('U')

  Route.post('/daily-ritase-ob/:id/update', 'DailyRitaseController.update').as('opr.daily-ritase-ob.update').middleware('U')

  Route.post('/daily-ritase-ob/:id/delete', 'DailyRitaseController.delete').as('opr.daily-ritase-ob.delete').middleware('D')

  Route.post('/daily-ritase-ob/upload-file', 'DailyRitaseController.uploadFile').as('opr.daily-ritase-ob.uploadFile').middleware('C')

  Route.get('/daily-ritase-ob/haulers/default/:dailyfleet_id', 'DailyRitaseController.getDefaultHaulerByDailyFleet').as('opr.daily-ritase-ob.getHaulerByDailyFleet').middleware('R')

  Route.post('/daily-ritase-ob/upload-file/back-date', 'DailyRitaseController.uploadFileBackDate').as('opr.daily-ritase-ob.uploadFileBackDate').middleware('C')

  Route.post('/daily-ritase-ob/upload-file/month', 'DailyRitaseController.GET_MONTH_EXCEL_DATA_PRODUCTION').as('opr.daily-ritase-ob.GET_MONTH_EXCEL_DATA_PRODUCTION').middleware('C')

  Route.get('/daily-ritase-ob/list/pit/:pit_id', 'DailyRitaseController.listByPIT').as('opr.daily-ritase-ob.listByPIT').middleware('R')

  Route.get('/daily-ritase-ob/list/fleet/:fleet_id', 'DailyRitaseController.listByFLEET').as('opr.daily-ritase-ob.listByFLEET').middleware('R')

  Route.get('/daily-ritase-ob/list/shift/:shift_id', 'DailyRitaseController.listBySHIFT').as('opr.daily-ritase-ob.listBySHIFT').middleware('R')

  Route.get('/daily-ritase-ob/ritase/show/equipment', 'DailyRitaseController.listUnitByRitase').as('opr.daily-ritase-ob.listUnitByRitase').middleware('R')

  Route.post('/daily-ritase-ob/ritase-detail/:id/update', 'DailyRitaseController.updateDetails').as('opr.daily-ritase-ob-details.updateDetails').middleware('U')

  Route.delete('/daily-ritase-ob/ritase-detail/:id/destroy', 'DailyRitaseController.detailDestroy').as('opr.daily-ritase-ob-details.detailDestroy').middleware('U')

  // Daily Ritase COAL
  Route.get('/daily-ritase-coal', 'DailyRitaseCoalController.index').as('opr.daily-ritase-coal.index').middleware('R')

  Route.post('/daily-ritase-coal', 'DailyRitaseCoalController.store').as('opr.daily-ritase-coal.store').middleware('C')

  Route.post('/daily-ritase-coal/file-validate', 'DailyRitaseCoalController.fileValidate').as('opr.daily-ritase-coal.fileValidate').middleware('C')

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

  Route.get('/daily-timesheet/add-event', 'DailyTimesheetController.addEvent').as('opr.daily-timesheet.addEvent').middleware('R')

  Route.get('/daily-timesheet/list-p2h', 'DailyTimesheetController.listP2H').as('opr.daily-timesheet.listP2H').middleware('R')

  Route.get('/daily-timesheet/create', 'DailyOperatorTimesheetController.create').as('opr.daily-timesheet.create').middleware('R') // changed to version 2

  Route.get('/daily-timesheet/create/addItems', 'DailyOperatorTimesheetController.addItems').as('opr.daily-timesheet.addItems').middleware('R')

  Route.post('/daily-timesheet/getLastHM', 'DailyOperatorTimesheetController.getLastHMEquipment').as('opr.daily-timesheet.getLastHMEquipment').middleware('R')

  // Route.get('/daily-timesheet/create', 'DailyTimesheetController.createv2').as('opr.daily-timesheet.create').middleware('R') // old version

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

  // Daily Coal Exposed
  Route.get('/daily-coal-exposed', 'DailyCoalExposedController.index').as('opr.daily-coal-exposed.index').middleware('R')

  Route.post('/daily-coal-exposed', 'DailyCoalExposedController.store').as('opr.daily-coal-exposed.store').middleware('R')

  Route.get('/daily-coal-exposed/list', 'DailyCoalExposedController.list').as('opr.daily-coal-exposed.list').middleware('R')

  Route.get('/daily-coal-exposed/filter', 'DailyCoalExposedController.filter').as('opr.daily-coal-exposed.filter').middleware('R')

  Route.get('/daily-coal-exposed/create', 'DailyCoalExposedController.create').as('opr.daily-coal-exposed.create').middleware('R')

  Route.post('/daily-coal-exposed/:id/destroy', 'DailyCoalExposedController.destroy').as('opr.daily-coal-exposed.destroy').middleware('D')

  Route.get('/daily-coal-exposed/:id/show', 'DailyCoalExposedController.show').as('opr.daily-coal-exposed.show').middleware('R')

  Route.post('/daily-coal-exposed/:id/update', 'DailyCoalExposedController.update').as('opr.daily-coal-exposed.update').middleware('U')

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

  // Daily Refuel Equipment
  Route.get('/daily-refuel-unit', 'DailyRefuelEquipmentController.index').as('opr.daily-refuel-unit.index').middleware('R')

  Route.post('/daily-refuel-unit', 'DailyRefuelEquipmentController.store').as('opr.daily-refuel-unit.store').middleware('C')

  Route.get('/daily-refuel-unit/list', 'DailyRefuelEquipmentController.list').as('opr.daily-refuel-unit.list').middleware('R')

  Route.get('/daily-refuel-unit/create', 'DailyRefuelEquipmentController.create').as('opr.daily-refuel-unit.create').middleware('C')

  Route.post('/daily-refuel-unit/upload-file', 'DailyRefuelEquipmentController.uploadFile').as('opr.daily-refuel-unit.uploadFile').middleware('C')

  Route.get('/daily-refuel-unit/:id/show', 'DailyRefuelEquipmentController.show').as('opr.daily-refuel-unit.show').middleware('U')

  Route.post('/daily-refuel-unit/:id/update', 'DailyRefuelEquipmentController.update').as('opr.daily-refuel-unit.update').middleware('U')

  // Daily Issue
  Route.get('/daily-issue', 'DailyIssueController.index').as('opr.daily-issue.index').middleware('R')

  Route.post('/daily-issue', 'DailyIssueController.store').as('opr.daily-issue.store').middleware('R')

  Route.get('/daily-issue/list', 'DailyIssueController.list').as('opr.daily-issue.list').middleware('R')

  Route.get('/daily-issue/create', 'DailyIssueController.create').as('opr.daily-issue.create').middleware('R')

  Route.get('/daily-issue/:id/show', 'DailyIssueController.show').as('opr.daily-issue.show').middleware('R')

  Route.post('/daily-issue/:id/update', 'DailyIssueController.update').as('opr.daily-issue.update').middleware('U')

  Route.delete('/daily-issue/:id/destroy', 'DailyIssueController.destroy').as('opr.daily-issue.destroy').middleware('D')

   // Daily Stoppage Issue
  Route.get('/daily-stoppage-issue', 'DailyStoppageIssueController.index').as('opr.daily-stoppage-issue.index').middleware('R')

  Route.post('/daily-stoppage-issue', 'DailyStoppageIssueController.store').as('opr.daily-stoppage-issue.store').middleware('R')
 
  Route.get('/daily-stoppage-issue/list', 'DailyStoppageIssueController.list').as('opr.daily-stoppage-issue.list').middleware('R')
 
  Route.get('/daily-stoppage-issue/create', 'DailyStoppageIssueController.create').as('opr.daily-stoppage-issue.create').middleware('R')
 
  Route.get('/daily-stoppage-issue/:id/show', 'DailyStoppageIssueController.show').as('opr.daily-stoppage-issue.show').middleware('R')
 
  Route.post('/daily-stoppage-issue/:id/update', 'DailyStoppageIssueController.update').as('opr.daily-stoppage-issue.update').middleware('U')
 
  Route.delete('/daily-stoppage-issue/:id/destroy', 'DailyStoppageIssueController.destroy').as('opr.daily-stoppage-issue.destroy').middleware('D')
   
  // Purchasing Request Request
  Route.get('/purchasing-request', 'PurchasingRequestController.index').as('opr.purchasing-request.index')

  Route.post('/purchasing-request', 'PurchasingRequestController.store').as('opr.purchasing-request.store')

  Route.get('/purchasing-request/list', 'PurchasingRequestController.list').as('opr.purchasing-request.list')

  Route.get('/purchasing-request/create', 'PurchasingRequestController.create').as('opr.purchasing-request.create')

  Route.get('/purchasing-request/items-create', 'PurchasingRequestController.itemCreate').as('opr.purchasing-request.itemCreate')

  Route.get('/purchasing-request/:id/view', 'PurchasingRequestController.view').as('opr.purchasing-request.view')

  Route.post('/purchasing-request/:id/destroy', 'PurchasingRequestController.destroy').as('opr.purchasing-request.destroy')
  
  // Purchasing Request Order
  Route.get('/purchasing-order', 'PurchasingOrderController.index').as('opr.purchasing-order.index')

  Route.post('/purchasing-order', 'PurchasingOrderController.store').as('opr.purchasing-order.store')

  Route.get('/purchasing-order/list', 'PurchasingOrderController.list').as('opr.purchasing-order.list')

  Route.get('/purchasing-order/create', 'PurchasingOrderController.create').as('opr.purchasing-order.create')

  Route.get('/purchasing-order/items-create', 'PurchasingOrderController.itemCreate').as('opr.purchasing-order.itemCreate')

  Route.get('/purchasing-order/:id/view', 'PurchasingOrderController.view').as('opr.purchasing-order.view')

  Route.get('/purchasing-order/:id/receive', 'PurchasingOrderController.receive').as('opr.purchasing-order.receive')

  Route.get('/purchasing-order/:id/delivering', 'PurchasingOrderController.delivering').as('opr.purchasing-order.delivering')

  Route.get('/purchasing-order/:id/print', 'PurchasingOrderController.printOrder').as('opr.purchasing-order.printOrder')

  Route.get('/purchasing-order/:id/view-print', 'PurchasingOrderController.viewPrint').as('opr.purchasing-order.viewPrint')

  Route.post('/purchasing-order/:id/received', 'PurchasingOrderController.received').as('opr.purchasing-order.received')
  
  Route.post('/purchasing-order/:id/delivered', 'PurchasingOrderController.delivered').as('opr.purchasing-order.delivered')

  Route.post('/purchasing-order/:id/update', 'PurchasingOrderController.update').as('opr.purchasing-order.update')

  Route.post('/purchasing-order/item/:id/destroy-items', 'PurchasingOrderController.destroyItems').as('log.purchasing-order.destroyItems')

  // SOP Operational

  Route.get('/sop', 'SopController.index').as('opr.sop.index').middleware('R')

  Route.post('/sop', 'SopController.store').as('opr.sop.store').middleware('R')

  Route.get('/sop/list', 'SopController.list').as('opr.sop.list').middleware('R')

  Route.post('/sop/create', 'SopController.create').as('opr.sop.create').middleware('C')

  Route.post('/sop/uploadFile', 'SopController.uploadFile').as('opr.sop.uploadFile').middleware('C')

  Route.get('/sop/:id/show', 'SopController.show').as('opr.sop.show').middleware('U')

  Route.post('/sop/:id/update', 'SopController.update').as('opr.sop.update').middleware('U')

  Route.delete('/sop/:id/destroy', 'SopController.destroy').as('opr.sop.destroy').middleware('D')

  // Fuel Usage Summary
  Route.get('/fuel-summary', 'FuelUsageSummaryController.index').as('opr.fuel-summary.index').middleware('R')

  Route.post('/fuel-summary', 'FuelUsageSummaryController.store').as('opr.fuel-summary.store').middleware('C')

  Route.get('/fuel-summary/list', 'FuelUsageSummaryController.list').as('opr.fuel-summary.list').middleware('R')

  Route.get('/fuel-summary/create', 'FuelUsageSummaryController.create').as('opr.fuel-summary.create').middleware('C')

  Route.post('/fuel-summary/entry', 'FuelUsageSummaryController.storeEntry').as('opr.fuel-summary.storeEntry').middleware('C')

  Route.post('/fuel-summary/uploadFile', 'FuelUsageSummaryController.uploadFile').as('opr.fuel-summary.uploadFile').middleware('C')

  Route.post('/fuel-summary/store', 'FuelUsageSummaryController.store').as('opr.fuel-summary.store').middleware('C')

  Route.get('/fuel-summary/:id/show', 'FuelUsageSummaryController.show').as('opr.fuel-summary.show').middleware('U')

  Route.post('/fuel-summary/:id/update', 'FuelUsageSummaryController.update').as('opr.fuel-summary.update').middleware('U')

  Route.delete('/fuel-summary/:id/destroy', 'FuelUsageSummaryController.destroy').as('opr.fuel-summary.destroy').middleware('D')

  // Heavy Equipment / Downtime
  Route.get('/daily-downtime', 'DailyDowntimeController.index').as('opr.daily-downtime.index').middleware('R')

  Route.post('/daily-downtime', 'DailyDowntimeController.store').as('opr.daily-downtime.store').middleware('C')

  Route.get('/daily-downtime/list', 'DailyDowntimeController.list').as('opr.daily-downtime.list').middleware('R')

  Route.get('/daily-downtime/create', 'DailyDowntimeController.create').as('opr.daily-downtime.create').middleware('C')

  Route.post('/daily-downtime/uploadFile', 'DailyDowntimeController.uploadFile').as('opr.daily-downtime.uploadFile').middleware('C')

  // Heavy Equipment / Equipment Performance
  Route.get('/equipment-performance', 'EquipmentPerformanceController.index').as('opr.equipment-performance.index').middleware('R')

  Route.post('/equipment-performance', 'EquipmentPerformanceController.store').as('opr.equipment-performance.store').middleware('C')

  Route.get('/equipment-performance/list', 'EquipmentPerformanceController.list').as('opr.equipment-performance.list').middleware('R')

  Route.get('/equipment-performance/create', 'EquipmentPerformanceController.create').as('opr.equipment-performance.create').middleware('C')

  Route.get('/equipment-performance/:id/show', 'EquipmentPerformanceController.show').as('opr.equipment-performance.show')

  Route.get('/equipment-performance/:id/update', 'EquipmentPerformanceController.update').as('opr.equipment-performance.update')
})
  .prefix('operation')
  .namespace('operation')
  .middleware(['MM'])

// REPORT
Route.group(() => {
  Route.get('/production', 'ProductionReportController.index').as('rep.production.index').middleware('R')

  Route.get('/production/filter', 'ProductionReportController.filterForm').as('rep.production.filter').middleware('R')

  Route.post('/production/apply-filter', 'ProductionReportController.applyFilter').as('rep.production.applyFilter').middleware('R')

  Route.post('/production/gen-data-pdf', 'ProductionReportController.genDataPDF').as('rep.production.showData').middleware('R')

  Route.post('/production/gen-data-xls', 'ProductionReportController.genDataXLS').as('rep.production.showData').middleware('R')

  Route.get('/fuel-ratio', 'FuelRatioController.index').as('rep.fuel-ratio.index').middleware('R')

  Route.get('/fuel-ratio/filter', 'FuelRatioController.filter').as('rep.fuel-ratio.filter').middleware('R')

  Route.post('/fuel-ratio/apply-filter', 'FuelRatioController.applyFilter').as('rep.production.applyFilter').middleware('R')

  Route.post('/fuel-ratio/gen-data-pdf', 'FuelRatioController.genDataPDF').as('rep.production.showData').middleware('R')

  Route.post('/fuel-ratio/gen-data-xls', 'FuelRatioController.genDataXLS').as('rep.production.showData').middleware('R')

  Route.get('/heavy-equipment', 'HeavyEquipmentController.index').as('rep.heavy-equipment.index').middleware('R')

  Route.post('/heavy-equipment', 'HeavyEquipmentController.applyFilter').as('rep.heavy-equipment.applyFilter').middleware('R')

  Route.get('/heavy-equipment/filter', 'HeavyEquipmentController.filter').as('rep.heavy-equipment.filter').middleware('R')

  Route.post('/heavy-equipment/table', 'HeavyEquipmentController.kpiTable').as('rep.heavy-equipment.kpiTable').middleware('R')

  Route.post('/heavy-equipment/gen-data-pdf', 'HeavyEquipmentController.genDataPDF').as('rep.heavy-equipment.showData').middleware('R')
})
  .prefix('report')
  .namespace('report')
  .middleware(['MM'])

// AJAX
Route.group(() => {
  Route.get('/sys-options', 'AjaxOptionController.index').as('set.sys-options.index')

  Route.get('/usr', 'AjaxUserAkseController.getOptionUsers').as('set.sys-options.getOptionUsers')

  Route.get('/fuelman', 'AjaxUserAkseController.getOptionFuelman').as('set.sys-options.getOptionFuelman')

  Route.get('/checker', 'AjaxUserAkseController.getOptionChecker').as('set.sys-options.getOptionChecker')

  Route.get('/spv', 'AjaxUserAkseController.getOptionForeman').as('set.sys-options.getOptionForeman')

  Route.get('/usr-module', 'AjaxUserAkseController.getUserModule').as('set.sys-options.getUserModule')

  Route.get('/usr-sysmodule', 'AjaxUserAkseController.getSysModule').as('set.sys-options.getSysModule')

  Route.get('/department', 'AjaxOptionController.getDepartment').as('set.sys-options.getDepartment')

  Route.get('/site', 'AjaxSiteController.getSites').as('site.getSites')

  Route.get('/site/:id', 'AjaxSiteController.getSiteByID').as('site.getSiteByID')

  Route.get('/pit', 'AjaxPitController.getPits').as('pit.getPits')

  Route.get('/pit-by-site', 'AjaxPitController.getPitsBySite').as('pit.getPitsBySite')

  Route.get('/fleet', 'AjaxFleetController.getFleets').as('fleet.getFleets')

  Route.get('/fleet/dailyfleet', 'AjaxFleetController.listDailyFleet').as('fleet.listDailyFleet')

  Route.get('/fleet-by-pit', 'AjaxFleetController.getFleetsByPit').as('fleet.getFleetsByPit')

  Route.get('/fleet-by-tipe', 'AjaxFleetController.getFleetsByTipe').as('fleet.getFleetsByTipe')

  Route.get('/fleet-by-equipment', 'AjaxFleetController.getEquipmentOnFleet').as('fleet.getEquipmentOnFleet')

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

  Route.get('/equipment/model', 'AjaxEquipmentController.getEquipmentModel').as('equipment.getEquipmentModel')

  Route.get('/equipment/model-onsite', 'AjaxEquipmentController.getEquipmentModelOnSite').as('equipment.getEquipmentModelOnSite')

  Route.get('/equipment/excavator', 'AjaxEquipmentController.getEquipmentExcavator').as('equipment.getEquipmentExcavator')

  Route.get('/equipment/hauler', 'AjaxEquipmentController.getEquipmentHauler').as('equipment.getEquipmentHauler')

  Route.get('/equipment/fuel-truck', 'AjaxEquipmentController.getEquipmentFuelTruck').as('equipment.getEquipmentFuelTruck')

  Route.get('/fuel-type', 'AjaxFuelController.getFuelType').as('fuel.getFuelType')

  Route.get('/fuel-agen', 'AjaxFuelController.getFuelAgen').as('fuel.getFuelAgen')

  Route.get('/subcon', 'AjaxSubcontractorController.getSubcon').as('subcon.getSubcon')

  Route.get('/daily-fleet/:id', 'AjaxDailyFleetController.getDailyfleet').as('daily-fleet.getDailyfleet')

  Route.get('/running-text', 'AjaxIssueController.runningText')

  Route.get('/barang', 'AjaxBarangController.getBarang')

  Route.get('/barang/:id', 'AjaxBarangController.getBarangDetails')

  Route.get('/vendor', 'AjaxBarangController.getVendor')
  
  Route.get('/vendor/:id', 'AjaxBarangController.getVendorDetails')

  Route.get('/gudang', 'AjaxGudangController.list')
  
  Route.get('/gudang/:id', 'AjaxGudangController.gudangID')

  Route.get('/opt-department', 'AjaxDepartmentController.list')

  // GRAFIK
  Route.get('/grafik1', 'AjaxChartController.grafik_OB_MTD')

  Route.get('/grafik2', 'AjaxChartController.grafik_OB_RITASE_EQUIPMENT')

  Route.get('/grafik3', 'AjaxChartController.grafik_COAL_MTD')

  Route.get('/grafik4', 'AjaxChartController.grafik_FUEL_MTD')

  Route.get('/grafik5', 'AjaxChartController.grafik_EVENT_MTD')

  Route.get('/grafik6', 'AjaxChartController.grafik_COST_VS_PROD')

  // CUSTOM GRAFIK
  Route.get('/ritase-ob', 'AjaxTruckCountObController.index')

  Route.get('/doc/platform', 'AjaxDocumentationController.getPlatform')

  Route.get('/doc/fitur', 'AjaxDocumentationController.getFitur')
})
  .prefix('ajax')
  .namespace('ajax')
  .middleware(['MM'])

Route.group(() => {
  Route.get('ritase-perjam/:hh', 'HourlyRitaseObController.index')
})
  .prefix('download')
  .namespace('report')

//  API MOBILE
Route.group(() => {
  // Route.post('/login', 'AuthApiController.login').middleware('auth:session,api')
  Route.post('/login', 'AuthApiController.login')

  Route.post('/update-password', 'AuthApiController.updatePassword')

  Route.post('/update-password/v2', 'AuthApiController.updatePasswordWithoutOldPassword')

  Route.post('/logout', 'AuthApiController.logout')

  Route.post('/api-test', 'MamEquipmentPerformanceController.index')

  Route.get('/', async () => ({ greeting: 'Welcome to Restfull API with Adonis.js.....' }))
})
  .prefix('api')
  .namespace('api')

Route.group(() => {
  Route.post('/error/add', 'SysErrorController.store')

  Route.post('/log/add', 'SysLogController.store')
})
  .prefix('api/system')
  .namespace('setting')

Route.group(() => {
  Route.get('/', 'UserApiController.index')

  Route.get('/search', 'UserApiController.search')

  Route.get('/:id/show', 'UserApiController.show')
})
  .prefix('api/users')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'ProfileApiController.index')

  Route.get('/:id/show', 'ProfileApiController.show')

  Route.post('/:id/update', 'ProfileApiController.update')

  Route.post('/:id/update-avatar', 'ProfileApiController.uploadAvatar')
})
  .prefix('api/profile')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'MasP2HApiController.index')

  Route.post('/', 'MasP2HApiController.create')

  Route.get('/:id/show', 'MasP2HApiController.show')

  Route.post('/:id/update', 'MasP2HApiController.update')
})
  .prefix('api/p2h')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'MaterialApiController.index')

  Route.post('/', 'MaterialApiController.create')

  Route.get('/:id/show', 'MaterialApiController.show')

  Route.post('/:id/update', 'MaterialApiController.update')
})
  .prefix('api/material')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'MasEventApiController.index')

  Route.post('/', 'MasEventApiController.create')

  Route.get('/:id/show', 'MasEventApiController.show')

  Route.post('/:id/update', 'MasEventApiController.update')
})
  .prefix('api/event')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'EmployeeApiController.index')

  Route.post('/', 'EmployeeApiController.create')

  Route.get('/operator', 'EmployeeApiController.operator')

  Route.get('/:id/show', 'EmployeeApiController.show')

  Route.post('/:id/update', 'EmployeeApiController.update')
})
  .prefix('api/employee')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'PitApiController.index')

  Route.get('/:id/show', 'PitApiController.show')

  Route.post('/:id/update', 'PitApiController.update')
})
  .prefix('api/pit')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'SiteApiController.index')

  Route.get('/:id/show', 'SiteApiController.show')

  Route.post('/:id/update', 'SiteApiController.update')
})
  .prefix('api/site')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'MasSeamApiController.index')

  Route.get('/:id/show', 'MasSeamApiController.show')

  Route.post('/:id/update', 'MasSeamApiController.update')

  Route.get('/:pit_id/pit', 'MasSeamApiController.getSeamByPit')
})
  .prefix('api/seam')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'FleetApiController.index')

  Route.get('/:id/show', 'FleetApiController.show')

  Route.post('/:id/update', 'FleetApiController.update')
})
  .prefix('api/fleet')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'SubconApiController.index')

  Route.get('/:id/show', 'SubconApiController.show')

  Route.get('/:id/equipment', 'SubconApiController.showEquipment')

  Route.get('/equipment/all', 'SubconApiController.showEquipmentAll')

  Route.get('/employee/all', 'SubconApiController.subconEmployeeAll')
})
  .prefix('api/subcon')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'EquipmentApiController.index')

  Route.get('/available-fleet', 'EquipmentApiController.availableForFleet')

  Route.get('/show-equipment-models', 'EquipmentApiController.showEquipmentModels')

  Route.get('/:id/show', 'EquipmentApiController.show')

  Route.get('/:idequip/last-smu', 'EquipmentApiController.lastEquipmentSMU')

  Route.post('/:id/update', 'EquipmentApiController.update')

  Route.get('/available-fleet/:idfleet/onfleet', 'EquipmentApiController.equipment_onFleet')

  Route.post('/available-fleet/:idfleet/event-all-equipment', 'EquipmentApiController.equipmentEventAll')

  Route.delete('/daily-event/:dailyevent_id/destroy', 'EquipmentApiController.destroyEquipmentEventId')

  Route.post('/available-fleet/:idfleet/equipment/:idequip', 'EquipmentApiController.equipmentEventId')

  Route.get('/:id/event', 'EquipmentApiController.getEventByEquipmentID')
})
  .prefix('api/equipment')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'ActivitiesApiController.index')

  Route.get('/:id/show', 'ActivitiesApiController.show')

  Route.post('/:id/update', 'ActivitiesApiController.update')
})
  .prefix('api/activities')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'ShiftApiController.index')

  Route.get('/:id/show', 'ShiftApiController.show')

  Route.post('/:id/update', 'ShiftApiController.update')
})
  .prefix('api/shift')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyFleetApiController.index')

  Route.post('/', 'DailyFleetApiController.create')

  Route.get('/:id/show', 'DailyFleetApiController.show')

  Route.get('/filter-date', 'DailyFleetApiController.filterByDate')

  Route.post('/:id/update', 'DailyFleetApiController.update')

  Route.post('update-pit', 'DailyFleetApiController.moveFleetToOtherPIT')
})
  .prefix('api/daily-fleet')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyFleetEquipmentApiController.index')

  Route.post('/', 'DailyFleetEquipmentApiController.create')

  Route.get('/:id/show', 'DailyFleetEquipmentApiController.show')

  Route.post('/:id/update', 'DailyFleetEquipmentApiController.update')

  Route.delete('/:id/destroy', 'DailyFleetEquipmentApiController.destroy')

  Route.post('/move-to-other-fleet', 'DailyFleetEquipmentApiController.moveUnitToOtherFleet')
})
  .prefix('api/daily-fleet-equipment')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyRitaseApiController.index')

  Route.post('/', 'DailyRitaseApiController.create')

  Route.get('/:id/show', 'DailyRitaseApiController.show')

  Route.post('/:id/update', 'DailyRitaseApiController.update')

  Route.get('/filter-date', 'DailyRitaseApiController.filterByDate')

  Route.get('/testupload', 'DailyRitaseApiController.GET_MONTH_EXCEL_DATA_PRODUCTION')

  Route.delete('/:id/destroy', 'DailyRitaseApiController.destroy')
})
  .prefix('api/daily-ritase')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyRitaseDetailApiController.index')

  Route.post('/', 'DailyRitaseDetailApiController.create')

  Route.get('/:id/show', 'DailyRitaseDetailApiController.show')

  Route.get('/:id/show', 'DailyRitaseDetailApiController.show')

  Route.get('/:id/rit/ob', 'DailyRitaseDetailApiController.getByRitID')

  Route.delete('/:id/destroy', 'DailyRitaseDetailApiController.destroy')
})
  .prefix('api/daily-ritase-details')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyRitaseCoalApiController.index')

  Route.post('/', 'DailyRitaseCoalApiController.create')

  Route.get('/:id/show', 'DailyRitaseCoalApiController.show')

  Route.get('/filter-date', 'DailyRitaseCoalApiController.filterByDate')

  Route.post('/:id/update', 'DailyRitaseCoalApiController.update')

  Route.delete('/:id/destroy', 'DailyRitaseCoalApiController.destroy')
})
  .prefix('api/daily-ritase-coal')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyRitaseCoalDetailApiController.index')

  Route.post('/', 'DailyRitaseCoalDetailApiController.create')

  Route.get('/:id/show', 'DailyRitaseCoalDetailApiController.show')

  Route.get('/:id/rit/coal', 'DailyRitaseCoalDetailApiController.getByRitID')

  Route.post('/:id/update', 'DailyRitaseCoalDetailApiController.update')

  Route.delete('/:id/destroy', 'DailyRitaseCoalDetailApiController.destroy')
})
  .prefix('api/daily-ritase-coal-details')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'TimeSheetApiController.index')

  Route.post('/', 'TimeSheetApiController.create')

  Route.post('/create/v2', 'TimeSheetApiController.create_v2')

  Route.get('/all', 'TimeSheetApiController.allTimeSheet')

  Route.get('/ranges-date', 'TimeSheetApiController.filterDate')

  Route.get('/:id/show', 'TimeSheetApiController.show')

  Route.post('/:id/update', 'TimeSheetApiController.update')

  Route.delete('/:id/destroy', 'TimeSheetApiController.destroy')
})
  .prefix('api/daily-time-sheet')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyEventApiController.index')

  Route.post('/', 'DailyEventApiController.saveWithoutTimeSheet')

  Route.post('/:id/time-sheet', 'DailyEventApiController.store')

  Route.get('/:timesheetID/time-sheet', 'DailyEventApiController.timesheetID')

  Route.get('/:equipmentID/equipment', 'DailyEventApiController.equipmentID')

  Route.delete('/:dailyEventID/destroy', 'DailyEventApiController.destroy')
})
  .prefix('api/daily-event')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyIssueController.index')

  // Route.post('/', 'DailyIssueController.store')

  Route.get('/:id/show', 'DailyIssueController.show')

  Route.get('/show/by/date', 'DailyIssueController.filterDate')

  // Route.post('/:id/daily-issue', 'DailyIssueController.store')

  // Route.delete('/:id/daily-issue', 'DailyIssueController.destroy')
})
  .prefix('api/daily-issue')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'MonthlyPlanApiController.index')

  Route.post('/', 'MonthlyPlanApiController.create')

  Route.post('/:id/update', 'MonthlyPlanApiController.update')

  Route.delete('/:id/destroy', 'MonthlyPlanApiController.destroy')

  Route.get('/weekly/ob', 'MonthlyPlanApiController.getWeeklyOBProduction')

  Route.get('/v1/weekly/ob', 'MonthlyPlanApiController.getWeeklyOBProduction_v2')

  Route.get('/v1/weekly/coal', 'MonthlyPlanApiController.getWeeklyCoalProduction_v2')

  Route.get('/v1/weekly/fuel', 'MonthlyPlanApiController.getWeeklyFuel_v2')

  Route.get('/weekly/fuel', 'MonthlyPlanApiController.getWeeklyFuelConsumption')

  Route.get('/monthly/recap', 'MonthlyPlanApiController.getMonthlyRecap')

  Route.get('/report/daily', 'MonthlyPlanApiController.getDailyReport')

  Route.get('/exca/productivity/ob', 'MonthlyPlanApiController.getExcaProductivity_OB')

  Route.get('/exca/productivity/coal', 'MonthlyPlanApiController.getExcaProductivity_COAL')

  Route.get('/unit/refueling/recent', 'MonthlyPlanApiController.recentUnitRefueling')

  Route.get('/unit/refueling/shift/detail', 'MonthlyPlanApiController.recentUnitRefuelingDetails')

  Route.get('/ranges/fuel/ratio', 'MonthlyPlanApiController.getRangeMonthFuelBurn')

  Route.get('/mtd-reports/get', 'MonthlyPlanApiController.getMTDReports')

  Route.get('/unit/event/recent', 'MonthlyPlanApiController.getRecentEvents')
})
  .prefix('api/monthly-plan')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyFuelFillingApiController.index')

  Route.post('/', 'DailyFuelFillingApiController.store')

  Route.post('/:id/update', 'DailyFuelFillingApiController.update')
})
  .prefix('api/daily-refueling')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'TravelDocumentApiController.index')

  Route.post('/', 'TravelDocumentApiController.store')

  Route.get('/:id/show', 'TravelDocumentApiController.show')

  Route.post('/:id/update', 'TravelDocumentApiController.update')

  Route.delete('/:id/destroy', 'TravelDocumentApiController.destroy')
})
  .prefix('api/travel-document')
  .namespace('api')

Route.group(() => {
  Route.get('/', 'DailyCoalExposedApiController.index')

  Route.get('/filter', 'DailyCoalExposedApiController.filter')

  Route.get('/:id/details', 'DailyCoalExposedApiController.show')
})
  .prefix('api/daily-coal-exposed')
  .namespace('api')

Route.group(() => {
  Route.post('/shift/morning', 'NotificationController.morningShiftNotification')
  Route.post('/shift/night', 'NotificationController.nightShiftNotification')

  Route.post('/user/device-id/update', 'NotificationController.storeUserDevice')
  Route.post('/', 'NotificationController.index')
})
  .prefix('api/notifications')
  .namespace('api')

/* START API VERSION 2.0 */

Route.group(() => {
  Route.post('/shift/morning', 'NotificationController.morningShiftNotification')
  Route.post('/shift/night', 'NotificationController.nightShiftNotification')

  Route.post('/user/device-id/update', 'NotificationController.storeUserDevice')
  Route.post('/', 'NotificationController.index')
})
  .prefix('api/v2/notifications')
  .namespace('api')

// REPORT PRODUCTIONS OVER BURDEN & COAL
Route.group(() => {
  Route.get('/', 'ReportProductionController.index')
  Route.get('/pdf', 'ReportProductionController.pdf')
  Route.get('/list', 'ReportProductionController.list')
})
  .prefix('api/v2/productions')
  .namespace('api/v2')

// REPORT FUEL RATIO
Route.group(() => {
  Route.get('/', 'ReportFuelRatioController.index')
  Route.get('/pdf', 'ReportFuelRatioController.pdf')
  Route.get('/list', 'ReportFuelRatioController.list')
})
  .prefix('api/v2/fuel-ratio')
  .namespace('api/v2')

// REPORT HEAVY EQUIPMENT PERFORMANCES
Route.group(() => {
  Route.get('/', 'ReportHeavyEquipmentPerformanceController.GET_REPORT')
  Route.get('/pdf', 'ReportHeavyEquipmentPerformanceController.pdf')
  Route.get('/equipment/list', 'ReportHeavyEquipmentPerformanceController.equipmentList')
  Route.get('/equipment/type', 'ReportHeavyEquipmentPerformanceController.equipmentType')
  Route.get('/equipment/model', 'ReportHeavyEquipmentPerformanceController.equipmentModel')
  // Route.get('/list', 'ReportHeavyEquipmentPerformanceController.list')
})
  .prefix('api/v2/he-performances')
  .namespace('api/v2')

// REPORT ISSUES
Route.group(() => {
  Route.get('/', 'ReportIssueController.index')
  Route.get('/today', 'ReportIssueController.today')
  Route.get('/log/hourly', 'ReportIssueController.issueHourly')
  Route.get('/log/ranges', 'ReportIssueController.byRanges')
})
  .prefix('api/v2/issues')
  .namespace('api/v2')

// REPORT EMPLOYEE
Route.group(() => {
  Route.get('/', 'ReportIssueController.index')
})
  .prefix('api/v2/employee')
  .namespace('api/v2')

// CMS MAIN
Route.group(() => {
  Route.get('/', 'CmsMainController.index')
  Route.get('/lang', 'CmsMainController.defaultLang')
  Route.get('/carousel-home', 'CmsMainController.carouselHome')
  Route.get('/about-home', 'CmsMainController.aboutHome')
  Route.get('/service-home', 'CmsMainController.serviceHome')
  Route.get('/team-home', 'CmsMainController.teamHome')
  Route.get('/testomoni-home', 'CmsMainController.testimonialHome')
  Route.get('/project-home', 'CmsMainController.projectHome')
  Route.get('/career-home', 'CmsMainController.careerHome')
  Route.post('/career-home', 'CmsMainController.careerStore')

  Route.get('/equipment', 'CmsMainController.equipment')
})
  .prefix('api/v2/:lang/cms-main')
  .namespace('api/v2')

/* END API VERSION 2.0 */

// Route.get('/mobileapps', ({ view }) => view.render('mobile-documentation'))

// Route.get('/api/v2/cms-main/lang', 'CmsMainController.defaultLang').namespace('api/v2')
Route.get('/mobileapps', 'MobileappsDocumentController.index').namespace('documentation')

Route.get('/email', ({ view }) => view.render('email-login-notification'))

Route.get('/401', ({ view }) => view.render('401'))

Route.any('*', ({ view }) => view.render('404'))

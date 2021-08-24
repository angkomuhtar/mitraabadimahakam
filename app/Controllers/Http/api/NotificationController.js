'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const _request = require('request');

/**
 * Resourceful controller for interacting with notifications
 */
class NotificationController {
  /**
   * Show a list of all notifications.
   * GET notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new notification.
   * GET notifications/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new notification.
   * POST notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {

    var sendMessage = function(device, message){
      var restKey = 'ZDJkYzBmZjAtZWIyOC00ODllLTk3MzUtMzgxZDU1OGUyMzE4';
      var appID = 'dc5cda17-9d1b-41bd-9a14-3db91d8ccd11';
      _request(
        {
          method:'POST',
          uri:'https://onesignal.com/api/v1/notifications',
          headers: {
            "authorization": "Basic "+restKey,
            "content-type": "application/json"
          },
          json: true,
          body:{
            'app_id': appID,
            'contents': {en: message},
            'include_player_ids': Array.isArray(device) ? device : [device],
            'data' : {}
          }
        },
        function(error, response, body) {
          if(!body.errors){
            console.log(body);
          }else{
            console.error('Error:', body.errors);
          }
          
        }
      );
    };
    
    const req = request.only(['device_id', 'message'])
    sendMessage("dc5cda17-9d1b-41bd-9a14-3db91d8ccd11", req.message);
  }



  /**
   * Display a single notification.
   * GET notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing notification.
   * GET notifications/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update notification details.
   * PUT or PATCH notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a notification with id.
   * DELETE notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = NotificationController

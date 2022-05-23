'use strict'
require('dotenv').config()
const { GET_INFO } = require('mam-npm')

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')

TOKEN_APP()
async function TOKEN_APP(){
  const hash = GET_INFO(process.env.APP_TOKEN).catch(err => console.log(err))
  new Ignitor(require('@adonisjs/fold'))
  .appRoot(hash ? __dirname:__filename)
  .fireHttpServer()
  .catch(console.error)
}

const {app,Menu} = require('electron')
const autoUpdater = require("electron-updater").autoUpdater
const ChildProcess = require('child_process')
const path = require('path')
autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"

let state = 'checking'

exports.initialize = () => {
  if (process.mas) return

  autoUpdater.on('checking-for-update', () => {
    console.log("checking-for-update")
    state = 'checking'
    exports.updateMenu()
  })

  autoUpdater.on('update-available', () => {
    console.log("update-available")
    state = 'checking'
    exports.updateMenu()
  })

  autoUpdater.on('update-downloaded', () => {
    console.log("update-downloaded")
    state = 'installed'
    exports.updateMenu()
  })

  autoUpdater.on('update-not-available', () => {
    console.log("update-not-available")
    state = 'no-update'
    exports.updateMenu()
  })

  autoUpdater.on('error', () => {
    console.log("error")
    state = 'no-update'
    exports.updateMenu()
  })

//  autoUpdater.setFeedURL(`https://electron-api-demos.githubapp.com/updates?version=${app.getVersion()}`)
    autoUpdater.setFeedURL(`https://github.com/Jinteger/Jinteger/raw/master?version=${app.getVersion()}`)
  autoUpdater.checkForUpdates()
}


exports.updateMenu = () => {
  if (process.mas) return

  const menu = Menu.getApplicationMenu()
  if (!menu) return

  menu.items.forEach(item => {
    if (item.submenu) {
      item.submenu.items.forEach(item => {
        switch (item.key) {
          case 'checkForUpdate':
            item.visible = state === 'no-update'
            break
          case 'checkingForUpdate':
            item.visible = state === 'checking'
            break
          case 'restartToUpdate':
            item.visible = state === 'installed'
            break
        }
      })
    }
  })
}

exports.createShortcut = callback => {
  spawnUpdate([
    '--createShortcut',
    path.basename(process.execPath),
    '--shortcut-locations',
    'StartMenu'
  ], callback)
}

exports.removeShortcut = callback => {
  spawnUpdate([
    '--removeShortcut',
    path.basename(process.execPath)
  ], callback)
}

function spawnUpdate (args, callback) {
  const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe')
  let stdout = ''
  let spawned = null

  try {
    spawned = ChildProcess.spawn(updateExe, args)
  } catch (error) {
    if (error && error.stdout == null) {
      error.stdout = stdout
    }
    process.nextTick(() => { callback(error) })
    return
  }

  var error = null

  spawned.stdout.on('data', data => {
    stdout += data
  })

  spawned.on('error', processError => {
    if (!error) error = processError
  })

  spawned.on('close', (code, signal) => {
    if (!error && code !== 0) {
      error = new Error(`Command failed: ${code} ${signal}`)
    }
    if (error && error.code == null) error.code = code
    if (error && error.stdout == null) error.stdout = stdout
    callback(error)
  })
}

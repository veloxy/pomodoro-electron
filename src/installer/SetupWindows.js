#!/usr/bin/env node

const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')
const rimraf = require('rimraf')
deleteOutputFolder()
  .then(getInstallerConfig)
  .then(createWindowsInstaller)
  .then(console.log("Setup Windows is generate in /out/windows-installer"))
  .catch((error) => {
    console.log('Error in setup generation.')
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  const rootPath = path.join(__dirname, '..','..')
  const outPath = path.join(rootPath, 'out')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'Pomodoro-win32-ia32'),
    loadingGif: path.join(rootPath,'src','assets', 'img', 'loading.gif'),
    noMsi: false,
    outputDirectory: path.join(outPath, 'windows-installer'),
    setupExe: 'PomodoroSetup.exe',
    setupIcon: path.join(rootPath,'src','assets', 'icons', 'tomate.ico'),
    skipUpdateIcon: true
  })
}


function deleteOutputFolder () {
  return new Promise((resolve, reject) => {
    rimraf(path.join(__dirname, '..', 'out', 'windows-installer'), (error) => {
      error ? reject(error) : resolve()
    })
  })
}

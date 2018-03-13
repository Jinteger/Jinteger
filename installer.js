var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './electron-win32-x64',
    outputDirectory: './YachaWallet',
    exe: 'electron.exe',
    setupExe: 'MyAppSetup.exe'
});

resultPromise.then(function () {
    console.log("It worked!");
}, function (e) {
    console.log('No dice: ' + e.message);
});
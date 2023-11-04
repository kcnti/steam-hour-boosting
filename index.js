require('dotenv').config()
const Steam = require('steam-user')
const prompt = require('prompt-sync')()
const axios = require('axios')

const client = new Steam()

const credentials = {
    accountName: process.env.USERNAME,
    password: process.env.PASSWORD,
    // twoFactorCode: process.argv[2]
}

const games = [
    730, // CS2
    359550, // RB6
    578080, // PUBG
    960170, // DJMAX
    1172470, // APEX LEGENDS
] // https://steamdb.info/


// TODO: Get appId by appName
const fetchGames = (appName) => {
    const games = axios.get('https://api.steampowered.com/ISteamApps/GetAppList/v0002/')
    console.log(games)
    return games.data.applist.apps.filter(data => data.name === appName)[0].appid
}

process.on('SIGINT', function() {
    client.logOff()
    client.on('disconnected', () => {
        process.exit(0)
    })
});

client.logOn(credentials)

client.on('steamGuard', (domain, callback) => {
    const twoFactorCode = prompt('Enter Steam Guard: ')
    callback(twoFactorCode)
})

client.on('loggedOn', (details, parental) => {
    client.setPersona(Steam.EPersonaState.Away);
    console.log('Login Successful')
    console.log(`Start playing ${games.length} games`)
    client.gamesPlayed(games)
})

client.setOption('ownershipFilter', {
    excludeFree: true,
    excludeExpiring: true,
    excludeShared: true
})

client.setOption('enablePicsCache', true)

// client.on('ownershipCached', () => {
//     const apps = client.getOwnedApps()
//     console.log(apps)
// })

client.on('error', (err) => {
    console.log('[error] ', Steam.EResult[err.eresult])
})
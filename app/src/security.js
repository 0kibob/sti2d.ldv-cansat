const { session } = require('electron')

function setupCSP(app) {
    const fullServer = `${app.serverUrl}:${app.serverPort}`

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": [
                    [
                        "default-src 'self'",
                        "script-src 'self'",
                        "style-src 'self' 'unsafe-inline'",
                        "img-src 'self' https://*.tile.openstreetmap.org",
                        `connect-src 'self' ${fullServer} https://nominatim.openstreetmap.org`
                    ].join('; ')
                ]
            }
        })
    })
}

module.exports = { setupCSP }
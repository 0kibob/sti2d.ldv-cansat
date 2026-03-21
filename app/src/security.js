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
                        `connect-src 'self' ${fullServer}`
                    ].join('; ')
                ]
            }
        })
    })
}

module.exports = { setupCSP }
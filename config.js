// Frontend configuration.
//
// apiUrl = ""  -> "demo mode": registrations are stored in this browser's
//                 localStorage. This is what GitHub Pages uses (no backend).
// apiUrl = "/api/register" -> the Node/MongoDB server (npm start) overrides this
//                 file automatically, so you never need to edit it by hand.
//                 To use a backend hosted elsewhere, put its full URL here,
//                 e.g. "https://my-app.onrender.com/api/register".
window.APP_CONFIG = {
    apiUrl: ""
};

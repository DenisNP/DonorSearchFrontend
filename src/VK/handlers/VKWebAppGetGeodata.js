import VKWebAppGetGeodata from './VKWebAppGetGeodata';

export default {
  iframe: handler,
  site: handler
}

/* eslint no-unused-vars: "off" */
function handler(params, callback, access_token) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            returnResult(callback, {
              available: 1,
              lat: position.coords.latitude,
              long: position.coords.longitude
            });
          },
          (error) => {
            returnResult(callback, {
              error_type: error.code,
              error_data: getErrorData(error.code)
            }, true);
          }
      );
    } else {
        returnResult(callback, {
          error_type: 'Not supported',
          error_data: ''
        }, true);
    }
}

function getErrorData(error_code) {
  switch(error_code) {
        case error_code.PERMISSION_DENIED:
            return "User denied the request for Geolocation."
        case error_code.POSITION_UNAVAILABLE:
            return "Location information is unavailable."
        case error_code.TIMEOUT:
            return "The request to get user location timed out."
        case error_code.UNKNOWN_ERROR:
            return "An unknown error occurred."
    }

    return "";
}

function returnResult(callback, data, isError) {
  callback({
    type: isError
          ? 'VKWebAppGeodataFailed'
          : 'VKWebAppGeodataResult',
    data: data
  });
}

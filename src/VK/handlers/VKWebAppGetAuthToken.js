import VKWebAppGetAuthToken from './VKWebAppGetAuthToken';

export default {
  iframe: handlerIFrame,
  site: handlerSite
}

function handlerIFrame(params, callback) {
  handlerSite(params, callback, "", true);
}

/* eslint no-unused-vars: "off" */
function handlerSite(params, callback, access_token, ignore_token) {
  let data = {};
  let isError = false
  if(access_token || ignore_token) {
    data = {
      access_token: access_token
    };
  } else {
    data = {
      error_type: "No token specified",
      error_data: "Token is empty"
    };
    isError = true;
  };

  returnResult(
    callback,
    data,
    isError
  );
}

function returnResult(callback, data, isError) {
  callback({
    type: isError
          ? 'VKWebAppAccessTokenFailed'
          : 'VKWebAppAccessTokenReceived',
    data: data
  });
}

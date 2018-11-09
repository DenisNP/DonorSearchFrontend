import VKWebAppGetAuthToken from './VKWebAppGetAuthToken';

export default {
  iframe: handler,
  site: handler
}

/* eslint no-unused-vars: "off" */
function handler(params, callback, access_token) {
  returnResult(
    callback,
    {
      access_token: access_token || ''
    }
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

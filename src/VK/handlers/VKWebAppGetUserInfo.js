import VKWebAppCallAPIMethodResult from './VKWebAppCallAPIMethod';
import { makeId } from '../../globals';

export default {
  iframe: handlerIFrame,
  site: handlerSite
}

/* eslint no-unused-vars: "off" */
function handlerIFrame(params, callback) {
  sendRequest('iframe', callback);
}

/* eslint no-unused-vars: "off" */
function handlerSite(params, callback, access_token) {
  sendRequest('site', callback, access_token);
}

function sendRequest(mode, callback, access_token) {
  let params = {
    fields: 'photo_100, photo_200, sex, city, country, timezone',
    access_token: access_token || ''
  };

  VKWebAppCallAPIMethodResult[mode](
    {
      method: 'users.get',
      params: params,
      request_id: makeId()
    },
    (result) => {
      if(result.data.response)
        returnResult(callback, result.data.response[0]);
      else
        returnResult(callback, result.data, true);
    }
  );
}

function returnResult(callback, data, isError) {
  callback({
    type: isError
          ? 'VKWebAppGetUserInfoFailed'
          : 'VKWebAppGetUserInfoResult',
    data: data
  });
}

import { jsonpRequest } from '../../globals';

export default {
  iframe: handlerIFrame,
  site: handlerSite
}

/* eslint no-unused-vars: "off" */
function handlerIFrame(params, callback) {
  if(!params || !params.method) return;
  if(!params.hasOwnProperty('params')) params.params = {};
  let payload = addRequired(params.params);

  VK.api(
    params.method,
    payload,
    (result) => {
      getResult(result, callback, params['request_id']);
    }
  );
}

/* eslint no-unused-vars: "off" */
function handlerSite(params, callback, access_token) {
  if(!params || !params.method) return;
  if(!params.hasOwnProperty('params')) params.params = {};
  let payload = addRequired(params.params, access_token);

  jsonpRequest(
    'https://api.vk.com/method/' + params.method,
    payload,
    (result) => {
      getResult(result, callback, params['request_id']);
    },
    (error) => {
      returnResult(callback, {
        error_type: "Jsonp error",
        error_data: JSON.stringify(error)
      }, true);
    }
  );
}

function getResult(result, callback, request_id) {
  if(result.response) {
    returnResult(callback, {
      request_id: request_id || '',
      response: result.response
    });
  } else {
    returnResult(callback, {
      error_type: result.error.error_code,
      error_data: result.error.error_msg
    }, true);
  }
}

function addRequired(params, access_token) {
  if(!params) params = {};

  if(!params['v'])
    params['v'] = '5.87';
  if(access_token && !params['access_token'])
    params['access_token'] = access_token;

  return params;
}

function returnResult(callback, data, isError) {
  callback({
    type: isError
          ? 'VKWebAppCallAPIMethodFailed'
          : 'VKWebAppCallAPIMethodResult',
    data: data
  });
}

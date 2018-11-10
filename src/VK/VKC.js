/* eslint-disable */
import connect from '@vkontakte/vkui-connect';
import handlers from './handlers';
import { makeId } from '../globals';
import { VK_APP_ID } from '../tokens';

import Debug from '../Debug'

export const CLIENT_VK_APPS = "VKAPPS";
export const CLIENT_VK_IFRAME = "VKIFRAME";
export const CLIENT_SITE = "SITE";

const FUNCTION = 'function';
const UNDEFINED = 'undefined';

let subscribers = [];
let client_type = CLIENT_SITE;
let access_token = "";

let api_requests = {};
let auth_callbacks = {};

export default {
  init: (arg1, arg2) => {
    let callback;
    if(typeof(arg2) === FUNCTION) {
      callback = arg2;
      access_token = arg1 || '';
    } else {
      callback = arg1;
    }

    let isClient = typeof window !== UNDEFINED;
    let androidBridge = !!(isClient && window.AndroidBridge);
    let iosBridge = !!(isClient && window.webkit && window.webkit.messageHandlers);
    let isDesktop = !!(!androidBridge && !iosBridge);

    //console && console.log("is desktop: ", isDesktop, androidBridge, iosBridge);

    if(!isDesktop) {

      connect.subscribe((e) => {
        returnData(e.detail);
      });

      client_type = CLIENT_VK_APPS;
      send('VKWebAppInit', {});
      callback();

    } else {
      try {
        VK.init(() => {
          client_type = CLIENT_VK_IFRAME;
          callback();
        },() => {
          client_type = CLIENT_SITE;
          callback();
        });
      } catch(ex) {
        client_type = CLIENT_SITE;
        callback();
      }
    }
  },

  send: send,

  subscribe: (fn) => {
    subscribers.push(fn);
  },

  unsubscribe: (fn) => {
    const index = subscribers.indexOf(fn);

    if (index > -1) {
      subscribers.splice(index, 1);
    }
  },

  quickApi: (method, params, onSuccess, onError) => {
    let req_id = makeId();
    send('VKWebAppCallAPIMethod', {
      method: method,
      params: params,
      request_id: req_id
    });

    api_requests[req_id] = {
      success: onSuccess,
      error: onError
    };
  },

  auth: (app_id, scope, onSuccess, onError) => {
    auth_callbacks = {
      success: onSuccess,
      error: onError
    };

    send('VKWebAppGetAuthToken', {
      'app_id': app_id,
      'scope': scope
    });
  },

  getClientType: () => {
    return client_type;
  }
}

function send(handler, params) {
  Debug.log([client_type + " send: " + handler, params]);

  if(!params) params = {};

  if (client_type == CLIENT_VK_APPS) {
    if(
        handler == 'VKWebAppCallAPIMethod'
        && access_token
        && (params['params'] && !params['params']['access_token'])
      ) {
      if(!params['params']) params['params'] = {};
      params['params']['access_token'] = access_token;
      if(!params['params']['v']) params['params']['v'] = '5.87';
    }

    connect.send(handler, params);
  } else if (client_type == CLIENT_VK_IFRAME) {
    sendIFrame(handler, params);
  } else if (client_type == CLIENT_SITE) {
    sendSite(handler, params);
  }
}

function sendIFrame(handler, params) {
  if(!handlers[handler]) {
    //console && console.log('Not implemented for VKIFRAME: ' + handler);
    return;
  }

  handlers[handler]["iframe"](params, (response) => {
    returnData(response);
  });
}

function sendSite(handler, params) {
  if(!handlers[handler]) {
    //console && console.log('Not implemented for SITE: ' + handler);
    return;
  }

  handlers[handler]["site"](
    params,
    (response) => {
      returnData(response);
    },
    access_token
  );
}

function returnData(data) {
  if(!data.data) return;

  if(data.data.error_type) {
    Debug.log([client_type + " error: ", data]);
  }else{
    Debug.log([client_type + " event: ", data]);
  }

  if(data.type == 'VKWebAppCallAPIMethodResult' || data.type == 'VKWebAppCallAPIMethodFailed') {
    let req_id = data.data.request_id;
    if(req_id && api_requests[req_id]) {
      let callbacks = api_requests[req_id];
      if(data.data.error_type) {
        callbacks.error && callbacks.error(data);
      }else{
        callbacks.success && callbacks.success(data);
      }

      delete api_requests[req_id];
    }
  }

  if(data.type == 'VKWebAppAccessTokenReceived' || data.type == 'VKWebAppAccessTokenFailed') {
    if(data.data.access_token || client_type == CLIENT_VK_IFRAME) {
      access_token = data.data.access_token;
      auth_callbacks.success && auth_callbacks.success(data);
    }else{
      auth_callbacks.error && auth_callbacks.error(data);
    }
  }

  subscribers.forEach((fn) => {
    fn(data);
  });
}

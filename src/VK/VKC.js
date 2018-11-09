/* eslint-disable */
import connect from '@vkontakte/vkui-connect';
import handlers from './handlers';
import { makeId } from '../globals';

export const CLIENT_VK_APPS = "VKAPPS";
export const CLIENT_VK_IFRAME = "VKIFRAME";
export const CLIENT_SITE = "SITE";

const FUNCTION = 'function';
const UNDEFINED = 'undefined';

let isClient = typeof window !== UNDEFINED;
let androidBridge = isClient && window.AndroidBridge;
let iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
let isDesktop = !androidBridge && !iosBridge;

let subscribers = [];
let client_type = CLIENT_SITE;
let access_token = "";

let api_requests = {};

export default {
  init: (arg1, arg2) => {
    let callback;
    if(typeof(arg2) === FUNCTION) {
      callback = arg2;
      access_token = arg1 || '';
    } else {
      callback = arg1;
    }

    if(!isDesktop) {

      connect.subscribe((e) => {
        if(
          e.detail.type == 'VKWebAppAccessTokenReceived' &&
          e.detail.data.access_token
        ) {
          access_token = e.detail.data.access_token;
        }
        returnData(e.detail);
      });

      connect.send('VKWebAppInit', {});
      client_type = CLIENT_VK_APPS;
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
  }
}

function send(handler, params) {
  console &&
  console.log(client_type + " send: " + handler) &&
  console.log(params);

  if(!params) params = {};

  if (client_type == CLIENT_VK_APPS) {
    if(!params['params']) params['params'] = {};
    if(
        handler == 'VKWebAppCallAPIMethod'
        && access_token
        && !params['params']['access_token']
      )
      params['params']['access_token'] = access_token;

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
    console && console.log(client_type + " error: ") && console.log(data);
  }else{
    console && console.log(client_type + " event: ") && console.log(data);
  }

  if(data.type == 'VKWebAppCallAPIMethodResult') {
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

  subscribers.forEach((fn) => {
    fn(data);
  });
}

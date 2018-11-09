import jsonp from 'jsonp';

export function httpRequest(address, params, onComplete, method = 'GET'){
    let xhr = new XMLHttpRequest();
    let postPars = null;
    if(method == 'GET') {
      let parsStr = stringifyParams(params);
      xhr.open('GET', address + (parsStr ? '?' + parsStr : ''));
    } else {
      postPars = JSON.stringify(params);
      xhr.open('POST', address);
    }

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function(){
        if(onComplete !== null)
            onComplete(JSON.parse(this.responseText));
    };
    xhr.send(postPars);
}

export function jsonpRequest(address, params, onComplete) {
  let parsStr = stringifyParams(params);
  let url = address + (parsStr ? '?' + parsStr : '');
  jsonp(url, {}, (err, data) => {
    if(err) {
      console && console.log("Jsonp error:") && console.log(err);
    } else if(onComplete != null) {
      onComplete(data);
    }
  });
}

export function makeId(len = 16) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function stringifyParams(params) {
  const paramsKeys = Object.keys(params);
  return paramsKeys.length > 0
    ? paramsKeys.map(key => `${key}=${params[key]}`).join('&')
    : '';
}

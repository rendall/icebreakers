(()=>{"use strict";var e=function(){return e=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},e.apply(this,arguments)},t=function(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))},n="icebreaker-questions",r="icebreaker-index",o="icebreaker-theme",i=function(e){return e.slice(e.indexOf("*")+1).trim()},u={name:"Carnival",background:"#2B50AA",foreground:"#FF9FE5",highlight:"#FF9FE5",font:"Rammetto One"},c=function(){var e=document.querySelector("main"),t=e.clientWidth,n=document.querySelector("#question-display");if(n.style.fontSize="",!(t>=600)){document.documentElement.classList.add("font-resizing");var r=function(t,o,i,u){void 0===u&&(u=100),void 0===t?setTimeout((function(){var t=e.getBoundingClientRect().width,n=e.getBoundingClientRect().height;r(8,t,n)}),1):(n.style.fontSize=t+"rem",setTimeout((function(){(n.getBoundingClientRect().width>o||n.getBoundingClientRect().height>i)&&u>0?r(t-.1,o,i,u-1):document.documentElement.classList.remove("font-resizing")}),1))};r()}},a=function(e){var t="https://fonts.googleapis.com/css?family="+e.replace(/\s/g,"+").replace(/\"/g,"")+"&display=swap";if(function(e){return(t=[],document.fonts.forEach((function(e){return t.push(e)})),t.reduce((function(e,t){return e.includes(t.family)||e.push(t.family),e}),[])).some((function(t){return t.family===e}));var t}(e))c();else{var n=document.createElement("link");n.href=t,n.rel="stylesheet",n.addEventListener("load",(function(){document.documentElement.style.setProperty("--theme-font",e),c()})),n.addEventListener("error",(function(){e!==u.font&&a(u.font)})),document.head.appendChild(n)}},l=function(e){var t=document.documentElement;t.style.setProperty("--theme-foreground",e.foreground),t.style.setProperty("--theme-background",e.background),t.style.setProperty("--theme-highlight",e.highlight),a(e.font),document.querySelector("#question-display").style.fontSize="",window.localStorage.setItem(o,JSON.stringify(e)),console.info("Theme "+e.name)},f=function(e){return fetch(e).then((function(e){return e.text()}))},d=function(e){return e.split("\n").filter((function(e){return e.match(/^\*/)})).map((function(e){return new RegExp(/^\* _([\w \d]*)_ ([\w#]*) ([\w#]*) ([\w#]*) _([\w \d]*?)_$/).exec(e)})).map((function(e){var t=e[1],n=e[2];return{name:t,foreground:e[3],background:n,highlight:e[4],font:e[5]}}))};new Promise((function(t){var n=function(){var t=window.localStorage.getItem(o)||"default-theme";try{var n=JSON.parse(t);return function(e){return"string"!=typeof e&&"foreground"in e}(n)?e(e({},u),n):u}catch(e){return u}}();l(n),window.addEventListener("resize",function(e,t){void 0===t&&(t=250);var n=null;return function(){for(var r=[],o=0;o<arguments.length;o++)r[o]=arguments[o];window.clearTimeout(n),n=window.setTimeout((function(){e.apply(void 0,r)}),t)}}(c)),t()})).then((function(){return f("QUESTIONS.md").then((function(e){return e.split("\n").filter((function(e){return e.match(/^\s*\*/)})).map(i)}))})).then((function(e){var o,i=null!==(o=localStorage.getItem(n))&&void 0!==o?o:"[]",u=JSON.parse(i),c=e.filter((function(e){return!e.startsWith("Credit: ")}));if(u.length===c.length)return u;var a,l=function(e){var n=e.reduce((function(e,n){var r=e[0],o=e[1];if(n.startsWith("Credit:")){var i=function(e){var t=RegExp(/Credit:\s*\[(.*)\]\((.*)\)/gm).exec(e);return{name:t[1],href:t[2]}}(n);return[i,o]}return[r,t(t([],o,!0),[{question:n,credit:r}],!1)]}),[{name:"",href:""},[]]);return n[0],n[1]}(e),f=(a=l).reduce((function(e,t,n){var r,o=Math.floor(Math.random()*(n+1));return r=[e[o],e[n]],e[n]=r[0],e[o]=r[1],e}),t([],a,!0));try{localStorage.setItem(n,JSON.stringify(f)),localStorage.setItem(r,"0")}catch(e){}return f})).then((function(e){var t,n,o,i,u,a=null!==(t=localStorage.getItem(r))&&void 0!==t?t:"0",l=parseInt(a);("navigate"===(null===(o=null===(n=null===performance||void 0===performance?void 0:performance.getEntriesByType("navigation"))||void 0===n?void 0:n[0])||void 0===o?void 0:o.type)||(null===(i=null===performance||void 0===performance?void 0:performance.navigation)||void 0===i?void 0:i.type)===(null===(u=null===performance||void 0===performance?void 0:performance.navigation)||void 0===u?void 0:u.TYPE_NAVIGATE))&&l>0&&(l+=1);var f=function(e){document.querySelector("#question-display").innerHTML=e.question;var t=document.querySelector("#credit-link");t.href=e.credit.href,t.innerHTML=e.credit.name,c()};f(e[l]),document.querySelector("#reload-button").addEventListener("click",(function(){l=(l+1)%e.length,localStorage.setItem(r,l.toString()),window.history.pushState(l,e[l].question),f(e[l])})),window.onpopstate=function(){var t,n=null!==(t=window.history.state)&&void 0!==t?t:0;localStorage.setItem(r,n.toString()),f(e[n])}})).then((function(){return e=void 0,t=void 0,r=function(){var e;return function(e,t){var n,r,o,i,u={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;u;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return u.label++,{value:i[1],done:!1};case 5:u.label++,r=i[1],i=[0];continue;case 7:i=u.ops.pop(),u.trys.pop();continue;default:if(!((o=(o=u.trys).length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){u=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){u.label=i[1];break}if(6===i[0]&&u.label<o[1]){u.label=o[1],o=i;break}if(o&&u.label<o[2]){u.label=o[2],u.ops.push(i);break}o[2]&&u.ops.pop(),u.trys.pop();continue}i=t.call(e,u)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,c])}}}(this,(function(t){switch(t.label){case 0:return[4,f("THEMES.md").then(d)];case 1:return e=t.sent(),document.querySelector("#change-theme-button").addEventListener("click",(function(){document.querySelector("body").classList.add("themed");var t=document.documentElement.style.getPropertyValue("--theme-foreground"),n=document.documentElement.style.getPropertyValue("--theme-background"),r=document.documentElement.style.getPropertyValue("--theme-highlight"),o=document.documentElement.style.getPropertyValue("--theme-font"),i=e.findIndex((function(e){return e.background===n&&e.foreground===t&&e.highlight===r&&e.font===o})),u=-1===i?0:(i+1)%e.length,c=e[u];l(c)})),[2]}}))},new((n=void 0)||(n=Promise))((function(o,i){function u(e){try{a(r.next(e))}catch(e){i(e)}}function c(e){try{a(r.throw(e))}catch(e){i(e)}}function a(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(u,c)}a((r=r.apply(e,t||[])).next())}));var e,t,n,r}))})();
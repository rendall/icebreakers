({607:function(){var t=this&&this.__spreadArray||function(t,n){for(var e=0,r=n.length,i=t.length;e<r;e++,i++)t[i]=n[e];return t},n=function(t){return t.slice(t.indexOf("*")+1).trim()},e=function(){return Math.floor(2*Math.random())-1};fetch("./QUESTIONS.md").then((function(t){return t.text()})).then((function(e){return e.split("\n").filter((function(t){return t.match(/^\s*\*/)})).map(n).reduce((function(n,e){var r=n[0],i=n[1];return e.startsWith("Credit:")?[function(t){var n=RegExp(/Credit:\s*\[(.*)\]\((.*\))/gm).exec(t);return{name:n[1],href:n[2]}}(e),i]:[r,t(t([],i),[{question:e,credit:r}])]}),[{name:"",href:""},[]])[1]})).then((function(t){return t.sort(e)})).then((function(t){var n=0,e=function(t){document.querySelector("#question-display").innerHTML=t.question;var n=document.querySelector("#credit-link");n.href=t.credit.href,n.innerHTML=t.credit.name};e(t[0]),document.querySelector("#reload-button").addEventListener("click",(function(){n=(n+1)%t.length,e(t[n])}))}))}})[607]();
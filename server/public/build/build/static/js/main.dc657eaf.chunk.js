(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{138:function(e,t,a){e.exports={topnav:"Navbar_topnav__iYCD-",icon:"Navbar_icon__3vFW_",responsive:"Navbar_responsive__2rcy6"}},147:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),s=a(30),c=a.n(s),i=a(90),o=a(91),u=a(99),l=a(98),j=a(20),d=a(43),b=a(93),h="USER_LOADING",p="USER_LOADED",O="AUTH_ERROR",g="LOGIN_SUCCESS",m="LOGIN_FAIL",f="LOGOUT_SUCCESS",v="REGISTER_SUCCESS",x="REGISTER_FAIL",_="GET_ERRORS",y="CLEAR_ERRORS",E={msg:{},status:null,id:null},A=a(10),S={token:localStorage.getItem("token"),isAuthenticated:null,isLoading:!1,user:null},R=Object(d.b)({error:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:E,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case _:return{msg:t.payload.msg,status:t.payload.status,id:t.payload.id};case y:return{msg:{},status:null,id:null};default:return e}},auth:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:S,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case h:return Object(A.a)(Object(A.a)({},e),{},{isLoading:!0});case p:return Object(A.a)(Object(A.a)({},e),{},{isAuthenticated:!0,isLoading:!1,user:t.payload});case g:case v:return localStorage.setItem("token",t.payload.token),Object(A.a)(Object(A.a)(Object(A.a)({},e),t.payload),{},{isAuthenticated:!0,isLoading:!1});case O:case m:case f:case x:return localStorage.removeItem("token"),Object(A.a)(Object(A.a)({},e),{},{token:null,user:null,isAuthenticated:!1,isLoading:!1});default:return e}}}),C=[b.a],L=Object(d.d)(R,{},Object(d.c)(d.a.apply(void 0,C),window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__&&window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()||d.c)),w=a(42),N=a.n(w),k=function(e,t){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return{type:_,payload:{msg:e,status:t,id:a}}},I=function(){return{type:y}},T=function(e){var t=e().auth.token,a={headers:{"Content-Type":"application/json"}};return t&&(a.headers["x-auth-token"]=t),a},D=a(37),G=(a(138),a(152)),H=a(154),U=(a(139),a.p+"static/media/akinpoz-logo.403b19c3.png"),F=a(4),q=a.n(F),P=a(2);var V=Object(j.b)(null,{logout:function(){return{type:f}}})((function(e){return q.a.func.isRequired,Object(P.jsx)(n.Fragment,{children:Object(P.jsx)("button",{onClick:e.logout,children:"Logout"})})})),J=a(153);var M=Object(j.b)((function(e){return{auth:e.auth}}),null)((function(e){var t=Object(n.useState)(e.auth.isAuthenticated),a=Object(D.a)(t,2),r=a[0],s=a[1];return Object(n.useEffect)((function(){s(e.auth.isAuthenticated)}),[e]),Object(P.jsxs)(G.a,{collapseOnSelect:!0,expand:"lg",bg:"dark",variant:"dark",children:[Object(P.jsxs)(G.a.Brand,{href:"#",children:[Object(P.jsx)("img",{alt:"",src:U,width:"30",height:"30",className:"d-inline-block align-top"})," ","Akinpoz"]}),Object(P.jsx)(G.a.Toggle,{"aria-controls":"responsive-navbar-nav"}),Object(P.jsxs)(G.a.Collapse,{id:"responsive-navbar-nav",children:[Object(P.jsx)(H.a,{className:"mr-auto"}),Object(P.jsxs)(H.a,{children:[r&&Object(P.jsx)(H.a.Link,{href:"/#/",children:Object(P.jsx)(V,{onClick:function(){s(!1)}})}),r&&Object(P.jsx)(H.a.Link,{href:"/#/profile",children:Object(P.jsx)(J.a,{name:"user",size:"big"})}),!r&&Object(P.jsx)(H.a.Link,{href:"/#/login",children:Object(P.jsx)("button",{children:"Login"})}),Object(P.jsx)(H.a.Link,{href:"/#/",children:"Home"})]})]})]})})),X=a(97),z=a(6);var B=function(){return Object(P.jsx)("div",{children:"Home"})},Y=a(45),K=(0,a(19).createHashHistory)(),W=a(26),Z=a.n(W),Q=a(155);var $=Object(j.b)((function(e){return{isAuthenticated:e.auth.isAuthenticated,error:e.error}}),{login:function(e){var t=e.email,a=e.password;return function(e){var n=JSON.stringify({email:t,password:a});N.a.post("/api/auth",n,{headers:{"Content-Type":"application/json"}}).then((function(t){e({type:g,payload:t.data})})).catch((function(t){e(k(t.response.data,t.response.status,"LOGIN_FAIL")),e({type:m})}))}},clearErrors:I})((function(e){var t=Object(n.useState)({email:"",password:""}),a=Object(D.a)(t,2),r=a[0],s=a[1],c=Object(n.useState)(null),i=Object(D.a)(c,2),o=i[0],u=i[1];q.a.bool,q.a.object.isRequired,q.a.func.isRequired,q.a.func.isRequired,Object(n.useEffect)((function(){"LOGIN_FAIL"===e.error.id&&u(e.error.msg.msg)}),[e.error]),Object(n.useEffect)((function(){e.isAuthenticated&&K.push(K.location.pathname)}),[e.isAuthenticated]);var l=function(e){s(Object(A.a)(Object(A.a)({},r),{},Object(Y.a)({},e.target.name,e.target.value)))},j=function(t){t.preventDefault();var a={email:r.email,password:r.password};e.clearErrors(),e.login(a),setTimeout(void(e.isAuthenticated&&K.push("/")),1e3)};return Object(P.jsxs)("div",{className:Z.a.loginContainer,children:[Object(P.jsx)("img",{className:Z.a.logo,src:U}),o&&Object(P.jsx)(Q.a,{negative:!0,className:Z.a.message,children:Object(P.jsx)(Q.a.Header,{children:o})}),Object(P.jsx)("input",{type:"email",onChange:l,value:r.email,name:"email",placeholder:"Email..."}),Object(P.jsx)("input",{type:"password",onChange:l,value:r.password,name:"password",placeholder:"Password...",onKeyPress:function(e){"Enter"===e.key&&j(e)}}),Object(P.jsx)("button",{className:Z.a.submit,onClick:j,children:"Login"}),Object(P.jsxs)("p",{children:["Don't have an account? ",Object(P.jsx)("a",{href:"/#/register",children:"Register Here."})]})]})}));var ee=Object(j.b)((function(e){return{isAuthenticated:e.auth.isAuthenticated,error:e.error}}),{register:function(e){var t=e.name,a=e.email,n=e.password;return function(e){var r=JSON.stringify({name:t,email:a,password:n});N.a.post("/api/users",r,{headers:{"Content-Type":"application/json"}}).then((function(t){e({type:v,payload:t.data})})).catch((function(t){e(k(t.response.data,t.response.status,"REGISTER_FAIL")),e({type:x})}))}},clearErrors:I})((function(e){var t=Object(n.useState)({name:"",email:"",password:""}),a=Object(D.a)(t,2),r=a[0],s=a[1],c=Object(n.useState)(null),i=Object(D.a)(c,2),o=i[0],u=i[1];q.a.bool,q.a.object.isRequired,q.a.func.isRequired,q.a.func.isRequired,Object(n.useEffect)((function(){"REGISTER_FAIL"===e.error.id&&u(e.error.msg.msg)}),[e.error]),Object(n.useEffect)((function(){e.isAuthenticated&&K.push("/")}),[e.isAuthenticated]);var l=function(e){s(Object(A.a)(Object(A.a)({},r),{},Object(Y.a)({},e.target.name,e.target.value)))};return Object(P.jsxs)("div",{className:Z.a.registerConatiner,children:[Object(P.jsx)("img",{className:Z.a.logo,src:U}),o&&Object(P.jsx)(Q.a,{negative:!0,className:Z.a.message,children:Object(P.jsx)(Q.a.Header,{children:o})}),Object(P.jsx)("input",{type:"text",onChange:l,value:r.name,name:"name",placeholder:"First and Last Name..."}),Object(P.jsx)("input",{type:"email",onChange:l,value:r.email,name:"email",placeholder:"Email..."}),Object(P.jsx)("input",{type:"password",onChange:l,value:r.password,name:"password",placeholder:"Password..."}),Object(P.jsx)("button",{className:Z.a.submit,onClick:function(t){t.preventDefault();var a={name:r.name,email:r.email,password:r.password};e.clearErrors(),e.register(a)},children:"Register"}),Object(P.jsxs)("p",{children:["Have An Account? ",Object(P.jsx)("a",{href:"/#/login",children:"Login."})]})]})})),te={Home:B};var ae=function(){return Object(P.jsx)("div",{children:Object(P.jsx)("h2",{children:"Oh No! The page you are looking for cannot be found."})})},ne=function(e){if(e.auth.isAuthenticated){var t=te[e.component];return Object(P.jsx)(t,{})}return Object(P.jsx)(z.a,{to:"/login"})},re=Object(j.b)((function(e){return{auth:e.auth}}),null)((function(e){return Object(P.jsx)(X.a,{children:Object(P.jsxs)(z.d,{children:[Object(P.jsx)(z.b,{exact:!0,path:"/",children:Object(P.jsx)(B,{})}),Object(P.jsx)(z.b,{exact:!0,path:"/register",children:Object(P.jsx)(ee,{})}),Object(P.jsx)(z.b,{exact:!0,path:"/login",children:Object(P.jsx)($,{})}),Object(P.jsx)(z.b,{exact:!0,path:"/profile",children:Object(P.jsx)(ne,Object(A.a)(Object(A.a)({},e),{},{component:"Profile"}))}),Object(P.jsx)(z.b,{path:"*",component:ae})]})})})),se=function(e){Object(u.a)(a,e);var t=Object(l.a)(a);function a(){return Object(i.a)(this,a),t.apply(this,arguments)}return Object(o.a)(a,[{key:"componentDidMount",value:function(){L.dispatch((function(e,t){e({type:h}),N.a.get("/api/auth/user",T(t)).then((function(t){e({type:p,payload:t.data})})).catch((function(t){e(k(t.response.data,t.response.status)),e({type:O})}))}))}},{key:"render",value:function(){return Object(P.jsxs)(j.a,{store:L,children:[Object(P.jsx)(M,{}),Object(P.jsx)("div",{className:"App",children:Object(P.jsx)(re,{})})]})}}]),a}(n.Component);N.a.defaults.baseURL="",N.a.defaults.headers.post["Content-Type"]="application/x-www-form-urlencoded",c.a.render(Object(P.jsx)(r.a.StrictMode,{children:Object(P.jsx)(se,{})}),document.getElementById("root"))},26:function(e,t,a){e.exports={loginContainer:"Auth_loginContainer__L7V0G",logo:"Auth_logo__2YIR_",message:"Auth_message__2VvZ0",submit:"Auth_submit__1ubee",registerConatiner:"Auth_registerConatiner__1cNVC"}}},[[147,1,2]]]);
//# sourceMappingURL=main.dc657eaf.chunk.js.map
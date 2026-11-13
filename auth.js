const $=i=>document.getElementById(i);let mode='email',signup=false,conf=null,rv=null;
const say=(t,ok)=>{$('msg').textContent=t;$('msg').className='msg'+(ok?' ok':'')};
auth.onAuthStateChanged(u=>{if(u&&(u.emailVerified||u.phoneNumber))location.href='app.html'});
function ui(){$('h').textContent=signup?'Create account':'Welcome back';$('s').textContent=signup?'Join CUTE-S AI and learn together':'Login to continue your studies';
 $('go').textContent=mode==='mobile'?($('ob').hidden?'Send code':'Verify & continue'):(signup?'Sign up':'Login');
 $('tw').hidden=!signup&&mode==='email';if(mode==='mobile')$('tw').hidden=false;$('fgr').hidden=signup;$('swt').textContent=signup?'Already have an account?':'New here?';$('sw').textContent=signup?'Login':'Create account';
 $('pe').hidden=mode!=='email';$('pm').hidden=mode!=='mobile';$('tabs').dataset.m=mode;document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.m===mode));say('')}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{mode=t.dataset.m;ui()});
$('sw').onclick=()=>{signup=!signup;ui()};
$('eye').onclick=()=>{const p=$('pw');p.type=p.type==='password'?'text':'password'};
$('fg').onclick=async()=>{const e=$('em').value.trim();if(!e)return say('Enter your email first');try{await auth.sendPasswordResetEmail(e)}catch(x){}say('If this email has an account, a reset link was sent.',1)};
$('go').onclick=async()=>{const b=$('go');say('');
 if((signup||mode==='mobile')&&!$('tm').checked)return say('Please accept the Privacy Policy & Terms');
 b.disabled=true;try{
 if(mode==='email'){const e=$('em').value.trim(),p=$('pw').value;
  if(!/^\S+@\S+\.\S+$/.test(e))throw{m:'Enter a valid email'};if(p.length<8)throw{m:'Password must be at least 8 characters'};
  if(signup){const c=await auth.createUserWithEmailAndPassword(e,p);await c.user.sendEmailVerification();await auth.signOut();signup=false;ui();say('Verification email sent. Verify it, then login.',1)}
  else{const c=await auth.signInWithEmailAndPassword(e,p);if(!c.user.emailVerified){await auth.signOut();throw{m:'Please verify your email first (check inbox/spam).'}}}}
 else if($('ob').hidden){let n=$('ph').value.replace(/\D/g,'').replace(/^0/,'');if(!/^3\d{9}$/.test(n))throw{m:'Enter a valid number, e.g. 3XX XXXXXXX'};
  rv=rv||new firebase.auth.RecaptchaVerifier('rc',{size:'invisible'});conf=await auth.signInWithPhoneNumber('+92'+n,rv);$('ob').hidden=false;ui();say('Code sent by SMS.',1)}
 else{if(!/^\d{6}$/.test($('otp').value))throw{m:'Enter the 6-digit code'};await conf.confirm($('otp').value)}
 }catch(x){say(x.m||(x.code==='auth/email-already-in-use'?'This email is already registered':x.code==='auth/too-many-requests'?'Too many attempts, try later':x.code==='auth/invalid-verification-code'?'Wrong code':'Login failed. Check your details.'))}b.disabled=false};
ui();

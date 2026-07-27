/* ============================================================
   SG Analytics — daxili izləmə modulu
   SECURITY GROUP daxili istifadə üçün. Heç bir açıq linkdə
   göstərilmir, yalnız fon rejimində işləyir.
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCBhyGNzZRGgQShP_C9kwAzTm_g_0zJlzg",
  authDomain: "an-psixoloji-33442.firebaseapp.com",
  databaseURL: "https://an-psixoloji-33442-default-rtdb.firebaseio.com",
  projectId: "an-psixoloji-33442",
  storageBucket: "an-psixoloji-33442.firebasestorage.app",
  messagingSenderId: "528809299356",
  appId: "1:528809299356:web:59cae89a64e446dc520c59"
};

const app = initializeApp(firebaseConfig, "sg-analytics");
const db = getDatabase(app);
const auth = getAuth(app);

const SID_KEY = "sg_sid_v1";
function getSessionId(){
  let sid = localStorage.getItem(SID_KEY);
  if(!sid){
    sid = "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2,10);
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

let geoCache = null;
async function getGeo(){
  if(geoCache) return geoCache;
  try{
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if(data && data.success !== false){
      geoCache = {
        ip: data.ip || "naməlum",
        city: data.city || "",
        region: data.region || "",
        country: data.country || "",
        flag: (data.flag && data.flag.emoji) || ""
      };
    }
  }catch(e){
    geoCache = { ip:"naməlum", city:"", region:"", country:"" };
  }
  return geoCache || { ip:"naməlum", city:"", region:"", country:"" };
}

let authReady = null;
function ensureAuth(){
  if(!authReady){
    authReady = signInAnonymously(auth).catch(()=>{});
  }
  return authReady;
}

async function sgTrackEvent(type, data){
  try{
    await ensureAuth();
    const geo = await getGeo();
    const payload = {
      type: type,
      source: (window.SG_PROJECT_NAME || document.title || "menyu"),
      data: data || {},
      sid: getSessionId(),
      ip: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      ua: navigator.userAgent,
      lang: navigator.language,
      screen: window.screen ? (window.screen.width + "x" + window.screen.height) : "",
      ts: Date.now(),
      tsHuman: new Date().toISOString()
    };
    const evRef = push(ref(db, "menyu_analytics/events"));
    await set(evRef, payload);
  }catch(e){
    /* səssiz uğursuzluq — istifadəçi təcrübəsinə mane olmasın */
  }
}
window.sgTrackEvent = sgTrackEvent;

/* Testlər üçün: yalnız yekun nəticə/bal */
window.sgTrackTest = function(testName, result){
  sgTrackEvent("test_result", { test: testName, result: result });
};

/* Formlarda əlavə edilən qeydlər üçün (yeni xəstə, əməkdaş və s.) */
window.sgTrackRecord = function(action, entity, name){
  sgTrackEvent("record_added", { action: action, entity: entity, name: name });
};

/* Avtomatik səhifə görüntülənməsi */
sgTrackEvent("page_view", { path: location.pathname });

/* menyu-nun layihə kartlarına klik izləməsi (yalnız menyu səhifəsində mövcuddur) */
document.addEventListener("click", function(e){
  const tile = e.target.closest(".tile");
  if(tile && tile.href){
    const name = tile.querySelector(".nm") ? tile.querySelector(".nm").textContent : tile.href;
    sgTrackEvent("project_click", { name: name, url: tile.href });
  }
});

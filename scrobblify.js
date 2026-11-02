/*
 * Scrobblify for Spicetify — v1.1.0
 * A local-first dual-service Last.fm + ListenBrainz scrobbler and listening dashboard.
 * API credentials and session key are stored in Spicetify.LocalStorage.
 */
(() => {
  const EXT = "scrobblify";
  const VERSION = "1.1.0";
  const API = "https://ws.audioscrobbler.com/2.0/";
  const STORE = {
    // Keep v1.0 Last.fm keys so existing credentials and queues migrate without re-entry.
    key: "lastfm-companion:apiKey", secret: "lastfm-companion:apiSecret", session: "lastfm-companion:sessionKey",
    username: "lastfm-companion:username", enabled: "lastfm-companion:enabled", lfmEnabled: "lastfm-companion:lfmEnabled", queue: "lastfm-companion:queue",
    scrobbled: "lastfm-companion:scrobbled", minPercent: "lastfm-companion:minPercent", minSeconds: "lastfm-companion:minSeconds",
    lbToken: `${EXT}:lbToken`, lbUser: `${EXT}:lbUser`, lbQueue: `${EXT}:lbQueue`, lbScrobbled: `${EXT}:lbScrobbled`, lbEnabled: `${EXT}:lbEnabled`
  };
  const get = (k, fallback = "") => Spicetify.LocalStorage.get(k) ?? fallback;
  const set = (k, v) => Spicetify.LocalStorage.set(k, String(v));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt = (n) => Number(n || 0).toLocaleString();
  const seconds = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2,"0")}`;
  const now = () => Math.floor(Date.now() / 1000);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Small standalone MD5 implementation for Last.fm's API signatures.
  function md5(input) {
    function cmn(q,a,b,x,s,t){a=(a+q+x+t)|0;return (((a<<s)|(a>>>(32-s)))+b)|0;}
    function ff(a,b,c,d,x,s,t){return cmn((b&c)|(~b&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&~d),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t);}
    const data = unescape(encodeURIComponent(input));
    const words=[]; for(let i=0;i<data.length;i++) words[i>>2]=(words[i>>2]||0)|((data.charCodeAt(i)&255)<<((i%4)*8));
    words[data.length>>2]=(words[data.length>>2]||0)|(0x80<<((data.length%4)*8));
    const bitLen=data.length*8, pad=((data.length+8)>>>6)+1; words[pad*16-2]=bitLen; words[pad*16-1]=Math.floor(bitLen/0x100000000);
    let a=0x67452301,b=0xefcdab89,c=0x98badcfe,d=0x10325476;
    for(let i=0;i<words.length;i+=16){const oa=a,ob=b,oc=c,od=d,x=words;
      a=ff(a,b,c,d,x[i]||0,7,-680876936); d=ff(d,a,b,c,x[i+1]||0,12,-389564586); c=ff(c,d,a,b,x[i+2]||0,17,606105819); b=ff(b,c,d,a,x[i+3]||0,22,-1044525330);
      a=ff(a,b,c,d,x[i+4]||0,7,-176418897); d=ff(d,a,b,c,x[i+5]||0,12,1200080426); c=ff(c,d,a,b,x[i+6]||0,17,-1473231341); b=ff(b,c,d,a,x[i+7]||0,22,-45705983);
      a=ff(a,b,c,d,x[i+8]||0,7,1770035416); d=ff(d,a,b,c,x[i+9]||0,12,-1958414417); c=ff(c,d,a,b,x[i+10]||0,17,-42063); b=ff(b,c,d,a,x[i+11]||0,22,-1990404162);
      a=ff(a,b,c,d,x[i+12]||0,7,1804603682); d=ff(d,a,b,c,x[i+13]||0,12,-40341101); c=ff(c,d,a,b,x[i+14]||0,17,-1502002290); b=ff(b,c,d,a,x[i+15]||0,22,1236535329);
      a=gg(a,b,c,d,x[i+1]||0,5,-165796510); d=gg(d,a,b,c,x[i+6]||0,9,-1069501632); c=gg(c,d,a,b,x[i+11]||0,14,643717713); b=gg(b,c,d,a,x[i]||0,20,-373897302);
      a=gg(a,b,c,d,x[i+5]||0,5,-701558691); d=gg(d,a,b,c,x[i+10]||0,9,38016083); c=gg(c,d,a,b,x[i+15]||0,14,-660478335); b=gg(b,c,d,a,x[i+4]||0,20,-405537848);
      a=gg(a,b,c,d,x[i+9]||0,5,568446438); d=gg(d,a,b,c,x[i+14]||0,9,-1019803690); c=gg(c,d,a,b,x[i+3]||0,14,-187363961); b=gg(b,c,d,a,x[i+8]||0,20,1163531501);
      a=gg(a,b,c,d,x[i+13]||0,5,-1444681467); d=gg(d,a,b,c,x[i+2]||0,9,-51403784); c=gg(c,d,a,b,x[i+7]||0,14,1735328473); b=gg(b,c,d,a,x[i+12]||0,20,-1926607734);
      a=hh(a,b,c,d,x[i+5]||0,4,-378558); d=hh(d,a,b,c,x[i+8]||0,11,-2022574463); c=hh(c,d,a,b,x[i+11]||0,16,1839030562); b=hh(b,c,d,a,x[i+14]||0,23,-35309556);
      a=hh(a,b,c,d,x[i+1]||0,4,-1530992060); d=hh(d,a,b,c,x[i+4]||0,11,1272893353); c=hh(c,d,a,b,x[i+7]||0,16,-155497632); b=hh(b,c,d,a,x[i+10]||0,23,-1094730640);
      a=hh(a,b,c,d,x[i+13]||0,4,681279174); d=hh(d,a,b,c,x[i]||0,11,-358537222); c=hh(c,d,a,b,x[i+3]||0,16,-722521979); b=hh(b,c,d,a,x[i+6]||0,23,76029189);
      a=hh(a,b,c,d,x[i+9]||0,4,-640364487); d=hh(d,a,b,c,x[i+12]||0,11,-421815835); c=hh(c,d,a,b,x[i+15]||0,16,530742520); b=hh(b,c,d,a,x[i+2]||0,23,-995338651);
      a=ii(a,b,c,d,x[i]||0,6,-198630844); d=ii(d,a,b,c,x[i+7]||0,10,1126891415); c=ii(c,d,a,b,x[i+14]||0,15,-1416354905); b=ii(b,c,d,a,x[i+5]||0,21,-57434055);
      a=ii(a,b,c,d,x[i+12]||0,6,1700485571); d=ii(d,a,b,c,x[i+3]||0,10,-1894986606); c=ii(c,d,a,b,x[i+10]||0,15,-1051523); b=ii(b,c,d,a,x[i+1]||0,21,-2054922799);
      a=ii(a,b,c,d,x[i+8]||0,6,1873313359); d=ii(d,a,b,c,x[i+15]||0,10,-30611744); c=ii(c,d,a,b,x[i+6]||0,15,-1560198380); b=ii(b,c,d,a,x[i+13]||0,21,1309151649);
      a=ii(a,b,c,d,x[i+4]||0,6,-145523070); d=ii(d,a,b,c,x[i+11]||0,10,-1120210379); c=ii(c,d,a,b,x[i+2]||0,15,718787259); b=ii(b,c,d,a,x[i+9]||0,21,-343485551);
      a=(a+oa)|0;b=(b+ob)|0;c=(c+oc)|0;d=(d+od)|0;
    }
    return [a,b,c,d].map(n=>[0,8,16,24].map(s=>((n>>>s)&255).toString(16).padStart(2,"0")).join("")).join("");
  }

  function signature(params) {
    const body = Object.keys(params).filter(k=>k!=="format"&&k!=="callback"&&k!=="api_sig").sort().map(k=>k+params[k]).join("");
    return md5(body + get(STORE.secret));
  }
  async function api(method, params={}, auth=true) {
    const p={method,api_key:get(STORE.key),...params,format:"json"};
    if(auth){p.sk=get(STORE.session);p.api_sig=signature(p);}
    const body=new URLSearchParams(p);
    const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
    const json=await res.json();
    if(!res.ok || json.error) throw new Error(json.message || `Last.fm API error ${json.error||res.status}`);
    return json;
  }
  async function authApi(method, params={}) {
    const p={method,api_key:get(STORE.key),...params};
    p.api_sig=signature(p);
    const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({...p,format:"json"})});
    const json=await res.json();
    if(!res.ok || json.error) throw new Error(json.message || `Last.fm API error ${json.error||res.status}`);
    return json;
  }
  function trackFromPlayer() {
    const d=Spicetify.Player.data; if(!d?.item) return null;
    const item=d.item, m=item.metadata||{};
    const artists=(m.artist_name||m.artists||item.artists?.map(a=>a.name)?.join(", ")||"").toString();
    const title=m.title||item.name||"";
    const album=m.album_title||m.album||"";
    const duration=Number(item.duration?.milliseconds||item.duration_ms||m.duration||d.duration||0);
    const uri=item.uri||m.uri||"";
    if(!title||!artists||!uri.startsWith("spotify:track:")) return null;
    return {title,artist:artists.split(/,\s*/)[0],album,duration,uri,spotifyId:uri.replace("spotify:track:",""),artists,cover:m.image_url||m.image||""};
  }
  const state={track:null,startedAt:0,lastTick:0,playedMs:0,nowPlayingKey:"",dashboard:null,tab:"overview",busy:false,online:navigator.onLine};
  function readQueue(){try{return JSON.parse(get(STORE.queue,"[]"))||[]}catch{return[]}}
  function writeQueue(q){set(STORE.queue,JSON.stringify(q.slice(-100)));}
  function readScrobbled(){try{return JSON.parse(get(STORE.scrobbled,"[]"))||[]}catch{return[]}}
  function markScrobbled(uri){const a=readScrobbled();a.push(uri);set(STORE.scrobbled,JSON.stringify(a.slice(-300)));}
  function isConnected(){return !!(get(STORE.key)&&get(STORE.secret)&&get(STORE.session));}
  function isLBConnected(){return !!(get(STORE.lbToken)&&get(STORE.lbUser));}
  async function lbRequest(path, options={}) {
    const headers={"Content-Type":"application/json","Authorization":`Token ${get(STORE.lbToken)}`,...(options.headers||{})};
    const res=await fetch(`https://api.listenbrainz.org${path}`,{...options,headers});
    const raw=await res.text(); let data={}; try{data=raw?JSON.parse(raw):{};}catch{}
    if(!res.ok) throw new Error(data.error||data.message||`ListenBrainz API error ${res.status}`);
    return data;
  }
  function lbMetadata(t){return {artist_name:t.artist,track_name:t.title,...(t.album?{release_name:t.album}:{}),additional_info:{media_player:"Spotify",submission_client:"Scrobblify",music_service:"spotify.com",origin_url:`https://open.spotify.com/track/${t.spotifyId}`,spotify_id:`https://open.spotify.com/track/${t.spotifyId}`,...(t.duration?{duration_ms:t.duration}:{})}};}
  async function lbNowPlaying(t){if(!isLBConnected()||!t||get(STORE.lbEnabled,"true")!=="true")return;try{const r=await lbRequest("/1/submit-listens?return_msid=true",{method:"POST",body:JSON.stringify({listen_type:"playing_now",payload:[{track_metadata:lbMetadata(t)}]})});const msid=r?.payload?.[0]?.recording_msid||r?.recording_msid;if(msid){const map=JSON.parse(get(`${EXT}:lbMsids`,"{}"));map[t.uri]=msid;set(`${EXT}:lbMsids`,JSON.stringify(map));}status("ListenBrainz · Now playing sent");}catch(e){status("ListenBrainz · "+e.message,true);}}
  function lbScrobbleKeys(){try{return JSON.parse(get(STORE.lbScrobbled,"[]"))||[];}catch{return[];}}
  function markLBScrobbled(uri){const a=lbScrobbleKeys();if(!a.includes(uri))a.push(uri);set(STORE.lbScrobbled,JSON.stringify(a.slice(-300)));}
  function readLBQueue(){try{return JSON.parse(get(STORE.lbQueue,"[]"))||[];}catch{return[];}}
  function writeLBQueue(q){set(STORE.lbQueue,JSON.stringify(q.slice(-100)));}
  async function lbSendScrobble(t,timestamp){if(!isLBConnected()||get(STORE.lbEnabled,"true")!=="true")return false;try{await lbRequest("/1/submit-listens",{method:"POST",body:JSON.stringify({listen_type:"single",payload:[{listened_at:timestamp,track_metadata:lbMetadata(t)}]})});markLBScrobbled(t.uri);status("ListenBrainz · Scrobbled · "+t.title);return true;}catch(e){const q=readLBQueue();if(!q.some(x=>x.uri===t.uri)){q.push({track:{title:t.title,artist:t.artist,album:t.album,duration:t.duration,uri:t.uri,spotifyId:t.spotifyId},timestamp});writeLBQueue(q);}status("ListenBrainz · queued for retry · "+e.message,true);return false;}}
  async function lbRetryQueue(){if(!isLBConnected()||!navigator.onLine)return;const q=readLBQueue(),remain=[];for(const item of q){try{await lbRequest("/1/submit-listens",{method:"POST",body:JSON.stringify({listen_type:"single",payload:[{listened_at:item.timestamp,track_metadata:lbMetadata(item.track)}]})});markLBScrobbled(item.track.uri);}catch{remain.push(item);}}writeLBQueue(remain);if(q.length!==remain.length)status(`ListenBrainz · synced ${q.length-remain.length} queued listen(s)`);}
  async function updateNowPlaying(t){
    if(!isConnected()||!t||get(STORE.lfmEnabled,"true")!=="true")return;
    const key=t.uri+":"+state.startedAt;if(key===state.nowPlayingKey)return;state.nowPlayingKey=key;
    try{await api("track.updateNowPlaying",{artist:t.artist,track:t.title,album:t.album,duration:Math.round(t.duration/1000)});status("Now playing sent");}catch(e){status(e.message,true);}
  }
  async function sendScrobble(t, timestamp){
    if(!isConnected()||get(STORE.lfmEnabled,"true")!=="true")return false;
    const params={artist:t.artist,track:t.title,timestamp:String(timestamp)};
    if(t.album)params.album=t.album;
    try{await api("track.scrobble",params);markScrobbled(t.uri);status("Scrobbled · "+t.title);return true;}
    catch(e){const q=readQueue();q.push({artist:t.artist,track:t.title,album:t.album,timestamp,uri:t.uri});writeQueue(q);status("Queued for retry · "+e.message,true);return false;}
  }
  async function retryQueue(){if(!isConnected()||!navigator.onLine)return;const q=readQueue();if(!q.length)return;const remain=[];
    for(const t of q){try{await api("track.scrobble",{artist:t.artist,track:t.track,album:t.album||"",timestamp:String(t.timestamp)});}catch{remain.push(t);}}
    writeQueue(remain);if(q.length!==remain.length)status(`Synced ${q.length-remain.length} queued scrobble(s)`);
  }
  function onTrackChange(){
    const t=trackFromPlayer();state.track=t;state.startedAt=now();state.playedMs=0;state.lastTick=Date.now();state.nowPlayingKey="";
    if(t&&Spicetify.Player.isPlaying()){updateNowPlaying(t);lbNowPlaying(t);}
    refreshDashboard();
  }
  function onProgress(){
    if(!state.track||!Spicetify.Player.isPlaying()||get(STORE.enabled,"true")!=="true")return;
    const tick=Date.now();
    if(state.lastTick)state.playedMs+=Math.min(Math.max(0,tick-state.lastTick),5000);
    state.lastTick=tick;
    const duration=state.track.duration;
    const threshold=Math.min(Number(get(STORE.minSeconds,"240"))*1000,duration*Number(get(STORE.minPercent,"50"))/100);
    if(duration<30000||state.playedMs<threshold)return;
    const t=state.track, ts=state.startedAt;
    if(isConnected()&&get(STORE.lfmEnabled,"true")==="true"&&!readScrobbled().includes(t.uri)){markScrobbled(t.uri);sendScrobble(t,ts);}
    if(isLBConnected()&&get(STORE.lbEnabled,"true")!=="false"&&!lbScrobbleKeys().includes(t.uri)){markLBScrobbled(t.uri);lbSendScrobble(t,ts);}
  }
  function status(message,error=false){const el=document.querySelector("#lfmc-status");if(el){el.textContent=message;el.dataset.error=error?"1":"0";}}

  const css=`
  #lfmc-launch{
  position:relative;
  display:flex;
  flex:0 0 40px;
  align-items:center;
  justify-content:center;
  width:40px;
  min-width:40px;
  height:40px;
  padding:0;
  margin:0 10px;
  box-sizing:border-box;
  border:0;
  border-radius:50%;
  background:transparent;
  color:var(--spice-subtext);
  cursor:pointer;
  font-size:20px;
}
  #lfmc-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:3vh 3vw;font-family:var(--font-family,Arial,sans-serif)}
  #lfmc-panel{width:min(920px,96vw);height:min(690px,92vh);min-height:470px;background:#151515;color:#f5f5f5;border:1px solid #343434;border-radius:18px;box-shadow:0 24px 90px #000a;overflow:hidden;display:flex;flex-direction:column}
  #lfmc-panel *{box-sizing:border-box} .lfmc-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #303030;background:linear-gradient(120deg,#241b20,#171717 55%)}
  .lfmc-brand{display:flex;align-items:center;gap:12px}.lfmc-logo{width:38px;height:38px;border-radius:12px;background:#d51007;display:grid;place-items:center;font-size:22px;font-weight:900}.lfmc-title{font-size:19px;font-weight:750;letter-spacing:-.4px}.lfmc-sub{font-size:11px;color:#aaa;margin-top:3px}.lfmc-close{border:0;background:#292929;color:#ddd;border-radius:9px;width:34px;height:34px;cursor:pointer;font-size:20px}
  .lfmc-body{display:flex;min-height:0;flex:1}.lfmc-side{width:190px;padding:18px 12px;border-right:1px solid #303030;background:#191919}.lfmc-nav{display:flex;flex-direction:column;gap:5px}.lfmc-nav button{border:0;background:transparent;color:#aaa;text-align:left;padding:11px 12px;border-radius:9px;cursor:pointer;font-size:13px}.lfmc-nav button.active,.lfmc-nav button:hover{background:#302323;color:#fff}.lfmc-main{flex:1;overflow:auto;padding:24px}.lfmc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.lfmc-card{background:#202020;border:1px solid #333;border-radius:13px;padding:15px;min-width:0}.lfmc-label{font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.8px}.lfmc-number{font-size:25px;font-weight:750;margin-top:8px}.lfmc-muted{color:#999;font-size:12px}.lfmc-now{display:flex;align-items:center;gap:16px;margin:18px 0;padding:17px;background:linear-gradient(110deg,#321d20,#202020);border:1px solid #573032;border-radius:14px}.lfmc-cover{width:76px;height:76px;border-radius:9px;background:#333;object-fit:cover}.lfmc-track{font-weight:700;font-size:16px;overflow-wrap:anywhere}.lfmc-artist{font-size:13px;color:#bbb;margin-top:5px}.lfmc-pill{font-size:10px;background:#4a2424;color:#ffb4ae;padding:5px 8px;border-radius:30px;display:inline-block;margin-top:8px}.lfmc-section{font-size:15px;font-weight:700;margin:20px 0 10px}.lfmc-list{display:flex;flex-direction:column;gap:7px}.lfmc-row{display:flex;align-items:center;gap:11px;background:#202020;border:1px solid #303030;border-radius:10px;padding:9px 11px}.lfmc-row img{width:42px;height:42px;border-radius:6px;object-fit:cover;background:#333}.lfmc-rowinfo{min-width:0;flex:1}.lfmc-rowtitle{font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lfmc-rowartist{font-size:11px;color:#999;margin-top:4px}.lfmc-btn{border:0;border-radius:9px;padding:10px 14px;background:#d51007;color:white;font-weight:650;cursor:pointer;font-size:12px}.lfmc-btn.secondary{background:#333;color:#eee}.lfmc-btn:disabled{opacity:.5;cursor:default}.lfmc-field{display:flex;flex-direction:column;gap:6px;margin:13px 0}.lfmc-field label{font-size:12px;color:#bbb}.lfmc-field input{background:#101010;border:1px solid #444;color:#fff;border-radius:8px;padding:10px 11px;outline:none}.lfmc-field input:focus{border-color:#d51007}.lfmc-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.lfmc-note{font-size:11px;color:#888;line-height:1.55;margin-top:12px}.lfmc-status{padding:10px 18px;border-top:1px solid #303030;color:#aaa;font-size:11px;display:flex;justify-content:space-between}.lfmc-status[data-error="1"]{color:#ff9b92}.lfmc-empty{padding:25px;text-align:center;color:#888;font-size:13px}.lfmc-tabtitle{font-size:21px;font-weight:750;margin-bottom:5px}.lfmc-toprow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}.lfmc-select{background:#252525;color:#eee;border:1px solid #444;padding:8px;border-radius:8px}
  @media(max-width:650px){#lfmc-panel{height:94vh}.lfmc-side{width:58px;padding:12px 6px}.lfmc-nav button{font-size:0;text-align:center;padding:12px 3px}.lfmc-nav button::first-letter{font-size:16px}.lfmc-main{padding:14px}.lfmc-grid{grid-template-columns:1fr 1fr}.lfmc-now{gap:10px}.lfmc-cover{width:58px;height:58px}}
  `;
  function injectStyles(){if(document.getElementById("lfmc-style"))return;const s=document.createElement("style");s.id="lfmc-style";s.textContent=css;document.head.appendChild(s);}
  function createLauncher(){if(document.getElementById("lfmc-launch"))return;const b=document.createElement("button");b.id="lfmc-launch";b.title="Scrobblify";b.innerHTML="<span aria-hidden='true'>♫</span>";b.onclick=openDashboard;
    const target=document.querySelector(".main-topBar-topbarContent, .main-topBar-historyButtons, header [data-testid='topbar']");
    if(target)target.appendChild(b);else{b.style.position="fixed";b.style.top="12px";b.style.right="170px";b.style.zIndex="9998";document.body.appendChild(b);}
  }
  function openDashboard(){if(document.getElementById("lfmc-overlay")){return;}
    const overlay=document.createElement("div");overlay.id="lfmc-overlay";overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
    overlay.innerHTML=`<section id="lfmc-panel"><header class="lfmc-head"><div class="lfmc-brand"><div class="lfmc-logo">♫</div><div><div class="lfmc-title">Scrobblify</div><div class="lfmc-sub">ONE PLAYER. TWO MUSIC HISTORIES.</div></div></div><button class="lfmc-close" aria-label="Close">×</button></header><div class="lfmc-body"><aside class="lfmc-side"><nav class="lfmc-nav"><button data-tab="overview" class="active">◉ &nbsp; Overview</button><button data-tab="history">◷ &nbsp; History</button><button data-tab="charts">▥ &nbsp; Charts</button><button data-tab="settings">⚙ &nbsp; Settings</button></nav></aside><main class="lfmc-main" id="lfmc-content"></main></div><footer class="lfmc-status"><span id="lfmc-status">${isConnected()?"Connected to Last.fm":"Not connected · Add API credentials in Settings"}</span><span>v${VERSION}</span></footer></section>`;
    document.body.appendChild(overlay);overlay.querySelector(".lfmc-close").onclick=()=>overlay.remove();overlay.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;overlay.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));renderTab();});renderTab();
  }
  function renderTab(){const root=document.querySelector("#lfmc-content");if(!root)return;root.innerHTML="<div class='lfmc-empty'>Loading…</div>";
    if(state.tab==="settings")return renderSettings(root);
    if(state.tab==="overview")return renderOverview(root);
    if(state.tab==="history")return renderHistory(root);
    if(state.tab==="charts")return renderCharts(root);
  }
  function renderSettings(root){root.innerHTML=`<div class="lfmc-tabtitle">Settings</div><div class="lfmc-muted">Connect your Last.fm account and tune scrobbling.</div><div class="lfmc-card" style="margin-top:18px"><div style="font-weight:700">Last.fm API credentials</div><div class="lfmc-field"><label>API key</label><input id="lfmc-key" value="${esc(get(STORE.key))}" placeholder="Your Last.fm API key"></div><div class="lfmc-field"><label>Shared secret</label><input id="lfmc-secret" type="password" value="${esc(get(STORE.secret))}" placeholder="Your Last.fm shared secret"></div><div class="lfmc-field"><label>Scrobble username</label><input id="lfmc-user" value="${esc(get(STORE.username))}" placeholder="Last.fm username"></div><div class="lfmc-actions"><button class="lfmc-btn" id="lfmc-save">Save credentials</button><a class="lfmc-btn secondary" href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:inline-flex;align-items:center">Get API</a><button class="lfmc-btn secondary" id="lfmc-connect">${isConnected()?"Reconnect":"Connect Last.fm"}</button><button class="lfmc-btn secondary" id="lfmc-disconnect">Disconnect</button><button class="lfmc-btn secondary" id="lfmc-lfm-toggle">Last.fm scrobbling: ${get(STORE.lfmEnabled,"true")==="true"?"ON":"OFF"}</button></div><p class="lfmc-note">Create an API account at last.fm/api/account. Connect opens Last.fm in your browser for authorization. After approving, return to Spotify and click “I've approved”. Your API secret and session key stay in local Spicetify storage.</p></div><div class="lfmc-card" style="margin-top:14px"><div style="font-weight:700">ListenBrainz connection</div><div class="lfmc-field"><label>ListenBrainz user token</label><input id="lfmc-lb-token" type="password" value="${esc(get(STORE.lbToken))}" placeholder="Paste your ListenBrainz user token"></div><div class="lfmc-field"><label>ListenBrainz username</label><input id="lfmc-lb-user" value="${esc(get(STORE.lbUser))}" placeholder="Filled automatically when token validates"></div><div class="lfmc-actions"><a class="lfmc-btn secondary" href="https://listenbrainz.org/settings" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:inline-flex;align-items:center">Get Token</a><button class="lfmc-btn" id="lfmc-lb-connect">Validate & connect</button><button class="lfmc-btn secondary" id="lfmc-lb-disconnect">Disconnect</button><button class="lfmc-btn secondary" id="lfmc-lb-toggle">ListenBrainz: ${get(STORE.lbEnabled,"true")==="true"?"ON":"OFF"}</button></div><p class="lfmc-note">Get your personal token from listenbrainz.org/settings. Scrobblify validates it directly with ListenBrainz. Token is stored locally in Spicetify storage.</p></div><div class="lfmc-card" style="margin-top:14px"><div style="font-weight:700">Scrobbling behaviour</div><div class="lfmc-field"><label>Minimum play threshold (seconds)</label><input id="lfmc-seconds" type="number" min="30" max="240" value="${esc(get(STORE.minSeconds,"240"))}"></div><div class="lfmc-field"><label>Minimum percentage of short tracks (%)</label><input id="lfmc-percent" type="number" min="1" max="99" value="${esc(get(STORE.minPercent,"50"))}"></div><div class="lfmc-actions"><button class="lfmc-btn" id="lfmc-save-pref">Save preferences</button><button class="lfmc-btn secondary" id="lfmc-toggle">Scrobbling: ${get(STORE.enabled,"true")==="true"?"ON":"OFF"}</button></div><p class="lfmc-note">A track is scrobbled after the shorter of the configured seconds or percentage threshold. Tracks shorter than 30 seconds are ignored. The default follows Last.fm's usual 50% / 4-minute rule.</p></div>`;
    root.querySelector("#lfmc-save").onclick=()=>{set(STORE.key,root.querySelector("#lfmc-key").value.trim());set(STORE.secret,root.querySelector("#lfmc-secret").value.trim());set(STORE.username,root.querySelector("#lfmc-user").value.trim());status("Credentials saved locally");};
    root.querySelector("#lfmc-connect").onclick=async()=>{const key=root.querySelector("#lfmc-key").value.trim(),secret=root.querySelector("#lfmc-secret").value.trim();if(!key||!secret){status("Enter your API key and shared secret first",true);return;}set(STORE.key,key);set(STORE.secret,secret);set(STORE.username,root.querySelector("#lfmc-user").value.trim());try{const r=await authApi("auth.getToken",{});const token=r.token;set(`${EXT}:pendingToken`,token);window.open(`https://www.last.fm/api/auth/?api_key=${encodeURIComponent(key)}&token=${encodeURIComponent(token)}`,"_blank");root.querySelector("#lfmc-connect").textContent="I've approved — finish connection";root.querySelector("#lfmc-connect").onclick=async()=>{try{const rr=await authApi("auth.getSession",{token});const session=rr.session;set(STORE.session,session.key);set(STORE.username,session.name||get(STORE.username));status("Connected as "+(session.name||"Last.fm user"));renderTab();}catch(e){status(e.message,true);}};status("Authorize Last.fm in your browser, then click the button again");}catch(e){status(e.message,true);}};
    root.querySelector("#lfmc-disconnect").onclick=()=>{set(STORE.session,"");set(`${EXT}:pendingToken`,"");status("Disconnected");renderTab();};
    root.querySelector("#lfmc-lfm-toggle").onclick=()=>{const v=get(STORE.lfmEnabled,"true")==="true"?"false":"true";set(STORE.lfmEnabled,v);root.querySelector("#lfmc-lfm-toggle").textContent="Last.fm scrobbling: "+(v==="true"?"ON":"OFF");status("Last.fm scrobbling "+(v==="true"?"enabled":"paused"));};
    root.querySelector("#lfmc-save-pref").onclick=()=>{set(STORE.minSeconds,Math.max(30,Math.min(240,Number(root.querySelector("#lfmc-seconds").value)||240)));set(STORE.minPercent,Math.max(1,Math.min(99,Number(root.querySelector("#lfmc-percent").value)||50)));status("Preferences saved");};
    root.querySelector("#lfmc-toggle").onclick=()=>{const v=get(STORE.enabled,"true")==="true"?"false":"true";set(STORE.enabled,v);root.querySelector("#lfmc-toggle").textContent="Scrobbling: "+(v==="true"?"ON":"OFF");status("Scrobbling "+(v==="true"?"enabled":"disabled"));};
    root.querySelector("#lfmc-lb-connect").onclick=async()=>{const token=root.querySelector("#lfmc-lb-token").value.trim();if(!token){status("Paste your ListenBrainz user token first",true);return;}set(STORE.lbToken,token);try{const r=await fetch("https://api.listenbrainz.org/1/validate-token",{headers:{Authorization:`Token ${token}`}});const j=await r.json();if(!r.ok||!j.valid)throw new Error(j.message||"Invalid ListenBrainz token");set(STORE.lbUser,j.user_name);root.querySelector("#lfmc-lb-user").value=j.user_name;status("ListenBrainz connected as "+j.user_name);renderTab();}catch(e){status("ListenBrainz · "+e.message,true);}};
    root.querySelector("#lfmc-lb-disconnect").onclick=()=>{set(STORE.lbToken,"");set(STORE.lbUser,"");set(`${EXT}:lbMsids`,"{}");status("ListenBrainz disconnected");renderTab();};
    root.querySelector("#lfmc-lb-toggle").onclick=()=>{const v=get(STORE.lbEnabled,"true")==="true"?"false":"true";set(STORE.lbEnabled,v);root.querySelector("#lfmc-lb-toggle").textContent="ListenBrainz: "+(v==="true"?"ON":"OFF");status("ListenBrainz scrobbling "+(v==="true"?"enabled":"paused"));};
  }
  async function renderOverview(root){const t=state.track;root.innerHTML=`<div class="lfmc-toprow"><div><div class="lfmc-tabtitle">Your listening</div><div class="lfmc-muted">A live look at what you're playing.</div></div><button class="lfmc-btn secondary" id="lfmc-refresh">Refresh</button></div><div class="lfmc-grid"><div class="lfmc-card"><div class="lfmc-label">Connection</div><div class="lfmc-number" style="font-size:18px;color:${isConnected()?"#72d69a":"#ff958d"}">${(isConnected()||isLBConnected())?"Connected":"Not connected"}</div><div class="lfmc-muted">${esc([isConnected()?"Last.fm: "+get(STORE.username):"",isLBConnected()?"ListenBrainz: "+get(STORE.lbUser):""].filter(Boolean).join(" · ")||"Connect a service in Settings")}</div></div><div class="lfmc-card"><div class="lfmc-label">Queued scrobbles</div><div class="lfmc-number">${readQueue().length+readLBQueue().length}</div><div class="lfmc-muted">Last.fm + ListenBrainz retries</div></div><div class="lfmc-card"><div class="lfmc-label">Scrobbling</div><div class="lfmc-number" style="font-size:18px">${get(STORE.enabled,"true")==="true"?"Enabled":"Paused"}</div><div class="lfmc-muted">Automatic tracking</div></div></div><div class="lfmc-now">${t?.cover?`<img class="lfmc-cover" src="${esc(t.cover)}">`:`<div class="lfmc-cover" style="display:grid;place-items:center;font-size:28px">♫</div>`}<div style="min-width:0"><div class="lfmc-label">Now playing</div><div class="lfmc-track">${esc(t?.title||"Nothing playing")}</div><div class="lfmc-artist">${esc(t?.artists||"Start a track in Spotify")}</div><span class="lfmc-pill">${Spicetify.Player.isPlaying()?"PLAYING":"IDLE"}</span></div></div><div class="lfmc-section">Recent Last.fm scrobbles</div><div id="lfmc-recent" class="lfmc-list"><div class="lfmc-empty">${isConnected()?"Loading listening history…":"Connect Last.fm to see your recent history."}</div></div>`;
    root.querySelector("#lfmc-refresh").onclick=()=>renderOverview(root);
    if(isConnected()){try{const r=await api("user.getRecentTracks",{user:get(STORE.username),limit:"6",extended:"1"},false);const tracks=r.recenttracks?.track||[];root.querySelector("#lfmc-recent").innerHTML=tracks.length?tracks.filter(x=>!x["@attr"]?.nowplaying).slice(0,5).map(trackRow).join(""):"<div class='lfmc-empty'>No scrobbles yet.</div>";}catch(e){root.querySelector("#lfmc-recent").innerHTML=`<div class="lfmc-empty">${esc(e.message)}</div>`;}}
  }
  function trackRow(t){const img=t.image?.find(x=>x.size==="medium")?.["#text"]||t.image?.[2]?.["#text"]||"";return `<div class="lfmc-row">${img?`<img src="${esc(img)}">`:`<div style="width:42px;height:42px;background:#333;border-radius:6px;display:grid;place-items:center">♫</div>`}<div class="lfmc-rowinfo"><div class="lfmc-rowtitle">${esc(t.name||t.track?.name)}</div><div class="lfmc-rowartist">${esc(t.artist?.name||t.artist?.["#text"]||"")}</div></div><div class="lfmc-muted">${t.date?.uts?new Date(Number(t.date.uts)*1000).toLocaleDateString():"Now"}</div></div>`;}
  function lbListenRow(listen){const m=listen.track_metadata||{},a=m.additional_info||{},img=m.mbid_mapping?.caa_id&&m.mbid_mapping?.caa_release_mbid?`https://coverartarchive.org/release/${m.mbid_mapping.caa_release_mbid}/${m.mbid_mapping.caa_id}-250.jpg`:"";return `<div class="lfmc-row">${img?`<img src="${esc(img)}">`:`<div style="width:42px;height:42px;background:#333;border-radius:6px;display:grid;place-items:center">♫</div>`}<div class="lfmc-rowinfo"><div class="lfmc-rowtitle">${esc(m.track_name||"Unknown track")}</div><div class="lfmc-rowartist">${esc(m.artist_name||"Unknown artist")}${m.release_name?" · "+esc(m.release_name):""}</div></div><div class="lfmc-muted">${listen.listened_at?new Date(Number(listen.listened_at)*1000).toLocaleDateString():""}</div></div>`;}
  async function lbPublic(path){const res=await fetch(`https://api.listenbrainz.org${path}`);const raw=await res.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}if(!res.ok)throw new Error(data.error||`ListenBrainz API error ${res.status}`);return data;}
  async function renderHistory(root){root.innerHTML=`<div class="lfmc-toprow"><div><div class="lfmc-tabtitle">Listening history</div><div class="lfmc-muted">Browse recent listens from either service.</div></div><div style="display:flex;gap:8px"><select id="lfmc-history-service" class="lfmc-select"><option value="lastfm">Last.fm</option><option value="listenbrainz">ListenBrainz</option></select><select id="lfmc-limit" class="lfmc-select"><option value="20">20 tracks</option><option value="50">50 tracks</option><option value="100">100 tracks</option></select></div></div><div id="lfmc-history" class="lfmc-list"><div class="lfmc-empty">Loading…</div></div>`;
    const load=async()=>{const dest=root.querySelector("#lfmc-history"),service=root.querySelector("#lfmc-history-service").value;dest.innerHTML="<div class='lfmc-empty'>Loading…</div>";try{if(service==="lastfm"){if(!isConnected())throw new Error("Connect Last.fm in Settings first.");const r=await api("user.getRecentTracks",{user:get(STORE.username),limit:root.querySelector("#lfmc-limit").value,extended:"1"},false);const tracks=r.recenttracks?.track||[];dest.innerHTML=tracks.map(trackRow).join("")||"<div class='lfmc-empty'>No listening history yet.</div>";}else{if(!isLBConnected())throw new Error("Connect ListenBrainz in Settings first.");const r=await lbPublic(`/1/user/${encodeURIComponent(get(STORE.lbUser))}/listens?count=${root.querySelector("#lfmc-limit").value}`);const listens=r.payload?.listens||[];dest.innerHTML=listens.map(lbListenRow).join("")||"<div class='lfmc-empty'>No listening history yet.</div>";}}catch(e){dest.innerHTML=`<div class='lfmc-empty'>${esc(e.message)}</div>`;}};root.querySelector("#lfmc-limit").onchange=load;root.querySelector("#lfmc-history-service").onchange=load;await load();}
  async function renderCharts(root){root.innerHTML=`<div class="lfmc-toprow"><div><div class="lfmc-tabtitle">Your charts</div><div class="lfmc-muted">Top tracks from your connected listening service.</div></div><div style="display:flex;gap:8px"><select id="lfmc-chart-service" class="lfmc-select"><option value="lastfm">Last.fm</option><option value="listenbrainz">ListenBrainz</option></select><select id="lfmc-chart-kind" class="lfmc-select"><option value="recordings">Tracks</option><option value="artists">Artists</option><option value="releases">Albums</option></select><select id="lfmc-period" class="lfmc-select"><option value="7day">7 days</option><option value="1month">1 month</option><option value="3month">3 months</option><option value="6month">6 months</option><option value="12month">12 months</option><option value="overall">All time</option></select></div></div><div id="lfmc-chartlist" class="lfmc-list"><div class="lfmc-empty">Loading charts…</div></div>`;
    const period=root.querySelector("#lfmc-period"),service=root.querySelector("#lfmc-chart-service"),kind=root.querySelector("#lfmc-chart-kind");
    const syncPeriod=()=>{const lb=service.value==="listenbrainz";period.innerHTML=lb?'<option value="week">This week</option><option value="month">This month</option><option value="year">This year</option><option value="all_time">All time</option>':'<option value="7day">7 days</option><option value="1month">1 month</option><option value="3month">3 months</option><option value="6month">6 months</option><option value="12month">12 months</option><option value="overall">All time</option>';};
    const load=async()=>{const dest=root.querySelector("#lfmc-chartlist");dest.innerHTML="<div class='lfmc-empty'>Loading…</div>";try{if(service.value==="lastfm"){if(!isConnected())throw new Error("Connect Last.fm in Settings first.");const method={recordings:"user.getTopTracks",artists:"user.getTopArtists",releases:"user.getTopAlbums"}[kind.value];const r=await api(method,{user:get(STORE.username),period:period.value,limit:"20"},false);const rows=kind.value==="recordings"?(r.toptracks?.track||[]):kind.value==="artists"?(r.topartists?.artist||[]):(r.topalbums?.album||[]);dest.innerHTML=rows.map((t,i)=>`<div class="lfmc-row"><div style="width:30px;color:#d77;font-weight:750;text-align:center">${i+1}</div><div class="lfmc-rowinfo"><div class="lfmc-rowtitle">${esc(t.name||t.title||"Unknown")}</div><div class="lfmc-rowartist">${esc(t.artist?.name||t.artist?.title||t.artist?.name||"")}</div></div><div class="lfmc-muted">${fmt(t.playcount)} plays</div></div>`).join("")||"<div class='lfmc-empty'>No chart data.</div>";}else{if(!isLBConnected())throw new Error("Connect ListenBrainz in Settings first.");const user=encodeURIComponent(get(STORE.lbUser)),range=period.value,endpoint={recordings:"recordings",artists:"artists",releases:"releases"}[kind.value];const r=await lbPublic(`/1/stats/user/${user}/${endpoint}?range=${encodeURIComponent(range)}&count=20`);const rows=r.payload?.[endpoint]||[];dest.innerHTML=rows.map((t,i)=>{const title=t.track_name||t.recording_name||t.artist_name||t.release_name||t.release_group_name||"Unknown";const sub=kind.value==="recordings"?t.artist_name:kind.value==="releases"?t.artist_name:"";return `<div class="lfmc-row"><div style="width:30px;color:#8bb5ef;font-weight:750;text-align:center">${i+1}</div><div class="lfmc-rowinfo"><div class="lfmc-rowtitle">${esc(title)}</div><div class="lfmc-rowartist">${esc(sub)}</div></div><div class="lfmc-muted">${fmt(t.listen_count)} listens</div></div>`;}).join("")||"<div class='lfmc-empty'>No chart data yet.</div>";}}catch(e){dest.innerHTML=`<div class='lfmc-empty'>${esc(e.message)}</div>`;}};
    service.onchange=()=>{syncPeriod();load();};period.onchange=load;kind.onchange=load;syncPeriod();await load();}
  async function loveCurrent(){const t=state.track;if(!t)return;const loved=get(`${EXT}:loved:${t.uri}`)==="true",score=loved?0:1,method=loved?"track.unlove":"track.love",outcomes=[];if(isConnected()){try{await api(method,{artist:t.artist,track:t.title});outcomes.push(loved?"Last.fm un-loved":"Last.fm loved ♥");}catch(e){outcomes.push("Last.fm: "+e.message);}}if(isLBConnected()){try{const msids=JSON.parse(get(`${EXT}:lbMsids`,"{}"));const msid=msids[t.uri];if(!msid)throw new Error("ListenBrainz recording ID unavailable yet; restart the track and try again");await lbRequest("/1/feedback/recording-feedback",{method:"POST",body:JSON.stringify({recording_msid:msid,score})});outcomes.push(loved?"ListenBrainz un-loved":"ListenBrainz loved ♥");}catch(e){outcomes.push("ListenBrainz: "+e.message);}}if(outcomes.some(x=>!x.includes(": ")))set(`${EXT}:loved:${t.uri}`,loved?"false":"true");status(outcomes.length?outcomes.join(" · "):"Connect at least one service first",!outcomes.length);}
  async function hateCurrent(){const t=state.track;if(!t||!isLBConnected())return;try{const msids=JSON.parse(get(`${EXT}:lbMsids`,"{}"));const msid=msids[t.uri];if(!msid)throw new Error("ListenBrainz recording ID unavailable yet; restart the track and try again");await lbRequest("/1/feedback/recording-feedback",{method:"POST",body:JSON.stringify({recording_msid:msid,score:-1})});status("Marked as disliked on ListenBrainz");}catch(e){status(e.message,true);}}
  function addLoveButton(){if(document.getElementById("lfmc-love"))return;const b=document.createElement("button");b.id="lfmc-love";b.title="Love current track on Last.fm and ListenBrainz";b.textContent="♥";b.style.cssText="position:fixed;bottom:105px;right:22px;z-index:9997;width:38px;height:38px;border:1px solid #555;border-radius:50%;background:#222;color:#ff7777;font-size:18px;cursor:pointer;display:none";b.onclick=loveCurrent;document.body.appendChild(b);const h=document.createElement("button");h.id="lfmc-hate";h.title="Mark current track as disliked on ListenBrainz";h.textContent="−";h.style.cssText="position:fixed;bottom:105px;right:68px;z-index:9997;width:38px;height:38px;border:1px solid #555;border-radius:50%;background:#222;color:#aaa;font-size:22px;cursor:pointer;display:none";h.onclick=hateCurrent;document.body.appendChild(h);}
  function refreshDashboard(){const love=document.getElementById("lfmc-love"),hate=document.getElementById("lfmc-hate");if(love)love.style.display=state.track&&(isConnected()||isLBConnected())?"block":"none";if(hate)hate.style.display=state.track&&isLBConnected()?"block":"none";if(document.getElementById("lfmc-overlay"))renderTab();}
  function init(){if(!Spicetify.Player||!Spicetify.LocalStorage){setTimeout(init,300);return;}injectStyles();createLauncher();addLoveButton();
    Spicetify.Player.addEventListener("songchange",onTrackChange);Spicetify.Player.addEventListener("onprogress",onProgress);Spicetify.Player.addEventListener("onplaypause",()=>{if(Spicetify.Player.isPlaying()&&state.track){state.lastTick=Date.now();updateNowPlaying(state.track);lbNowPlaying(state.track);}});
    if(Spicetify.Player.data)onTrackChange();window.addEventListener("online",()=>{state.online=true;retryQueue();lbRetryQueue();});window.addEventListener("offline",()=>{state.online=false;status("Offline · scrobbles will be queued");});
    setTimeout(()=>{retryQueue();lbRetryQueue();},5000);console.log(`[${EXT}] v${VERSION} loaded`);
  }
  init();
})();

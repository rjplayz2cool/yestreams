function specialRollByRecord(r){const all=[...EBK_ROLLS,...UNRELEASED_ROLLS],key=String(r?.catalog_key||r?.key||r?.spotify||'').trim();return all.find(x=>x.id===key)||((r?.unreleased||['Unreleased','EBK'].includes(String(r?.rarity)))?all.find(x=>normTitle(x.title)===normTitle(r?.title||'')):null)||null}
function serverCoverSrc(v){v=String(v||'').trim();if(!v)return'';if(/^(?:https?:\/\/|data:|blob:)/i.test(v))return v;v=v.replace(/^\.\//,'').replace(/^\/+/, '');return /^(?:covers|assets|snake|media)\//.test(v)?v:'covers/'+v}
function serverItemInfo(r){
 const sp=specialRollByRecord(r),special=!!sp||r?.unreleased||['Unreleased','EBK'].includes(String(r?.rarity||'')),x=special?null:trackerSongForServer(r),key=String(r?.catalog_key||r?.key||r?.spotify||x?.spotify||'').split('/').pop(),md=window.CARD_METADATA?.[key]||window.CARD_METADATA?.[(x?.spotify||'').split('/').pop()]||{},existing=x?(META[x.spotify]||{}):{};
 const known=value=>value&&!/^(?:unknown|tracker|n\/?a)$/i.test(String(value));
 const project=x?projectLabelFor(x):'',album=sp?.album||(known(project)?project:'')||md.album||(known(r?.album)?r.album:'')||'Single';
 const cover=serverCoverSrc(sp?.cover)||(x?localCover(x):'')||serverCoverSrc(md.cover)||serverCoverSrc(r?.cover);
 const date=special?'Unreleased':md.releaseDate||existing.releaseDate||(known(r?.release_date)?r.release_date:'')||(known(r?.releaseDate)?r.releaseDate:'')||'Date unavailable';
 return {cover,album,releaseDate:date};
}
function canonicalServerRecord(r){const sp=specialRollByRecord(r);let result=sp?{...r,title:sp.title,credits:sp.credits,cover:sp.cover,album:sp.album,rarity:EBK_ROLLS.some(x=>x.id===sp.id)?'EBK':'Unreleased'}:{...r};const info=serverItemInfo(result);return {...result,cover:info.cover,album:info.album,releaseDate:info.releaseDate,release_date:info.releaseDate}}

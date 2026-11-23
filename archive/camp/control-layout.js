// Keep the stand-up action close to its usual lower-left home, just above the wrist.
export function watchExitPosition(width,height){
 const landscape=width>height*1.4,short=!landscape&&height<650;
 const diameter=landscape?86:short?76:90,handY=height*(landscape?.72:short?.63:.72);
 return {left:14,top:Math.max(82,Math.round(handY-diameter*.8-38)),width:104,height:30};
}

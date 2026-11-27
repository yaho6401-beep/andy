// Keep every verse/sentence intact, including the keys used by the notebook.
export function readingPages(units,capacity=500){
 const pages=[];let page=[],length=0;
 for(const unit of units){const size=unit.text.length+14;if(page.length&&length+size>capacity){pages.push(page);page=[];length=0;}page.push(unit);length+=size;}
 if(page.length||!pages.length)pages.push(page);return pages;
}
export function turnReadingPage(page,count,direction,spread=false){const step=spread?2:1;if(direction>0&&page+step>=count)return {chapter:1,page:0};if(direction<0&&page===0)return {chapter:-1,page:0};return{chapter:0,page:Math.max(0,Math.min(count-1,page+direction*step))};}

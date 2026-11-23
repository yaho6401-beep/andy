// A binary heap avoids sorting the entire frontier at every step in a larger world.
export class PathQueue{
 constructor(){this.items=[];}
 get length(){return this.items.length;}
 before(a,b){return a.f<b.f||a.f===b.f&&a.g>b.g;}
 push(node){const a=this.items;let i=a.length;a.push(node);while(i){const p=(i-1)>>1;if(!this.before(node,a[p]))break;a[i]=a[p];i=p;}a[i]=node;}
 pop(){const a=this.items,first=a[0],tail=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let child=i*2+1;if(child+1<a.length&&this.before(a[child+1],a[child]))child++;if(!this.before(a[child],tail))break;a[i]=a[child];i=child;}a[i]=tail;}return first;}
}

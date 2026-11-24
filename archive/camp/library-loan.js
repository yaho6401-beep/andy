// Reading never expires; changing the carried book has a ten-minute cooldown.
export const LOAN_INTERVAL=10*60*1000;
export function validLoan(value,ids,now=Date.now()){
 if(!value||!ids.includes(value.id)||!Number.isFinite(value.borrowedAt)||value.borrowedAt<0||value.borrowedAt>now+5000)return null;
 return {id:value.id,borrowedAt:value.borrowedAt};
}
export function loanRemaining(loan,now=Date.now()){return loan?Math.max(0,Math.min(LOAN_INTERVAL,loan.borrowedAt+LOAN_INTERVAL-now)):0;}
export function borrowBook(loan,id,ids,now=Date.now()){
 if(!ids.includes(id))return {ok:false,loan,remaining:0};
 if(loan?.id===id)return {ok:true,loan,remaining:0};
 const remaining=loanRemaining(loan,now);
 return remaining?{ok:false,loan,remaining}:{ok:true,loan:{id,borrowedAt:now},remaining:0};
}

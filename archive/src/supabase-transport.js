// Production is deliberately gated until staging security and quota tests pass.
export class SupabaseTransport {
 constructor(){}
 async prepareEntry(){throw Error('이 시연판은 개발 PC의 로컬 테스트 공간입니다. 운영 모임 연결은 성인 승인·인증·보안 검증 후 공개됩니다.');}
}

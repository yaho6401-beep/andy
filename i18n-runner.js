(function(g){
 const rows=`
(게임잘하면 할인쿠폰 있음!)|(Play well for a chance at coupons!)|（玩得好，有机会赢优惠券！）|（上手に遊んでクーポンのチャンス！）
향수 미니게임 ♡|Perfume mini game ♡|香水小游戏 ♡|香水ミニゲーム ♡
향수 미니게임|Perfume mini game|香水小游戏|香水ミニゲーム
미니게임 닫기|Close mini game|关闭小游戏|ミニゲームを閉じる
장애물은 폴짝! 악취 친구에게는 칙! 쥐·토끼·곰 보스를 향기롭게 바꿔주세요.|Jump over obstacles and spray! Turn rat, rabbit and bear bosses into fragrant friends.|跳过障碍，喷出香气！让鼠、兔、熊首领变成香喷喷的朋友。|障害物をジャンプ、においの仲間にはシュッ！ねずみ・うさぎ・くまのボスを香りで笑顔に。
플레이|Play time|游戏时间|プレイ時間
향기 점수|Scent score|香气分数|香りスコア
자동 저장|Auto-save|自动保存|自動保存
너구리가 장애물을 넘고 향수를 뿌리는 달리기 게임|A raccoon runner with jumping and perfume spraying|小浣熊跳跃并喷香水的跑酷游戏|アライグマがジャンプして香水を吹きかけるランゲーム
점프 ↑|Jump ↑|跳跃 ↑|ジャンプ ↑
칙! 향수 뿌리기|Spray!|喷香水！|シュッ！香水
게임 시작|Start game|开始游戏|ゲーム開始
일시정지|Pause|暂停|一時停止
다시 달리기|Run again|再次奔跑|もう一度走る
이어 하기|Continue|继续游戏|続ける
연결 중…|Connecting…|连接中…|接続中…
키보드: 스페이스·↑ 점프 / F·→ 분사|Keyboard: Space/↑ jump · F/→ spray|键盘：空格/↑跳跃 · F/→喷香水|キーボード：スペース・↑でジャンプ / F・→で噴射
버튼을 누르고 있으면 연속으로 움직여요.|Hold a button to repeat its action.|按住按钮可连续动作。|ボタンを押し続けると連続で動きます。
실제 플레이 5분 + 향기 점수 1,000점 → 하루 한 번 행운의 향기 선물!|5 active minutes + 1,000 points → one daily scent-gift draw!|实际游戏5分钟＋1000分 → 每天一次香气礼物抽取！|実プレイ5分＋1,000点で、1日1回の香りギフト抽選！
향기 선물 조건 달성도|Gift eligibility progress|礼物条件达成进度|香りギフトの条件達成度
매장 1,000원 할인권|₩1,000 atelier discount|到店减1000韩元券|工房1,000ウォン割引券
매장 2,000원 할인권|₩2,000 atelier discount|到店减2000韩元券|工房2,000ウォン割引券
매장 3,000원 할인권|₩3,000 atelier discount|到店减3000韩元券|工房3,000ウォン割引券
5ml 제공권|5 ml gift voucher|5ml赠送券|5mlプレゼント券
3ml 제공권|3 ml gift voucher|3ml赠送券|3mlプレゼント券
유효기간|Valid until|有效期至|有効期限
까지|until|截止|まで
사용 가능|Available|可使用|利用可能
사용 완료|Redeemed|已使用|使用済み
발급 취소|Voided|已作废|発行取消
기간 만료|Expired|已过期|期限切れ
방문당 1장 · 다른 쿠폰과 중복 불가|One per visit · Cannot combine with other coupons|每次到店限用一张 · 不可与其他优惠券叠加|1回の来店につき1枚・他のクーポンと併用不可
이 화면을 캡처하거나 쿠폰 이미지를 저장해 매장에 보여주세요.|Capture this screen or save the coupon image and show it at the atelier.|请截图或保存优惠券图片，到店出示。|画面を撮影するかクーポン画像を保存して、工房でご提示ください。
매장에서 쿠폰 번호 확인 후 사용 처리합니다.|Staff will verify the code and mark it as redeemed.|店员核对券号后进行核销。|店頭で番号を確認して使用済みにします。
쿠폰 이미지 저장|Save coupon image|保存优惠券图片|クーポン画像を保存
게임 방법 · 선물 확률 · 사용 조건|How to play · Gift odds · Terms|玩法 · 礼物概率 · 使用条件|遊び方・当選確率・利用条件
화면을 닫거나 다른 탭으로 이동한 시간은 플레이 시간에 포함되지 않아요. 쓰러져도 오늘의 점수와 플레이 시간은 유지돼요. 이어 하기 전까지는 시간이 흐르지 않아요.|Closed or background time does not count. Today's time and score survive a fall. Time stays paused until you continue.|关闭画面或切换标签的时间不计入游戏。倒下后保留当天时间和分数，继续游戏前暂停计时。|閉じた画面や別タブの時間は数えません。倒れても当日の時間と点数は維持され、再開まで時間は止まります。
5분과 1,000점을 모두 채우면 서버에서 한 번 추첨해요. 같은 브라우저에서 한국 시간 기준 하루 한 번 참여할 수 있어요.|The server draws once after both 5 minutes and 1,000 points. One draw per browser per Korean calendar day.|同时达到5分钟和1000分后，由服务器抽取一次。同一浏览器按韩国日期每天一次。|5分と1,000点の両方を満たすとサーバーで抽選します。同じブラウザで韓国時間の1日1回です。
1,000원 할인 · 30%|₩1,000 discount · 30%|减1000韩元 · 30%|1,000ウォン割引・30%
2,000원 할인 · 20%|₩2,000 discount · 20%|减2000韩元 · 20%|2,000ウォン割引・20%
3,000원 할인 · 10%|₩3,000 discount · 10%|减3000韩元 · 10%|3,000ウォン割引・10%
5ml 제공권 · 5%|5 ml voucher · 5%|5ml赠送券 · 5%|5mlプレゼント券・5%
3ml 제공권 · 5%|3 ml voucher · 5%|3ml赠送券 · 5%|3mlプレゼント券・5%
미당첨 · 30%|No prize · 30%|未中奖 · 30%|当選なし・30%
쿠폰은 발급일부터 30일 동안 유효하며, 방문당 1장만 사용할 수 있어요. 다른 쿠폰과 중복 사용은 불가해요. 실제 사용 여부는 매장 조회 결과를 기준으로 합니다.|Coupons last 30 days from issue. Use one per visit, with no other coupons. The atelier's code lookup determines validity.|优惠券自发放起30天有效，每次到店限一张，不可叠加。实际有效性以店内查询结果为准。|発行から30日間有効。1回の来店につき1枚、他クーポン併用不可。利用可否は店頭の照会結果に従います。
내 쿠폰함|My coupons|我的优惠券|自分のクーポン
내 쿠폰 불러오기|Load my coupons|查看我的优惠券|クーポンを読み込む
아직 발급된 쿠폰이 없어요.|No coupons yet.|暂无优惠券。|発行されたクーポンはまだありません。
매장 관리자 · 쿠폰 확인|Atelier staff · Verify coupons|店员 · 优惠券核销|店舗管理者・クーポン確認
쿠폰 번호|Coupon code|优惠券号码|クーポン番号
쿠폰 조회|Look up coupon|查询优惠券|クーポン照会
쿠폰 혜택을 제공한 뒤 사용 완료로 처리해주세요. 처리 후에는 다시 사용할 수 없습니다.|Provide the benefit, then mark as redeemed. This cannot be used again afterward.|提供优惠后请核销。核销后不可再次使用。|特典を提供してから使用済みにしてください。その後は再使用できません。
이 쿠폰 사용 완료|Mark this coupon redeemed|核销此优惠券|このクーポンを使用済みにする
쿠폰을 사용 완료로 처리했어요.|Coupon marked as redeemed.|优惠券已核销。|使用済みにしました。
쿠폰 번호를 확인해주세요.|Please check the coupon code.|请检查优惠券号码。|クーポン番号を確認してください。
만료된 쿠폰이에요.|This coupon has expired.|优惠券已过期。|期限切れのクーポンです。
이미 사용되었거나 취소된 쿠폰이에요.|This coupon was used or voided.|优惠券已使用或作废。|使用済み、または取り消されたクーポンです。
쿠폰을 찾지 못했어요.|Coupon not found.|未找到优惠券。|クーポンが見つかりません。
플레이 기록은 자동으로 저장돼요.|Your play progress saves automatically.|游戏进度会自动保存。|プレイ記録は自動保存されます。
점프하고, 칙! 향기로 친구를 구해보세요.|Jump and spray! Save friends with scent.|跳起来，喷香水！用香气拯救朋友吧。|ジャンプしてシュッ！香りで仲間を救いましょう。
저장됨|Saved|已保存|保存済み
연결 확인 필요|Connection check needed|需要检查连接|接続の確認が必要
이어 하기를 눌러주세요.|Press Continue.|请点击继续游戏。|続けるボタンを押してください。
오늘의 향기 미션을 완료했어요!|Today's scent mission is complete!|今天的香气任务完成！|今日の香りミッション達成！
오늘은 쿠폰이 나오지 않았어요.|No coupon in today's draw.|今天没有抽到优惠券。|今日はクーポンが出ませんでした。
악취 보스|Stinky boss|臭味首领|においのボス
책과향기 · 향기로 행복을 전해요|Books & Scents · Spread happiness with scent|书与香气 · 用香气传递幸福|本と香り・香りで幸せを届けよう
잠깐 쉬고, 다시 달려볼까요?|Take a breath and run again?|休息一下，再跑一次？|ひと休みして、また走りませんか？
준비되면 이어 달려요!|Continue when you're ready!|准备好就继续奔跑！|準備ができたら走りましょう！
너구리의 향기로운 달리기|Raccoon's scent run|小浣熊香气跑酷|アライグマの香りラン
점수와 플레이 시간은 유지돼요.|Your score and active time are kept.|分数和实际游戏时间会保留。|点数とプレイ時間は維持されます。
점프로 장애물을 넘고, 칙! 악취 친구를 구해주세요.|Jump obstacles and spray to help stinky friends.|跳过障碍，喷香水帮助臭臭朋友。|障害物を跳び越え、シュッと仲間を助けてください。
게임과 연결하지 못했어요. 잠시 후 다시 시도해주세요.|Could not connect to the game. Try again shortly.|暂时无法连接游戏，请稍后再试。|ゲームに接続できません。しばらくしてからお試しください。
실제 플레이 5분과 향기 점수 1,000점을 채워주세요.|Reach 5 active minutes and 1,000 scent points.|请达到实际游戏5分钟及1000香气分数。|実プレイ5分と香りスコア1,000点を達成してください。
게임 정보를 확인해주세요.|Please check the game session.|请检查游戏信息。|ゲーム情報を確認してください。
게임 입력이 너무 많아요.|Too many game inputs.|游戏输入过多。|ゲームの入力が多すぎます。
오늘의 게임을 다시 열어주세요.|Open today's game again.|请重新打开今天的游戏。|今日のゲームを開き直してください。
다른 창에서 진행 중이거나 연결이 바뀌었어요. 게임을 다시 이어주세요.|Another window is playing or the connection changed. Continue again.|另一个窗口正在游戏，或连接已改变，请重新继续。|別ウィンドウで進行中か、接続が変わりました。再開してください。
게임 입력을 확인해주세요. 다시 이어주세요.|Please continue to resync the game.|请重新继续以同步游戏。|続けるボタンでゲームを同期してください。
게임 시간을 확인하지 못했어요. 잠시 후 이어주세요.|Could not verify game time. Continue in a moment.|无法确认游戏时间，请稍后继续。|ゲーム時間を確認できません。少し待って再開してください。
`.trim().split('\n');for(const row of rows){const [ko,en,zh,ja]=row.split('|');g.ScentLocaleData[ko]={en,zh,ja};}
})(globalThis);

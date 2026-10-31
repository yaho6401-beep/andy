(function(g){
 const rows=`
첫 번째 최고점 기록을 기다려요.|Be the first to set a high score.|期待首个最高分纪录。|最初の最高点記録をお待ちしています。
선물 결과 확인|Check gift result|查看礼物结果|ギフト結果を確認
장애물은 폴짝! 쥐·토끼·곰과 하늘의 비둘기·참새를 향기롭게 바꿔주세요.|Jump obstacles and spray rats, rabbits, bears, pigeons and sparrows!|跳过障碍，让鼠、兔、熊和空中的鸽子、麻雀变香！|障害物をジャンプ！ねずみ・うさぎ・くま、空のハトやスズメを香りで笑顔に！
한 판 2분 완주 + 500점 → 하루 한 번 행운의 향기 선물!|Finish one 2-minute round with 500 points → one daily scent-gift draw!|单局完成2分钟并达到500分 → 每天一次香气礼物抽取！|1回2分を完走して500点で、1日1回の香りギフト抽選！
한 판은 최대 2분입니다. 죽으면 이번 판의 점수와 시간은 0으로 초기화돼요. 화면을 닫거나 다른 탭으로 이동하면 일시정지됩니다.|Each round lasts up to 2 minutes. Losing resets that round's score and time to zero. Closing the game or switching tabs pauses play.|每局最多2分钟。失败后该局分数和时间归零。关闭游戏或切换标签页会暂停。|1回は最大2分。やられるとその回の点数と時間は0になります。画面を閉じたりタブを切り替えると一時停止します。
한 판에서 2분을 완주하고 500점을 채우면 서버에서 한 번 추첨해요. 같은 브라우저에서 한국 시간 기준 하루 한 번 참여할 수 있어요.|Finish 2 minutes in one round with 500 points for one server draw. One draw per browser per Korean calendar day.|单局完成2分钟并达到500分后由服务器抽取一次。同一浏览器按韩国时间每天可参加一次。|1回で2分を完走し500点を獲得するとサーバーで抽選。韓国時間で同じブラウザから1日1回参加できます。
최고점 랭킹 TOP 20|Single-round Top 20|单局最高分排行榜前20名|1回の最高点 TOP 20
최고점 랭킹 1위에게 추후 10ml 향수 제공 예정!|A 10ml perfume gift is planned for the future high-score winner!|计划为届时最高分第一名提供10ml香水！|最高点ランキング1位に、後日10mlの香水をプレゼント予定！
내 최고점|My best score|我的最高分|自分の最高点
여러 판을 더하지 않고, 가장 높은 한 판 기록으로 겨뤄요.|Compete on your best single round, not added-up scores.|不累加多局分数，以单局最高纪录竞赛。|複数回の合計ではなく、1回の最高記録で競います。
한 판 최고점|Best round|单局最高分|1回の最高点
새 게임에서 서버가 검증한 한 판 최고점으로 순위를 정합니다. 기존 누적 점수는 새 랭킹에 포함하지 않습니다. 같은 브라우저 기준이며, 데이터를 삭제하거나 기기를 바꾸면 기록이 분리됩니다. 동점이면 최고점을 먼저 달성한 순서입니다.|Rankings use the best server-verified single round in the new game. Previous cumulative totals are excluded. Records are per browser; clearing data or changing devices separates them. Ties go to the earlier high score.|按新游戏经服务器验证的单局最高分排名。旧累计分数不计入新排行榜。以同一浏览器为准，清除数据或更换设备会分开记录。同分时先达到最高分者优先。|新ゲームでサーバーが検証した1回の最高点で順位を決めます。以前の累計点は含みません。同じブラウザ単位で、データ削除や端末変更で記録は分かれます。同点は先に達成した順です。
닉네임과 한 판 최고점은 랭킹에 공개됩니다.|Your nickname and best-round score will be public.|昵称与单局最高分将公开显示。|ニックネームと1回の最高点は公開されます。
✦ 아로마 오일을 먹으면 8초 동안 거대화·무적!|✦ Collect aroma oil for 8 seconds of giant invincibility!|✦ 获得芳香精油后，8秒巨大化并无敌！|✦ アロマオイルで8秒間、巨大化＆無敵！
한 판에서 2분을 완주하고 500점을 채워주세요.|Finish 2 minutes in one round with at least 500 points.|请在单局完成2分钟并达到500分。|1回で2分を完走して500点を獲得してください。
다시 도전|Try again|再次挑战|再挑戦
2분 완주!|2-minute round complete!|2分钟完成！|2分間完走！
다시 도전해볼까요?|Ready to try again?|再挑战一次吗？|もう一度挑戦しましょうか？
이번 판 점수와 시간은 0부터 다시 시작해요.|This round's score and time restart from zero.|本局分数和时间从零重新开始。|この回の点数と時間は0から再スタートします。
500점 달성! 선물 결과를 확인해주세요.|500 points reached! Check your gift result.|达到500分！请查看礼物结果。|500点達成！ギフトの結果をご確認ください。
500점에 도전! 다음 판에서 다시 만나요.|Aim for 500! Try another round.|挑战500分！下一局再试。|500点を目指して、次の回で再挑戦！
아로마 파워! 8초 무적|Aroma power! 8 seconds invincible|芳香力量！8秒无敌|アロマパワー！8秒間無敵
아로마 무적!|Aroma invincibility!|芳香无敌！|アロマ無敵！
한 판이 끝났어요. 기록을 저장하고 있어요.|Round finished. Saving your record.|本局结束，正在保存记录。|この回は終了。記録を保存しています。
이번 판은 끝! 점수와 시간은 초기화됐어요.|Round over! Score and time have reset.|本局结束！分数和时间已归零。|この回は終了！点数と時間はリセットされました。

랭킹에 사용할 닉네임|Your ranking nickname|排行榜昵称|ランキング用のニックネーム
닉네임 1~12자|Nickname: 1–12 characters|昵称1至12字|ニックネーム1～12文字
닉네임과 누적 점수는 랭킹에 공개됩니다.|Your nickname and cumulative score will be public on the leaderboard.|昵称与累计分数将公开在排行榜上。|ニックネームと累計スコアはランキングに公開されます。
누적 랭킹 TOP 20|All-time Top 20|累计排行榜前20名|累計ランキング TOP 20
누적 랭킹 1위에게 추후 10ml 향수 제공 예정!|A 10ml perfume gift is planned for the future all-time ranking winner!|计划为届时累计排行榜第一名提供10ml香水！|累計ランキング1位に、後日10mlの香水をプレゼント予定！
선정일과 지급 방법은 추후 안내합니다.|The selection date and gift details will be announced later.|评选日期与领取方式将另行通知。|選出日とお渡し方法は後日ご案内します。
내 누적 점수|My cumulative score|我的累计分数|自分の累計スコア
내 순위|My rank|我的排名|自分の順位
날짜가 바뀌어도 누적 점수는 유지돼요.|Your cumulative score carries over each day.|累计分数不会每天重置。|日付が変わっても累計スコアは続きます。
랭킹 새로고침|Refresh rankings|刷新排行榜|ランキングを更新
순위|Rank|排名|順位
누적 점수|Cumulative score|累计分数|累計スコア
서버가 검증한 점수만 합산합니다. 같은 브라우저 기준이며, 브라우저 데이터를 삭제하거나 다른 기기를 사용하면 기록이 분리됩니다. 기존에 이 브라우저로 플레이한 서버 기록도 닉네임 등록 시 합산돼요. 동점이면 해당 누적 점수를 먼저 달성한 순서로 정합니다.|Only server-verified points count, per browser. Clearing browser data or using another device creates a separate record. Earlier server-saved games from this browser are included when you register. Ties go to whoever reached the total first.|仅累计服务器验证的分数，以同一浏览器为准。清除浏览器数据或更换设备会产生独立记录。注册昵称时也会计入此浏览器以前保存在服务器上的游戏记录。同分时，先达到该分数者优先。|サーバーで検証した点数のみを同じブラウザ単位で合算します。ブラウザデータの削除や他の端末では記録が分かれます。登録時に同じブラウザの過去のサーバー記録も合算します。同点は先にその点数に達した順です。
게임을 시작하기 전에 닉네임을 1~12자로 적어주세요.|Enter a 1–12 character nickname before starting.|开始游戏前，请输入1至12字的昵称。|開始前にニックネームを1～12文字で入力してください。
첫 번째 누적 랭커를 기다려요.|Be the first to join the all-time rankings.|期待首位累计排行榜玩家。|最初の累計ランカーをお待ちしています。
랭킹을 불러오고 있어요…|Loading rankings…|正在加载排行榜…|ランキングを読み込んでいます…
공병 1단계 업그레이드 쿠폰|One-tier bottle upgrade voucher|空瓶升级一级券|ボトル1段階アップグレード券
공병 1단계 업그레이드 · 10%|One-tier bottle upgrade · 10%|空瓶升级一级 · 10%|ボトル1段階アップグレード・10%
연속 구출|Rescue combo|连续救助|連続救出
최고 기록|Personal best|最高纪录|ベスト記録
점프는 누르고, 향수는 가까이 왔을 때 톡!|Hold to jump; tap to spray when they're close!|按住跳跃，靠近时轻点喷香水！|ジャンプは長押し、香水は近づいたらタップ！
가까이서 칙! 퍼펙트 타이밍 보너스 · 5콤보마다 8초 피버로 향기 점수 2배!|Spray up close for perfect timing! Every 5-combo triggers 8 seconds of double-score fever.|近距离喷香水获得完美时机奖励！每5连击触发8秒双倍分数狂热！|近くでシュッ！絶妙なタイミングでボーナス。5コンボごとに8秒間スコア2倍！
안개 피버!|Mist fever!|香雾狂热！|ミストフィーバー！
5콤보! 향기 점수 2배|5-combo! Double scent score|5连击！香气分数翻倍|5コンボ！香りスコア2倍
보스 구출 성공!|Boss rescued!|首领救助成功！|ボス救出成功！
퍼펙트 타이밍!|Perfect timing!|完美时机！|パーフェクトタイミング！
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
1,000원 할인 · 20%|₩1,000 discount · 20%|减1000韩元 · 20%|1,000ウォン割引・20%
2,000원 할인 · 10%|₩2,000 discount · 10%|减2000韩元 · 10%|2,000ウォン割引・10%
3,000원 할인 · 5%|₩3,000 discount · 5%|减3000韩元 · 5%|3,000ウォン割引・5%
5ml 제공권 · 5%|5 ml voucher · 5%|5ml赠送券 · 5%|5mlプレゼント券・5%
3ml 제공권 · 10%|3 ml voucher · 10%|3ml赠送券 · 10%|3mlプレゼント券・10%
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

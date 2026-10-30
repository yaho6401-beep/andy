(function(g){const rows=`
연락처 더 보기|Load more contacts|查看更多联系方式|連絡先をさらに表示
최고의 사진을 찾아라!|Find the photo of the month!|寻找本月最佳照片！|今月のベストフォトを探そう！
매월 좋아요를 가장 많이 받은 사진 1명에게|Each month, the most-liked photo wins|每月点赞最多的照片获得|毎月、いいね最多の写真1名に
10ml 향수 · 15,000원 상당 제공|10ml perfume · worth ₩15,000|10ml香水 · 价值15,000韩元|10mlの香水・15,000ウォン相当をプレゼント
해당 월에 올린 이벤트 참여 사진의 월간 좋아요로 선정해요. 공동 1위는 추첨! 다음 달 관리자 확인 후 발표하며, 매장에서 수령해요.|Monthly likes on eligible photos uploaded that month decide the winner. Tied leaders enter a draw. Results are confirmed the following month; collect at the atelier.|按当月上传的参与照片的月度点赞数评选。并列第一时抽签！次月经管理员确认公布，到店领取。|当月投稿の参加写真の月間いいね数で選出。同率1位は抽選！翌月に管理者が確認・発表し、店舗でお渡しします。
회전판을 살짝 돌려보세요. 실제 선정은 월간 좋아요 기준이에요.|Give the wheel a spin. The actual winner is chosen by monthly likes.|转一下小转盘吧。实际评选以月度点赞数为准。|ルーレットを回してみて。実際の選出は月間いいね数で決まります。
하트가 모이면, 나의 사진이 이달의 주인공!|Gather hearts and your photo could be this month's star!|收集爱心，让你的照片成为本月主角！|ハートを集めて、あなたの写真を今月の主役に！
이벤트 회전판 돌려보기|Spin the event wheel|转动活动转盘|イベントのルーレットを回す
이번 달 인기 사진|This month's popular photos|本月人气照片|今月の人気写真
월간 당선자|Monthly winners|月度获奖者|月間当選者
월간 사진 이벤트 참여 · 선택|Join the monthly photo event · optional|参加月度照片活动 · 可选|月間フォトイベントに参加・任意
당선 연락용 휴대폰 번호|Mobile number for winner notification|获奖通知用手机号|当選連絡用の携帯番号
당선 안내를 위한 휴대폰 번호 수집·이용에 동의하며 이벤트에 참여합니다. 공개 화면에는 끝 4자리만 표시되고, 전체 번호는 관리자만 확인합니다. 사진 삭제 시 연락처도 삭제됩니다. 참여하지 않아도 사진을 올릴 수 있어요.|I agree to the collection and use of my mobile number for winner notification. Only the last four digits are public; administrators can see the full number. Deleting the photo also deletes its contact details. Participation is optional.|我同意收集和使用手机号以接收获奖通知。公开页面仅显示后四位，管理员可查看完整号码。删除照片时也会删除联系方式。不参加活动也可上传照片。|当選連絡のための携帯番号の収集・利用に同意して参加します。公開は下4桁のみで、全番号は管理者だけが確認できます。写真削除時に連絡先も削除されます。参加しなくても投稿できます。
사진 이벤트 관리자|Photo event administration|照片活动管理|フォトイベント管理
참여자 연락처 확인|View participant contacts|查看参与者联系方式|参加者の連絡先を確認
마감할 월|Month to finalize|结算月份|確定する月
해당 월 최다 좋아요 사진으로 확정합니다. 공동 1위는 추첨하며, 재추첨할 수 없습니다.|Confirm the most-liked photo for this month. Tied leaders are drawn once; results cannot be redrawn.|确认该月点赞最多的照片。并列第一时进行一次抽签，不可重新抽签。|当月のいいね最多の写真で確定します。同率1位は一度だけ抽選し、再抽選はできません。
월간 당선자 확정|Confirm monthly winner|确认月度获奖者|月間当選者を確定
참여자가 없습니다.|No participants yet.|暂无参与者。|参加者はまだいません。
확정 동의를 체크해주세요.|Please check the confirmation box.|请勾选确认框。|確認欄にチェックしてください。
이벤트 연락처를 확인해주세요.|Please check your event contact number.|请检查活动联系号码。|イベントの連絡先番号を確認してください。
지난달까지 마감할 수 있어요. 좋아요를 받은 참여 사진이 있어야 합니다.|Only completed months can be finalized, with at least one liked eligible photo.|只能结算已结束的月份，且须有获得点赞的参与照片。|終了した月のみ確定でき、いいねのある参加写真が必要です。
`.trim().split('\n');for(const row of rows){const [ko,en,zh,ja]=row.split('|');g.ScentLocaleData[ko]={en,zh,ja};}})(globalThis);

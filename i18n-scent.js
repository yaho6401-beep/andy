(function(g){
  const rows=`
코멘트 · 노트|Comments & notes|点评与香调|コメント・ノート
단일향 더하기 ↓|Add single notes ↓|添加单香 ↓|単香を追加 ↓
이 향의 이야기|Stories of this scent|这款香气的故事|この香りのストーリー
이 향 좋아요|Like this scent|喜欢这款香气|この香りが好き
좋아요|Like|点赞|いいね
사장님|Owner|店主|オーナー
매니저|Manager|店长|マネージャー
공식 코멘트|Atelier comment|工坊点评|工房のコメント
사장님과 매니저의 코멘트를 기다리고 있어요.|Our owner and manager will share their thoughts here.|店主与店长的点评将在这里显示。|オーナーやマネージャーのコメントをお待ちください。
사장·매니저 코멘트 작성|Write as owner or manager|店主或店长写点评|オーナー・マネージャーのコメント作成
공식 코멘트 작성 · 수정|Write or edit an atelier comment|撰写或修改工坊点评|工房コメントの作成・編集
작성자|Author|作者|投稿者
이 향의 매력이나 추천 포인트를 남겨주세요.|Share this scent's appeal and your recommendations.|写下这款香气的魅力与推荐理由。|この香りの魅力やおすすめのポイントをどうぞ。
공식 코멘트는 역할별로 하나씩 상단에 고정돼요. 최대 500자.|One pinned comment per role, up to 500 characters.|每种身份可置顶一条点评，最多500字。|役割ごとに1件を上部に固定します。500文字まで。
코멘트 저장|Save comment|保存点评|コメントを保存
고객 시향 소감|Visitors' scent impressions|顾客试香感受|お客様の試香レビュー
이 향에 대한 첫 소감을 남겨주세요.|Share the first impression of this scent.|来分享这款香气的第一条感受吧。|この香りの最初の感想を投稿してください。
내 소감 삭제|Delete my impression|删除我的感受|自分の感想を削除
나의 시향 소감|My scent impression|我的试香感受|自分の試香レビュー
직접 맡아본 느낌이나 떠오르는 장면을 남겨주세요.|Share how it smelled to you or a scene it brought to mind.|分享亲自闻过的感受，或香气让你想起的画面。|実際に嗅いだ感想や、思い浮かんだ情景をどうぞ。
내 소감 삭제용 비밀번호|Password to delete your impression|删除感受的密码|感想の削除用パスワード
소감은 300자 이내로, 비밀번호는 4~64자로 설정해주세요.|Up to 300 characters; set a password of 4–64 characters.|感受最多300字，密码为4至64位。|感想は300文字以内、パスワードは4〜64文字で設定してください。
소감 남기기|Share impression|发布感受|感想を投稿
소감을 불러오고 있어요.|Loading scent impressions.|正在加载试香感受。|感想を読み込んでいます。
공식 코멘트를 저장했어요.|Atelier comment saved.|工坊点评已保存。|工房のコメントを保存しました。
시향 소감을 남겼어요.|Your scent impression has been posted.|试香感受已发布。|試香レビューを投稿しました。
공식 코멘트는 500자 이내로 적어주세요.|Use up to 500 characters for an atelier comment.|工坊点评请控制在500字以内。|工房のコメントは500文字以内で入力してください。
닉네임은 20자, 소감은 300자 이내로 적어주세요.|Use up to 20 characters for your name and 300 for your impression.|昵称限20字，感受限300字。|ニックネームは20文字、感想は300文字以内で入力してください。
공식 코멘트 관리자 로그인|Atelier comment admin login|工坊点评管理员登录|工房コメントの管理者ログイン
로그인 창 닫기|Close login dialog|关闭登录窗口|ログイン画面を閉じる
로그인|Log in|登录|ログイン
코멘트 · 소감 삭제|Delete comment or impression|删除点评或感受|コメント・感想を削除
이 글을 삭제할까요?|Delete this post?|要删除这条内容吗？|この投稿を削除しますか？
향 소감과 연결하지 못했어요. 잠시 후 다시 시도해주세요.|Could not load scent impressions. Please try again shortly.|暂时无法连接试香感受，请稍后再试。|香りの感想に接続できません。しばらくしてからお試しください。
향과 페이지를 확인해주세요.|Please check the scent and page.|请检查香气与页码。|香りとページを確認してください。
향을 확인해주세요.|Please check the scent.|请检查香气。|香りを確認してください。
내용을 확인해주세요.|Please check your post.|请检查内容。|内容を確認してください。
작성자 역할을 확인해주세요.|Please check the author role.|请检查作者身份。|投稿者の役割を確認してください。
삭제된 코멘트예요.|This comment has been deleted.|这条点评已被删除。|このコメントは削除されました。
소감을 확인해주세요.|Please check the impression.|请检查感受。|感想を確認してください。
삭제된 소감이에요.|This impression has been deleted.|这条感受已被删除。|この感想は削除されました。
소감이 많아요. 잠시 후 다시 남겨주세요.|Please wait a little before posting more impressions.|感受发布过于频繁，请稍后再试。|感想の投稿が続いています。しばらくしてからお試しください。
이미 등록된 소감이에요. 새로고침해 확인해주세요.|This impression was already posted. Refresh to check.|这条感受已发布，请刷新查看。|この感想はすでに投稿されています。再読み込みしてご確認ください。
`.trim().split('\n');
  for(const row of rows){const [ko,en,zh,ja]=row.split('|');g.ScentLocaleData[ko]={en,zh,ja};}
})(globalThis);

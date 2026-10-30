(function(g){
  const rows=`
나중에 이 글을 수정하거나 삭제할 때 사용해요|Use this to edit or delete your note later.|以后修改或删除留言时使用。|あとでメモを編集・削除するときに使います。
어떤 방식으로 나만의 향을 찾아볼까요?|How would you like to find your scent?|想用哪种方式寻找专属香气？|どの方法で自分の香りを探しますか？
향 찾기 방법 선택|Choose how to find your scent|选择寻香方式|香りの探し方を選択
오늘의 마음과 순간을 향으로|Turn today's feelings into scent|把今天的心情化为香气|今日の気持ちと瞬間を香りに
나의 취향과 분위기에 맞춰|Match your taste and mood|匹配你的喜好与气质|好みと雰囲気に合わせて
메인향 하나에 나만의 포인트를|One main scent, your personal touch|一款主香，加上专属点缀|ひとつのメインに自分らしさを
다른 방법으로 찾기 ↑|Choose another way ↑|换一种方式 ↑|別の方法で探す ↑
쥐|Rat|鼠|ねずみ
소|Ox|牛|うし
호랑이|Tiger|虎|とら
토끼|Rabbit|兔|うさぎ
용|Dragon|龙|りゅう
뱀|Snake|蛇|へび
말|Horse|马|うま
양|Goat|羊|ひつじ
원숭이|Monkey|猴|さる
닭|Rooster|鸡|とり
개|Dog|狗|いぬ
돼지|Pig|猪|いのしし
동물 친구를 골라주세요|Choose an animal friend|选择动物伙伴|動物の仲間を選んでください
내 글 수정·삭제용 비밀번호|Password to edit or delete your note|修改或删除留言的密码|メモの編集・削除用パスワード
글 삭제|Delete note|删除留言|メモを削除
내 향기 메모 삭제|Delete my scent note|删除我的香气留言|自分の香りメモを削除
삭제 창 닫기|Close delete dialog|关闭删除窗口|削除画面を閉じる
이 메모와 연결된 댓글·하트도 함께 삭제됩니다.|Comments and hearts on this note will also be deleted.|该留言的评论和爱心也会一起删除。|このメモのコメントとハートも削除されます。
내 메모 삭제|Delete my note|删除我的留言|自分のメモを削除
우리의 향수 갤러리|Our perfume gallery|我们的香水相册|みんなの香水ギャラリー
공방에서 완성한 나만의 향수와 그날의 순간을 남겨주세요.|Share your handmade perfume and the moment you created it.|分享在工坊完成的专属香水和当天的瞬间。|工房で作った自分だけの香水と、その日の思い出を残してください。
사진 올리기 ＋|Upload a photo ＋|上传照片 ＋|写真を投稿 ＋
완성한 향수 사진|Photo of your finished perfume|完成的香水照片|完成した香水の写真
JPG·PNG·WEBP · 사진은 자동으로 크기를 줄여 저장해요.|JPG, PNG or WEBP · Photos are resized automatically.|JPG、PNG、WEBP · 照片会自动缩小后保存。|JPG・PNG・WEBP · 写真は自動で縮小して保存します。
올릴 사진 미리보기|Photo preview|照片预览|投稿する写真のプレビュー
사진에 담긴 이야기|The story behind your photo|照片中的故事|写真に込めたストーリー
나의 향수에 담은 이야기를 짧게 남겨주세요.|Tell us a little about your perfume.|简单写下香水中的故事。|香水に込めたストーリーをひと言で。
내 사진 삭제용 비밀번호|Password to delete your photo|删除照片的密码|写真の削除用パスワード
직접 촬영한 사진이며, 공개 갤러리에 올리는 데 동의합니다.|I took this photo and agree to publish it in the public gallery.|这是我拍摄的照片，我同意将其发布到公开相册。|自分で撮影した写真で、公開ギャラリーへの掲載に同意します。
내 향수 사진 남기기|Share my perfume photo|分享我的香水照片|自分の香水写真を投稿
공방에서 만든 첫 향수 사진을 남겨주세요.|Be the first to share a perfume made at our atelier.|来分享第一张在工坊制作的香水照片吧。|工房で作った香水の写真を最初に投稿してみませんか。
사진 크게 보기|View larger photo|查看大图|写真を大きく見る
관리자 삭제|Delete as admin|管理员删除|管理者として削除
내 사진 삭제|Delete my photo|删除我的照片|自分の写真を削除
사진 닫기|Close photo|关闭照片|写真を閉じる
갤러리 사진 삭제|Delete gallery photo|删除相册照片|ギャラリーの写真を削除
이 사진을 갤러리에서 삭제할까요?|Delete this photo from the gallery?|要从相册中删除这张照片吗？|この写真をギャラリーから削除しますか？
사진 등록 시 설정한 비밀번호|Password set when uploading|上传时设置的密码|投稿時に設定したパスワード
이전|Previous|上一页|前へ
다음|Next|下一页|次へ
사진 삭제|Delete photo|删除照片|写真を削除
20MB 이하의 사진을 선택해주세요.|Choose a photo smaller than 20 MB.|请选择20MB以下的照片。|20MB以下の写真を選んでください。
사진을 읽지 못했어요. JPG·PNG·WEBP 사진을 선택해주세요.|Could not read this photo. Choose JPG, PNG or WEBP.|无法读取照片，请选择JPG、PNG或WEBP格式。|写真を読み込めません。JPG・PNG・WEBPを選んでください。
사진 파일을 선택해주세요.|Choose a photo file.|请选择照片文件。|写真ファイルを選んでください。
닉네임은 20자, 설명은 100자 이내로 적어주세요.|Use up to 20 characters for your name and 100 for the caption.|昵称限20字，说明限100字。|ニックネームは20文字、説明は100文字以内で入力してください。
삭제용 비밀번호를 4~64자로 설정해주세요.|Set a deletion password of 4–64 characters.|请设置4至64位的删除密码。|削除用パスワードは4〜64文字で設定してください。
공개 갤러리 등록에 동의해주세요.|Please agree to publish in the public gallery.|请同意发布到公开相册。|公開ギャラリーへの掲載に同意してください。
사진을 올리고 있어요…|Uploading your photo…|正在上传照片…|写真を投稿しています…
향수 사진을 갤러리에 남겼어요.|Your perfume photo is now in the gallery.|香水照片已发布到相册。|香水の写真をギャラリーに投稿しました。
사진을 삭제했어요.|Photo deleted.|照片已删除。|写真を削除しました。
갤러리와 연결하지 못했어요. 잠시 후 다시 시도해주세요.|Could not connect to the gallery. Please try again shortly.|暂时无法连接相册，请稍后再试。|ギャラリーに接続できません。しばらくしてからお試しください。
시도가 많아요. 잠시 후 다시 시도해주세요.|Too many attempts. Please try again shortly.|尝试次数过多，请稍后再试。|試行回数が多いため、しばらくしてからお試しください。
사진을 많이 올렸어요. 잠시 후 다시 올려주세요.|Please wait a little before uploading more photos.|上传照片过多，请稍后再上传。|写真の投稿が続いています。しばらくしてからお試しください。
사진 용량은 3MB 이하여야 해요.|The processed photo must be 3 MB or smaller.|处理后的照片须小于3MB。|保存する写真は3MB以下にしてください。
JPG 사진 파일을 확인해주세요.|Please check the JPG photo file.|请检查JPG照片文件。|JPG写真ファイルを確認してください。
사진을 확인해주세요.|Please check the photo.|请检查照片。|写真を確認してください。
삭제된 사진이에요.|This photo has been deleted.|照片已被删除。|この写真は削除されました。
삭제 시도가 많아요. 15분 후 다시 시도해주세요.|Too many deletion attempts. Try again in 15 minutes.|删除尝试过多，请15分钟后再试。|削除の試行回数が多いため、15分後にお試しください。
`.trim().split('\n');
  for(const row of rows){const [ko,en,zh,ja]=row.split('|');g.ScentLocaleData[ko]={en,zh,ja};}
})(globalThis);

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen, Brain, FileText, ChevronRight, ChevronLeft,
  Star, Check, X, Clock, Trophy, RotateCcw, Play,
  Volume2, Headphones, BookMarked, Filter, Search,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  ListOrdered, Layers,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
//  DATA — VOCAB & GRAMMAR by TOPIK level
// ═══════════════════════════════════════════════════════════════════
const TOPIK_LEVELS = [
  { level: 1, label: "Level 1", badge: "TOPIK I", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)" },
  { level: 2, label: "Level 2", badge: "TOPIK I", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)" },
  { level: 3, label: "Level 3", badge: "TOPIK II", color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.3)" },
  { level: 4, label: "Level 4", badge: "TOPIK II", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)" },
  { level: 5, label: "Level 5", badge: "TOPIK II", color: "#ec4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.3)" },
  { level: 6, label: "Level 6", badge: "TOPIK II", color: "#dc2626", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.3)" },
];

const VOCAB_DATA = {
  1: [
    { word: "학교", meaning: "Trường học", hanja: "學校", example: "저는 학교에 갑니다.", exTrans: "Tôi đến trường." },
    { word: "선생님", meaning: "Giáo viên", hanja: "", example: "선생님은 친절합니다.", exTrans: "Giáo viên rất tử tế." },
    { word: "친구", meaning: "Bạn bè", hanja: "親舊", example: "친구와 밥을 먹습니다.", exTrans: "Tôi ăn cơm với bạn." },
    { word: "물", meaning: "Nước", hanja: "", example: "물을 마시고 싶어요.", exTrans: "Tôi muốn uống nước." },
    { word: "밥", meaning: "Cơm / Bữa ăn", hanja: "", example: "밥을 먹었어요?", exTrans: "Bạn đã ăn cơm chưa?" },
    { word: "집", meaning: "Nhà", hanja: "", example: "집에 가고 싶어요.", exTrans: "Tôi muốn về nhà." },
    { word: "책", meaning: "Sách", hanja: "", example: "책을 읽어요.", exTrans: "Tôi đọc sách." },
    { word: "가방", meaning: "Túi xách", hanja: "", example: "가방이 무거워요.", exTrans: "Túi nặng quá." },
    { word: "사과", meaning: "Quả táo", hanja: "", example: "사과를 좋아해요.", exTrans: "Tôi thích ăn táo." },
    { word: "오늘", meaning: "Hôm nay", hanja: "", example: "오늘은 날씨가 좋아요.", exTrans: "Hôm nay thời tiết đẹp." },
    { word: "어제", meaning: "Hôm qua", hanja: "", example: "어제 뭐 했어요?", exTrans: "Hôm qua bạn làm gì?" },
    { word: "내일", meaning: "Ngày mai", hanja: "", example: "내일 만나요.", exTrans: "Ngày mai gặp nhé." },
  ],
  2: [
    { word: "생일", meaning: "Sinh nhật", hanja: "生日", example: "오늘은 제 생일이에요.", exTrans: "Hôm nay là sinh nhật của tôi." },
    { word: "날씨", meaning: "Thời tiết", hanja: "", example: "날씨가 많이 추워요.", exTrans: "Thời tiết lạnh lắm." },
    { word: "여행", meaning: "Du lịch", hanja: "旅行", example: "여행을 좋아해요.", exTrans: "Tôi thích du lịch." },
    { word: "음식", meaning: "Thức ăn", hanja: "飮食", example: "한국 음식이 맛있어요.", exTrans: "Đồ ăn Hàn Quốc ngon lắm." },
    { word: "병원", meaning: "Bệnh viện", hanja: "病院", example: "병원에 가야 해요.", exTrans: "Tôi cần đến bệnh viện." },
    { word: "약국", meaning: "Hiệu thuốc", hanja: "藥局", example: "약국이 어디예요?", exTrans: "Hiệu thuốc ở đâu?" },
    { word: "편의점", meaning: "Cửa hàng tiện lợi", hanja: "", example: "편의점에서 샀어요.", exTrans: "Tôi mua ở cửa hàng tiện lợi." },
    { word: "지하철", meaning: "Tàu điện ngầm", hanja: "地下鐵", example: "지하철을 타요.", exTrans: "Tôi đi tàu điện ngầm." },
    { word: "버스", meaning: "Xe buýt", hanja: "", example: "버스로 가요.", exTrans: "Tôi đi bằng xe buýt." },
    { word: "주말", meaning: "Cuối tuần", hanja: "週末", example: "주말에 뭐 해요?", exTrans: "Cuối tuần bạn làm gì?" },
    { word: "취미", meaning: "Sở thích", hanja: "趣味", example: "취미가 뭐예요?", exTrans: "Sở thích của bạn là gì?" },
    { word: "운동", meaning: "Tập thể dục / Thể thao", hanja: "運動", example: "매일 운동해요.", exTrans: "Tôi tập thể dục mỗi ngày." },
  ],
  3: [
    { word: "경험", meaning: "Kinh nghiệm", hanja: "經驗", example: "많은 경험이 필요해요.", exTrans: "Cần nhiều kinh nghiệm." },
    { word: "계획", meaning: "Kế hoạch", hanja: "計劃", example: "계획을 세웠어요.", exTrans: "Tôi đã lập kế hoạch." },
    { word: "관계", meaning: "Quan hệ / Mối quan hệ", hanja: "關係", example: "좋은 관계를 유지해요.", exTrans: "Duy trì mối quan hệ tốt." },
    { word: "기회", meaning: "Cơ hội", hanja: "機會", example: "좋은 기회가 왔어요.", exTrans: "Cơ hội tốt đã đến." },
    { word: "노력", meaning: "Nỗ lực", hanja: "努力", example: "노력하면 성공할 수 있어요.", exTrans: "Nếu cố gắng thì có thể thành công." },
    { word: "목표", meaning: "Mục tiêu", hanja: "目標", example: "목표를 정해야 해요.", exTrans: "Cần xác định mục tiêu." },
    { word: "방법", meaning: "Phương pháp", hanja: "方法", example: "좋은 방법을 찾았어요.", exTrans: "Tôi đã tìm được phương pháp hay." },
    { word: "사회", meaning: "Xã hội", hanja: "社會", example: "사회 문제가 많아요.", exTrans: "Có nhiều vấn đề xã hội." },
    { word: "성격", meaning: "Tính cách", hanja: "性格", example: "그는 좋은 성격이에요.", exTrans: "Anh ấy có tính cách tốt." },
    { word: "약속", meaning: "Hẹn hò / Lời hứa", hanja: "約束", example: "약속을 지켜야 해요.", exTrans: "Phải giữ lời hứa." },
    { word: "의견", meaning: "Ý kiến", hanja: "意見", example: "의견을 말해 주세요.", exTrans: "Hãy nói ý kiến của bạn." },
    { word: "준비", meaning: "Chuẩn bị", hanja: "準備", example: "시험을 준비하고 있어요.", exTrans: "Tôi đang chuẩn bị cho kỳ thi." },
  ],
  4: [
    { word: "갈등", meaning: "Xung đột / Mâu thuẫn", hanja: "葛藤", example: "갈등을 해결해야 해요.", exTrans: "Cần giải quyết mâu thuẫn." },
    { word: "경제", meaning: "Kinh tế", hanja: "經濟", example: "경제가 좋아지고 있어요.", exTrans: "Kinh tế đang khá lên." },
    { word: "공통점", meaning: "Điểm chung", hanja: "共通點", example: "공통점이 많아요.", exTrans: "Có nhiều điểm chung." },
    { word: "문화", meaning: "Văn hóa", hanja: "文化", example: "문화 차이가 있어요.", exTrans: "Có sự khác biệt văn hóa." },
    { word: "발전", meaning: "Phát triển", hanja: "發展", example: "기술이 발전했어요.", exTrans: "Công nghệ đã phát triển." },
    { word: "비교", meaning: "So sánh", hanja: "比較", example: "두 가지를 비교해요.", exTrans: "So sánh hai thứ." },
    { word: "상황", meaning: "Tình huống", hanja: "狀況", example: "상황이 나빠졌어요.", exTrans: "Tình huống trở nên xấu hơn." },
    { word: "영향", meaning: "Ảnh hưởng", hanja: "影響", example: "좋은 영향을 줘요.", exTrans: "Gây ảnh hưởng tích cực." },
    { word: "원인", meaning: "Nguyên nhân", hanja: "原因", example: "원인을 찾아야 해요.", exTrans: "Cần tìm nguyên nhân." },
    { word: "주장", meaning: "Chủ trương / Lập luận", hanja: "主張", example: "자신의 주장을 밝혀요.", exTrans: "Nêu rõ lập luận của mình." },
    { word: "환경", meaning: "Môi trường", hanja: "環境", example: "환경을 보호해야 해요.", exTrans: "Cần bảo vệ môi trường." },
    { word: "효과", meaning: "Hiệu quả", hanja: "效果", example: "효과가 있어요.", exTrans: "Có hiệu quả." },
  ],
  5: [
    { word: "논리", meaning: "Logic / Lý luận", hanja: "論理", example: "논리적으로 설명해요.", exTrans: "Giải thích một cách logic." },
    { word: "다양성", meaning: "Sự đa dạng", hanja: "多樣性", example: "문화적 다양성이 중요해요.", exTrans: "Sự đa dạng văn hóa rất quan trọng." },
    { word: "맥락", meaning: "Ngữ cảnh / Bối cảnh", hanja: "脈絡", example: "맥락을 파악해야 해요.", exTrans: "Cần nắm bắt bối cảnh." },
    { word: "본질", meaning: "Bản chất", hanja: "本質", example: "문제의 본질을 알아야 해요.", exTrans: "Cần hiểu bản chất vấn đề." },
    { word: "상징", meaning: "Biểu tượng", hanja: "象徵", example: "이것은 평화의 상징이에요.", exTrans: "Đây là biểu tượng của hòa bình." },
    { word: "역할", meaning: "Vai trò", hanja: "役割", example: "중요한 역할을 해요.", exTrans: "Đóng vai trò quan trọng." },
    { word: "인식", meaning: "Nhận thức", hanja: "認識", example: "문제를 인식해야 해요.", exTrans: "Cần nhận thức được vấn đề." },
    { word: "전망", meaning: "Triển vọng", hanja: "展望", example: "미래 전망이 밝아요.", exTrans: "Triển vọng tương lai sáng sủa." },
    { word: "정체성", meaning: "Bản sắc / Danh tính", hanja: "正體性", example: "정체성을 확립해야 해요.", exTrans: "Cần xây dựng bản sắc." },
    { word: "추구", meaning: "Theo đuổi / Truy cầu", hanja: "追求", example: "행복을 추구해요.", exTrans: "Theo đuổi hạnh phúc." },
    { word: "통찰", meaning: "Thấu hiểu / Sâu sắc", hanja: "洞察", example: "통찰력이 있는 사람이에요.", exTrans: "Đây là người có sự thấu hiểu sâu sắc." },
    { word: "현상", meaning: "Hiện tượng", hanja: "現象", example: "사회적 현상이에요.", exTrans: "Đây là hiện tượng xã hội." },
  ],
  6: [
    { word: "간과", meaning: "Bỏ qua / Xem nhẹ", hanja: "看過", example: "중요한 부분을 간과했어요.", exTrans: "Đã bỏ qua phần quan trọng." },
    { word: "귀납", meaning: "Quy nạp", hanja: "歸納", example: "귀납적 추론을 해요.", exTrans: "Suy luận quy nạp." },
    { word: "내재", meaning: "Nội tại / Ẩn chứa", hanja: "內在", example: "내재된 문제가 있어요.", exTrans: "Có vấn đề ẩn chứa bên trong." },
    { word: "담론", meaning: "Luận đàm / Diễn ngôn", hanja: "談論", example: "사회적 담론이 필요해요.", exTrans: "Cần có luận đàm xã hội." },
    { word: "모순", meaning: "Mâu thuẫn / Nghịch lý", hanja: "矛盾", example: "논리적 모순이 있어요.", exTrans: "Có mâu thuẫn logic." },
    { word: "변증법", meaning: "Biện chứng pháp", hanja: "辯證法", example: "변증법적 사고가 필요해요.", exTrans: "Cần tư duy biện chứng." },
    { word: "성찰", meaning: "Tự suy xét / Phản tỉnh", hanja: "省察", example: "자기 성찰이 중요해요.", exTrans: "Tự suy xét bản thân rất quan trọng." },
    { word: "양면성", meaning: "Tính hai mặt", hanja: "兩面性", example: "기술의 양면성을 알아야 해요.", exTrans: "Cần hiểu tính hai mặt của công nghệ." },
    { word: "잠재력", meaning: "Tiềm năng", hanja: "潛在力", example: "잠재력을 발휘해요.", exTrans: "Phát huy tiềm năng." },
    { word: "패러다임", meaning: "Mô thức / Paradigm", hanja: "", example: "새로운 패러다임이 필요해요.", exTrans: "Cần một mô thức mới." },
    { word: "함의", meaning: "Hàm ý / Ý nghĩa ẩn", hanja: "含意", example: "이 말의 함의가 뭐예요?", exTrans: "Hàm ý của câu này là gì?" },
    { word: "형이상학", meaning: "Siêu hình học", hanja: "形而上學", example: "형이상학적 질문이에요.", exTrans: "Đây là câu hỏi siêu hình học." },
  ],
};

const GRAMMAR_DATA = {
  1: [
    { pattern: "-이에요/예요", meaning: "Là... (thì hiện tại)", example: "저는 학생이에요.", exTrans: "Tôi là học sinh.", usage: "Dùng sau danh từ để diễn đạt 'là'. Sau phụ âm: -이에요, sau nguyên âm: -예요." },
    { pattern: "-(으)세요", meaning: "Mệnh lệnh/đề nghị lịch sự", example: "앉으세요.", exTrans: "Mời ngồi.", usage: "Dùng để đưa ra yêu cầu hoặc mời một cách lịch sự." },
    { pattern: "-(으)ㄹ 거예요", meaning: "Kế hoạch / Ý định tương lai", example: "내일 갈 거예요.", exTrans: "Ngày mai tôi sẽ đi.", usage: "Diễn đạt kế hoạch hoặc dự đoán về tương lai." },
    { pattern: "-고 싶어요", meaning: "Muốn làm gì", example: "한국에 가고 싶어요.", exTrans: "Tôi muốn đến Hàn Quốc.", usage: "Bày tỏ mong muốn của chủ thể đối với hành động." },
    { pattern: "-(으)ㄹ 수 있어요", meaning: "Có thể / Biết làm gì", example: "수영할 수 있어요.", exTrans: "Tôi có thể bơi.", usage: "Diễn đạt khả năng thực hiện hành động." },
    { pattern: "-지 않아요", meaning: "Phủ định hành động", example: "저는 고기를 먹지 않아요.", exTrans: "Tôi không ăn thịt.", usage: "Phủ định động từ. Lịch sự hơn '안'." },
  ],
  2: [
    { pattern: "-(으)면", meaning: "Nếu... thì...", example: "비가 오면 집에 있을 거예요.", exTrans: "Nếu trời mưa tôi sẽ ở nhà.", usage: "Điều kiện. Nếu vế trước xảy ra thì vế sau sẽ xảy ra." },
    { pattern: "-아/어서", meaning: "Vì... nên... (nguyên nhân)", example: "배가 고파서 밥을 먹었어요.", exTrans: "Vì đói nên tôi ăn cơm.", usage: "Nối nguyên nhân và kết quả. Không dùng được với mệnh lệnh." },
    { pattern: "-기 때문에", meaning: "Vì lý do... (giải thích)", example: "바쁘기 때문에 못 가요.", exTrans: "Vì bận nên không đi được.", usage: "Giải thích lý do, dùng được với danh từ+이기 때문에." },
    { pattern: "-(으)려고", meaning: "Có ý định / Để làm gì", example: "한국어를 배우려고 해요.", exTrans: "Tôi định học tiếng Hàn.", usage: "Diễn đạt mục đích hoặc ý định của hành động." },
    { pattern: "-(으)ㄴ 후에", meaning: "Sau khi...", example: "밥을 먹은 후에 운동해요.", exTrans: "Sau khi ăn cơm tôi tập thể dục.", usage: "Diễn đạt thứ tự: hành động trước → sau." },
    { pattern: "-는 동안", meaning: "Trong khi / Trong suốt", example: "공부하는 동안 음악을 들어요.", exTrans: "Trong khi học tôi nghe nhạc.", usage: "Hai hành động diễn ra đồng thời." },
  ],
  3: [
    { pattern: "-(으)ㄴ/는 것 같다", meaning: "Có vẻ như / Dường như", example: "그는 피곤한 것 같아요.", exTrans: "Có vẻ như anh ấy mệt.", usage: "Suy đoán dựa trên quan sát hoặc bằng chứng gián tiếp." },
    { pattern: "-도록", meaning: "Để cho / Đến mức", example: "밤새도록 공부했어요.", exTrans: "Tôi học suốt đêm.", usage: "Diễn đạt mục đích hoặc kết quả của mức độ." },
    { pattern: "-(으)ㄹ 뿐만 아니라", meaning: "Không chỉ... mà còn...", example: "그는 똑똑할 뿐만 아니라 친절해요.", exTrans: "Anh ấy không chỉ thông minh mà còn tốt bụng.", usage: "Thêm thông tin bổ sung, tương đương 'moreover'." },
    { pattern: "-았/었더라면", meaning: "Giá mà... (giả định quá khứ)", example: "더 열심히 했더라면 좋았을 텐데.", exTrans: "Giá mà tôi đã cố gắng hơn thì tốt.", usage: "Diễn đạt điều ước về quá khứ không thể thay đổi." },
    { pattern: "-에 비해(서)", meaning: "So với / So sánh với", example: "작년에 비해 실력이 늘었어요.", exTrans: "So với năm ngoái, kỹ năng đã tăng lên.", usage: "So sánh hai đối tượng hoặc thời điểm." },
    { pattern: "-(으)ㄹ수록", meaning: "Càng... càng...", example: "공부할수록 어려워져요.", exTrans: "Càng học càng khó.", usage: "Diễn đạt mối tương quan tăng dần." },
  ],
  4: [
    { pattern: "-에 따르면", meaning: "Theo như...", example: "뉴스에 따르면 내일 비가 온대요.", exTrans: "Theo tin tức, ngày mai sẽ có mưa.", usage: "Trích dẫn nguồn thông tin." },
    { pattern: "-(으)ㄹ 리가 없다", meaning: "Không thể nào... (phủ định khả năng)", example: "그가 거짓말을 할 리가 없어요.", exTrans: "Không thể nào anh ấy lại nói dối.", usage: "Bác bỏ một khả năng dựa trên lý luận." },
    { pattern: "-는 반면(에)", meaning: "Trong khi đó / Ngược lại", example: "한국은 덥는 반면에 영국은 추워요.", exTrans: "Hàn Quốc nóng trong khi Anh lại lạnh.", usage: "Đối lập hai tình huống trái ngược nhau." },
    { pattern: "-(으)로 인해(서)", meaning: "Do / Vì (nguyên nhân trang trọng)", example: "교통사고로 인해 길이 막혔어요.", exTrans: "Do tai nạn giao thông, đường bị tắc.", usage: "Văn phong trang trọng hơn -때문에." },
    { pattern: "-고자", meaning: "Nhằm / Với mục đích (văn viết)", example: "더 알리고자 이 글을 씁니다.", exTrans: "Tôi viết bài này nhằm thông tin rộng rãi hơn.", usage: "Văn viết trang trọng, diễn đạt mục đích." },
    { pattern: "-(으)ㄹ 수밖에 없다", meaning: "Không còn cách nào khác ngoài...", example: "버스가 없어서 걸을 수밖에 없었어요.", exTrans: "Vì không có xe buýt nên đành phải đi bộ.", usage: "Diễn đạt sự bất khả kháng." },
  ],
  5: [
    { pattern: "-을/를 통해(서)", meaning: "Thông qua / Qua", example: "경험을 통해 배웁니다.", exTrans: "Học hỏi qua kinh nghiệm.", usage: "Diễn đạt phương tiện hoặc quá trình." },
    { pattern: "-(으)ㄴ/는 한", meaning: "Chừng nào còn / Miễn là", example: "살아있는 한 희망이 있어요.", exTrans: "Chừng nào còn sống thì còn hy vọng.", usage: "Điều kiện kéo dài theo thời gian." },
    { pattern: "-을/를 비롯해(서)", meaning: "Kể cả / Bắt đầu từ", example: "서울을 비롯해 주요 도시에서 열렸어요.", exTrans: "Được tổ chức ở Seoul và các thành phố lớn.", usage: "Liệt kê với ví dụ tiêu biểu đứng đầu." },
    { pattern: "-(으)ㄹ 따름이다", meaning: "Chỉ... mà thôi (văn viết)", example: "최선을 다할 따름입니다.", exTrans: "Tôi chỉ có thể cố gắng hết sức mà thôi.", usage: "Nhấn mạnh giới hạn hoặc sự quyết tâm." },
    { pattern: "-에 불과하다", meaning: "Chỉ là / Chẳng qua là", example: "이건 시작에 불과해요.", exTrans: "Đây chỉ là bước khởi đầu thôi.", usage: "Nhấn mạnh mức độ nhỏ hoặc tầm quan trọng thấp." },
    { pattern: "-(으)ㄴ/는 셈이다", meaning: "Coi như / Xem như", example: "절반은 한 셈이에요.", exTrans: "Xem như đã làm được một nửa.", usage: "Diễn đạt kết quả hoặc tình trạng hiện tại một cách ước lượng." },
  ],
  6: [
    { pattern: "-건대", meaning: "Theo ý tôi / Tôi tin rằng (văn nói trang trọng)", example: "생각건대 이 방법이 최선입니다.", exTrans: "Theo tôi, đây là phương pháp tốt nhất.", usage: "Rút gọn của -기로 하건대, thường gặp trong văn viết học thuật." },
    { pattern: "-(으)ㄹ진대", meaning: "Nếu đã... thì (văn cổ/thơ)", example: "그렇게 할진대 결과를 감수해야지.", exTrans: "Nếu đã làm vậy thì phải chịu kết quả.", usage: "Văn phong cổ điển, thường gặp trong văn học." },
    { pattern: "-노라면", meaning: "Trong lúc... / Khi mà...", example: "연습하노라면 실력이 늘어요.", exTrans: "Trong lúc luyện tập, kỹ năng tăng lên.", usage: "Diễn đạt hành động liên tục dẫn đến kết quả." },
    { pattern: "-(으)ㄹ망정", meaning: "Dù... nhưng (chấp nhận nhượng bộ)", example: "가난할망정 자존심은 있어요.", exTrans: "Dù nghèo nhưng vẫn có lòng tự trọng.", usage: "Nhượng bộ một điểm, nhấn mạnh điều quan trọng hơn." },
    { pattern: "-다시피", meaning: "Như... vậy / Như ta thấy", example: "아시다시피 상황이 좋지 않아요.", exTrans: "Như bạn đã biết, tình hình không tốt.", usage: "Kêu gọi kiến thức chung giữa người nói và người nghe." },
    { pattern: "-(으)ㄹ 나름이다", meaning: "Tùy theo / Phụ thuộc vào", example: "행복은 생각할 나름이에요.", exTrans: "Hạnh phúc tùy theo cách nghĩ.", usage: "Nhấn mạnh sự phụ thuộc vào cá nhân hoặc hoàn cảnh." },
  ],
};

// ═══════════════════════════════════════════════════════════════════
//  MOCK TEST DATA
// ═══════════════════════════════════════════════════════════════════
const MOCK_TESTS = {
  "topik1": {
    title: "TOPIK I — Đề thử số 1",
    badge: "TOPIK I",
    badgeColor: "#22c55e",
    reading: [
      {
        id: "r1", type: "vocabulary", instruction: "[1~2] 다음을 보고 질문에 답하시오.",
        passage: null,
        image: "🌧️  비가 ___. 우산을 쓰세요.",
        question: "빈칸에 알맞은 것을 고르십시오.",
        options: ["옵니다", "먹습니다", "잡니다", "씁니다"],
        answer: 0,
        explanation: "'비가 오다'는 관용 표현입니다. 비가 내릴 때는 '오다'를 사용합니다.",
      },
      {
        id: "r2", type: "vocabulary", instruction: "",
        image: "저는 한국어를 ___. 매일 공부합니다.",
        question: "빈칸에 알맞은 것을 고르십시오.",
        options: ["배웁니다", "가르칩니다", "팝니다", "잊습니다"],
        answer: 0,
        explanation: "문맥상 '매일 공부한다'는 것은 배우는 행위입니다.",
      },
      {
        id: "r3", type: "reading", instruction: "[3~4] 다음 글을 읽고 물음에 답하십시오.",
        passage: "저는 서울에 삽니다. 서울은 한국의 수도입니다. 큰 도시라서 사람이 많습니다. 지하철과 버스가 잘 되어 있어서 편리합니다. 저는 서울이 좋습니다.",
        question: "이 글의 내용과 같은 것을 고르십시오.",
        options: [
          "서울은 작은 도시입니다.",
          "서울은 한국의 수도입니다.",
          "서울에는 지하철이 없습니다.",
          "글쓴이는 서울을 싫어합니다.",
        ],
        answer: 1,
        explanation: "본문에서 '서울은 한국의 수도입니다'라고 명시되어 있습니다.",
      },
      {
        id: "r4", type: "reading", instruction: "",
        passage: "저는 서울에 삽니다. 서울은 한국의 수도입니다. 큰 도시라서 사람이 많습니다. 지하철과 버스가 잘 되어 있어서 편리합니다. 저는 서울이 좋습니다.",
        question: "글쓴이가 서울을 좋아하는 이유는 무엇입니까?",
        options: [
          "음식이 맛있어서",
          "날씨가 좋아서",
          "교통이 편리해서",
          "경치가 아름다워서",
        ],
        answer: 2,
        explanation: "'지하철과 버스가 잘 되어 있어서 편리합니다'에서 교통 편의성을 언급합니다.",
      },
      {
        id: "r5", type: "grammar", instruction: "[5] 빈칸에 들어갈 알맞은 것을 고르십시오.",
        passage: "내일 친구 생일이에요. 그래서 선물을 ___.",
        question: "빈칸에 알맞은 것을 고르십시오.",
        options: ["샀어요", "살 거예요", "사고 싶어요", "살 수 있어요"],
        answer: 1,
        explanation: "'내일'은 미래 시제이므로 '-ㄹ 거예요'(의도/계획)가 가장 자연스럽습니다.",
      },
    ],
    listening: [
      {
        id: "l1", instruction: "[1] 다음을 듣고 알맞은 대답을 고르십시오.",
        script: "남자: 오늘 점심 같이 먹을까요?\n여자: ___",
        question: "여자의 대답으로 알맞은 것은?",
        options: [
          "네, 좋아요. 같이 먹어요.",
          "아니요, 저는 이미 먹었어요.",
          "죄송해요, 오늘은 약속이 있어요.",
          "이상의 모든 답변이 가능합니다.",
        ],
        answer: 3,
        explanation: "초대에 대한 응답은 긍정(A), 거절(B, C) 모두 가능합니다. 문맥에 따라 여러 대답이 자연스럽습니다.",
      },
      {
        id: "l2", instruction: "[2~3] 다음을 듣고 물음에 답하십시오.",
        script: "남자: 안녕하세요. 저는 민수예요. 저는 서울대학교 학생이에요. 전공은 경제학이에요. 취미는 독서예요. 매주 토요일에 도서관에 가요.",
        question: "민수의 전공은 무엇입니까?",
        options: ["한국어", "경제학", "독서", "서울"],
        answer: 1,
        explanation: "민수는 '전공은 경제학이에요'라고 직접 말했습니다.",
      },
      {
        id: "l3", instruction: "",
        script: "남자: 안녕하세요. 저는 민수예요. 저는 서울대학교 학생이에요. 전공은 경제학이에요. 취미는 독서예요. 매주 토요일에 도서관에 가요.",
        question: "민수는 언제 도서관에 갑니까?",
        options: ["매일", "매주 월요일", "매주 토요일", "매주 일요일"],
        answer: 2,
        explanation: "'매주 토요일에 도서관에 가요'에서 명확히 언급되었습니다.",
      },
      {
        id: "l4", instruction: "[4] 다음을 듣고 내용과 같은 것을 고르십시오.",
        script: "여자: 저는 의사예요. 병원에서 일해요. 아침 8시부터 저녁 6시까지 일해요. 힘들지만 환자들이 나을 때 기분이 좋아요.",
        question: "내용과 같은 것을 고르십시오.",
        options: [
          "여자는 간호사입니다.",
          "여자는 오후 6시에 퇴근합니다.",
          "여자는 병원 일이 싫습니다.",
          "여자는 아침 9시에 출근합니다.",
        ],
        answer: 1,
        explanation: "'아침 8시부터 저녁 6시까지'에서 저녁 6시 퇴근임을 알 수 있습니다.",
      },
      {
        id: "l5", instruction: "[5] 대화를 듣고 질문에 답하십시오.",
        script: "남자: 저 좀 도와주실 수 있어요?\n여자: 네, 무슨 일이에요?\n남자: 이 짐이 너무 무거워서요.\n여자: 제가 들어 드릴게요.",
        question: "여자는 무엇을 할 것입니까?",
        options: [
          "짐을 들어 줄 것입니다.",
          "택시를 부를 것입니다.",
          "짐을 버릴 것입니다.",
          "가방을 살 것입니다.",
        ],
        answer: 0,
        explanation: "여자는 '제가 들어 드릴게요'라고 말했습니다.",
      },
    ],
  },
  "topik2": {
    title: "TOPIK II — Đề thử số 1",
    badge: "TOPIK II",
    badgeColor: "#8b5cf6",
    reading: [
      {
        id: "r1", type: "vocabulary", instruction: "[1] 빈칸에 알맞은 어휘를 고르십시오.",
        passage: "이번 프로젝트는 예상보다 훨씬 ___ 작업이었다. 팀원들 모두 밤새 작업해야 했다.",
        question: "빈칸에 가장 알맞은 것을 고르십시오.",
        options: ["간단한", "쉬운", "방대한", "평범한"],
        answer: 2,
        explanation: "'방대한(尨大한)'은 '규모나 양이 매우 크다'는 의미로, '밤새 작업했다'는 결과와 논리적으로 연결됩니다.",
      },
      {
        id: "r2", type: "grammar", instruction: "[2] 다음 글의 빈칸에 알맞은 것을 고르십시오.",
        passage: "인간은 사회적 동물이다. 혼자서는 살 수 없으며 다른 사람들과 관계를 맺으면서 살아간다. 따라서 원활한 의사소통은 ___ 삶의 기본 조건이라 할 수 있다.",
        question: "빈칸에 알맞은 것을 고르십시오.",
        options: ["인간에게만의", "인간과 동물의", "인간 사회에서", "인간으로서의"],
        answer: 3,
        explanation: "'인간으로서의'는 인간의 본질적 조건을 강조하는 문맥에 가장 자연스럽습니다.",
      },
      {
        id: "r3", type: "reading", instruction: "[3~4] 다음 글을 읽고 물음에 답하십시오.",
        passage: "현대 사회에서 소셜 미디어는 사람들의 일상생활에 깊숙이 파고들었다. 정보 공유와 소통의 도구로 활용되는 한편, 과도한 사용으로 인한 부작용도 나타나고 있다. 특히 청소년들의 경우 소셜 미디어 중독이 학업 성취도와 정서 건강에 부정적인 영향을 미친다는 연구 결과가 속속 발표되고 있다. 전문가들은 소셜 미디어 사용 시간을 적절히 조절하고, 실제 대인 관계를 강화하는 것이 중요하다고 강조한다.",
        question: "이 글의 중심 내용으로 가장 알맞은 것을 고르십시오.",
        options: [
          "소셜 미디어는 현대 사회에 필수적이다.",
          "청소년의 소셜 미디어 사용을 금지해야 한다.",
          "소셜 미디어의 과도한 사용은 부작용을 낳는다.",
          "소셜 미디어는 정보 공유에 가장 효과적이다.",
        ],
        answer: 2,
        explanation: "글은 소셜 미디어의 유용성을 인정하면서도 과도한 사용의 부작용과 조절의 필요성을 강조합니다.",
      },
      {
        id: "r4", type: "reading", instruction: "",
        passage: "현대 사회에서 소셜 미디어는 사람들의 일상생활에 깊숙이 파고들었다. 정보 공유와 소통의 도구로 활용되는 한편, 과도한 사용으로 인한 부작용도 나타나고 있다. 특히 청소년들의 경우 소셜 미디어 중독이 학업 성취도와 정서 건강에 부정적인 영향을 미친다는 연구 결과가 속속 발표되고 있다. 전문가들은 소셜 미디어 사용 시간을 적절히 조절하고, 실제 대인 관계를 강화하는 것이 중요하다고 강조한다.",
        question: "이 글에서 전문가들이 권장하는 것은 무엇입니까?",
        options: [
          "소셜 미디어를 완전히 차단한다.",
          "소셜 미디어 사용 시간을 조절하고 대인 관계를 강화한다.",
          "청소년에게 소셜 미디어를 가르친다.",
          "새로운 소셜 미디어 플랫폼을 개발한다.",
        ],
        answer: 1,
        explanation: "마지막 문장에서 '사용 시간 조절'과 '실제 대인 관계 강화'를 권장합니다.",
      },
      {
        id: "r5", type: "grammar", instruction: "[5] 다음 글의 ①~④ 중에서 문법적으로 틀린 것을 고르십시오.",
        passage: "① 환경 보호는 우리 모두의 책임이다. ② 일회용 제품 사용을 줄임으로써 ③ 쓰레기 배출량을 크게 감소할 수 있다. ④ 작은 실천이 큰 변화를 만든다.",
        question: "문법적으로 틀린 것을 고르십시오.",
        options: ["①", "②", "③", "④"],
        answer: 2,
        explanation: "③에서 '감소할 수 있다'는 '감소시킬 수 있다' 또는 '줄일 수 있다'가 올바릅니다. '감소하다'는 자동사이므로 직접 목적어를 취할 수 없습니다.",
      },
    ],
    listening: [
      {
        id: "l1", instruction: "[1] 다음 대화를 듣고 여자의 중심 생각으로 알맞은 것을 고르십시오.",
        script: "남자: 요즘 재택근무가 많이 늘었는데, 어때요?\n여자: 처음에는 좋았는데, 요즘은 좀 힘들어요. 집에 있으니까 일과 생활의 경계가 없어지는 것 같아요. 퇴근 후에도 계속 일하게 되더라고요.\n남자: 그렇군요. 그래도 출퇴근 시간이 줄어서 좋지 않아요?\n여자: 물론 그건 좋죠. 그런데 동료들과 직접 만나서 대화하는 게 그리워요. 온라인으로는 한계가 있는 것 같아요.",
        question: "여자의 중심 생각으로 가장 알맞은 것은?",
        options: [
          "재택근무는 출퇴근 시간을 줄여 효율적이다.",
          "재택근무는 일-생활 균형과 소통 측면에서 어려움이 있다.",
          "재택근무보다 사무실 근무가 무조건 낫다.",
          "온라인 소통은 대면 소통과 차이가 없다.",
        ],
        answer: 1,
        explanation: "여자는 재택근무의 장점(출퇴근 감소)은 인정하지만 일-생활 경계 없음과 대면 소통 부재를 주요 문제점으로 지적합니다.",
      },
      {
        id: "l2", instruction: "[2] 다음을 듣고 내용과 일치하는 것을 고르십시오.",
        script: "아나운서: 기후변화로 인한 이상 기후 현상이 전 세계적으로 심화되고 있습니다. 올해 한국은 역대 최고 기온을 기록했으며, 폭염 일수도 증가했습니다. 전문가들은 이산화탄소 배출량 감소와 재생에너지 확대가 시급하다고 말합니다. 정부도 2050년 탄소중립을 목표로 다양한 정책을 추진 중입니다.",
        question: "내용과 일치하는 것을 고르십시오.",
        options: [
          "한국의 기온은 올해 역대 최저를 기록했다.",
          "이산화탄소 배출 증가가 권장되고 있다.",
          "정부는 2050년 탄소중립을 목표로 하고 있다.",
          "폭염 일수는 작년보다 줄었다.",
        ],
        answer: 2,
        explanation: "뉴스에서 '2050년 탄소중립을 목표로 다양한 정책을 추진 중'이라고 명시했습니다.",
      },
      {
        id: "l3", instruction: "[3] 다음을 듣고 화자의 태도로 알맞은 것을 고르십시오.",
        script: "여자: 인공지능 기술의 발전은 분명 많은 편의를 가져다줍니다. 하지만 이로 인해 일자리를 잃는 사람들이 생기고, 개인 정보 유출 문제도 심각해지고 있습니다. 기술 발전 자체를 막을 수는 없지만, 그에 따른 사회적 안전망을 강화하는 정책이 반드시 필요합니다. 기술과 인간이 공존할 수 있는 방법을 찾아야 합니다.",
        question: "화자의 태도로 가장 알맞은 것을 고르십시오.",
        options: [
          "인공지능 기술을 전면 반대한다.",
          "인공지능 기술의 장점만을 강조한다.",
          "기술 발전과 사회적 대책의 균형을 주장한다.",
          "일자리 문제는 개인의 책임이라고 본다.",
        ],
        answer: 2,
        explanation: "화자는 기술 발전을 인정하면서도 사회적 안전망 강화와 공존 방법 모색을 강조합니다.",
      },
      {
        id: "l4", instruction: "[4~5] 다음 강연을 듣고 물음에 답하십시오.",
        script: "교수: 오늘은 '플라시보 효과'에 대해 알아보겠습니다. 플라시보 효과란 실제 약효가 없는 가짜 약을 복용했을 때도 환자가 심리적 믿음으로 인해 증상이 호전되는 현상을 말합니다. 연구에 따르면 일부 환자의 경우 플라시보 약만으로도 실제 약과 유사한 효과를 보이기도 합니다. 이는 인간의 심리가 신체에 미치는 영향이 얼마나 큰지를 보여주는 사례입니다. 물론 이를 악용하는 것은 의료 윤리에 어긋납니다.",
        question: "강연의 내용과 같은 것을 고르십시오.",
        options: [
          "플라시보 효과는 실제 약보다 항상 효과적이다.",
          "플라시보 약은 실제 약효 성분이 없다.",
          "플라시보 효과는 심리와 신체가 무관함을 보여준다.",
          "플라시보 효과를 활용하는 것은 항상 윤리적이다.",
        ],
        answer: 1,
        explanation: "'실제 약효가 없는 가짜 약'이라는 정의에서 플라시보 약에는 실제 약효 성분이 없음을 명시합니다.",
      },
      {
        id: "l5", instruction: "",
        script: "교수: 오늘은 '플라시보 효과'에 대해 알아보겠습니다. 플라시보 효과란 실제 약효가 없는 가짜 약을 복용했을 때도 환자가 심리적 믿음으로 인해 증상이 호전되는 현상을 말합니다. 연구에 따르면 일부 환자의 경우 플라시보 약만으로도 실제 약과 유사한 효과를 보이기도 합니다. 이는 인간의 심리가 신체에 미치는 영향이 얼마나 큰지를 보여주는 사례입니다. 물론 이를 악용하는 것은 의료 윤리에 어긋납니다.",
        question: "교수가 강조하는 것은 무엇입니까?",
        options: [
          "플라시보 효과는 의학적으로 무의미하다.",
          "심리가 신체에 큰 영향을 미친다.",
          "가짜 약을 처방해야 한다.",
          "의료 윤리는 별로 중요하지 않다.",
        ],
        answer: 1,
        explanation: "'인간의 심리가 신체에 미치는 영향이 얼마나 큰지를 보여주는 사례'라고 직접 언급합니다.",
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function LevelPill({ lvl, active, onClick }) {
  const cfg = TOPIK_LEVELS.find(l => l.level === lvl);
  return (
    <button onClick={onClick}
      className="flex flex-col items-center px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200"
      style={{
        background: active ? cfg.color : "white",
        color: active ? "white" : cfg.color,
        border: `2px solid ${active ? cfg.color : cfg.border}`,
        boxShadow: active ? `0 4px 16px ${cfg.bg}` : "0 1px 4px rgba(0,0,0,0.05)",
      }}>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{cfg.badge}</span>
      <span>{cfg.label}</span>
    </button>
  );
}

function VocabCard({ item, levelColor }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(f => !f)} className="cursor-pointer rounded-2xl p-5 border transition-all duration-200 select-none"
      style={{ background: "white", border: "1.5px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${levelColor}20`; e.currentTarget.style.borderColor = `${levelColor}40`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; }}>
      {!flipped ? (
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className="text-2xl font-extrabold text-gray-900">{item.word}</span>
            {item.hanja && <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-lg">{item.hanja}</span>}
          </div>
          <p className="text-sm font-semibold" style={{ color: levelColor }}>{item.meaning}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mt-3">Nhấn để xem ví dụ →</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1">{item.example}</p>
          <p className="text-sm text-gray-500 italic">{item.exTrans}</p>
          <p className="text-[10px] font-black uppercase tracking-widest mt-3" style={{ color: levelColor }}>← Nhấn để quay lại</p>
        </div>
      )}
    </div>
  );
}

function GrammarCard({ item, levelColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{ border: "1.5px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 bg-white text-left"
        style={{ borderBottom: open ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold font-mono" style={{ color: levelColor }}>{item.pattern}</span>
          <span className="text-sm font-semibold text-gray-600">{item.meaning}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="p-5 bg-gray-50/50 space-y-3">
          <div className="p-3 rounded-xl" style={{ background: `${levelColor}0D`, border: `1px solid ${levelColor}20` }}>
            <p className="text-sm font-bold text-gray-800">{item.example}</p>
            <p className="text-xs text-gray-500 italic mt-1">{item.exTrans}</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: levelColor }} />
            <p className="text-xs text-gray-600 font-medium">{item.usage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VOCAB & GRAMMAR TAB ──────────────────────────────────────────
function VocabGrammarTab() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [activeSection, setActiveSection] = useState("vocab"); // vocab | grammar
  const [search, setSearch] = useState("");
  const cfg = TOPIK_LEVELS.find(l => l.level === activeLevel);

  const vocab = (VOCAB_DATA[activeLevel] || []).filter(v =>
    !search || v.word.includes(search) || v.meaning.toLowerCase().includes(search.toLowerCase())
  );
  const grammar = GRAMMAR_DATA[activeLevel] || [];

  return (
    <div className="space-y-6">
      {/* Level selector */}
      <div className="flex flex-wrap gap-2">
        {TOPIK_LEVELS.map(l => (
          <LevelPill key={l.level} lvl={l.level} active={activeLevel === l.level} onClick={() => { setActiveLevel(l.level); setSearch(""); }} />
        ))}
      </div>

      {/* Level info banner */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: cfg.color }}>
          {cfg.level}
        </div>
        <div>
          <p className="font-black text-gray-900 text-sm">{cfg.label} — {cfg.badge}</p>
          <p className="text-xs text-gray-500">{vocab.length} từ vựng · {grammar.length} cấu trúc ngữ pháp</p>
        </div>
      </div>

      {/* Section toggle */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {[{ id: "vocab", label: "Từ vựng", icon: BookOpen }, { id: "grammar", label: "Ngữ pháp", icon: Brain }].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: activeSection === s.id ? "white" : "transparent", color: activeSection === s.id ? cfg.color : "#6b7280", boxShadow: activeSection === s.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
            <s.icon size={15} />{s.label}
          </button>
        ))}
      </div>

      {/* VOCAB section */}
      {activeSection === "vocab" && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm từ vựng..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:border-gray-400 transition-colors" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vocab.map((v, i) => <VocabCard key={i} item={v} levelColor={cfg.color} />)}
          </div>
          {vocab.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không tìm thấy từ vựng nào</p>
            </div>
          )}
        </div>
      )}

      {/* GRAMMAR section */}
      {activeSection === "grammar" && (
        <div className="space-y-3">
          {grammar.map((g, i) => <GrammarCard key={i} item={g} levelColor={cfg.color} />)}
        </div>
      )}
    </div>
  );
}

// ── MOCK TEST TAB ────────────────────────────────────────────────
function MockTestTab() {
  const [selectedTest, setSelectedTest] = useState(null); // null | "topik1" | "topik2"
  const [phase, setPhase] = useState("lobby");             // lobby | reading | listening | result
  const [readingAnswers, setReadingAnswers] = useState({});
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [showExplain, setShowExplain] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const test = selectedTest ? MOCK_TESTS[selectedTest] : null;

  const startTest = (testId, section) => {
    setSelectedTest(testId);
    setPhase(section);
    setReadingAnswers({});
    setListeningAnswers({});
    setCurrentQ(0);
    setShowExplain({});
    const mins = section === "reading" ? 40 : 30;
    setTimeLeft(mins * 60);
  };

  useEffect(() => {
    if (phase !== "reading" && phase !== "listening") { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase("result"); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const calcScore = () => {
    if (!test) return { reading: 0, listening: 0, total: 0, rTotal: 0, lTotal: 0 };
    const rTotal = test.reading.length;
    const lTotal = test.listening.length;
    const rc = test.reading.filter((q, i) => readingAnswers[q.id] === q.answer).length;
    const lc = test.listening.filter((q, i) => listeningAnswers[q.id] === q.answer).length;
    return { reading: rc, listening: lc, total: rc + lc, rTotal, lTotal };
  };

  // Lobby
  if (phase === "lobby") {
    return (
      <div className="space-y-8">
        <div className="px-5 py-4 rounded-2xl flex items-center gap-3"
          style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.12)" }}>
          <FileText size={18} style={{ color: "#8b5cf6" }} />
          <p className="text-sm font-medium text-gray-600">Đề thi giả lập theo cấu trúc TOPIK chính thức. Mỗi phần có giới hạn thời gian và sẽ chấm điểm tự động.</p>
        </div>

        {[
          { id: "topik1", label: "TOPIK I", desc: "Dành cho trình độ 1-2", color: "#22c55e", icon: "🌱", reading: "30 câu · 40 phút", listening: "30 câu · 30 phút" },
          { id: "topik2", label: "TOPIK II", desc: "Dành cho trình độ 3-6", color: "#8b5cf6", icon: "🏆", reading: "50 câu · 70 phút", listening: "50 câu · 60 phút" },
        ].map(t => (
          <div key={t.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}80)` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{t.icon}</span>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">{t.label}</h3>
                  <p className="text-sm text-gray-500">{t.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { section: "reading", label: "Đọc hiểu (읽기)", icon: BookOpen, detail: t.reading },
                  { section: "listening", label: "Nghe hiểu (듣기)", icon: Headphones, detail: t.listening },
                ].map(s => (
                  <button key={s.section} onClick={() => startTest(t.id, s.section)}
                    className="flex flex-col items-start p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                    style={{ background: `${t.color}08`, border: `1.5px solid ${t.color}30` }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 20px ${t.color}20`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon size={16} style={{ color: t.color }} />
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: t.color }}>{s.section === "reading" ? "Đọc" : "Nghe"}</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.detail}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold" style={{ color: t.color }}>
                      <Play size={12} fill={t.color} /> Làm ngay
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Result
  if (phase === "result" && test) {
    const { reading, listening, total, rTotal, lTotal } = calcScore();
    const pct = Math.round((total / (rTotal + lTotal)) * 100);
    return (
      <div className="space-y-6">
        <div className="text-center py-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#1a7a3c,#22c55e)", boxShadow: "0 16px 48px rgba(26,122,60,0.3)" }}>
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Kết quả bài thi</h2>
          <p className="text-gray-500">{test.title}</p>
          <div className="text-5xl font-extrabold mt-4" style={{ color: pct >= 60 ? "#22c55e" : "#f97316" }}>{pct}%</div>
          <p className="text-sm text-gray-400 mt-1">{total}/{rTotal + lTotal} câu đúng</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Đọc hiểu", correct: reading, total: rTotal, color: "#3b82f6" },
            { label: "Nghe hiểu", correct: listening, total: lTotal, color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
              <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.correct}<span className="text-lg text-gray-300">/{s.total}</span></p>
            </div>
          ))}
        </div>

        {/* Review answers */}
        {[
          { questions: test.reading, answers: readingAnswers, label: "Đọc hiểu" },
          { questions: test.listening, answers: listeningAnswers, label: "Nghe hiểu" },
        ].map(section => (
          <div key={section.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <ListOrdered size={18} className="text-gray-500" />
              <h3 className="font-extrabold text-gray-900">Xem lại — {section.label}</h3>
            </div>
            <div className="p-6 space-y-4">
              {section.questions.map((q, i) => {
                const userAns = section.answers[q.id];
                const isRight = userAns === q.answer;
                const isShowEx = showExplain[q.id];
                return (
                  <div key={q.id} className="p-4 rounded-2xl" style={{ background: isRight ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1.5px solid ${isRight ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isRight ? "bg-green-100" : "bg-red-100"}`}>
                        {isRight ? <Check size={13} className="text-green-600" /> : <X size={13} className="text-red-500" />}
                      </div>
                      <p className="text-sm font-bold text-gray-800">Câu {i + 1}: {q.question}</p>
                    </div>
                    <div className="ml-9 space-y-1 mb-3">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl"
                          style={{
                            background: oi === q.answer ? "rgba(34,197,94,0.1)" : (oi === userAns && !isRight) ? "rgba(239,68,68,0.1)" : "transparent",
                            color: oi === q.answer ? "#16a34a" : (oi === userAns && !isRight) ? "#dc2626" : "#6b7280",
                            fontWeight: oi === q.answer ? "700" : "500",
                          }}>
                          <span>{["①", "②", "③", "④"][oi]}</span> {opt}
                          {oi === q.answer && <Check size={11} className="ml-auto" />}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setShowExplain(prev => ({ ...prev, [q.id]: !isShowEx }))}
                      className="ml-9 text-xs font-bold text-blue-500 hover:text-blue-700">
                      {isShowEx ? "▲ Ẩn giải thích" : "▼ Xem giải thích"}
                    </button>
                    {isShowEx && <p className="ml-9 mt-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-xl">{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button onClick={() => { setPhase("lobby"); setSelectedTest(null); }}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm"
          style={{ background: "linear-gradient(135deg,#1a7a3c,#22c55e)", boxShadow: "0 8px 24px rgba(26,122,60,0.25)" }}>
          ← Quay lại danh sách đề
        </button>
      </div>
    );
  }

  // Test taking
  if ((phase === "reading" || phase === "listening") && test) {
    const questions = phase === "reading" ? test.reading : test.listening;
    const answers = phase === "reading" ? readingAnswers : listeningAnswers;
    const setAnswers = phase === "reading" ? setReadingAnswers : setListeningAnswers;
    const answered = Object.keys(answers).length;
    const isUrgent = timeLeft < 300;
    const q = questions[currentQ];
    const prevQ = questions.find((_, i) => i === currentQ - 1);

    // Show script/passage only if different from previous
    const showInstruction = !prevQ || prevQ.instruction !== q.instruction;
    const showPassage = q.passage && (!prevQ || prevQ.passage !== q.passage);
    const showScript = q.script && (!prevQ || prevQ.script !== q.script);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            {phase === "reading" ? <BookOpen size={18} className="text-blue-500" /> : <Headphones size={18} className="text-purple-500" />}
            <div>
              <p className="font-extrabold text-gray-900 text-sm">{test.title}</p>
              <p className="text-xs text-gray-400">{phase === "reading" ? "Đọc hiểu" : "Nghe hiểu"} · {answered}/{questions.length} đã trả lời</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm"
            style={{ background: isUrgent ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: isUrgent ? "#dc2626" : "#16a34a", border: `2px solid ${isUrgent ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` }}>
            <Clock size={14} /> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((qq, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className="w-7 h-7 rounded-lg text-[10px] font-black transition-all"
              style={{
                background: i === currentQ ? "#1a7a3c" : answers[qq.id] !== undefined ? "rgba(26,122,60,0.15)" : "#f3f4f6",
                color: i === currentQ ? "white" : answers[qq.id] !== undefined ? "#1a7a3c" : "#9ca3af",
              }}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {showInstruction && q.instruction && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500">{q.instruction}</p>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Passage / Image */}
            {showPassage && q.passage && (
              <div className="p-4 rounded-2xl text-sm leading-relaxed text-gray-700 font-medium"
                style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)" }}>
                {q.passage}
              </div>
            )}
            {q.image && (
              <div className="p-4 rounded-2xl text-sm font-medium text-center"
                style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.15)" }}>
                {q.image}
              </div>
            )}

            {/* Script for listening */}
            {showScript && q.script && (
              <div className="p-4 rounded-2xl"
                style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 size={14} className="text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">대화 스크립트 (Script)</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">{q.script}</p>
              </div>
            )}

            {/* Question */}
            <p className="font-bold text-gray-900">{currentQ + 1}. {q.question}</p>

            {/* Options */}
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const userAns = answers[q.id];
                const isSelected = userAns === oi;
                return (
                  <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-left transition-all duration-200"
                    style={{
                      background: isSelected ? "rgba(26,122,60,0.08)" : "rgba(0,0,0,0.02)",
                      border: isSelected ? "2px solid rgba(26,122,60,0.4)" : "1.5px solid rgba(0,0,0,0.06)",
                      color: isSelected ? "#1a7a3c" : "#374151",
                      transform: isSelected ? "scale(1.005)" : "scale(1)",
                    }}>
                    <span className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black"
                      style={{ background: isSelected ? "#1a7a3c" : "#f3f4f6", color: isSelected ? "white" : "#6b7280" }}>
                      {["①", "②", "③", "④"][oi]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} /> Câu trước
          </button>
          <div className="flex-1" />
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all"
              style={{ background: "linear-gradient(135deg,#1a7a3c,#22c55e)", boxShadow: "0 4px 16px rgba(26,122,60,0.25)" }}>
              Câu tiếp <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={() => { clearInterval(timerRef.current); setPhase("result"); }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all"
              style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", boxShadow: "0 4px 16px rgba(249,115,22,0.25)" }}>
              <CheckCircle2 size={16} /> Nộp bài
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
export default function TopikPrepPage() {
  const [activeTab, setActiveTab] = useState("vocab"); // vocab | test

  const tabs = [
    { id: "vocab", label: "Từ vựng & Ngữ pháp", icon: BookOpen },
    { id: "test", label: "Đề thi thử (Mock Test)", icon: FileText },
  ];

  return (
    <div className="w-full pb-8 font-sans">
      {/* Hero header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
            <BookMarked size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">TOPIK Prep</h1>
            <p className="text-sm text-gray-500 font-medium">Từ vựng · Ngữ pháp · Đề thi thử — Cấp độ 1 đến 6</p>
          </div>
        </div>

        {/* Level overview pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[{ label: "TOPIK I", sub: "Level 1-2", color: "#22c55e" }, { label: "TOPIK II", sub: "Level 3-6", color: "#8b5cf6" }].map(b => (
            <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: `${b.color}12`, color: b.color, border: `1px solid ${b.color}30` }}>
              <span>{b.label}</span>
              <span className="opacity-60">·</span>
              <span className="opacity-70">{b.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: activeTab === t.id ? "white" : "transparent",
              color: activeTab === t.id ? "#1a7a3c" : "#6b7280",
              boxShadow: activeTab === t.id ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
            }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "vocab" ? <VocabGrammarTab /> : <MockTestTab />}
    </div>
  );
}

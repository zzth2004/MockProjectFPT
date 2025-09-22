import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Table from "../ui/Table";

export default function Vocabulary() {
  const words = [
    { word: "안녕하세요", meaning: "Hello", type: "Greeting" },
    { word: "사랑", meaning: "Love", type: "Noun" },
    { word: "먹다", meaning: "Eat", type: "Verb" },
    { word: "학교", meaning: "School", type: "Noun" },
    { word: "공부하다", meaning: "Study", type: "Verb" },
    { word: "행복", meaning: "Happiness", type: "Noun" },
    { word: "예쁘다", meaning: "Pretty", type: "Adjective" },
    { word: "친구", meaning: "Friend", type: "Noun" },
    { word: "달리다", meaning: "Run", type: "Verb" },
    { word: "커피", meaning: "Coffee", type: "Noun" },
    { word: "좋아하다", meaning: "Like", type: "Verb" },
    { word: "감사합니다", meaning: "Thank you", type: "Greeting" },
    { word: "빠르다", meaning: "Fast", type: "Adjective" },
  ];

  const totalWords = words.length;

  const columns = [
    { key: "word", title: "Từ" },
    { key: "meaning", title: "Nghĩa" },
    { key: "type", title: "Loại từ" },
    { key: "actions", title: "Hành động" },
  ];

  const data = words.map((w) => ({
    word: <span className="font-semibold text-gray-700">{w.word}</span>,
    meaning: <span className="text-gray-600">{w.meaning}</span>,
    type: (
      <Badge
        color={
          w.type === "Greeting"
            ? "green"
            : w.type === "Noun"
            ? "blue"
            : w.type === "Verb"
            ? "purple"
            : w.type === "Adjective"
            ? "pink"
            : "gray"
        }
      >
        {w.type}
      </Badge>
    ),
    actions: (
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="text-blue-600 border-blue-200">
          ✏️ Sửa
        </Button>
        <Button variant="danger">🗑️ Xóa</Button>
      </div>
    ),
  }));

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🔤 Từ vựng</h2>
        <Button variant="primary">➕ Thêm từ mới</Button>
      </div>

      {/* Summary */}
      <div className="text-gray-600 text-sm">
        📚 Tổng số từ vựng:{" "}
        <span className="font-semibold text-gray-900">{totalWords}</span>
      </div>

      {/* Vocabulary Table */}
      <Card className="flex-1">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import avatar from "../../../assets/schedule1.png";
import MainLayout2 from "../../../layout/MainLayout2";

const PRIMARY = "#008236";
const PRIMARY_DARK = "#00591A";

export default function ScheduleDetailTeacher() {
    const { id } = useParams();
    const navigate = useNavigate();

    const tasks = [
        { text: "Học ngữ pháp 은/는, 이/가", playable: false },
        { text: "Học từ vựng mới (bài 3)", playable: false },
        { text: "Nghe hội thoại (chủ đề gia đình).", playable: true },
        { text: "Luyện nói: giới thiệu bản thân + gia đình.", playable: true },
    
    ];

    return (
        <MainLayout2>
            <div
                className="  flex items-center justify-center rounded-2xl min-h-[80vh] relative"
                style={{ backgroundColor: PRIMARY_DARK, filter: "brightness(1.1)" }}
            >
                {/* Nút back */}
                <button
                    onClick={() => navigate("/user/schedule")}
                    className="absolute top-4 left-4 text-white"
                >
                    <ArrowLeft size={32} />
                </button>

                {/* Card nội dung */}
                <div
                    className="rounded-2xl shadow-xl w-2/3 min-h-[60vh] max-h-[60vh] p-8 flex flex-col text-white"
                    style={{ backgroundColor: PRIMARY }}
                >
                    {/* Header */}
                    <div className="text-center mb-6 flex-shrink-0">
                        <h1 className="text-3xl font-bold">Schedule</h1>
                        <p className="text-lg text-green-100 mt-2">Ngày {id}</p>
                    </div>

                    {/* Main content: task list + image */}
                    <div className="flex flex-1 gap-6 overflow-hidden">
                        {/* Task list */}
                        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 pb-4">
                            {tasks.map((task, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-lg px-4 py-3"
                                    style={{ backgroundColor: "#DBFCE7" }}
                                >
                                    <span className="text-black text-lg">{task.text}</span>
                                    {task.playable && (
                                        <button className="text-gray-900 hover:text-gray-400">
                                            <Play size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Hình minh họa */}
                        <div className="flex-shrink-0 flex items-end justify-center">
                            <img src={avatar} alt="fighting" className="w-68 h-auto rounded-lg" />
                        </div>
                    </div>
                </div>

            </div>
        </MainLayout2>
    );
}

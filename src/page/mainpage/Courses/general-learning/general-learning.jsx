import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";

const GeneralLearning = () => {
  const navigate = useNavigate();

  // Data mẫu
  const units = [
    { id: 1, title: "Unit 1 - Introduction - 소개하다", unitId: "unit-1" },
    { id: 2, title: "Unit 2 - Healthy - 건강", unitId: "unit-2" },
    { id: 3, title: "Unit 3 - Travel - 여행", unitId: "unit-3" },
    { id: 4, title: "Unit 4 - Movies - 영화", unitId: "unit-4" },
    { id: 5, title: "Unit 5 - Occupation - 직업", unitId: "unit-5" },
    { id: 6, title: "SS", unitId: "ss" },
  ];

  const handleUnitClick = (unitId) => {
    navigate(`/courses/general-learning/${unitId}`, { replace: false });
  };

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8">
      {/* --- HEADER --- */}
      <header className="flex items-center gap-2 mb-6 -ml-2">
        <button
          onClick={() => navigate("/courses")}
          className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all border border-gray-200"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2 text-lg font-bold text-gray-800 ml-1">
          <span
            className="opacity-50 hover:opacity-100 cursor-pointer transition"
            onClick={() => navigate("/courses")}
          >
            Course
          </span>
          <ChevronRight size={18} className="text-gray-400" />
          <span>General Learning</span>
        </div>
      </header>

      {/* --- LIST UNITS --- */}
      <div className="flex flex-col gap-4 max-w-4xl">
        {units.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handleUnitClick(unit.unitId)}
            className="
                        group bg-white p-6 rounded-2xl shadow-sm cursor-pointer
                        border border-transparent hover:border-blue-100
                        transition-all duration-200 ease-in-out
                        hover:-translate-y-0.5 hover:shadow-md
                        flex items-center justify-between
                    "
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <PlayCircle size={20} />
              </div>
              <span className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors">
                {unit.title}
              </span>
            </div>
            <ChevronRight
              className="text-gray-300 group-hover:text-blue-500 transition-colors"
              size={20}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneralLearning;

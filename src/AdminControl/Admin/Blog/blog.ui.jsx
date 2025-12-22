import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    FileText, Plus, Search, User, Calendar, 
    Eye, Globe, Archive, Trash2, Edit3, 
    ChevronLeft, ChevronRight, Rss, PenTool 
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import blogService from "../../Service/API/blogAPI/blog.service";

export default function BlogManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- 1. FETCH DATA ---
    const fetchBlogsFn = useCallback(() => 
        blogService.getAll({ 
            page: currentPage, 
            limit: pageSize, 
            search: searchTerm 
        }), 
    [currentPage, searchTerm]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchBlogsFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // --- 2. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "title",
            title: "Nội dung bài viết",
            render: (val, row) => (
                <div className="flex items-center gap-4 py-1 text-left">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border shadow-sm flex-shrink-0">
                        {row.thumbnail ? (
                            <img src={row.thumbnail} alt={val} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FileText size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-black text-gray-900 leading-tight line-clamp-1">{val}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-bold italic lowercase">
                                /{row.slug}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "author",
            title: "Tác giả",
            render: (author) => (
                <div className="flex items-center gap-2 text-left">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border">
                        {author?.avatar ? (
                            <img src={author.avatar} alt="avt" className="w-full h-full object-cover" />
                        ) : (
                            <User size={12} className="text-[#2d5a2d]" />
                        )}
                    </div>
                    <span className="text-[12px] font-bold text-gray-700">
                        {author ? `${author.firstName} ${author.lastName}` : "Admin"}
                    </span>
                </div>
            )
        },
        {
            key: "createdAt",
            title: "Ngày đăng",
            render: (date) => (
                <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[12px]">
                    <Calendar size={14} />
                    {new Date(date).toLocaleDateString('vi-VN')}
                </div>
            )
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (val) => (
                <KLBadge type={val === "PUBLISHED" ? "success" : "default"}>
                    <div className="flex items-center gap-1">
                        {val === "PUBLISHED" ? <Globe size={10} /> : <Archive size={10} />}
                        <span className="text-[10px] font-black uppercase">{val}</span>
                    </div>
                </KLBadge>
            )
        }
    ];

    // --- 3. ACTIONS ---
    const handleAction = async (type, row) => {
        if (type === 'delete') {
            if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết: ${row.title}?`)) {
                await blogService.delete(row.id);
                refresh();
            }
        }
        if (type === 'edit') {
            // Logic điều hướng đến trang sửa bài viết
            console.log("Edit post:", row.id);
        }
    };

    // Tính toán phân trang (Giả định backend trả về meta, nếu không mặc định 1)
    const totalPages = response?.meta?.totalPages || 1;

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Quản lý <span className="text-[#2d5a2d]">Blog</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Tin tức & Kiến thức KoreanLab</p>
                </div>
                <div className="flex gap-2">
                    <KLButton icon={Plus} className="bg-[#2d5a2d] shadow-lg shadow-green-100">Viết bài mới</KLButton>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-[#2d5a2d] rounded-xl"><Rss size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Tổng bài viết</p>
                        <h3 className="text-xl font-black text-gray-900">{response?.length || 0}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><PenTool size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Đang biên tập</p>
                        <h3 className="text-xl font-black text-gray-900">3</h3>
                    </div>
                </KLCard>
            </div>

            {/* SEARCH & TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden shadow-2xl border-none bg-white rounded-[2rem]">
                <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tiêu đề bài viết..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">
                        Đang nạp bản tin...
                    </div>
                ) : (
                    <>
                        <KLTable 
                            columns={columns} 
                            data={Array.isArray(response) ? response : response?.items || []} 
                            onAction={handleAction}
                            hiddenActions={['reset', 'lock']}
                        />

                        {/* PAGINATION */}
                        <div className="px-8 py-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <span className="text-[11px] font-black text-gray-400 uppercase">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <KLButton 
                                    variant="outline" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 h-auto"
                                >
                                    <ChevronLeft size={16} />
                                </KLButton>
                                <KLButton 
                                    variant="outline" 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 h-auto"
                                >
                                    <ChevronRight size={16} />
                                </KLButton>
                            </div>
                        </div>
                    </>
                )}
            </KLCard>
        </div>
    );
}
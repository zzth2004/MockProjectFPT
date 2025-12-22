import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Book, Plus, Search, Database, User, DollarSign, 
    BookOpen, Globe, Archive, Trash2, Edit3, ChevronLeft, ChevronRight 
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import bookService from "../../Service/API/bookAPI/book.service";

export default function BookManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- 1. FETCH DATA ---
    const fetchBooksFn = useCallback(() => 
        bookService.getAdminList(currentPage, pageSize, searchTerm), 
    [currentPage, searchTerm]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchBooksFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // --- 2. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "title",
            title: "Thông tin sách",
            render: (val, row) => (
                <div className="flex items-center gap-4 py-1 text-left">
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-100 border shadow-sm flex-shrink-0">
                        {row.thumbnail ? (
                            <img src={row.thumbnail} alt={val} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Book size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-black text-gray-900 leading-tight line-clamp-1">{val}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#2d5a2d] font-bold flex items-center gap-1">
                                <User size={10} /> {row.author}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium italic">| {row.slug}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "price",
            title: "Giá bán",
            render: (val) => (
                <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-gray-800">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Bản quyền in ấn</span>
                </div>
            )
        },
        {
            key: "isPublished",
            title: "Trạng thái",
            render: (val) => (
                <KLBadge type={val ? "success" : "danger"}>
                    <div className="flex items-center gap-1">
                        {val ? <Globe size={10} /> : <Archive size={10} />}
                        {val ? "CÔNG KHAI" : "BẢN NHÁP"}
                    </div>
                </KLBadge>
            )
        }
    ];

    // --- 3. ACTIONS ---
    const handleAction = async (type, row) => {
        if (type === 'delete') {
            if (window.confirm(`Xóa cuốn sách: ${row.title}?`)) {
                await bookService.delete(row.id);
                refresh();
            }
        }
    };

    const handleSeed = async () => {
        if (window.confirm("Bắt đầu nạp dữ liệu từ file JSON hệ thống?")) {
            await bookService.seed();
            refresh();
        }
    };

    const totalPages = response?.meta?.totalPages || 1;

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Quản lý <span className="text-[#2d5a2d]">Kho Sách</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Hệ thống tàng thư & Tài liệu KoreanLab</p>
                </div>
                <div className="flex gap-2">
                    <KLButton variant="outline" icon={Database} onClick={handleSeed}>Seed JSON</KLButton>
                    <KLButton icon={Plus} className="bg-[#2d5a2d]">Thêm sách</KLButton>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-[#2d5a2d] rounded-xl"><BookOpen size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Tổng đầu sách</p>
                        <h3 className="text-xl font-black text-gray-900">{response?.meta?.total || 0}</h3>
                    </div>
                </KLCard>
                {/* Thêm các stats khác tương tự... */}
            </div>

            {/* SEARCH & TABLE */}
            <KLCard className="p-0 overflow-hidden shadow-2xl border-none bg-white rounded-[2rem]">
                <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">
                        Đang nạp dữ liệu tàng thư...
                    </div>
                ) : (
                    <>
                        <KLTable 
                            columns={columns} 
                            data={response?.items || []} 
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
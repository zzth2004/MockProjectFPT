import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    FileText, Plus, Search, User, Calendar, 
    Eye, Globe, Archive, Trash2, Edit3, 
    ChevronLeft, ChevronRight, Rss, PenTool, X, AlertCircle, Loader2
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";
import { KLInput } from "../../Component/Input";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import blogService from "../../Service/API/blogAPI/blog.service";

export default function BlogManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);

    // Form inputs
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("draft");
    const [thumbnail, setThumbnail] = useState("");
    const [content, setContent] = useState("");
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // --- 1. FETCH DATA ---
    const fetchBlogsFn = useCallback(() => 
        blogService.getAll({ 
            search: searchTerm,
            all: "true"
        }), 
    [searchTerm]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchBlogsFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Parse dataset
    const dataset = useMemo(() => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.items)) return response.items;
        return [];
    }, [response]);

    // Client-side pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return dataset.slice(startIndex, startIndex + pageSize);
    }, [dataset, currentPage, pageSize]);

    const totalPages = Math.max(1, Math.ceil(dataset.length / pageSize));

    // Reset pagination page on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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
                        {author ? (author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim()) : "Admin"}
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
            render: (val) => {
                const isPublished = val?.toLowerCase() === "published";
                return (
                    <KLBadge type={isPublished ? "success" : "default"}>
                        <div className="flex items-center gap-1">
                            {isPublished ? <Globe size={10} /> : <Archive size={10} />}
                            <span className="text-[10px] font-black uppercase">{val}</span>
                        </div>
                    </KLBadge>
                );
            }
        }
    ];

    // --- 3. ACTIONS ---
    const handleAction = async (type, row) => {
        if (type === 'delete') {
            if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết: ${row.title}?`)) {
                try {
                    await blogService.delete(row.id);
                    refresh();
                } catch (err) {
                    console.error("Lỗi khi xóa bài viết:", err);
                    alert("Không thể xóa bài viết");
                }
            }
        }
        if (type === 'edit') {
            setSelectedBlog(row);
            setTitle(row.title || "");
            setStatus(row.status?.toLowerCase() || "draft");
            setThumbnail(row.thumbnail || "");
            setContent(row.content || "");
            setFormError("");
            setIsModalOpen(true);
        }
    };

    const handleOpenCreateModal = () => {
        setSelectedBlog(null);
        setTitle("");
        setStatus("draft");
        setThumbnail("");
        setContent("");
        setFormError("");
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!title.trim()) {
            setFormError("Vui lòng nhập tiêu đề bài viết.");
            return;
        }
        if (!content.trim()) {
            setFormError("Vui lòng nhập nội dung bài viết.");
            return;
        }

        const payload = {
            title: title.trim(),
            content: content.trim(),
            thumbnail: thumbnail.trim() || undefined,
            status: status
        };

        setIsSaving(true);
        try {
            if (selectedBlog) {
                await blogService.update(selectedBlog.id, payload);
            } else {
                await blogService.create(payload);
            }
            setIsModalOpen(false);
            refresh();
        } catch (err) {
            console.error("Lỗi khi lưu bài viết:", err);
            setFormError(err.response?.data?.message || "Không thể lưu bài viết. Hãy thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate metrics
    const stats = useMemo(() => {
        const publishedCount = dataset.filter(p => p.status?.toLowerCase() === "published").length;
        return {
            total: dataset.length,
            drafts: dataset.length - publishedCount,
            published: publishedCount
        };
    }, [dataset]);

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
                    <KLButton icon={Plus} className="bg-[#2d5a2d] shadow-lg shadow-green-100" onClick={handleOpenCreateModal}>Viết bài mới</KLButton>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><Rss size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng bài viết</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Globe size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Đã xuất bản</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.published}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><PenTool size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Đang biên tập</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.drafts}</h3>
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
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all outline-none"
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
                            data={paginatedData} 
                            onAction={handleAction}
                            hiddenActions={['reset', 'lock']}
                        />

                        {/* PAGINATION */}
                        <div className="px-8 py-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/30 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px] leading-tight">
                                <span>Trang {currentPage} / {totalPages}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">Tổng cộng: {dataset.length} bài viết</span>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-all"
                                    >
                                        Trước
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-all"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </KLCard>

            {/* WRITE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Header */}
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">
                                    {selectedBlog ? "Sửa bài viết" : "Viết bài mới"}
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Biên tập nội dung bản tin chia sẻ học tập</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {formError && (
                                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-700 font-bold text-xs">
                                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <KLInput 
                                label="Tiêu đề bài viết" 
                                placeholder="Nhập tiêu đề thu hút người đọc..." 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <KLInput 
                                    label="Đường dẫn Ảnh bìa (Thumbnail URL)" 
                                    placeholder="https://example.com/cover.jpg" 
                                    value={thumbnail}
                                    onChange={(e) => setThumbnail(e.target.value)}
                                />

                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Trạng thái xuất bản</label>
                                    <select 
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-800 outline-none focus:border-[#2d5a2d] transition-all"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="draft">Bản nháp (Draft)</option>
                                        <option value="published">Xuất bản (Published)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Nội dung bài viết</label>
                                <textarea
                                    rows={10}
                                    placeholder="Viết nội dung bài chia sẻ tại đây..."
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl py-4 px-6 font-bold text-gray-800 outline-none focus:border-[#2d5a2d] transition-all"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 justify-end border-t">
                                <KLButton variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Hủy</KLButton>
                                <KLButton type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Lưu bài viết"}
                                </KLButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
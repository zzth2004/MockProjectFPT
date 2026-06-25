import React, { useEffect, useCallback, useState, useMemo, useRef } from "react";
import {
    MessageSquare, Search, ChevronLeft, Send, User, Calendar,
    CheckCircle2, AlertCircle, X, ShieldAlert, BadgeInfo, Clock,
    HelpCircle, Mail, MessageCircle, Image, Paperclip
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import ticketService from "../../Service/API/ticketAPI/ticket.service";

export default function TicketManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, OPEN, IN_PROGRESS, CLOSED
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [uploadingFile, setUploadingFile] = useState(false);
    const chatEndRef = useRef(null);

    // --- 1. FETCH TICKETS LIST ---
    const fetchTicketsFn = useCallback(() => ticketService.getAll(), []);
    const { data: tickets = [], loading: listLoading, call: refreshList } = useCallApiHandler(fetchTicketsFn);

    // --- 2. FETCH SELECTED TICKET DETAIL ---
    const [ticketDetail, setTicketDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadTicketDetail = useCallback(async (id) => {
        if (!id) return;
        setDetailLoading(true);
        try {
            const data = await ticketService.getDetail(id);
            setTicketDetail(data);
        } catch (err) {
            console.error("Lỗi khi tải chi tiết ticket:", err);
            alert("Không thể tải chi tiết yêu cầu hỗ trợ.");
        } finally {
            setDetailLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshList();
    }, [refreshList]);

    useEffect(() => {
        if (selectedTicketId) {
            loadTicketDetail(selectedTicketId);
        } else {
            setTicketDetail(null);
        }
    }, [selectedTicketId, loadTicketDetail]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [ticketDetail]);

    // --- 3. HANDLERS ---
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFile(true);
        try {
            const res = await ticketService.uploadAttachment(file);
            if (res && res.url) {
                setAttachmentUrl(res.url);
            }
        } catch (err) {
            console.error("Lỗi khi tải ảnh lên:", err);
            alert("Tải ảnh đính kèm thất bại.");
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if ((!replyText.trim() && !attachmentUrl) || isReplying) return;

        setIsReplying(true);
        try {
            await ticketService.reply(selectedTicketId, replyText.trim(), attachmentUrl);
            setReplyText("");
            setAttachmentUrl(""); // Reset attachment after sending
            // Refresh detail to show new message and updated status
            await loadTicketDetail(selectedTicketId);
            refreshList();
        } catch (err) {
            console.error("Lỗi khi gửi phản hồi:", err);
            alert("Không thể gửi phản hồi.");
        } finally {
            setIsReplying(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            await ticketService.updateStatus(selectedTicketId, status);
            // Refresh details & list
            await loadTicketDetail(selectedTicketId);
            refreshList();
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái ticket:", err);
            alert("Không thể cập nhật trạng thái.");
        }
    };

    // --- 4. COLUMNS FOR TICKET LIST ---
    const columns = [
        {
            key: "id",
            title: "Yêu cầu",
            render: (val, row) => (
                <div className="flex items-center gap-3 py-1 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2d5a2d] to-[#4ade80] flex items-center justify-center text-white shadow-lg shadow-green-100 flex-shrink-0">
                        <MessageSquare size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] font-black text-gray-900 leading-tight">{row.subject}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Mã: #{val}</span>
                    </div>
                </div>
            )
        },
        {
            key: "user",
            title: "Người gửi",
            render: (user, row) => (
                <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-gray-800">
                        {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : "Học sinh"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                        <Mail size={10} /> {user?.email || "N/A"}
                    </span>
                </div>
            )
        },
        {
            key: "message",
            title: "Nội dung ban đầu",
            render: (val) => (
                <div className="text-left text-xs text-gray-500 font-medium max-w-xs truncate">
                    {val || "---"}
                </div>
            )
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            render: (val) => (
                <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs">
                    <Calendar size={13} />
                    {val ? new Date(val).toLocaleDateString('vi-VN') : "N/A"}
                </div>
            )
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (val) => {
                let badgeType = "info";
                let text = val;
                if (val === "open") {
                    badgeType = "warning";
                    text = "Chưa xử lý";
                } else if (val === "in_progress") {
                    badgeType = "info";
                    text = "Đang xử lý";
                } else if (val === "closed") {
                    badgeType = "success";
                    text = "Đã đóng";
                }
                return (
                    <KLBadge type={badgeType}>
                        <span className="font-black text-[10px] tracking-tight">{text}</span>
                    </KLBadge>
                );
            }
        }
    ];

    // Filter & Search Logic
    const filteredTickets = useMemo(() => {
        const safeTickets = Array.isArray(tickets) ? tickets : [];
        let list = safeTickets;
        if (statusFilter !== "ALL") {
            list = safeTickets.filter(item => item.status === statusFilter.toLowerCase());
        }
        if (!searchTerm) return list;
        return list.filter(item =>
            item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tickets, searchTerm, statusFilter]);

    // Statistics calculations
    const stats = useMemo(() => {
        const safeTickets = Array.isArray(tickets) ? tickets : [];
        const total = safeTickets.length;
        const open = safeTickets.filter(t => t.status === "open").length;
        const inProgress = safeTickets.filter(t => t.status === "in_progress").length;
        const closed = safeTickets.filter(t => t.status === "closed").length;
        return { total, open, inProgress, closed };
    }, [tickets]);

    // --- RENDER DETAIL VIEW ---
    if (selectedTicketId && ticketDetail) {
        const userFullName = ticketDetail.user
            ? `${ticketDetail.user.firstName || ''} ${ticketDetail.user.lastName || ''}`.trim() || ticketDetail.user.username
            : "Học sinh";
        return (
            <div className="space-y-6 p-4 animate-in fade-in duration-500 text-left">
                {/* Back button and title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                        onClick={() => setSelectedTicketId(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-black text-xs uppercase tracking-wider transition-colors"
                    >
                        <ChevronLeft size={16} strokeWidth={3} />
                        Quay lại danh sách
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">Đổi trạng thái:</span>
                        <select
                            className="bg-white border-2 border-gray-100 rounded-xl py-1.5 px-3 font-black text-xs text-gray-800 outline-none focus:border-[#2d5a2d] transition-all"
                            value={ticketDetail.status}
                            onChange={(e) => handleUpdateStatus(e.target.value)}
                        >
                            <option value="open">Chưa xử lý (Open)</option>
                            <option value="in_progress">Đang xử lý (In Progress)</option>
                            <option value="closed">Đã đóng (Closed)</option>
                        </select>
                    </div>
                </div>

                {/* Ticket general info */}
                <KLCard className="bg-white p-6 border-none shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{ticketDetail.subject}</h2>
                                <KLBadge type={ticketDetail.status === "closed" ? "success" : ticketDetail.status === "open" ? "warning" : "info"}>
                                    {ticketDetail.status === "closed" ? "Đã đóng" : ticketDetail.status === "open" ? "Chưa xử lý" : "Đang xử lý"}
                                </KLBadge>
                            </div>
                            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wide">Yêu cầu hỗ trợ #{ticketDetail.id}</p>
                        </div>
                        <div className="text-left md:text-right text-xs text-gray-400 space-y-1">
                            <p className="font-bold flex items-center md:justify-end gap-1.5">
                                <User size={13} /> {userFullName} ({ticketDetail.user?.email || "Không có Email"})
                            </p>
                            <p className="flex items-center md:justify-end gap-1.5">
                                <Calendar size={13} /> Gửi lúc: {new Date(ticketDetail.createdAt).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border text-sm text-gray-700 leading-relaxed italic">
                        <strong>Nội dung gốc:</strong> {ticketDetail.message}
                    </div>
                </KLCard>

                {/* Conversation Box */}
                <KLCard className="p-0 overflow-hidden shadow-2xl border-none bg-white flex flex-col h-[500px]">
                    <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-2">
                        <MessageCircle size={18} className="text-[#2d5a2d]" />
                        <span className="font-black text-xs text-gray-700 uppercase tracking-widest">Nhật ký hội thoại</span>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                        {/* Initial message as first bubble if messages array is empty */}
                        {(!ticketDetail.messages || ticketDetail.messages.length === 0) ? (
                            <div className="flex justify-center py-8 text-xs font-bold text-gray-400 uppercase tracking-widest italic">
                                Chưa có tin nhắn phản hồi nào
                            </div>
                        ) : (
                            ticketDetail.messages.map((msg, index) => {
                                const isSenderAdmin = msg.sender?.role === "admin";
                                const senderName = msg.sender
                                    ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || msg.sender.username
                                    : "Admin";
                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`flex flex-col max-w-[80%] ${isSenderAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                    >
                                        <span className="text-[10px] text-gray-400 font-bold mb-1">
                                            {isSenderAdmin ? "Bạn (Admin)" : senderName} • {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div
                                            className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${isSenderAdmin
                                                    ? 'bg-[#2d5a2d] text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 border rounded-tl-none'
                                                }`}
                                        >
                                            <div>{msg.messageText}</div>
                                            {msg.attachment && (
                                                <div className="mt-2 rounded-lg overflow-hidden max-w-xs border shadow-sm bg-gray-50">
                                                    <img 
                                                        src={msg.attachment} 
                                                        alt="Đính kèm" 
                                                        className="w-full h-auto object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.attachment, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Preview attached image */}
                    {attachmentUrl && (
                        <div className="px-6 py-2 bg-gray-50 flex items-center gap-3 border-t">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
                                <img src={attachmentUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => setAttachmentUrl("")}
                                    className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black rounded-full text-white transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                            <span className="text-xs text-gray-400 font-bold">Ảnh đã đính kèm!</span>
                        </div>
                    )}

                    {/* Reply Input Form */}
                    <form onSubmit={handleSendReply} className="p-4 border-t bg-white flex items-center gap-3">
                        <label 
                            htmlFor="ticket-file-upload" 
                            className={`p-3.5 rounded-2xl border bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer transition-all flex-shrink-0 ${uploadingFile ? "animate-pulse" : ""}`}
                        >
                            {uploadingFile ? (
                                <RefreshCw size={18} className="animate-spin text-[#2d5a2d]" />
                            ) : (
                                <Paperclip size={18} />
                            )}
                        </label>
                        <input
                            type="file"
                            id="ticket-file-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isReplying || uploadingFile || ticketDetail.status === "closed"}
                        />

                        <input
                            type="text"
                            placeholder="Nhập nội dung phản hồi học viên..."
                            className="flex-1 px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:bg-white focus:border-[#2d5a2d] font-medium text-sm transition-all"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={isReplying || uploadingFile || ticketDetail.status === "closed"}
                        />
                        <KLButton
                            type="submit"
                            disabled={(!replyText.trim() && !attachmentUrl) || isReplying || uploadingFile || ticketDetail.status === "closed"}
                            icon={Send}
                            className="bg-[#2d5a2d]"
                        >
                            Gửi
                        </KLButton>
                    </form>
                </KLCard>
            </div>
        );
    }

    // --- RENDER TICKETS LIST VIEW ---
    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Quản lý <span className="text-[#2d5a2d]">Yêu cầu Hỗ trợ</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Hệ thống tiếp nhận phản hồi & giải đáp thắc mắc</p>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-[#2d5a2d] rounded-xl"><HelpCircle size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Tổng số yêu cầu</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.total}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-500 rounded-xl"><AlertCircle size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Chưa xử lý (Open)</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.open}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Clock size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Đang xử lý</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.inProgress}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Đã xử lý xong</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.closed}</h3>
                    </div>
                </KLCard>
            </div>

            {/* SEARCH & TABLE */}
            <KLCard className="p-0 overflow-hidden shadow-2xl border-none bg-white rounded-[2rem]">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề hoặc email học viên..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {["ALL", "OPEN", "IN_PROGRESS", "CLOSED"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${statusFilter === filter ? "bg-[#E4FBE1] text-[#2d5a2d]" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                            >
                                {filter === "ALL" ? "Tất cả" : filter === "OPEN" ? "Chưa xử lý" : filter === "IN_PROGRESS" ? "Đang xử lý" : "Đã đóng"}
                            </button>
                        ))}
                    </div>
                </div>

                {listLoading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang nạp yêu cầu hỗ trợ...</div>
                ) : (
                    <KLTable
                        columns={columns}
                        data={filteredTickets}
                        onAction={(type, row) => setSelectedTicketId(row.id)}
                        hiddenActions={['reset', 'lock', 'edit', 'delete']}
                    />
                )}
            </KLCard>
        </div>
    );
}

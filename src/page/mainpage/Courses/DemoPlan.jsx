// DemoVideoPlayer.jsx
import React, { useRef, useState, useEffect } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Fullscreen,
    Shrink,
    SkipBack,
    SkipForward,
    CornerDownRight,
    Clock9,
    Tv,
    Eye,
    Settings,
} from "lucide-react";

export default function DemoVideoPlayer() {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (message) {
            const t = setTimeout(() => setMessage(""), 2000);
            return () => clearTimeout(t);
        }
    }, [message]);

    // Lắng nghe sự kiện ESC thoát fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFullscreen(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const src = "https://www.w3schools.com/html/mov_bbb.mp4";

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const handleTimeUpdate = () => {
            setProgress((v.currentTime / v.duration) * 100 || 0);
        };
        const handleLoaded = () => setDuration(v.duration || 0);
        const handleEnded = () => setPlaying(false);

        v.addEventListener("timeupdate", handleTimeUpdate);
        v.addEventListener("loadedmetadata", handleLoaded);
        v.addEventListener("ended", handleEnded);

        return () => {
            v.removeEventListener("timeupdate", handleTimeUpdate);
            v.removeEventListener("loadedmetadata", handleLoaded);
            v.removeEventListener("ended", handleEnded);
        };
    }, []);

    const togglePlay = async () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            await v.play();
            setPlaying(true);
        } else {
            v.pause();
            setPlaying(false);
        }
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };

    const handleVolume = (val) => {
        const v = videoRef.current;
        if (!v) return;
        v.volume = val;
        setVolume(val);
        setMuted(val === 0);
    };

    const scrub = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const v = videoRef.current;
        if (!v || !v.duration) return;
        v.currentTime = pct * v.duration;
        setProgress(pct * 100);
    };

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen()?.then(() => setFullscreen(true));
        } else {
            document.exitFullscreen()?.then(() => setFullscreen(false));
        }
    };

    const skip = (sec) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + sec));
    };

    return (
        <div
            ref={containerRef}
            className={`mx-auto mt-8 bg-black rounded-lg overflow-hidden shadow-lg ${fullscreen ? "w-screen h-screen" : "w-full max-w-5xl"
                }`}
        >
            {/* Video */}
            <div className="relative bg-black w-full h-full">
                <video
                    ref={videoRef}
                    className={`bg-black ${fullscreen ? "w-full h-full object-contain" : "w-full h-[60vh] object-contain"}`}
                    src={src}
                    controls={false}
                />

                {/* Overlay play */}
                {!playing && (
                    <button
                        onClick={togglePlay}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 p-6 rounded-full"
                    >
                        <Play size={40} className="text-white" />
                    </button>
                )}

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    {/* progress */}
                    <div
                        className="h-2 bg-gray-700 rounded cursor-pointer w-full"
                        onClick={scrub}
                    >
                        <div
                            className="h-2 bg-red-600 rounded"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                            <button onClick={() => skip(-10)} className="p-2">
                                <SkipBack size={18} className="text-white" />
                            </button>
                            <button onClick={togglePlay} className="p-2">
                                {playing ? (
                                    <Pause size={18} className="text-white" />
                                ) : (
                                    <Play size={18} className="text-white" />
                                )}
                            </button>
                            <button onClick={() => skip(10)} className="p-2">
                                <SkipForward size={18} className="text-white" />
                            </button>

                            <button onClick={toggleMute} className="p-2">
                                {muted || volume === 0 ? (
                                    <VolumeX size={18} className="text-white" />
                                ) : (
                                    <Volume2 size={18} className="text-white" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(e) => handleVolume(Number(e.target.value))}
                                className="w-24"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={toggleFullscreen} className="p-2">
                                {fullscreen ? (
                                    <Shrink size={18} className="text-white" />
                                ) : (
                                    <Fullscreen size={18} className="text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info panel (ẩn khi fullscreen) */}
            {!fullscreen && (
                <div className="p-4 bg-white relative">
                    <h2 className="text-xl font-semibold">Demo Video Player</h2>
                    <p className="text-sm mt-2 text-gray-600">
                        Custom HTML5 player with TailwindCSS + lucide-react.
                    </p>

                    {/* Thông báo */}
                    {message && (
                        <div className="absolute top-2 right-2 bg-black/80 text-white text-sm px-3 py-1 rounded shadow">
                            {message}
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={togglePlay}
                            className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700"
                        >
                            <Tv size={16} /> Watch
                        </button>

                        <button
                            onClick={() => setMessage("Tính năng đang phát triển...")}
                            className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-gray-100"
                        >
                            <Eye size={16} /> 1.2K views
                        </button>

                        <button
                            onClick={() => setMessage("Tính năng đang phát triển...")}
                            className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-gray-100"
                        >
                            <Clock9 size={16} /> Watch later
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

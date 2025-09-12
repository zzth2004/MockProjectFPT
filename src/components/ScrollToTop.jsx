import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setVisible(window.scrollY > 300);
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        visible && (
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 p-3 rounded-lg shadow-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center"
            >
                <ArrowUp size={20} />
            </button>
        )
    );

};

export default ScrollToTopButton;

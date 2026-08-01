import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function OAuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/", { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-[#8B95A1] text-[15px]">로그인 처리 중입니다...</p>
        </div>
    );
}
import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // --- GEMINI API İSTEĞİ ---
    const sendMessage = async () => {
        if (!input.trim()) return;

        // Kullanıcı mesajını ekle
        const userMsg = { sender: "user", text: input };
        setMessages([...messages, userMsg]);

        try {
            // Backend endpoint: /chat
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input }),
            });

            if (!response.ok) throw new Error("Sunucudan hata döndü");

            const data = await response.json();
            const botMsg = { sender: "bot", text: data.answer || "API'den yanıt alınamadı." };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            const botMsg = { sender: "bot", text: "API çağrısında bir hata oluştu: " + err.message };
            setMessages((prev) => [...prev, botMsg]);
        }

        setInput("");
    };

    // --- Enter tuşu ile gönderme ---
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <span>🤖 AI Asistan</span>
                <button className="close-btn" onClick={onClose}>✖</button>
            </div>

            <div className="chatbot-messages">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`msg ${msg.sender === "user" ? "user" : "bot"}`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="chatbot-input">
                <input
                    type="text"
                    placeholder="Bir şey sor..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown} // Enter ile gönder
                />
                <button onClick={sendMessage}>Gönder</button>
            </div>
        </div>
    );
};

export default Chatbot;

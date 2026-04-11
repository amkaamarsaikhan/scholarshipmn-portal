"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Шинэ мессеж ирэхэд доошоо гүйлгэх
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.content }]);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] rounded-[2.5rem] shadow-2xl border border-emerald-100 flex flex-col overflow-hidden mb-4 transition-all">
                    {/* Header */}
                    <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Bot size={20} />
                            </div>
                            <span className="font-black uppercase italic tracking-tighter text-sm">Scholarship AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)}><X size={20}/></button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                        {messages.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest">Танд юугаар туслах вэ?</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-slate-50">
                        <div className="relative flex items-center">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Асуултаа бичнэ үү..."
                                className="w-full h-12 pl-6 pr-12 bg-slate-50 rounded-xl outline-none text-xs font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                            <button onClick={handleSend} className="absolute right-2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
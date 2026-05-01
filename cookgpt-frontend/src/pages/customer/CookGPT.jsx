import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import apiClient from '../../api/apiClient';

/* ───────────── Markdown-lite renderer ───────────── */
const renderMarkdown = (text) => {
    if (!text) return '';
    // Cap multiple consecutive blank lines to a maximum of one blank line (2 newlines)
    let html = text.replace(/\n{3,}/g, '\n\n')
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#1c1c1c;color:#f5f5f5;padding:1rem 1.2rem;border-radius:10px;overflow-x:auto;font-size:0.88rem;line-height:1.7;margin:0.8rem 0;font-family:monospace">$2</pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code style="background:rgba(184,144,91,0.12);color:var(--primary-hover);padding:2px 6px;border-radius:4px;font-size:0.9em;font-family:monospace">$1</code>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4 style="margin:1.5rem 0 0.5rem;font-family:Playfair Display,serif;color:var(--text-primary)">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 style="margin:1.8rem 0 0.6rem;font-family:Playfair Display,serif;color:var(--text-primary)">$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 style="margin:2rem 0 0.7rem;font-family:Playfair Display,serif;color:var(--text-primary)">$1</h2>')
        // Numbered lists
        .replace(/^\d+\.\s+(.+)$/gm, '<li style="margin-bottom:0.3rem;padding-left:0.2rem;list-style-type:decimal">$1</li>')
        // Bullet lists
        .replace(/^[-*]\s+(.+)$/gm, '<li style="margin-bottom:0.3rem;padding-left:0.2rem;list-style-type:disc">$1</li>')
        // Line breaks
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');

    // Clean up excessive <br/> tags injected between list items
    html = html.replace(/<\/li>(?:\s*<br\s*\/?>\s*)+<li/gi, '</li>\n<li');

    // Wrap consecutive <li> in <ul> (now without massive <br/> gaps inside)
    html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul style="padding-left:1.4rem;margin:0.5rem 0">$1</ul>');

    // Clean up excessive <br/> tags around headers and lists to prevent double-margins
    html = html.replace(/(?:<br\s*\/?>\s*)+(<h[1-6]|<ul)/gi, '$1');
    html = html.replace(/(<\/h[1-6]>|<\/ul>)\s*(?:<br\s*\/?>\s*)+/gi, '$1<div style="height:0.8rem"></div>');

    return html;
};

/* ───────────── Typing indicator ───────────── */
const TypingIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 0' }}>
        <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0
        }}>AI</div>
        <div style={{
            background: 'var(--surface-color)', borderRadius: '18px 18px 18px 4px',
            padding: '1rem 1.4rem', border: '1px solid var(--border-color)',
            display: 'flex', gap: '5px', alignItems: 'center'
        }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--primary-color)', opacity: 0.5,
                    animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite`
                }} />
            ))}
        </div>
    </div>
);

/* ───────────── Suggestion Chips ───────────── */
const suggestions = [
    "What can I make with chicken and rice?",
    "Give me a healthy breakfast idea",
    "Is turmeric good for health?",
    "Best foods for weight loss",
    "Quick 15-minute dinner recipe",
    "Vegan high-protein meals",
];

const CookGPT = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selection, setSelection] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const isUserScrolledUp = useRef(false);

    // Track text selection for the "Ask CookGPT" popup
    useEffect(() => {
        const handleMouseUp = () => {
            const activeSelection = window.getSelection();
            const text = activeSelection.toString().trim();

            if (text && text.length > 2) {
                const range = activeSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setSelection({
                    text,
                    top: rect.top - 45, // Position above the selection
                    left: rect.left + (rect.width / 2) // Center horizontally
                });
            } else {
                setSelection(null);
            }
        };

        const handleMouseDown = (e) => {
            if (!e.target.closest('#ask-cookgpt-popup')) {
                setTimeout(() => {
                    if (window.getSelection().toString().trim() === '') {
                        setSelection(null);
                    }
                }, 10);
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    // Track if user has manually scrolled up
    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        // Consider 'scrolled up' if they are more than 100px away from the bottom
        isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 100;
    };

    // Auto-scroll to bottom only if user hasn't scrolled up manually
    useEffect(() => {
        if (!isUserScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (text) => {
        const userMessage = (text || inputValue).trim();
        if (!userMessage || isTyping) return;

        // Add user message to the conversation
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setInputValue('');
        setIsTyping(true);
        isUserScrolledUp.current = false; // Force scroll down when sending a new message

        // We don't add the empty assistant message here anymore.
        // The typing indicator will show until the first chunk arrives.
        try {
            // Build conversation history (exclude current message)
            const history = newMessages.slice(0, -1).map(m => ({
                role: m.role,
                content: m.content
            }));

            const token = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:8000/api/v1/ai/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversation_history: history,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('AUTH');
                }
                throw new Error('NETWORK');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let hasAddedMessage = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const raw = decoder.decode(value, { stream: true });
                // Parse SSE lines
                const lines = raw.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;

                        // Stop the typing indicator dots as soon as real text starts arriving
                        if (isTyping) setIsTyping(false);

                        // Each "data:" line is a line of text; reassemble with newlines
                        fullText += data + '\n';
                        // Update the assistant message in real-time
                        setMessages(prev => {
                            if (!hasAddedMessage) {
                                hasAddedMessage = true;
                                return [...prev, { role: 'assistant', content: fullText.trimEnd() }];
                            } else {
                                const updated = [...prev];
                                updated[updated.length - 1] = { role: 'assistant', content: fullText.trimEnd() };
                                return updated;
                            }
                        });
                    }
                }
            }

            // If we got nothing, show a fallback
            if (!fullText.trim()) {
                setMessages(prev => {
                    if (!hasAddedMessage) {
                        return [...prev, { role: 'assistant', content: "I couldn't process that. Please try again." }];
                    } else {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'assistant', content: "I couldn't process that. Please try again." };
                        return updated;
                    }
                });
            }

        } catch (err) {
            let errorMsg = "Something went wrong. Please try again.";
            if (err.message === 'AUTH') {
                errorMsg = "Please sign in to use CookGPT AI.";
            }
            setMessages(prev => {
                // If it failed before we ever created the message bubble, append one
                // Otherwise update the last one (which would be the incomplete stream)
                const lastMsg = prev[prev.length - 1];
                if (!lastMsg || lastMsg.role !== 'assistant') {
                    return [...prev, { role: 'assistant', content: errorMsg }];
                } else {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: errorMsg };
                    return updated;
                }
            });
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setInputValue('');
        inputRef.current?.focus();
    };

    const showWelcome = messages.length === 0 && inputValue.length === 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-color)' }}>
            <Navbar />
            {/* Scoped animations and custom selection highlight */}
            <style>{`
                ::selection {
                    background: var(--primary-color);
                    color: white;
                }
                ::-moz-selection {
                    background: var(--primary-color);
                    color: white;
                }
                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-6px); opacity: 1; }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes tooltipPop {
                    0% { opacity: 0; transform: translateX(-50%) scale(0.8) translateY(10px); }
                    100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
                }
                @keyframes gentlePulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
                .premium-tooltip {
                    position: fixed;
                    background: #1c1c1e;
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-family: 'Inter', 'Outfit', sans-serif;
                    font-weight: 500;
                    cursor: pointer;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08);
                    z-index: 9999;
                    animation: tooltipPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }
                .premium-tooltip:hover {
                    background: #2a2a2c;
                    transform: translateX(-50%) translateY(-2px);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(184,144,91,0.4);
                }
                .premium-tooltip::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 6px solid #1c1c1e;
                    transition: border-top-color 0.2s ease;
                }
                .premium-tooltip:hover::after {
                    border-top-color: #2a2a2c;
                }
                .chat-suggestion:hover {
                    background: rgba(184,144,91,0.12) !important;
                    border-color: var(--primary-color) !important;
                    transform: translateY(-2px);
                }
                .chat-input-area:focus-within {
                    border-color: var(--primary-color) !important;
                    box-shadow: 0 0 0 3px rgba(184,144,91,0.1) !important;
                }
                .chat-input-area textarea:focus {
                    outline: none !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                .chat-send-btn:hover:not(:disabled) {
                    background: var(--primary-hover) !important;
                    transform: scale(1.05);
                }
                .chat-send-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .clear-btn:hover {
                    background: rgba(0,0,0,0.04) !important;
                }
            `}</style>

            <div style={{
                display: 'flex', flexDirection: 'column',
                flex: 1, minHeight: 0, // This replaces calc(100vh - 80px) and stops outer scrolling
                width: '100%',
                maxWidth: '1200px', // Expanded width for a true full-page app feel
                margin: '0 auto',
                padding: '0 2rem'
            }}>

                {/* ── Header Bar (Only shows Clear Chat when needed) ── */}
                {messages.length > 0 && (
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                        padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)',
                        flexShrink: 0
                    }}>
                        <button className="clear-btn" onClick={clearChat} style={{
                            background: 'transparent', border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)', padding: '0.5rem 1.2rem',
                            borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer',
                            boxShadow: 'none', textTransform: 'none', letterSpacing: '0',
                            transition: 'all 0.2s ease'
                        }}>
                            Clear Chat
                        </button>
                    </div>
                )}

                {/* ── Chat Messages Area ── */}
                <div ref={chatContainerRef} onScroll={handleScroll} style={{
                    flex: 1, overflowY: 'auto', padding: '1.5rem 0',
                    display: 'flex', flexDirection: 'column', gap: '0.3rem'
                }}>

                    {/* Welcome Screen */}
                    {showWelcome && (
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', alignItems: 'center',
                            textAlign: 'center', padding: '2rem 1rem',
                            animation: 'fadeSlideUp 0.6s ease-out'
                        }}>
                            <h2 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '2rem', color: 'var(--text-primary)',
                                marginBottom: '0.8rem', fontWeight: '600'
                            }}>
                                Hello, I'm CookGPT
                            </h2>
                            <p style={{
                                color: 'var(--text-secondary)', fontSize: '1.05rem',
                                maxWidth: '520px', lineHeight: '1.7', fontWeight: '300',
                                marginBottom: '2.5rem'
                            }}>
                                How can I help you today? Ask me about cooking, recipes, nutrition & food-related health.
                            </p>

                            {/* Suggestion Chips */}
                            <div style={{
                                display: 'flex', flexWrap: 'wrap', gap: '0.7rem',
                                justifyContent: 'center', maxWidth: '600px'
                            }}>
                                {suggestions.map((s, i) => (
                                    <button key={i} className="chat-suggestion" onClick={() => sendMessage(s)} style={{
                                        background: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        padding: '0.65rem 1.2rem', borderRadius: '20px',
                                        fontSize: '0.88rem', cursor: 'pointer',
                                        boxShadow: 'none', textTransform: 'none',
                                        letterSpacing: '0', fontWeight: '400',
                                        transition: 'all 0.25s ease',
                                        animation: `fadeSlideUp 0.4s ease-out ${i * 0.07}s both`
                                    }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: isUser ? 'flex-end' : 'flex-start',
                                gap: '0.7rem',
                                animation: 'fadeSlideUp 0.35s ease-out',
                                marginBottom: '0.8rem'
                            }}>
                                {/* AI Avatar */}
                                {!isUser && (
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '0.7rem', fontWeight: '700',
                                        flexShrink: 0, marginTop: '4px'
                                    }}>AI</div>
                                )}

                                {/* Message Bubble */}
                                <div style={{
                                    maxWidth: isUser ? '75%' : '90%', // AI gets more space to read properly
                                    padding: '1rem 1.4rem',
                                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: isUser
                                        ? 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))'
                                        : 'var(--surface-color)',
                                    color: isUser ? 'white' : 'var(--text-primary)',
                                    border: isUser ? 'none' : '1px solid var(--border-color)',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.7',
                                    boxShadow: isUser
                                        ? '0 4px 15px rgba(184,144,91,0.25)'
                                        : 'var(--shadow-sm)',
                                    wordBreak: 'break-word'
                                }}>
                                    {isUser ? (
                                        <span>{msg.content}</span>
                                    ) : (
                                        <div
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                            style={{ lineHeight: '1.8' }}
                                        />
                                    )}
                                </div>

                                {/* User Avatar */}
                                {isUser && (
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600',
                                        flexShrink: 0, marginTop: '4px'
                                    }}>You</div>
                                )}
                            </div>
                        );
                    })}

                    {/* Typing Indicator */}
                    {isTyping && <TypingIndicator />}

                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input Area ── */}
                <div style={{
                    flexShrink: 0,
                    padding: '1rem 0 1.5rem',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <div className="chat-input-area" style={{
                        display: 'flex', alignItems: 'flex-end', gap: '0.8rem',
                        background: 'var(--surface-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        padding: '0.6rem 0.6rem 0.6rem 1.5rem',
                        transition: 'all 0.3s ease',
                        boxShadow: 'var(--shadow-sm)',
                        minHeight: '56px'
                    }}>
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything about cooking, recipes, or nutrition..."
                            rows={1}
                            style={{
                                flex: 1, border: 'none', outline: 'none',
                                background: 'transparent', resize: 'none',
                                fontSize: '1rem', color: 'var(--text-primary)',
                                fontFamily: "'Outfit', sans-serif",
                                lineHeight: '1.5', padding: '0.5rem 0',
                                maxHeight: '150px', overflowY: 'auto',
                                boxShadow: 'none'
                            }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                            }}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={() => sendMessage()}
                            disabled={!inputValue.trim() || isTyping}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'var(--primary-color)',
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 0, boxShadow: 'none', flexShrink: 0,
                                marginBottom: '2px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                    <div style={{
                        textAlign: 'center', marginTop: '0.7rem',
                        fontSize: '0.75rem', color: 'var(--text-secondary)',
                        opacity: 0.6
                    }}>
                        CookGPT specializes in cooking, recipes, nutrition & food-related health.
                    </div>
                </div>
            </div>

            {/* ── Ask CookGPT Premium Selection Popup ── */}
            {selection && (
                <div
                    id="ask-cookgpt-popup"
                    className="premium-tooltip"
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent selection from clearing
                        sendMessage(`Tell me more about: **"${selection.text}"**`);
                        setSelection(null);
                        // Removed removeAllRanges() so the text stays highlighted
                    }}
                    style={{
                        top: Math.max(10, selection.top) + 'px',
                        left: selection.left + 'px',
                        transform: 'translateX(-50%)' // Initial transform before hover overrides it
                    }}
                >
                    Ask CookGPT
                </div>
            )}

        </div>
    );
};

export default CookGPT;

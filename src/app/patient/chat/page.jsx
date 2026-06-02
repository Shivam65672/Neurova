'use client';

import { useState } from 'react';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: 'Hi John — I noticed an upward trend. Would you like suggestions?' },
  ]);
  const [input, setInput] = useState('');

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: 'user', text: input };
    setMessages((s) => [...s, newMsg]);
    setInput('');

    // Demo: Auto reply (placeholder for AI backend)
    setTimeout(() => {
      setMessages((s) => [...s, { id: Date.now()+1, from: 'ai', text: 'Thanks — based on your recent readings, consider checking salt intake and schedule a follow-up.' }]);
    }, 700);
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
          <p className="mt-2 text-zinc-400">Ask the assistant about your readings, medications, or general advice. Always confirm prescriptions with a doctor.</p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex h-80 flex-col gap-3 overflow-auto p-2">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[85%] ${m.from==='ai' ? 'self-start bg-zinc-800 text-zinc-200' : 'self-end bg-cyan-600 text-white'} rounded-md px-4 py-2`}> 
                  <div className="text-sm">{m.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="mt-4 flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question (demo only)"
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
              <button className="rounded-lg bg-cyan-500 px-4 py-2 text-white">Send</button>
            </form>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
            <strong className="text-white">Important:</strong> This assistant provides educational suggestions. Any medication advice must be validated by a licensed doctor via the Doctor Portal.
          </div>
        </div>
      </div>
      </div>
      <UserFooter />
    </>
  );
}

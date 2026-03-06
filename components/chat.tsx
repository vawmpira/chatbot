"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat-header";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import type { VisibilityType } from "./visibility-selector";

declare global {
  interface Window { puter: any; }
}

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<"ready" | "streaming" | "submitted">("ready");
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const puterReady = useRef(false);
  const abortRef = useRef(false);
  const chatSaved = useRef(false);

  // Load puter.js once
  useEffect(() => {
    if (puterReady.current || typeof window === "undefined") return;
    const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
    if (existing) { puterReady.current = true; return; }
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => { puterReady.current = true; };
    document.head.appendChild(script);
  }, []);

  // Strip provider prefix for puter: "openai/gpt-5" → "gpt-5", keep "deepseek/..."
  function toPuterModelId(modelId: string): string {
    const stripPrefixes = ["openai/", "anthropic/", "google/"];
    for (const prefix of stripPrefixes) {
      if (modelId.startsWith(prefix)) return modelId.slice(prefix.length);
    }
    return modelId;
  }

  // Generate a title from the first user message
  async function generateTitle(text: string): Promise<string> {
    try {
      const res = await fetch("/api/save-chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: id,
          title: text.slice(0, 60),
        }),
      });
      return text.slice(0, 60);
    } catch {
      return "New chat";
    }
  }

  async function saveToDb(allMessages: ChatMessage[], isFirstMessage: boolean) {
    try {
      const title = isFirstMessage
        ? (allMessages.find(m => m.role === "user")?.parts as any)?.[0]?.text?.slice(0, 60) ?? "New chat"
        : undefined;

      await fetch("/api/save-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title,
          visibility: initialVisibilityType,
          messages: allMessages.map(m => ({
            id: m.id,
            role: m.role,
            parts: m.parts,
            createdAt: (m as any).createdAt ?? new Date(),
          })),
        }),
      });
    } catch (e) {
      console.error("Failed to save chat:", e);
    }
  }

  const sendMessage = async (message: {
    role: "user";
    parts: { type: string; text?: string }[];
  }) => {
    const text = message.parts.find((p) => p.type === "text")?.text ?? "";
    if (!text.trim()) return;

    const isFirstMessage = messages.length === 0 && !chatSaved.current;

    const userMsg: ChatMessage = {
      id: generateUUID(),
      role: "user",
      parts: message.parts as any,
      createdAt: new Date(),
    } as any;

    const assistantId = generateUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      parts: [{ type: "text", text: "" }],
      createdAt: new Date(),
    } as any;

    const updatedMessages = [...messages, userMsg, assistantMsg];
    setMessages(updatedMessages);
    setStatus("streaming");
    abortRef.current = false;

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role as "user" | "assistant",
        content: (m.parts as any[])
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join(""),
      }));

      const puterModel = toPuterModelId(currentModelId);
      const response = await window.puter.ai.chat(history, {
        model: puterModel,
        stream: true,
      });

      let accumulated = "";
      for await (const chunk of response) {
        if (abortRef.current) break;
        const delta = chunk?.text ?? chunk?.choices?.[0]?.delta?.content ?? "";
        accumulated += delta;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, parts: [{ type: "text", text: accumulated }] }
              : m
          )
        );
      }

      // Save to DB after response is complete
      const finalMessages = [...messages, userMsg, {
        ...assistantMsg,
        parts: [{ type: "text", text: accumulated }],
      }];

      await saveToDb(finalMessages as ChatMessage[], isFirstMessage);
      chatSaved.current = true;

    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, parts: [{ type: "text", text: `⚠️ Error: ${err?.message ?? "Something went wrong."}` }] }
            : m
        )
      );
    } finally {
      abortRef.current = false;
      setStatus("ready");
    }
  };

  const stop = () => {
    abortRef.current = true;
    setStatus("ready");
  };

  const regenerate = async () => {
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;
    const lastUser = [...messages].reverse()[lastUserIndex];
    const cutIndex = messages.length - 1 - lastUserIndex;
    setMessages((prev) => prev.slice(0, cutIndex));
    await sendMessage({ role: "user", parts: lastUser.parts as any });
  };

  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({ role: "user", parts: [{ type: "text", text: query }] });
      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, hasAppendedQuery]);

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader
        chatId={id}
        isReadonly={isReadonly}
        selectedVisibilityType={initialVisibilityType}
      />

      <Messages
        addToolApprovalResponse={() => {}}
        chatId={id}
        isArtifactVisible={false}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        setMessages={setMessages as any}
        status={status}
        votes={[]}
      />

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        {!isReadonly && (
          <MultimodalInput
            attachments={[]}
            chatId={id}
            input={input}
            messages={messages}
            onModelChange={setCurrentModelId}
            selectedModelId={currentModelId}
            selectedVisibilityType={initialVisibilityType}
            sendMessage={sendMessage as any}
            setAttachments={() => {}}
            setInput={setInput}
            setMessages={setMessages as any}
            status={status}
            stop={stop}
          />
        )}
      </div>
    </div>
  );
}

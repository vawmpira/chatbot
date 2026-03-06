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
  interface Window {
    puter: any;
  }
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
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<"ready" | "streaming" | "submitted">("ready");
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const puterReady = useRef(false);

  // Load puter.js once
  useEffect(() => {
    if (puterReady.current || typeof window === "undefined") return;
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => { puterReady.current = true; };
    document.head.appendChild(script);
  }, []);

  const sendMessage = async (message: { role: "user"; parts: { type: string; text: string }[] }) => {
    const text = message.parts.find((p) => p.type === "text")?.text ?? "";
    if (!text.trim()) return;

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

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStatus("streaming");

    try {
      // Build conversation history for context
      const history = [...messages, userMsg].map((m) => ({
        role: m.role as "user" | "assistant",
        content: (m.parts as any[])
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join(""),
      }));

      const response = await window.puter.ai.chat(history, {
        model: currentModelId,
        stream: true,
      });

      let accumulated = "";
      for await (const chunk of response) {
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
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, parts: [{ type: "text", text: `Error: ${err?.message ?? "Something went wrong"}` }] }
            : m
        )
      );
    } finally {
      setStatus("ready");
    }
  };

  const stop = () => setStatus("ready");

  const regenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => prev.filter((m) => m.role !== "assistant" || prev.indexOf(m) < prev.indexOf(lastUser)));
    await sendMessage({ role: "user", parts: lastUser.parts as any });
  };

  // Handle ?query= param
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({ role: "user", parts: [{ type: "text", text: query }] });
      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
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
            sendMessage={sendMessage}
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

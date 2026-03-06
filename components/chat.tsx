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
  const abortRef = useRef(false);

  // Load puter.js once
  useEffect(() => {
    if (puterReady.current || typeof window === "undefined") return;
    const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
    if (existing) {
      puterReady.current = true;
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => {
      puterReady.current = true;
    };
    document.head.appendChild(script);
  }, []);

  // Strip the "provider/" prefix before sending to puter
  // e.g. "anthropic/claude-opus-4-6" → "claude-opus-4-6"
  //      "openai/gpt-5" → "gpt-5"
  //      "deepseek/deepseek-r1-0528" → "deepseek/deepseek-r1-0528" (kept, puter needs it)
  function toPuterModelId(modelId: string): string {
    const knownPrefixes = ["openai/", "anthropic/", "google/"];
    for (const prefix of knownPrefixes) {
      if (modelId.startsWith(prefix)) {
        return modelId.slice(prefix.length);
      }
    }
    // deepseek/ and others stay as-is
    return modelId;
  }

  const sendMessage = async (message: {
    role: "user";
    parts: { type: string; text?: string }[];
  }) => {
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
    abortRef.current = false;

    try {
      // Build full conversation history for context
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

        const delta =
          chunk?.text ??
          chunk?.choices?.[0]?.delta?.content ??
          "";

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
            ? {
                ...m,
                parts: [
                  {
                    type: "text",
                    text: `⚠️ Error: ${err?.message ?? "Something went wrong. Please try again."}`,
                  },
                ],
              }
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
    // Remove everything from the last user message onward
    const cutIndex = messages.length - 1 - lastUserIndex;
    setMessages((prev) => prev.slice(0, cutIndex));
    await sendMessage({
      role: "user",
      parts: lastUser.parts as any,
    });
  };

  // Handle ?query= param on first load
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

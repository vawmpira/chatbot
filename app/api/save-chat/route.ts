import { auth } from "@/app/(auth)/auth";
import { saveChat, saveMessages, updateChatTitleById } from "@/lib/db/queries";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, visibility, messages } = await request.json();

  try {
    await saveChat({
      id,
      userId: session.user.id,
      title: title || "New chat",
      visibility: visibility || "private",
    });

    if (messages?.length) {
      await saveMessages({
        messages: messages.map((m: any) => ({
          id: m.id,
          chatId: id,
          role: m.role,
          parts: m.parts,
          attachments: [],
          createdAt: new Date(m.createdAt),
        })),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    // Chat might already exist, try just saving messages
    try {
      if (messages?.length) {
        await saveMessages({
          messages: messages.map((m: any) => ({
            id: m.id,
            chatId: id,
            role: m.role,
            parts: m.parts,
            attachments: [],
            createdAt: new Date(m.createdAt),
          })),
        });
      }
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: "Failed to save" }, { status: 500 });
    }
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId, title } = await request.json();

  try {
    await updateChatTitleById({ chatId, title });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update title" }, { status: 500 });
  }
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind-ийн классуудыг цэгцтэй нэгтгэх функц (Одоо байгаа функц)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Телеграм суваг руу мэдэгдэл илгээх функц
 */
export const sendTelegramNotification = async (message: string) => {
  // --- ӨӨРИЙН ТОХИРГООГ ЭНД ХИЙНЭ ---
  const token = "YOUR_BOT_TOKEN"; // Өөрийн Bot Token-оо энд тавина
  const chatId = "YOUR_CHAT_ID";   // Өөрийн Chat ID-гаа энд тавина
  // --------------------------------
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API Error:", errorData);
    }
  } catch (error) {
    console.error("Telegram Fetch Error:", error);
  }
};
import { useState, useCallback, useEffect } from "react";
import { chatAPI } from "../services/api";
import toast from "react-hot-toast";
import { MESSAGES } from "../utils/constants";

export const useChat = (pdfId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadConversation = useCallback(async () => {
    if (!pdfId) return;

    setIsLoadingHistory(true);
    try {
      const response = await chatAPI.getConversation(pdfId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      toast.error("Failed to load conversation history");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [pdfId]);

  useEffect(() => {
    if (pdfId) {
      loadConversation();
    }
  }, [pdfId, loadConversation]);

  const sendMessage = useCallback(
    async (message) => {
      if (!pdfId || !message.trim()) return;

      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await chatAPI.sendMessage(pdfId, message);

        const assistantMessage = {
          role: "assistant",
          content: response.data.response,
          citations: response.data.citations,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error(MESSAGES.CHAT_ERROR);

        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [pdfId]
  );

  return {
    messages,
    isLoading,
    isLoadingHistory,
    sendMessage,
    loadConversation,
  };
};

import { useState, useCallback, useEffect } from "react";
import { chatAPI, pdfAPI } from "../services/api";
import toast from "react-hot-toast";
import { MESSAGES } from "../utils/constants";

export const useChat = (pdfId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState(null);
  const [embeddingProgress, setEmbeddingProgress] = useState(0);

  const loadConversation = useCallback(async () => {
    if (!pdfId || pdfId === "undefined") return;

    setIsLoadingHistory(true);
    try {
      const [conversationResponse, statusResponse] = await Promise.all([
        chatAPI.getConversation(pdfId),
        pdfAPI.getEmbeddingStatus(pdfId),
      ]);

      setMessages(conversationResponse.data.messages || []);
      setEmbeddingStatus(statusResponse.data.status);
      setEmbeddingProgress(statusResponse.data.progress || 0);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load conversation history");
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [pdfId]);

  useEffect(() => {
    if (pdfId && pdfId !== "undefined") {
      loadConversation();
    }
  }, [pdfId, loadConversation]);

  useEffect(() => {
    if (embeddingStatus === "processing" && pdfId && pdfId !== "undefined") {
      const interval = setInterval(async () => {
        try {
          const response = await pdfAPI.getEmbeddingStatus(pdfId);
          setEmbeddingStatus(response.data.status);
          setEmbeddingProgress(response.data.progress || 0);

          if (
            response.data.status === "completed" ||
            response.data.status === "failed"
          ) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Failed to update embedding status:", error);
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [embeddingStatus, pdfId]);

  const sendMessage = useCallback(
    async (message) => {
      if (!pdfId || pdfId === "undefined" || !message.trim()) return;

      const tempUserMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
        _id: `temp-user-${Date.now()}`,
        isTemporary: true,
      };

      setMessages((prev) => [...prev, tempUserMessage]);
      setIsLoading(true);

      try {
        const response = await chatAPI.sendMessage(pdfId, message);

        setMessages((prev) => {
          const withoutTemp = prev.filter(
            (msg) => msg._id !== tempUserMessage._id
          );

          const realUserMessage = {
            ...response.data.userMessage,
            timestamp:
              response.data.userMessage.timestamp || new Date().toISOString(),
          };

          const realAssistantMessage = {
            ...response.data.assistantMessage,
            timestamp:
              response.data.assistantMessage.timestamp ||
              new Date().toISOString(),
          };

          return [...withoutTemp, realUserMessage, realAssistantMessage];
        });
      } catch (error) {
        console.error("Failed to send message:", error);

        setMessages((prev) =>
          prev.filter((msg) => msg._id !== tempUserMessage._id)
        );

        if (error.response?.data?.details) {
          toast.error(error.response.data.details);
        } else {
          toast.error(MESSAGES.CHAT_ERROR);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [pdfId]
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!pdfId || pdfId === "undefined" || !messageId) return;

      if (messageId.startsWith("temp-")) {
        toast.error(
          "Cannot delete unsaved message. Please wait for the message to be saved."
        );
        return;
      }

      try {
        await chatAPI.deleteMessage(pdfId, messageId);
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success("Message deleted successfully");
      } catch (error) {
        console.error("Failed to delete message:", error);

        if (error.response?.status === 404) {
          toast.error("Message not found or already deleted");
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        } else if (error.response?.data?.details) {
          toast.error(error.response.data.details);
        } else {
          toast.error("Failed to delete message");
        }
      }
    },
    [pdfId]
  );

  const clearConversation = useCallback(async () => {
    if (!pdfId || pdfId === "undefined") return;

    try {
      await chatAPI.clearConversation(pdfId);
      setMessages([]);
      toast.success("Conversation cleared successfully");
    } catch (error) {
      console.error("Failed to clear conversation:", error);
      toast.error("Failed to clear conversation");
    }
  }, [pdfId]);

  const searchSimilar = useCallback(
    async (query) => {
      if (!pdfId || pdfId === "undefined" || !query.trim()) return [];

      try {
        const response = await chatAPI.searchSimilar(pdfId, query);
        return response.data.results || [];
      } catch (error) {
        console.error("Failed to search similar content:", error);
        return [];
      }
    },
    [pdfId]
  );

  const reprocessEmbeddings = useCallback(async () => {
    if (!pdfId || pdfId === "undefined") return;

    try {
      await pdfAPI.reprocessEmbeddings(pdfId);
      setEmbeddingStatus("processing");
      setEmbeddingProgress(0);
      toast.success("Document reprocessing started");
    } catch (error) {
      console.error("Failed to reprocess embeddings:", error);
      toast.error("Failed to reprocess document");
    }
  }, [pdfId]);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    embeddingStatus,
    embeddingProgress,
    sendMessage,
    deleteMessage,
    clearConversation,
    loadConversation,
    searchSimilar,
    reprocessEmbeddings,
  };
};

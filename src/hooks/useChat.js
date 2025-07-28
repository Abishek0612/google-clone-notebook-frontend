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
    if (!pdfId) return;

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

  useEffect(() => {
    if (embeddingStatus === "processing") {
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
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [embeddingStatus, pdfId]);

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
          citations: response.data.citations || [],
          relevanceScore: response.data.relevanceScore,
          sourceChunks: response.data.sourceChunks || [],
          searchMethod: response.data.searchMethod,
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

  const searchSimilar = useCallback(
    async (query) => {
      if (!pdfId || !query.trim()) return [];

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
    if (!pdfId) return;

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
    loadConversation,
    searchSimilar,
    reprocessEmbeddings,
  };
};

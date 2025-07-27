import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import ChatMessage from "./ChatMessage";

const ChatInterface = ({ pdfId, onCitationClick }) => {
  const { messages, isLoading, isLoadingHistory, sendMessage } = useChat(pdfId);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsRecording(false);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage.trim());
    setInputMessage("");
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600">
              Ask questions about your PDF document or use voice input.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={`${message.timestamp}-${index}`}
              message={message}
              onCitationClick={onCitationClick}
            />
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white flex-shrink-0">
        {isListening && (
          <div className="mb-3 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Listening...
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question or use voice input..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading || isListening}
              rows={1}
            />
          </div>

          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`px-4 py-3 rounded-lg transition-colors ${
              isRecording || isListening
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            disabled={isLoading}
          >
            {isRecording || isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || isListening}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

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
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Start a conversation
              </h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Ask questions about your PDF document or use voice input to get
                AI-powered insights.
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
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {isListening && (
            <div className="mb-4 text-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-red-100 text-red-800 font-medium">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                disabled={isLoading || isListening}
                rows={1}
              />
            </div>

            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`px-4 py-3 rounded-xl transition-all duration-200 shadow-sm ${
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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

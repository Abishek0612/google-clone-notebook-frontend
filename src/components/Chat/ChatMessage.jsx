import React from "react";
import { User, Bot, FileText } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import Button from "../UI/Button";

const ChatMessage = ({ message, onCitationClick }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fadeIn px-1 sm:px-0`}
    >
      <div
        className={`flex max-w-[90%] sm:max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start space-x-2`}
      >
        <div
          className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-blue-500 text-white ml-2"
              : "bg-gray-200 text-gray-600 mr-2"
          }`}
        >
          {isUser ? (
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </div>

        <div
          className={`flex flex-col ${
            isUser ? "items-end" : "items-start"
          } min-w-0 flex-1`}
        >
          <div
            className={`rounded-lg p-2 sm:p-3 max-w-full ${
              isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          </div>

          {message.citations && message.citations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.citations.map((citation, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onCitationClick?.(citation.page)}
                  className="text-xs px-2 py-1"
                >
                  <FileText className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                  Page {citation.page}
                </Button>
              ))}
            </div>
          )}

          <span className="text-xs text-gray-500 mt-1">
            {formatDate(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

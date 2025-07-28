import React from "react";
import { User, Bot, FileText, ExternalLink } from "lucide-react";
import { formatDate } from "../../utils/helpers";

const CitationButton = React.memo(({ citation, onCitationClick }) => (
  <button
    onClick={() => onCitationClick?.(citation.page)}
    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
  >
    <FileText className="w-3 h-3" />
    <span>Page {citation.page}</span>
    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
  </button>
));

const ChatMessage = React.memo(({ message, onCitationClick }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fadeIn px-1 sm:px-0 mb-6`}
    >
      <div
        className={`flex max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-start space-x-3`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ml-3"
              : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 mr-3"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>

        <div
          className={`flex flex-col ${
            isUser ? "items-end" : "items-start"
          } min-w-0 flex-1`}
        >
          <div
            className={`rounded-2xl p-3 sm:p-4 max-w-full shadow-sm ${
              isUser
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                : "bg-white text-gray-900 border border-gray-200"
            }`}
          >
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          </div>

          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.citations.map((citation, index) => (
                <CitationButton
                  key={`${citation.page}-${index}`}
                  citation={citation}
                  onCitationClick={onCitationClick}
                />
              ))}
            </div>
          )}

          <span className="text-xs text-gray-500 mt-2 px-1">
            {formatDate(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;

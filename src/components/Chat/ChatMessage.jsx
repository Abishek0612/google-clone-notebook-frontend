import React, { useState } from "react";
import {
  User,
  Bot,
  FileText,
  ExternalLink,
  Trash2,
  MoreVertical,
  Clock,
} from "lucide-react";
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

const MessageActions = React.memo(({ message, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  if (message.isTemporary || message._id?.startsWith("temp-")) {
    return null;
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDelete(message._id);
    }
    setShowActions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {showActions && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowActions(false)}
          />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32">
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
});

const MessageStatus = React.memo(({ message }) => {
  if (message.isTemporary || message._id?.startsWith("temp-")) {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-400">
        <Clock className="w-3 h-3 animate-pulse" />
        <span>Sending...</span>
      </div>
    );
  }

  return null;
});

const ChatMessage = React.memo(({ message, onCitationClick, onDelete }) => {
  const isUser = message.role === "user";
  const isTemporary = message.isTemporary || message._id?.startsWith("temp-");

  return (
    <div
      className={`group flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fadeIn px-1 sm:px-0 mb-6 ${isTemporary ? "opacity-70" : ""}`}
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
            className={`flex items-start space-x-2 ${
              isUser ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`rounded-2xl p-3 sm:p-4 max-w-full shadow-sm ${
                isUser
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              } ${isTemporary ? "opacity-80" : ""}`}
            >
              <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            </div>

            {onDelete && !isTemporary && (
              <MessageActions message={message} onDelete={onDelete} />
            )}
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

          <div
            className={`flex items-center space-x-2 mt-2 px-1 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <MessageStatus message={message} />

            {!isTemporary && (
              <>
                <span className="text-xs text-gray-500">
                  {formatDate(message.timestamp)}
                </span>
                {message.searchMethod && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      message.searchMethod === "vector"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {message.searchMethod === "vector" ? "Vector" : "Keyword"}
                  </span>
                )}
                {message.relevanceScore && (
                  <span className="text-xs text-gray-400">
                    {Math.round(message.relevanceScore * 100)}% match
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;

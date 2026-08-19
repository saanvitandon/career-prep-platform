import { useState } from "react";
import {
  BookOpen,
  Upload,
  FileText,
  Send,
  Sparkles,
  Trash2,
  Plus,
  Bot,
  User,
} from "lucide-react";

function PDFAssistant() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Operating Systems Notes.pdf",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "DBMS Interview Prep.pdf",
      size: "1.8 MB",
    },
  ]);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Hi! Upload your study material and ask me anything about your documents. I'll use the uploaded content to answer your questions.",
    },
  ]);

  const [isThinking, setIsThinking] = useState(false);

  const handleUpload = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    const newDocument = {
      id: Date.now(),
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
    };

    setDocuments((previous) => [...previous, newDocument]);
  };

  const removeDocument = (id) => {
    setDocuments((previous) =>
      previous.filter((document) => document.id !== id)
    );
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: message,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setIsThinking(true);

    // Temporary mock AI response.
    // Later this will call the RAG backend.
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        text: getMockAnswer(message),
        source:
          documents.length > 0
            ? "Operating Systems Notes.pdf · Page 12"
            : null,
      };

      setMessages((previous) => [...previous, aiMessage]);
      setIsThinking(false);
    }, 1200);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>

      {/* Header */}
      <section>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <BookOpen size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              PDF Assistant
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ask questions about your uploaded study material using AI.
            </p>
          </div>

        </div>
      </section>


      {/* Workspace */}
      <section className="mt-8 grid h-[calc(100vh-220px)] min-h-[550px] grid-cols-[260px_1fr] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* =========================
            DOCUMENT SIDEBAR
        ========================== */}

        <aside className="flex flex-col border-r border-slate-200 bg-slate-50/70">

          {/* Documents header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Your documents
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {documents.length} document
                {documents.length !== 1 ? "s" : ""}
              </p>
            </div>

            <label
              htmlFor="pdf-upload"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
            >
              <Plus size={17} />
            </label>

            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />

          </div>


          {/* Document list */}
          <div className="flex-1 overflow-y-auto p-3">

            {documents.length === 0 ? (

              <div className="flex h-full flex-col items-center justify-center px-5 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <FileText size={22} />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-700">
                  No documents yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Upload a PDF to start asking questions.
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {documents.map((document) => (
                  <DocumentItem
                    key={document.id}
                    document={document}
                    onRemove={() => removeDocument(document.id)}
                  />
                ))}

              </div>

            )}

          </div>


          {/* Upload button */}
          <div className="border-t border-slate-200 p-4">

            <label
              htmlFor="pdf-upload-bottom"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Upload size={15} />
              Upload PDF
            </label>

            <input
              id="pdf-upload-bottom"
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />

          </div>

        </aside>


        {/* =========================
            CHAT AREA
        ========================== */}

        <div className="flex min-w-0 flex-col">

          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Bot size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                AI Assistant
              </h2>

              <p className="text-xs text-slate-500">
                Answers based on your documents
              </p>
            </div>

            <div className="ml-auto flex items-center gap-1.5">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-medium text-green-600">
                Ready
              </span>

            </div>

          </div>


          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-7 py-6">

            <div className="mx-auto max-w-3xl space-y-6">

              {messages.map((chatMessage) => (
                <ChatMessage
                  key={chatMessage.id}
                  message={chatMessage}
                />
              ))}


              {/* Thinking */}
              {isThinking && (
                <div className="flex items-start gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Bot size={16} />
                  </div>

                  <div className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3">

                    <div className="flex gap-1">

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />

                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: "150ms" }}
                      />

                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: "300ms" }}
                      />

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>


          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="px-7 pb-3">

              <div className="mx-auto max-w-3xl">

                <p className="mb-2 text-xs font-medium text-slate-400">
                  Try asking
                </p>

                <div className="flex flex-wrap gap-2">

                  <Suggestion
                    text="What are the key concepts?"
                    onClick={() =>
                      setMessage("What are the key concepts?")
                    }
                  />

                  <Suggestion
                    text="Summarize this document"
                    onClick={() =>
                      setMessage("Summarize this document")
                    }
                  />

                  <Suggestion
                    text="Generate interview questions"
                    onClick={() =>
                      setMessage("Generate interview questions")
                    }
                  />

                </div>

              </div>

            </div>
          )}


          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-5">

            <div className="mx-auto max-w-3xl">

              <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition-all focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    documents.length > 0
                      ? "Ask something about your documents..."
                      : "Upload a PDF to start asking questions..."
                  }
                  disabled={documents.length === 0}
                  rows={1}
                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || documents.length === 0}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                    message.trim() && documents.length > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <Send size={17} />
                </button>

              </div>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                AI responses are generated from your uploaded documents.
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


/* Document item */
function DocumentItem({ document, onRemove }) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-3">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <FileText size={17} />
        </div>

        <div className="min-w-0 flex-1">

          <p className="truncate text-xs font-semibold text-slate-700">
            {document.name}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {document.size}
          </p>

        </div>

        <button
          onClick={onRemove}
          className="opacity-0 transition-opacity group-hover:opacity-100"
          title="Remove document"
        >
          <Trash2
            size={14}
            className="text-slate-400 hover:text-red-500"
          />
        </button>

      </div>

    </div>
  );
}


/* Chat message */
function ChatMessage({ message }) {
  const isUser = message.type === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-slate-100 text-slate-600"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>


      <div
        className={`max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
      >

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-tr-md bg-blue-600 text-white"
              : "rounded-tl-md bg-slate-100 text-slate-700"
          }`}
        >
          <p className="text-sm leading-6">
            {message.text}
          </p>
        </div>


        {/* RAG source */}
        {message.source && !isUser && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-600">
            <FileText size={12} />
            Source: {message.source}
          </div>
        )}

      </div>

    </div>
  );
}


/* Suggested question */
function Suggestion({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
    >
      {text}
    </button>
  );
}


/* Temporary mock answer */
function getMockAnswer(question) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("virtual memory")) {
    return "Virtual memory is a memory management technique that allows an operating system to use secondary storage as an extension of physical RAM. It allows programs to use more memory than is physically available while providing process isolation and efficient memory management.";
  }

  if (lowerQuestion.includes("summar")) {
    return "The document covers core operating system concepts including processes, threads, memory management, scheduling, synchronization, and file systems. The most important areas for interviews are process management, virtual memory, CPU scheduling, and synchronization.";
  }

  if (lowerQuestion.includes("key concepts")) {
    return "The key concepts include process management, threads, CPU scheduling, memory management, virtual memory, synchronization, deadlocks, and file systems.";
  }

  return "Based on the uploaded documents, this topic is covered in the study material. The relevant concepts include the definitions, underlying mechanisms, and practical considerations discussed in the document. In the final version, this response will be generated using retrieval-augmented generation from the uploaded content.";
}

export default PDFAssistant;
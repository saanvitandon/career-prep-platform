import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Upload,
  FileText,
  Send,
  Trash2,
  Plus,
  Bot,
  User,
  Sparkles,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  X,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INITIAL_MESSAGE = {
  id: "welcome",
  type: "ai",
  text: "Hi! Upload your study material, select a document, and ask me questions about its contents.",
};

function PDFAssistant() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  const [isThinking, setIsThinking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const selectedDocument = documents.find(
    (doc) => String(doc.id) === String(selectedDocumentId)
  );

  const getToken = () => localStorage.getItem("token");

  const apiRequest = async (path, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    const response = await fetch(`${API_URL}/api/pdf${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  };

  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    setError("");

    try {
      const data = await apiRequest("/documents");
      const loadedDocuments = Array.isArray(data.documents)
        ? data.documents
        : [];

      setDocuments(loadedDocuments);

      setSelectedDocumentId((currentId) => {
        if (
          loadedDocuments.some(
            (doc) => String(doc.id) === String(currentId)
          )
        ) {
          return currentId;
        }

        return loadedDocuments[0]?.id ?? null;
      });
    } catch (err) {
      console.error("Load PDF documents error:", err);
      setError(err.message || "Unable to load your documents.");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isThinking]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setNotice("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The PDF must be smaller than 10 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setIsUploading(true);

    try {
      const data = await apiRequest("/upload", {
        method: "POST",
        body: formData,
      });

      const uploadedDocument = data.document;

      if (!uploadedDocument?.id) {
        throw new Error("The server did not return the uploaded document.");
      }

      setDocuments((previous) => [
        uploadedDocument,
        ...previous.filter(
          (doc) => String(doc.id) !== String(uploadedDocument.id)
        ),
      ]);

      setSelectedDocumentId(uploadedDocument.id);
      setMessages([
        {
          ...INITIAL_MESSAGE,
          id: `welcome-${uploadedDocument.id}`,
        },
        {
          id: `upload-${uploadedDocument.id}`,
          type: "ai",
          text: `"${uploadedDocument.name || file.name}" has been uploaded and its text extracted successfully. You can now ask questions about it.`,
        },
      ]);

      setMessage("");
      setNotice("Your PDF is ready to explore.");
    } catch (err) {
      console.error("PDF upload error:", err);
      setError(err.message || "Unable to upload the PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = async (id) => {
    const documentToRemove = documents.find(
      (doc) => String(doc.id) === String(id)
    );

    if (!documentToRemove || deletingDocumentId !== null) return;

    const documentName =
      documentToRemove.name || documentToRemove.file_name || "this document";

    const confirmed = window.confirm(
      `Delete "${documentName}"? This also removes its saved document data.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingDocumentId(id);

    try {
      await apiRequest(`/documents/${id}`, { method: "DELETE" });

      const remaining = documents.filter(
        (doc) => String(doc.id) !== String(id)
      );

      setDocuments(remaining);

      if (String(selectedDocumentId) === String(id)) {
        setSelectedDocumentId(remaining[0]?.id ?? null);
        setMessages([INITIAL_MESSAGE]);
        setMessage("");
      }

      setNotice("Document deleted successfully.");
    } catch (err) {
      console.error("Delete PDF document error:", err);
      setError(err.message || "Unable to delete this document.");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const selectDocument = (documentId) => {
    if (String(documentId) === String(selectedDocumentId)) return;

    setSelectedDocumentId(documentId);
    setMessages([INITIAL_MESSAGE]);
    setMessage("");
    setError("");
    setNotice("");
  };

  const sendMessage = async (questionOverride) => {
    const question = (questionOverride ?? message).trim();

    if (!question || !selectedDocumentId || isThinking) return;

    setMessages((previous) => [
      ...previous,
      {
        id: `user-${Date.now()}`,
        type: "user",
        text: question,
      },
    ]);

    setMessage("");
    setIsThinking(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          question,
        }),
      });

      setMessages((previous) => [
        ...previous,
        {
          id: `ai-${Date.now()}`,
          type: "ai",
          text: data.answer,
          source: data.source,
        },
      ]);
    } catch (err) {
      console.error("PDF question error:", err);

      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          type: "ai",
          text: `I couldn't answer that question: ${err.message}`,
          isError: true,
        },
      ]);
    } finally {
      setIsThinking(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const suggestions = [
    "What are the key concepts?",
    "Summarize this document",
    "Explain the main topic",
  ];

  const documentName = (document) =>
    document?.name || document?.file_name || "Untitled PDF";

  return (
    <div className="relative mx-auto max-w-[1500px] space-y-7 pb-8 text-[#F0ECE5]">
      {/* Ambient lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.055),transparent_70%)] blur-3xl" />
        <div className="absolute -left-48 top-[45%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.035),transparent_70%)] blur-3xl" />
      </div>

      {/* Page heading */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#403B35] bg-gradient-to-br from-[#24221F] via-[#1C1B19] to-[#191817] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.045)] sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border border-[#C5A984]/10" />
        <div className="pointer-events-none absolute -right-4 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.07),transparent_70%)]" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#D4B994]">
            <Sparkles size={14} />
            YOUR AI STUDY SPACE
          </div>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#F1ECE4] sm:text-5xl">
                Your notes,
                <br />
                <span className="bg-gradient-to-r from-[#E7D8C1] via-[#C5A984] to-[#A99175] bg-clip-text text-transparent">
                  made clearer.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#AAA197] sm:text-base">
                Upload your study material, ask questions, and work through
                difficult concepts one conversation at a time.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#403B35] bg-[#191817]/80 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-xl font-semibold tabular-nums text-[#F0ECE5]">
                  {documents.length}
                </p>
                <p className="text-xs text-[#928A80]">
                  {documents.length === 1 ? "Document" : "Documents"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#403B35]/80 pt-5 text-xs text-[#8F877D]">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A4B49A] shadow-[0_0_8px_rgba(164,180,154,0.4)]" />
              PDF text extraction
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A984]" />
              Document-grounded answers
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} />
              Your personal library
            </span>
          </div>
        </div>
      </section>

      {/* Status messages */}
      {(error || notice) && (
        <div
          role={error ? "alert" : "status"}
          aria-live="polite"
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            error
              ? "border-[#744540] bg-[#332321] text-[#E7B2A9]"
              : "border-[#465B45] bg-[#222D23] text-[#C1D4B8]"
          }`}
        >
          {error ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          )}

          <p className="min-w-0 flex-1">{error || notice}</p>

          <button
            type="button"
            onClick={() => {
              setError("");
              setNotice("");
            }}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-lg p-1 opacity-70 transition hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Workspace */}
      <section className="grid min-h-[720px] grid-cols-1 gap-5 xl:h-[calc(100vh-330px)] xl:min-h-[620px] xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* Document library */}
        <aside className="flex min-h-[320px] flex-col overflow-hidden rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#22211F] to-[#1B1A19] shadow-[0_14px_38px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.035)] xl:min-h-0">
          <div className="flex items-center justify-between gap-3 border-b border-[#403B35] px-5 py-5">
            <div>
              <h2 className="font-semibold text-[#F0ECE5]">Your library</h2>
              <p className="mt-1 text-xs text-[#928A80]">
                Select a PDF to get started
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload PDF"
              aria-label="Upload PDF"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] text-[#241E17] shadow-[0_4px_16px_rgba(160,126,86,0.12)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Plus size={19} />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
            />
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center gap-2 p-6 text-xs text-[#A59D93]">
                <LoaderCircle size={16} className="animate-spin" />
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#403B35] bg-[#292621] text-[#B7A18A]">
                  <BookOpen size={22} />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-[#E9E2D8]">
                  Your library is empty
                </h3>
                <p className="mt-2 max-w-[200px] text-xs leading-5 text-[#928A80]">
                  Add your first PDF to start exploring your study material.
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#65513C] bg-[#302920] px-4 py-2.5 text-xs font-semibold text-[#D8BD98] transition hover:bg-[#3A3025]"
                >
                  <Upload size={14} />
                  Upload your first PDF
                </button>
              </div>
            ) : (
              documents.map((document) => (
                <DocumentItem
                  key={document.id}
                  document={document}
                  name={documentName(document)}
                  size={formatSize(document.size)}
                  selected={
                    String(selectedDocumentId) === String(document.id)
                  }
                  deleting={
                    String(deletingDocumentId) === String(document.id)
                  }
                  disabled={deletingDocumentId !== null}
                  onSelect={() => selectDocument(document.id)}
                  onRemove={() => removeDocument(document.id)}
                />
              ))
            )}
          </div>

          <div className="border-t border-[#403B35] p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#51483D] bg-[#29251F] px-4 py-3 text-sm font-medium text-[#D8BD98] transition hover:border-[#8C7455] hover:bg-[#332B21] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {isUploading ? "Uploading PDF..." : "Upload a PDF"}
            </button>

            <p className="mt-3 text-center text-[11px] leading-5 text-[#81796F]">
              PDF files only · Maximum 10 MB
            </p>
          </div>
        </aside>

        {/* Chat panel */}
        <div className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#22211F] to-[#1B1A19] shadow-[0_14px_38px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.035)] xl:min-h-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-[#403B35] px-4 py-4 sm:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-gradient-to-br from-[#3A3025] to-[#29231D] text-[#D4B994]">
              <Bot size={21} />
            </span>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-[#F0ECE5]">PDF Assistant</h2>
              <p className="mt-1 truncate text-xs text-[#928A80]">
                {selectedDocument
                  ? documentName(selectedDocument)
                  : "Select or upload a document"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#403B35] bg-[#191817] px-3 py-1.5 text-xs font-medium text-[#B5ADA2]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isThinking
                    ? "animate-pulse bg-[#C5A984]"
                    : selectedDocumentId
                      ? "bg-[#A4B49A] shadow-[0_0_7px_rgba(164,180,154,0.3)]"
                      : "bg-[#81796F]"
                }`}
              />
              <span className="hidden sm:inline">
                {isThinking
                  ? "Thinking"
                  : selectedDocumentId
                    ? "Ready"
                    : "Waiting"}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {!selectedDocument && !isLoadingDocuments && (
                <div className="rounded-2xl border border-dashed border-[#51483D] bg-[#191817] p-6 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#403B35] bg-[#292621] text-[#B7A18A]">
                    <FileText size={20} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[#E9E2D8]">
                    Start with a document
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#928A80]">
                    Upload a PDF or choose one from your library to ask
                    questions about its contents.
                  </p>
                </div>
              )}

              {messages.map((chatMessage) => (
                <ChatMessage key={chatMessage.id} message={chatMessage} />
              ))}

              {isThinking && (
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                    <Bot size={17} />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-[#403B35] bg-[#25231F] px-4 py-3 text-sm text-[#B5ADA2]">
                    <LoaderCircle
                      size={15}
                      className="animate-spin text-[#C5A984]"
                    />
                    Reading your document...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && selectedDocumentId && !isThinking && (
            <div className="px-4 pb-4 sm:px-6">
              <div className="mx-auto max-w-3xl">
                <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] text-[#928A80]">
                  A FEW IDEAS TO GET YOU STARTED
                </p>

                <div className="flex flex-wrap gap-2">
                  {suggestions.map((question) => (
                    <Suggestion
                      key={question}
                      text={question}
                      onClick={() => sendMessage(question)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="shrink-0 border-t border-[#403B35] bg-[#1D1C1A] p-4 sm:p-5">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-end gap-2 rounded-[20px] border border-[#454039] bg-[#151412] p-2 transition focus-within:border-[#A58A68] focus-within:ring-4 focus-within:ring-[#C5A984]/10">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedDocumentId
                      ? "Ask something about your PDF..."
                      : "Upload a PDF to start asking questions..."
                  }
                  disabled={!selectedDocumentId || isThinking}
                  rows={1}
                  className="max-h-32 min-h-10 min-w-0 flex-1 resize-y bg-transparent px-3 py-2.5 text-sm leading-5 text-[#F0ECE5] outline-none placeholder:text-[#746D63] disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={
                    !message.trim() || !selectedDocumentId || isThinking
                  }
                  aria-label="Send message"
                  title="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] text-[#241E17] shadow-[0_4px_16px_rgba(160,126,86,0.1)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-[#403B35] disabled:bg-[#302D28] disabled:text-[#746D63] disabled:shadow-none"
                >
                  {isThinking ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] text-[#81796F]">
                Enter to send · Shift + Enter for a new line
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DocumentItem({
  document,
  name,
  size,
  selected,
  deleting,
  disabled,
  onSelect,
  onRemove,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-3 transition-all duration-200 ${
        selected
          ? "border-[#80694C] bg-gradient-to-br from-[#332B22] to-[#27231E] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_rgba(197,169,132,0.035)]"
          : "border-[#393530] bg-[#1D1C1A] hover:border-[#51483D] hover:bg-[#25231F]"
      }`}
    >
      {selected && (
        <div className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-gradient-to-b from-[#E0C7A5] to-[#8F7350]" />
      )}

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              selected
                ? "border-[#65513C] bg-[#403426] text-[#D8BD98]"
                : "border-[#403B35] bg-[#292621] text-[#A59D93]"
            }`}
          >
            <FileText size={18} />
          </span>

          <span className="min-w-0 flex-1 pt-0.5">
            <span className="block break-words text-xs font-semibold leading-5 text-[#E9E2D8]">
              {name}
            </span>
            <span className="mt-1 block text-[11px] text-[#81796F]">
              {size || "PDF document"}
            </span>

            {selected && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#65513C]/70 bg-[#3A3025] px-2 py-1 text-[10px] font-semibold text-[#D8BD98]">
                <span className="h-1 w-1 rounded-full bg-[#C5A984]" />
                Selected
              </span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Delete ${name}`}
          title="Delete document"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#81796F] transition hover:bg-[#382422] hover:text-[#E7B2A9] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {deleting ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.type === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
          isUser
            ? "border-[#65513C]/60 bg-[#332A21] text-[#D8BD98]"
            : message.isError
              ? "border-[#744540] bg-[#332321] text-[#E7B2A9]"
              : "border-[#51483D] bg-[#302920] text-[#D4B994]"
        }`}
      >
        {isUser ? <User size={17} /> : <Bot size={17} />}
      </span>

      <div
        className={`flex min-w-0 max-w-[88%] flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-tr-md border border-[#65513C] bg-gradient-to-br from-[#3A3025] to-[#29231D] text-[#F0E3D1]"
              : message.isError
                ? "rounded-tl-md border border-[#744540] bg-[#332321] text-[#E7B2A9]"
                : "rounded-tl-md border border-[#403B35] bg-[#292723] text-[#D9D2C8]"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.text}
          </p>
        </div>

        {message.source && !isUser && (
          <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full border border-[#51483D] bg-[#29251F] px-3 py-1.5 text-[11px] font-medium text-[#C5A984]">
            <FileText size={12} className="shrink-0" />
            <span className="break-all">Source: {message.source}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Suggestion({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-[#403B35] bg-[#211F1D] px-3.5 py-2.5 text-xs font-medium text-[#B5ADA2] transition hover:border-[#80694C] hover:bg-[#302920] hover:text-[#E0C7A5]"
    >
      {text}
      <ArrowUpRight size={13} className="opacity-60" />
    </button>
  );
}

export default PDFAssistant;
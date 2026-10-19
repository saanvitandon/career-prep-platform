
import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Target,
  TrendingUp,
  X,
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  ScanSearch,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ResumeAnalyzer() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (selectedFile) => {
    setError("");
    setAnalysis(null);

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" ||
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setError("Please choose a PDF file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("Your PDF must be smaller than 10 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!file || isAnalyzing) return;

    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(`${API_URL}/api/resume/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to analyze your resume. Please try again."
        );
      }

      if (!data.analysis) {
        throw new Error("The server did not return an analysis result.");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Resume analysis failed:", err);
      setError(
        err.message ||
          "Could not connect to the backend. Check that your server is running."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setError("");
    setIsDragging(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const score = Math.min(100, Math.max(0, Number(analysis?.atsScore) || 0));

  const strengths = Array.isArray(analysis?.strengths)
    ? analysis.strengths
    : [];

  const improvements = Array.isArray(analysis?.improvements)
    ? analysis.improvements
    : [];

  const scoreLabel =
    score >= 80
      ? "Strong foundation"
      : score >= 60
        ? "Room to improve"
        : "Needs attention";

  return (
    <div className="relative mx-auto max-w-[1400px] space-y-7 pb-8 text-[#F0ECE5]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.055),transparent_70%)] blur-3xl" />
        <div className="absolute -left-48 top-[45%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.035),transparent_70%)] blur-3xl" />
      </div>

      {/* Page introduction */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#403B35] bg-gradient-to-br from-[#26231F] via-[#1E1C19] to-[#191817] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border border-[#C5A984]/10" />
        <div className="pointer-events-none absolute -right-4 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.07),transparent_70%)]" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#D4B994]">
            <Sparkles size={14} />
            RESUME INTELLIGENCE
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#F1ECE4] sm:text-5xl">
                Make your resume
                <br />
                <span className="bg-gradient-to-r from-[#E7D8C1] via-[#C5A984] to-[#A99175] bg-clip-text text-transparent">
                  work harder for you.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#AAA197] sm:text-base">
                Get an estimated ATS score, understand your strengths, and
                discover practical ways to make your resume stronger.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#403B35]/80 pt-5 text-xs text-[#928A80]">
            <span className="inline-flex items-center gap-2">
              <Target size={14} className="text-[#C5A984]" />
              Estimated ATS score
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A4B49A]" />
              Strengths assessment
            </span>
            <span className="inline-flex items-center gap-2">
              <TrendingUp size={14} className="text-[#C5A984]" />
              Actionable suggestions
            </span>
          </div>
        </div>
      </section>

      {!analysis ? (
        <>
          {/* Upload workspace */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
            <div className="relative overflow-hidden rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#A58A68]">
                    STEP 01 / UPLOAD
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#F0ECE5] sm:text-2xl">
                    Upload your resume
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#A59D93]">
                    Start with your current resume in PDF format.
                  </p>
                </div>

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#65513C]/60 bg-gradient-to-br from-[#3A3025] to-[#29231D] text-[#D4B994]">
                  <FileText size={22} />
                </span>
              </div>

              <input
                ref={inputRef}
                id="resume-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="sr-only"
                disabled={isAnalyzing}
              />

              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (!isAnalyzing) setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsDragging(false);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  if (!isAnalyzing) {
                    selectFile(event.dataTransfer.files?.[0]);
                  }
                }}
                className={`mt-6 rounded-[22px] border border-dashed p-6 text-center transition-all duration-300 sm:p-10 ${
                  isDragging
                    ? "border-[#D8BD98] bg-[#332A21] shadow-[inset_0_0_35px_rgba(197,169,132,0.07),0_0_25px_rgba(197,169,132,0.07)]"
                    : file
                      ? "border-[#667A61] bg-gradient-to-br from-[#252E25] to-[#1D241D] shadow-[inset_0_1px_0_rgba(164,180,154,0.06)]"
                      : "border-[#51483D] bg-[#191817] hover:border-[#80694C] hover:bg-[#211F1C]"
                }`}
              >
                <span
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${
                    file
                      ? "border-[#465B45] bg-[#303D2F] text-[#B5C4AA]"
                      : "border-[#403B35] bg-[#292621] text-[#C5A984]"
                  }`}
                >
                  {file ? <FileText size={26} /> : <Upload size={25} />}
                </span>

                {file ? (
                  <>
                    <h3 className="mx-auto mt-4 max-w-full break-words text-sm font-semibold text-[#E9E2D8]">
                      {file.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#928A80]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · PDF document
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="rounded-xl border border-[#51483D] bg-[#292621] px-4 py-2.5 text-xs font-semibold text-[#D9D0C3] transition hover:border-[#80694C] hover:bg-[#332A21] disabled:opacity-50"
                      >
                        Choose another
                      </button>

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isAnalyzing}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#928A80] transition hover:bg-[#302522] hover:text-[#E7B2A9] disabled:opacity-50"
                      >
                        <X size={14} />
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mt-4 text-base font-semibold text-[#E9E2D8]">
                      Drop your resume here
                    </h3>
                    <p className="mt-2 text-sm text-[#928A80]">
                      Or choose a file from your computer
                    </p>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={isAnalyzing}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-5 py-3 text-sm font-semibold text-[#241E17] shadow-[0_4px_16px_rgba(160,126,86,0.1)] transition hover:brightness-110 disabled:opacity-50"
                    >
                      <Upload size={16} />
                      Browse files
                    </button>
                    <p className="mt-4 text-xs text-[#81796F]">
                      PDF only · Maximum file size 10 MB
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-2xl border border-[#744540] bg-[#332321] p-4 text-sm text-[#E7B2A9]"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-r from-[#D8C1A0] via-[#C5A984] to-[#B39470] px-5 py-3.5 text-sm font-semibold text-[#241E17] shadow-[0_5px_20px_rgba(160,126,86,0.08)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-[#403B35] disabled:bg-[#302D28] disabled:text-[#746D63] disabled:shadow-none">
                {isAnalyzing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Analyzing your resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Analyze my resume
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {isAnalyzing && (
                <p className="mt-3 text-center text-xs text-[#928A80]">
                  Your resume is being processed. This may take a moment.
                </p>
              )}
            </div>

            {/* Feature panel */}
            <aside className="relative flex flex-col overflow-hidden rounded-[26px] border border-[#51483D] bg-gradient-to-br from-[#302920] via-[#26221D] to-[#201E1B] p-6 shadow-[0_14px_38px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.09),transparent_70%)]" />

              <div className="relative">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C5A984]">
                  THE BREAKDOWN
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#F0E7DA]">
                  A clearer picture.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#AAA093]">
                  Understand what is working in your resume and what deserves
                  your attention next.
                </p>

                <div className="mt-8 space-y-6">
                  <InfoItem
                    icon={<Target size={19} />}
                    title="ATS score"
                    description="An estimated score based on the existing review rules."
                  />
                  <InfoItem
                    icon={<CheckCircle2 size={19} />}
                    title="Your strengths"
                    description="Positive aspects identified by the analyzer."
                  />
                  <InfoItem
                    icon={<TrendingUp size={19} />}
                    title="Improvement ideas"
                    description="Practical suggestions to strengthen your resume."
                  />
                </div>
              </div>

              <div className="relative mt-auto pt-8">
                <div className="rounded-2xl border border-[#65513C]/50 bg-[#1D1A17]/75 p-4">
                  <p className="text-xs leading-5 text-[#AAA093]">
                    <strong className="font-semibold text-[#D8BD98]">
                      Good to know:
                    </strong>{" "}
                    An ATS score is an estimate, not a guarantee of how an
                    employer's system will rank your resume.
                  </p>
                </div>
              </div>
            </aside>
          </section>
        </>
      ) : (
        <>
          {/* Results heading */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#465B45] bg-[#253025] px-3 py-1.5 text-xs font-semibold text-[#B5C4AA]">
                <CheckCircle2 size={14} />
                ANALYSIS COMPLETE
              </div>
              <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight text-[#F0ECE5] sm:text-3xl">
                Your resume review
              </h2>
              <p className="mt-2 break-words text-sm text-[#928A80]">
                {analysis.fileName || file?.name}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#51483D] bg-[#24221F] px-4 py-2.5 text-sm font-semibold text-[#D9D0C3] transition hover:border-[#80694C] hover:bg-[#302920]"
            >
              <RotateCcw size={16} />
              Analyze another
            </button>
          </section>

          {/* Score and strengths */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative overflow-hidden rounded-[26px] border border-[#80694C] bg-gradient-to-br from-[#393024] via-[#30281F] to-[#26211B] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-7">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.10),transparent_70%)]" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.17em] text-[#C5A984]">
                    ESTIMATED ATS SCORE
                  </p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-6xl font-semibold tracking-[-0.05em] text-[#F0E6D8]">
                      {score}
                    </span>
                    <span className="text-sm text-[#A99175]">/ 100</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#D8BD98]">
                    {scoreLabel}
                  </p>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#80694C] bg-[#413526] text-[#D8BD98]">
                  <Target size={23} />
                </span>
              </div>

              <div
                className="relative mt-6 h-2.5 overflow-hidden rounded-full bg-[#514333]"
                role="progressbar"
                aria-label="Estimated ATS score"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9B7B53] via-[#D8BD98] to-[#E8D6B9] shadow-[0_0_12px_rgba(197,169,132,0.25)] transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6 shadow-[0_14px_38px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#465B45] bg-[#293328] text-[#B5C4AA]">
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-[#F0ECE5]">
                    What's working
                  </h3>
                  <p className="mt-1 text-sm text-[#928A80]">
                    Strengths identified in your resume.
                  </p>
                </div>
              </div>

              {strengths.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-[#A4B49A]"
                      />
                      <p className="text-sm leading-6 text-[#C9C1B6]">
                        {strength}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-[#928A80]">
                  No strengths were returned for this analysis.
                </p>
              )}
            </div>
          </section>

          {/* Summary */}
          {analysis.summary && (
            <section className="rounded-[26px] border border-[#403B35] bg-gradient-to-br from-[#23211E] to-[#1B1A19] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <p className="text-[10px] font-semibold tracking-[0.17em] text-[#A58A68]">
                THE BIG PICTURE
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[#F0ECE5]">
                Analysis summary
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#B5ADA2]">
                {analysis.summary}
              </p>
            </section>
          )}

          {/* Improvements */}
          <section className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6 shadow-[0_14px_38px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                <TrendingUp size={20} />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[#F0ECE5]">
                  Where to improve
                </h3>
                <p className="mt-1 text-sm text-[#928A80]">
                  Work through these suggestions to strengthen your resume.
                </p>
              </div>
            </div>

            {improvements.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {improvements.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-[#393530] bg-[#1D1C1A] p-4 transition hover:border-[#65513C] hover:bg-[#25221E]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-xs font-semibold text-[#D8BD98]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#E9E2D8]">
                        Suggestion {index + 1}
                      </h4>
                      <p className="mt-1.5 text-sm leading-6 text-[#A59D93]">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-[#928A80]">
                No improvement suggestions were returned.
              </p>
            )}
          </section>

          {/* Next step */}
          <div className="relative overflow-hidden rounded-[24px] border border-[#51483D] bg-gradient-to-r from-[#302920] via-[#27231E] to-[#211F1C] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
            <div className="pointer-events-none absolute -right-8 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.08),transparent_70%)]" />

            <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-[#F0ECE5]">
                  Ready for your next step?
                </h3>
                <p className="mt-1 text-sm text-[#AAA093]">
                  Compare your resume with a job description to find relevant
                  skill gaps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.location.assign("/resume-matcher")}
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-5 py-3 text-sm font-semibold text-[#241E17] transition hover:brightness-110"
              >
                Match a job
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#51483D] bg-[#302920] text-[#D4B994]">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-[#E9E2D8]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#A59D93]">{description}</p>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;

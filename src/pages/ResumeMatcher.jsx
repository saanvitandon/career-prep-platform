
import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  BriefcaseBusiness,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  TrendingUp,
  Target,
  ArrowRight,
  X,
  ShieldCheck,
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ResumeMatcher() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
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
      setError("Your PDF must be 10 MB or smaller.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!file || jobDescription.trim().length < 30 || isAnalyzing) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription.trim());

      const response = await fetch(`${API_URL}/api/resume/match`, {
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

      if (!response.ok || !data.success || !data.result) {
        throw new Error(data.message || "Resume matching failed.");
      }

      setAnalysis(data.result);
    } catch (err) {
      console.error("Resume matching error:", err);
      setError(
        err.message || "Could not connect to the backend. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setAnalysis(null);
    setError("");
    setIsDragging(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const canAnalyze =
    Boolean(file) && jobDescription.trim().length >= 30 && !isAnalyzing;

  const matchScore = clampScore(analysis?.matchScore);
  const skillsScore = clampScore(analysis?.skillsMatchScore);
  const keywordScore = clampScore(analysis?.keywordMatchScore);

  const matchedSkills = Array.isArray(analysis?.matchedSkills)
    ? analysis.matchedSkills
    : [];

  const missingSkills = Array.isArray(analysis?.missingSkills)
    ? analysis.missingSkills
    : [];

  const recommendations = Array.isArray(analysis?.recommendations)
    ? analysis.recommendations
    : [];

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
            <BriefcaseBusiness size={14} />
            JOB COMPATIBILITY
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#F1ECE4] sm:text-5xl">
                Find your fit.
                <br />
                <span className="bg-gradient-to-r from-[#E7D8C1] via-[#C5A984] to-[#A99175] bg-clip-text text-transparent">
                  Know where you stand.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#AAA197] sm:text-base">
                Compare your resume with a job description to identify matching
                skills, potential gaps, and ways to improve your application.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#403B35] bg-[#191817]/80 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#465446] bg-[#273027] text-[#B5C4AA]">
                <ShieldCheck size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#E6E0D6]">
                  Private workspace
                </p>
                <p className="mt-1 text-xs text-[#928A80]">
                  Your account, your results
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#403B35]/80 pt-5 text-xs text-[#928A80]">
            <span className="inline-flex items-center gap-2">
              <Target size={14} className="text-[#C5A984]" />
              Compatibility score
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A4B49A]" />
              Skills comparison
            </span>
            <span className="inline-flex items-center gap-2">
              <TrendingUp size={14} className="text-[#C5A984]" />
              Actionable recommendations
            </span>
          </div>
        </div>
      </section>

      {!analysis ? (
        <>
          {/* Input workspace */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Resume upload */}
            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#A58A68]">
                    STEP 01 / UPLOAD
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-[#F0ECE5]">
                    Your resume
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#A59D93]">
                    Upload the resume you want to compare.
                  </p>
                </div>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-gradient-to-br from-[#3A3025] to-[#29231D] text-[#D4B994]">
                  <FileText size={21} />
                </span>
              </div>

              <input
                ref={inputRef}
                id="matcher-resume-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isAnalyzing}
                className="sr-only"
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
                className={`mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-[22px] border border-dashed p-6 text-center transition-all duration-300 sm:p-8 ${
                  isDragging
                    ? "border-[#D8BD98] bg-[#332A21] shadow-[inset_0_0_35px_rgba(197,169,132,0.07),0_0_25px_rgba(197,169,132,0.07)]"
                    : file
                      ? "border-[#667A61] bg-gradient-to-br from-[#252E25] to-[#1D241D] shadow-[inset_0_1px_0_rgba(164,180,154,0.06)]"
                      : "border-[#51483D] bg-[#191817] hover:border-[#80694C] hover:bg-[#211F1C]"
                }`}
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                    file
                      ? "border-[#465B45] bg-[#303D2F] text-[#B5C4AA]"
                      : "border-[#403B35] bg-[#292621] text-[#C5A984]"
                  }`}
                >
                  {file ? <FileText size={26} /> : <Upload size={25} />}
                </span>

                {file ? (
                  <>
                    <h3 className="mt-4 max-w-full break-words text-sm font-semibold text-[#E9E2D8]">
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
                        Clear form
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mt-4 text-base font-semibold text-[#E9E2D8]">
                      Drop your resume here
                    </h3>
                    <p className="mt-2 text-sm text-[#928A80]">
                      Or browse files on your computer
                    </p>

                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={isAnalyzing}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-5 py-3 text-sm font-semibold text-[#241E17] shadow-[0_4px_16px_rgba(160,126,86,0.1)] transition hover:brightness-110 disabled:opacity-50"
                    >
                      <Upload size={16} />
                      Choose PDF
                    </button>

                    <p className="mt-4 text-xs text-[#81796F]">
                      PDF only · Maximum 10 MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Job description */}
            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#A58A68]">
                    STEP 02 / ROLE
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-[#F0ECE5]">
                    Job description
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#A59D93]">
                    Paste the role's requirements to compare them with your
                    resume.
                  </p>
                </div>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-gradient-to-br from-[#3A3025] to-[#29231D] text-[#D4B994]">
                  <BriefcaseBusiness size={21} />
                </span>
              </div>

              <textarea
                value={jobDescription}
                onChange={(event) => {
                  setJobDescription(event.target.value);
                  setAnalysis(null);
                  setError("");
                }}
                placeholder={`Paste the job description here...\n\nInclude responsibilities, required skills, qualifications, and experience.`}
                disabled={isAnalyzing}
                className="mt-6 min-h-[280px] w-full resize-y rounded-[20px] border border-[#454039] bg-[#191817] p-4 text-sm leading-6 text-[#F0ECE5] outline-none transition placeholder:text-[#746D63] focus:border-[#A58A68] focus:ring-4 focus:ring-[#C5A984]/10 disabled:opacity-70"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <span
                  className={`text-xs ${
                    jobDescription.trim().length < 30
                      ? "text-[#928A80]"
                      : "text-[#A4B49A]"
                  }`}
                >
                  {jobDescription.trim().length < 30
                    ? `${30 - jobDescription.trim().length} more characters needed`
                    : "Ready to compare"}
                </span>

                <span className="text-xs tabular-nums text-[#81796F]">
                  {jobDescription.length} characters
                </span>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-[#744540] bg-[#332321] p-4 text-sm text-[#E7B2A9]"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Analyze action */}
          <section className="relative overflow-hidden rounded-[26px] border border-[#51483D] bg-gradient-to-r from-[#302920] via-[#27231E] to-[#211F1C] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
            <div className="pointer-events-none absolute -right-8 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.08),transparent_70%)]" />

            <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-[#F0ECE5]">
                  Ready to see how you match?
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#AAA093]">
                  We'll compare detected skills and keywords. Use the results
                  to identify gaps, not as a guarantee of hiring outcomes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-6 py-3.5 text-sm font-semibold text-[#241E17] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-[#403B35] disabled:bg-[#302D28] disabled:text-[#746D63]"
              >
                {isAnalyzing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Matching resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Analyze compatibility
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
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

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#F0ECE5] sm:text-3xl">
                Your compatibility report
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
              New analysis
            </button>
          </section>

          {/* Overall score */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[26px] border border-[#80694C] bg-gradient-to-br from-[#393024] via-[#30281F] to-[#26211B] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.10),transparent_70%)]" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C5A984]">
                    OVERALL COMPATIBILITY
                  </p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-6xl font-semibold tracking-[-0.05em] text-[#F0E6D8]">
                      {matchScore}
                    </span>
                    <span className="text-2xl font-medium text-[#C5A984]">
                      %
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-[#D8BD98]">
                    {matchScore >= 75
                      ? "Strong keyword match"
                      : matchScore >= 50
                        ? "Moderate keyword match"
                        : "More alignment needed"}
                  </h3>
                </div>

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#80694C] bg-[#413526] text-[#D8BD98]">
                  <Target size={23} />
                </span>
              </div>

              <div
                className="relative mt-6 h-2.5 overflow-hidden rounded-full bg-[#514333]"
                role="progressbar"
                aria-label="Overall compatibility"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={matchScore}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9B7B53] via-[#D8BD98] to-[#E8D6B9] shadow-[0_0_12px_rgba(197,169,132,0.25)] transition-all duration-700"
                  style={{ width: `${matchScore}%` }}
                />
              </div>

              <p className="relative mt-4 text-xs leading-5 text-[#A99A84]">
                A rule-based estimate of detected skill and keyword overlap,
                not an employer's ATS score.
              </p>
            </div>

            {/* Score breakdown */}
            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6 shadow-[0_14px_38px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <h3 className="text-lg font-semibold text-[#F0ECE5]">
                Score breakdown
              </h3>
              <p className="mt-2 text-sm text-[#928A80]">
                Explore the two components of your match.
              </p>

              <div className="mt-6 space-y-6">
                <MatchScoreCard
                  label="Skills match"
                  score={skillsScore}
                  icon={<TrendingUp size={19} />}
                  accent="sage"
                />

                <MatchScoreCard
                  label="Keyword match"
                  score={keywordScore}
                  icon={<BriefcaseBusiness size={19} />}
                  accent="champagne"
                />
              </div>
            </div>
          </section>

          {/* Skill comparison */}
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#465B45] bg-[#293328] text-[#B5C4AA]">
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#F0ECE5]">
                    Matched skills
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-[#928A80]">
                    Skills detected in both your resume and the job description.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill) => (
                    <SkillTag key={skill} label={skill} positive />
                  ))
                ) : (
                  <p className="text-sm text-[#928A80]">
                    No overlapping skills detected.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                  <AlertCircle size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#F0ECE5]">
                    Potential skill gaps
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-[#928A80]">
                    Job-description skills not detected in your resume.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill) => (
                    <SkillTag key={skill} label={skill} />
                  ))
                ) : (
                  <p className="text-sm text-[#928A80]">
                    No missing skills detected from the supported skill list.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section className="relative overflow-hidden rounded-[26px] border border-[#51483D] bg-gradient-to-br from-[#302920] via-[#26221D] to-[#201E1B] p-6 shadow-[0_14px_38px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.07),transparent_70%)]" />

            <div className="relative flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                <Sparkles size={20} />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[#F0ECE5]">
                  Your next steps
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#AAA093]">
                  Use these recommendations to make your application more
                  relevant to the role.
                </p>
              </div>
            </div>

            {recommendations.length > 0 ? (
              <div className="relative mt-6 space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-[#403B35] bg-[#1D1C1A]/80 p-4 transition hover:border-[#65513C] hover:bg-[#25221E]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-xs font-semibold text-[#D8BD98]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-1 text-sm leading-6 text-[#C9C1B6]">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="relative mt-5 text-sm text-[#AAA093]">
                No recommendations were returned for this analysis.
              </p>
            )}
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-5 py-3 text-sm font-semibold text-[#241E17] transition hover:brightness-110"
            >
              <RotateCcw size={16} />
              Analyze another job
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function clampScore(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
}

function MatchScoreCard({ label, score, icon, accent }) {
  const colors =
    accent === "sage"
      ? {
          icon: "border-[#465B45] bg-[#293328] text-[#B5C4AA]",
          track: "bg-[#353D33]",
          bar: "bg-gradient-to-r from-[#718768] to-[#A4B49A]",
          number: "text-[#B5C4AA]",
        }
      : {
          icon: "border-[#65513C] bg-[#332A21] text-[#D4B994]",
          track: "bg-[#40372C]",
          bar: "bg-gradient-to-r from-[#9B7B53] to-[#D8BD98]",
          number: "text-[#D8BD98]",
        };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors.icon}`}
          >
            {icon}
          </span>
          <span className="text-sm font-medium text-[#C9C1B6]">{label}</span>
        </div>
        <span className={`text-xl font-semibold tabular-nums ${colors.number}`}>
          {score}%
        </span>
      </div>

      <div className={`mt-3 h-2 overflow-hidden rounded-full ${colors.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function SkillTag({ label, positive = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium ${
        positive
          ? "border-[#465B45] bg-[#293328] text-[#B5C4AA]"
          : "border-[#65513C]/70 bg-[#332A21] text-[#D8BD98]"
      }`}
    >
      {positive ? (
        <CheckCircle2 size={13} />
      ) : (
        <AlertCircle size={13} />
      )}
      {label}
    </span>
  );
}

export default ResumeMatcher;

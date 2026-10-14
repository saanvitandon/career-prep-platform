
import { useState } from "react";
import {
  FileText,
  Upload,
  BriefcaseBusiness,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

function ResumeMatcher() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setShowResults(false);
    setAnalysis(null);
    setError("");

    if (selectedFile.type !== "application/pdf" ||
        !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setFile(null);
      setError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("The PDF must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim() || isAnalyzing) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription.trim());

      const response = await fetch(
        "http://localhost:5000/api/resume/match",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok || !data.success || !data.result) {
        throw new Error(data.message || "Resume matching failed.");
      }

      setAnalysis(data.result);
      setShowResults(true);
    } catch (err) {
      console.error("Resume matching error:", err);
      setError(err.message || "Unable to match your resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setShowResults(false);
    setAnalysis(null);
    setError("");
  };

  const canAnalyze = file && jobDescription.trim().length >= 30;

  return (
    <div>
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Resume Matcher
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Compare your resume with a job description and discover how well you match.
            </p>
          </div>
        </div>
      </section>

      {!showResults ? (
        <section className="mt-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Your Resume
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload the resume you want to compare.
                  </p>
                </div>
              </div>

              <label
                htmlFor="matcher-resume-upload"
                className="group mt-5 flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 transition-all hover:border-blue-300 hover:bg-blue-50/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-105">
                  {file ? <FileText size={23} /> : <Upload size={23} />}
                </div>

                {file ? (
                  <>
                    <h3 className="mt-4 max-w-full truncate px-4 text-sm font-semibold text-slate-900">
                      {file.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="mt-3 text-xs font-medium text-blue-600">
                      Click to choose another file
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                      Upload your resume
                    </h3>
                    <p className="mt-1 text-center text-xs text-slate-500">
                      PDF files up to 10 MB
                    </p>
                    <span className="mt-4 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200">
                      Choose PDF
                    </span>
                  </>
                )}
              </label>

              <input
                id="matcher-resume-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Job Description
                  </h2>
                  <p className="text-xs text-slate-500">
                    Paste the job description you want to match against.
                  </p>
                </div>
              </div>

              <textarea
                value={jobDescription}
                onChange={(event) => {
                  setJobDescription(event.target.value);
                  setShowResults(false);
                  setAnalysis(null);
                }}
                placeholder="Paste the job description here..."
                className="mt-5 min-h-[270px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <div className="mt-2 flex justify-between">
                <span className="text-xs text-slate-400">
                  Minimum 30 characters
                </span>
                <span className="text-xs text-slate-400">
                  {jobDescription.length} characters
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                canAnalyze && !isAnalyzing
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Matching resume...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Analyze Compatibility
                </>
              )}
            </button>
          </div>

          <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 text-center text-xs text-slate-400">
            <Sparkles size={13} />
            Your resume is compared using a rule-based skill and keyword analysis.
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Compatibility analysis complete
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {analysis.fileName}
              </h2>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              New analysis
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overall compatibility
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {analysis.matchScore >= 75
                    ? "Strong keyword match"
                    : analysis.matchScore >= 50
                    ? "Moderate keyword match"
                    : "More alignment needed"}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  {analysis.matchScore}%
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Rule-based estimate
                </p>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${analysis.matchScore}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              This score measures detected skill and keyword overlap. It is not an employer's ATS score.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <MatchScoreCard
              label="Skills Match"
              score={analysis.skillsMatchScore}
              icon={<TrendingUp size={18} />}
            />
            <MatchScoreCard
              label="Keyword Match"
              score={analysis.keywordMatchScore}
              icon={<BriefcaseBusiness size={18} />}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <CheckCircle2 size={17} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Matched skills
                </h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Detected in both your resume and the job description.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {analysis.matchedSkills.length > 0 ? (
                  analysis.matchedSkills.map((skill) => (
                    <SkillTag key={skill} label={skill} positive />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No overlapping skills detected.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertCircle size={17} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Potential skill gaps
                </h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Job-description skills not detected in your resume.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {analysis.missingSkills.length > 0 ? (
                  analysis.missingSkills.map((skill) => (
                    <SkillTag key={skill} label={skill} />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No missing skills detected from the supported skill list.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-6">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Recommendations
                </h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <RotateCcw size={17} />
              Analyze another job
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function MatchScoreCard({ label, score, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
        <span className="text-2xl font-bold text-slate-900">{score}%</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function SkillTag({ label, positive = false }) {
  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
        positive
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {positive ? "✓ " : "⚠ "}
      {label}
    </span>
  );
}

export default ResumeMatcher;

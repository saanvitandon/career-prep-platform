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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setShowResults(false);
    }
  };

  const handleAnalyze = () => {
    if (!file || !jobDescription.trim()) return;

    setIsAnalyzing(true);

    // Temporary mock delay.
    // Later this will call our backend matching API.
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1500);
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setShowResults(false);
  };

  const canAnalyze = file && jobDescription.trim();

  return (
    <div>

      {/* Page Header */}
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

        /* =========================
           INPUT STATE
        ========================== */

        <section className="mt-8">

          <div className="grid grid-cols-2 gap-6">

            {/* Resume Upload */}
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
                    Upload the resume you want to analyze.
                  </p>
                </div>

              </div>


              <label
                htmlFor="matcher-resume-upload"
                className="group mt-5 flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 transition-all hover:border-blue-300 hover:bg-blue-50/50"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-105">

                  {file ? (
                    <FileText size={23} />
                  ) : (
                    <Upload size={23} />
                  )}

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
                      PDF files up to 10MB
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
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>


            {/* Job Description */}
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
                }}
                placeholder="Paste the job description here..."
                className="mt-5 min-h-[270px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-slate-400">
                  {jobDescription.length} characters
                </span>
              </div>

            </div>

          </div>


          {/* Analyze */}
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
                  Analyzing compatibility...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Analyze Compatibility
                </>
              )}

            </button>

          </div>


          {/* Small explanation */}
          <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 text-center text-xs text-slate-400">
            <Sparkles size={13} />
            AI will compare your skills, experience, education, and keywords.
          </div>

        </section>

      ) : (

        /* =========================
           RESULTS STATE
        ========================== */

        <section className="mt-8">

          {/* Result Header */}
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Compatibility analysis complete
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {file?.name}
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


          {/* Match Score */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overall compatibility
                </p>

                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  Excellent match
                </h3>
              </div>

              <div className="text-right">

                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  91%
                </span>

                <p className="mt-1 text-xs font-semibold text-green-600">
                  Strong compatibility
                </p>

              </div>

            </div>


            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[91%] rounded-full bg-green-500" />
            </div>

          </div>


          {/* Match Breakdown */}
          <div className="mt-6 grid grid-cols-3 gap-5">

            <MatchScoreCard
              label="Skills Match"
              score="87%"
              icon={<TrendingUp size={18} />}
            />

            <MatchScoreCard
              label="Experience Match"
              score="76%"
              icon={<BriefcaseBusiness size={18} />}
            />

            <MatchScoreCard
              label="Education Match"
              score="95%"
              icon={<CheckCircle2 size={18} />}
            />

          </div>


          {/* Skills */}
          <div className="mt-6 grid grid-cols-2 gap-6">

            {/* Matched */}
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
                Skills from your resume that align with the role.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                <SkillTag label="Python" positive />
                <SkillTag label="SQL" positive />
                <SkillTag label="React" positive />
                <SkillTag label="Git" positive />
                <SkillTag label="REST APIs" positive />
                <SkillTag label="PostgreSQL" positive />

              </div>

            </div>


            {/* Missing */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertCircle size={17} />
                </div>

                <h3 className="text-base font-semibold text-slate-900">
                  Skill gaps
                </h3>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Skills mentioned in the job description that are missing.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                <SkillTag label="Docker" />
                <SkillTag label="AWS" />
                <SkillTag label="Kubernetes" />

              </div>

            </div>

          </div>


          {/* Recommendation */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-6">

            <div className="flex gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Sparkles size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  AI recommendation
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your resume is a strong match for this role. Focus on
                  highlighting your backend experience and consider adding
                  relevant cloud and containerization skills to improve your
                  compatibility further.
                </p>
              </div>

            </div>

          </div>


          {/* Bottom CTA */}
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


/* Match score card */
function MatchScoreCard({ label, score, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {score}
        </span>

      </div>

      <p className="mt-4 text-sm font-medium text-slate-600">
        {label}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: score }}
        />
      </div>

    </div>
  );
}


/* Skill tags */
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
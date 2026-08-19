import { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
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
    if (!file) return;

    setIsAnalyzing(true);

    // Temporary mock delay.
    // Later this will call our backend AI API.
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1500);
  };

  const handleReset = () => {
    setFile(null);
    setShowResults(false);
  };

  return (
    <div>

      {/* Page Header */}
      <section>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Sparkles size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Resume Analyzer
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Get AI-powered feedback to improve your resume and ATS score.
            </p>
          </div>

        </div>
      </section>


      {!showResults ? (

        /* =========================
           UPLOAD STATE
        ========================== */

        <section className="mt-8">

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="mx-auto max-w-2xl">

              {/* Upload Area */}
              <label
                htmlFor="resume-upload"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 transition-all hover:border-blue-300 hover:bg-blue-50/50"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-105">

                  {file ? (
                    <FileText size={26} />
                  ) : (
                    <Upload size={26} />
                  )}

                </div>


                {file ? (
                  <>
                    <h2 className="mt-5 text-base font-semibold text-slate-900">
                      {file.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    <p className="mt-3 text-xs font-medium text-blue-600">
                      Click to choose a different file
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-5 text-base font-semibold text-slate-900">
                      Upload your resume
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Drag and drop your PDF here, or click to browse
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      PDF files up to 10MB
                    </p>
                  </>
                )}

              </label>


              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />


              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  file && !isAnalyzing
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >

                {isAnalyzing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing your resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Analyze Resume
                  </>
                )}

              </button>

            </div>

          </div>


          {/* What the analysis includes */}
          <div className="mt-6 grid grid-cols-3 gap-5">

            <AnalysisFeature
              icon={<FileText size={18} />}
              title="ATS Compatibility"
              description="Check how well your resume performs with applicant tracking systems."
            />

            <AnalysisFeature
              icon={<CheckCircle2 size={18} />}
              title="Strengths"
              description="Identify the strongest parts of your resume and experience."
            />

            <AnalysisFeature
              icon={<AlertCircle size={18} />}
              title="Improvements"
              description="Get actionable suggestions to make your resume stronger."
            />

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
                Analysis complete
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
              Analyze another
            </button>

          </div>


          {/* Score + Strengths */}
          <div className="mt-6 grid grid-cols-3 gap-5">

            {/* Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-slate-500">
                ATS Score
              </p>

              <div className="mt-5 flex items-end gap-1">

                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  82
                </span>

                <span className="mb-1 text-sm text-slate-400">
                  / 100
                </span>

              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[82%] rounded-full bg-green-500" />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <CheckCircle2 size={14} />
                Good ATS compatibility
              </div>

            </div>


            {/* Strengths */}
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-base font-semibold text-slate-900">
                Resume strengths
              </h3>

              <div className="mt-5 space-y-4">

                <ResultItem
                  text="Strong technical skills section"
                />

                <ResultItem
                  text="Relevant project experience"
                />

                <ResultItem
                  text="Clear education and certification details"
                />

                <ResultItem
                  text="Good use of industry-relevant keywords"
                />

              </div>

            </div>

          </div>


          {/* Improvements */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Areas to improve
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These changes could help improve your resume's performance.
              </p>
            </div>

            <div className="mt-5 space-y-3">

              <ImprovementItem
                title="Add measurable achievements"
                description="Use numbers and measurable outcomes to demonstrate the impact of your work."
              />

              <ImprovementItem
                title="Strengthen your professional summary"
                description="Highlight your key skills, experience, and target role more clearly."
              />

              <ImprovementItem
                title="Improve keyword coverage"
                description="Consider adding relevant technical keywords that appear frequently in your target roles."
              />

            </div>

          </div>


          {/* Bottom CTA */}
          <div className="mt-6 flex justify-end">

            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <RotateCcw size={17} />
              Analyze another resume
            </button>

          </div>

        </section>

      )}

    </div>
  );
}


/* Feature cards shown before analysis */
function AnalysisFeature({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* Positive result */
function ResultItem({ text }) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 size={14} />
      </div>

      <p className="text-sm text-slate-600">
        {text}
      </p>

    </div>
  );
}


/* Improvement result */
function ImprovementItem({ title, description }) {
  return (
    <div className="flex gap-4 rounded-xl bg-amber-50/60 p-4">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        <AlertCircle size={17} />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          {title}
        </h4>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}

export default ResumeAnalyzer;
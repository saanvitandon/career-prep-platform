import {
  FileText,
  BriefcaseBusiness,
  TrendingUp,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";
import FeatureCard from "../components/dashboard/FeatureCard";
import RoadmapCard from "../components/dashboard/RoadmapCard";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>

      {/* Welcome */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Good morning, Saanvi 👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Let's get you one step closer to your dream role.
        </p>
      </section>


      {/* Stats */}
      <section className="mt-7 grid grid-cols-3 gap-5">

        <StatCard
          icon={<FileText size={19} />}
          label="Latest ATS Score"
          value="82"
          trend="+8%"
          description="from your last analysis"
        />

        <StatCard
          icon={<BriefcaseBusiness size={19} />}
          label="Latest Match"
          value="91%"
          trend="+5%"
          description="resume compatibility"
        />

        <StatCard
          icon={<TrendingUp size={19} />}
          label="Preparation Progress"
          value="68%"
          description="3 of 5 modules completed"
        />

      </section>


      {/* Main content grid */}
      <section className="mt-8 grid grid-cols-3 gap-6">

        {/* Preparation tools */}
        <div className="col-span-2">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Preparation tools
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Use AI-powered tools to strengthen your placement preparation.
            </p>
          </div>


          <div className="grid grid-cols-2 gap-5">

            <FeatureCard
              icon={<FileText size={19} />}
              title="Resume Analyzer"
              description="Analyze your resume and identify ways to improve your ATS compatibility."
              action="Analyze resume"
              onClick={() => navigate("/resume-analyzer")}
            />

            <FeatureCard
              icon={<BriefcaseBusiness size={19} />}
              title="Resume Matcher"
              description="Compare your resume with a job description and discover skill gaps."
              action="Match resume"
              onClick={() => navigate("/resume-matcher")}
            />

            <FeatureCard
              icon={<TrendingUp size={19} />}
              title="Interview Prep"
              description="Generate role-specific interview questions tailored to your target role."
              action="Start practicing"
              onClick={() => navigate("/interview-prep")}
            />

            <FeatureCard
              icon={<FileText size={19} />}
              title="PDF Assistant"
              description="Upload study material and ask questions directly from your documents."
              action="Open assistant"
              onClick={() => navigate("/pdf-assistant")}
            />

          </div>

        </div>


        {/* Roadmap */}
        <div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Your roadmap
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep moving forward.
            </p>
          </div>

          <RoadmapCard />

        </div>

      </section>


      {/* Recent activity */}
      <section className="mt-8">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest preparation activity.
              </p>
            </div>

            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View all →
            </button>

          </div>


          <div className="mt-6 divide-y divide-slate-100">

            <ActivityItem
              title="Resume analyzed"
              description="ATS score: 82/100"
              time="2 hours ago"
            />

            <ActivityItem
              title="Resume matched"
              description="Software Engineer Intern · 91% match"
              time="Yesterday"
            />

            <ActivityItem
              title="Interview questions generated"
              description="Software Engineering Intern"
              time="2 days ago"
            />

          </div>

        </div>

      </section>

    </div>
  );
}


function ActivityItem({ title, description, time }) {
  return (
    <div className="flex items-center justify-between py-4">

      <div className="flex items-center gap-3">

        <div className="h-2 w-2 rounded-full bg-blue-500" />

        <div>
          <p className="text-sm font-medium text-slate-800">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        </div>

      </div>

      <span className="text-xs text-slate-400">
        {time}
      </span>

    </div>
  );
}

export default Dashboard;
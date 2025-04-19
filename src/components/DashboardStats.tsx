import React from 'react';
import { Clapperboard, Film, Timer, CheckCircle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  totalProjects: number;
  totalScenes: number;
  completedShots: number;
  totalDuration: string;
}

export default function DashboardStats({
  totalProjects,
  totalScenes,
  completedShots,
  totalDuration,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Projects"
        value={totalProjects}
        icon={Clapperboard}
        description="Active and completed projects"
      />
      <StatsCard
        title="Total Scenes"
        value={totalScenes}
        icon={Film}
        description="Scenes across all projects"
      />
      <StatsCard
        title="Completed Shots"
        value={completedShots}
        icon={CheckCircle}
        description="Shots marked as completed"
      />
      <StatsCard
        title="Total Duration"
        value={0}
        icon={Timer}
        description={`Estimated runtime: ${totalDuration}`}
      />
    </div>
  );
}
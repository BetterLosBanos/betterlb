import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  GitMerge,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'warning' | 'error' | 'primary' | 'success';
  link: string;
}

export default function AdminDashboard() {
  // TODO: Fetch actual stats from API
  const stats: StatCard[] = [
    {
      title: 'Failed Parses',
      value: '--',
      description: 'Documents that failed OCR/parsing',
      icon: AlertTriangle,
      variant: 'error',
      link: '/admin/errors',
    },
    {
      title: 'Review Queue',
      value: '--',
      description: 'Items awaiting manual review',
      icon: FileText,
      variant: 'warning',
      link: '/admin/review-queue',
    },
    {
      title: 'Reconcile',
      value: '--',
      description: 'Facebook vs gov.ph conflicts',
      icon: GitMerge,
      variant: 'primary',
      link: '/admin/reconcile',
    },
    {
      title: 'Pipeline Status',
      value: 'Active',
      description: 'Last run: --',
      icon: Activity,
      variant: 'success',
      link: '/admin/status',
    },
  ];

  const quickActions = [
    {
      title: 'View Error Log',
      description: 'See all failed parse attempts',
      link: '/admin/errors',
      variant: 'outline' as const,
    },
    {
      title: 'Process Queue',
      description: 'Review pending items',
      link: '/admin/review-queue',
      variant: 'outline' as const,
    },
    {
      title: 'Reconcile Data',
      description: 'Merge Facebook and gov.ph records',
      link: '/admin/reconcile',
      variant: 'outline' as const,
    },
  ];

  const variantColors = {
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    primary: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Overview</h2>
        <CardGrid columns={4}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.link}>
                <Card
                  variant="default"
                  hover
                  className="group h-full cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon
                        className={`h-6 w-6 ${
                          stat.variant === 'error'
                            ? 'text-rose-500'
                            : stat.variant === 'warning'
                            ? 'text-amber-500'
                            : stat.variant === 'success'
                            ? 'text-emerald-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <Badge
                        variant={stat.variant}
                        className="border px-2 py-0.5"
                      >
                        {stat.value}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle level="h3" className="mb-1">
                      {stat.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </CardGrid>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              variant="slate"
              hover
              className="flex items-center justify-between"
            >
              <CardContent className="flex-1 py-4">
                <h3 className="font-bold text-slate-900">{action.title}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
              </CardContent>
              <Link to={action.link} className="px-4">
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Activity</h2>
        <Card variant="default">
          <CardContent className="py-6">
            <div className="text-center text-slate-500">
              <p className="mb-4 text-sm">No recent activity to display</p>
              <Button variant="outline" size="sm">
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

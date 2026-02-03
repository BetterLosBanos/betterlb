import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  GitMerge,
  Activity,
  ArrowRight,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'warning' | 'error' | 'primary' | 'success';
  link: string;
}

interface DashboardStats {
  review_queue: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
  };
  documents: {
    total: number;
    pending_review: number;
    processed: number;
  };
  errors: {
    total: number;
    recent: number;
  };
  conflicts: {
    active: number;
  };
  deletion_queue: {
    total: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      title: 'Failed Parses',
      value: stats?.errors.total ?? '--',
      description: stats?.errors.recent
        ? `${stats.errors.recent} in the last 7 days`
        : 'Documents that failed OCR/parsing',
      icon: AlertTriangle,
      variant: 'error',
      link: '/admin/errors',
    },
    {
      title: 'Review Queue',
      value: stats?.review_queue.pending ?? '--',
      description: `${stats?.review_queue.total ?? 0} total items awaiting review`,
      icon: FileText,
      variant: 'warning',
      link: '/admin/review-queue',
    },
    {
      title: 'Reconcile',
      value: stats?.conflicts.active ?? '--',
      description: 'Facebook vs gov.ph conflicts',
      icon: GitMerge,
      variant: 'primary',
      link: '/admin/reconcile',
    },
    {
      title: 'Documents',
      value: stats?.documents.total ?? '--',
      description: `${stats?.documents.processed ?? 0} processed`,
      icon: Activity,
      variant: 'success',
      link: '/admin/documents',
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
      title: 'Merge Persons',
      description: 'Fix duplicate person records',
      link: '/admin/persons/merge',
      variant: 'outline' as const,
    },
    {
      title: 'Deletion Queue',
      description: `Review ${stats?.deletion_queue.total ?? 0} flagged persons`,
      link: '/admin/persons/deletion-queue',
      variant: 'outline' as const,
    },
    {
      title: 'Reconcile Data',
      description: 'Merge Facebook and gov.ph records',
      link: '/admin/reconcile',
      variant: 'outline' as const,
    },
  ];

  const getDisplayValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Overview</h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchStats}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        <CardGrid columns={4}>
          {statCards.map((stat) => {
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
                        {getDisplayValue(stat.value)}
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

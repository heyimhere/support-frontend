import React from 'react';
import { TicketStats } from '../../types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn, formatNumber, formatPercentage } from '../../lib/utils';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react';

interface TicketStatsProps {
  stats: TicketStats;
  isLoading?: boolean;
  className?: string;
  showTrends?: boolean;
  compact?: boolean;
}

export const TicketStatsComponent: React.FC<TicketStatsProps> = ({
  stats,
  isLoading = false,
  className,
  showTrends = true,
  compact = false,
}) => {
  const getStatusData = () => [
    {
      label: 'Open',
      value: stats.openTickets,
      icon: AlertCircle,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      percentage: formatPercentage(stats.openTickets, stats.totalTickets),
    },
    {
      label: 'In Progress',
      value: stats.inProgressTickets,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      percentage: formatPercentage(stats.inProgressTickets, stats.totalTickets),
    },
    {
      label: 'Resolved',
      value: stats.resolvedTickets,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 border-green-200',
      percentage: formatPercentage(stats.resolvedTickets, stats.totalTickets),
    },
    {
      label: 'Closed',
      value: stats.closedTickets,
      icon: CheckCircle,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      percentage: formatPercentage(stats.closedTickets, stats.totalTickets),
    },
  ];

  const getCategoryData = () => {
    return Object.entries(stats.byCategory).map(([category, count]) => ({
      label: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      percentage: formatPercentage(count, stats.totalTickets),
    }));
  };

  const getPriorityData = () => {
    return Object.entries(stats.byPriority).map(([priority, count]) => ({
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      percentage: formatPercentage(count, stats.totalTickets),
      color: getPriorityColor(priority),
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
        {getStatusData().map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold">{formatNumber(item.value)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStatusData().map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-2xl font-bold">{formatNumber(item.value)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.percentage} of total
                    </p>
                  </div>
                  <div className={cn('p-3 rounded-full', item.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getCategoryData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatNumber(item.value)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.percentage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              By Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPriorityData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full border', item.color)} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatNumber(item.value)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.percentage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      {showTrends && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Tickets</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalTickets)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active Tickets</span>
              </div>
              <p className="text-2xl font-bold">
                {formatNumber(stats.openTickets + stats.inProgressTickets)}
              </p>
            </CardContent>
          </Card>

          {stats.averageResolutionTime && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg. Resolution</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(stats.averageResolutionTime)}h
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// Quick stats summary component
export const QuickStats: React.FC<Pick<TicketStatsProps, 'stats' | 'className'>> = ({
  stats,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <span className="text-muted-foreground">Open:</span>
        <span className="font-medium">{stats.openTickets}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        <span className="text-muted-foreground">In Progress:</span>
        <span className="font-medium">{stats.inProgressTickets}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-muted-foreground">Resolved:</span>
        <span className="font-medium">{stats.resolvedTickets}</span>
      </div>
    </div>
  );
}; 
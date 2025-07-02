import React from 'react';
import { Ticket, TicketStatusType, TicketPriorityType, getTicketStatusColor, getPriorityColor, getCategoryDisplayName } from '../../types/ticket';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn, formatRelativeTime, truncateText } from '../../lib/utils';
import {
  User,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Eye,
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onView?: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
  onStatusChange?: (ticketId: string, status: TicketStatusType) => void;
  onPriorityChange?: (ticketId: string, priority: TicketPriorityType) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onView,
  onEdit,
  onStatusChange,
  onPriorityChange,
  showActions = true,
  compact = false,
  className,
}) => {
  const handleCardClick = () => {
    if (onView) {
      onView(ticket);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(ticket);
    }
  };

  const getStatusIcon = (status: TicketStatusType) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-3 w-3" />;
      case 'in_progress':
        return <Clock className="h-3 w-3" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getPriorityIcon = (priority: TicketPriorityType) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer group',
        'border-l-4',
        ticket.priority === 'urgent' && 'border-l-red-500',
        ticket.priority === 'high' && 'border-l-orange-500',
        ticket.priority === 'medium' && 'border-l-yellow-500',
        ticket.priority === 'low' && 'border-l-green-500',
        compact && 'hover:bg-muted/50',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className={cn('pb-2', compact && 'pb-1')}>
        <div className="flex items-start justify-between gap-3">
          {/* Left: Title and Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                'font-medium truncate',
                compact ? 'text-sm' : 'text-base'
              )}>
                {ticket.title}
              </h3>
              {showActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={handleEdit}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {ticket.userName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(ticket.createdAt)}
              </span>
              {ticket.conversationId && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Chat
                </span>
              )}
            </div>
          </div>

          {/* Right: Status & Priority */}
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant="outline" 
              className={cn('gap-1 text-xs', getTicketStatusColor(ticket.status))}
            >
              {getStatusIcon(ticket.status)}
              {ticket.status.replace('_', ' ')}
            </Badge>
            
            <div className="flex items-center gap-1">
              <span className="text-xs">{getPriorityIcon(ticket.priority)}</span>
              <Badge 
                variant="secondary" 
                className={cn('text-xs', getPriorityColor(ticket.priority))}
              >
                {ticket.priority}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="pt-0">
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {truncateText(ticket.description, 120)}
          </p>

          {/* Tags and Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getCategoryDisplayName(ticket.category)}
              </Badge>
              
              {ticket.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              
              {ticket.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{ticket.tags.length - 2} more
                </span>
              )}
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Assigned To */}
          {ticket.assignedTo && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {ticket.assignedTo.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Assigned to {ticket.assignedTo}
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

// Compact list item version
export const TicketListItem: React.FC<TicketCardProps> = ({
  ticket,
  onView,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0',
        className
      )}
      onClick={() => onView?.(ticket)}
    >
      {/* Priority Indicator */}
      <div className={cn(
        'w-1 h-8 rounded-full',
        ticket.priority === 'urgent' && 'bg-red-500',
        ticket.priority === 'high' && 'bg-orange-500', 
        ticket.priority === 'medium' && 'bg-yellow-500',
        ticket.priority === 'low' && 'bg-green-500'
      )} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">{ticket.title}</h4>
          <Badge 
            variant="outline" 
            className={cn('text-xs', getTicketStatusColor(ticket.status))}
          >
            {ticket.status.replace('_', ' ')}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{ticket.userName}</span>
          <span>{formatRelativeTime(ticket.createdAt)}</span>
          <Badge variant="secondary" className="text-xs">
            {getCategoryDisplayName(ticket.category)}
          </Badge>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

// Grid item version for dashboard
export const TicketGridItem: React.FC<TicketCardProps & { featured?: boolean }> = ({
  ticket,
  onView,
  featured = false,
  className,
  ...props
}) => {
  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-all duration-200 cursor-pointer',
        featured && 'ring-2 ring-primary/20',
        className
      )}
      onClick={() => onView?.(ticket)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate mb-1">{ticket.title}</h4>
            <p className="text-xs text-muted-foreground">{ticket.userName}</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn('text-xs', getTicketStatusColor(ticket.status))}
          >
            {ticket.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {truncateText(ticket.description, 80)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {getCategoryDisplayName(ticket.category)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(ticket.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}; 
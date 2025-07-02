'use client';

import React, { useState, useEffect } from 'react';
import { useTickets } from '../hooks/useTickets';
import { useRealTimeConnection, useLiveStats } from '../hooks/useRealTimeSimulation';
import { useToast } from '../components/ui/toast';
import { useCommandPalette, CommandPalette, createDefaultCommands } from '../components/ui/command-palette';
import { KeyboardShortcutManager } from '../components/ui/keyboard-shortcut';
import { ConnectionStatus } from '../components/ui/connection-status';
import { LoadingOverlay, LoadingSpinner } from '../components/ui/loading-spinner';
import { TicketCard, TicketListItem } from '../components/tickets/TicketCard';
import { TicketStatsComponent, QuickStats } from '../components/tickets/TicketStats';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  Plus,
  Settings,
  Bell,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Keyboard,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';

export default function SupportDashboard() {
  const router = useRouter();
  const { addToast } = useToast();
  const commandPalette = useCommandPalette();
  
  const {
    filteredTickets,
    stats: originalStats,
    isLoading,
    error,
    hasMore,
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    loadTickets,
    loadMore,
    refreshTickets,
    updateTicket,
    setFilters,
    setSearchQuery,
    setSorting,
    clearFilters,
  } = useTickets();

  // Real-time features
  const liveStatsData = useLiveStats();
  const realTimeConnection = useRealTimeConnection({ 
    enabled: true, 
    userType: 'support',
    userId: 'support-dashboard' 
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Use live stats if available, fallback to original stats
  const stats = originalStats; // For now, use original stats since liveStatsData has different structure

  // Load initial data
  useEffect(() => {
    loadTickets(true);
  }, []);

  // Show toast notifications for real-time events
  useEffect(() => {
    realTimeConnection.events.forEach((event: any) => {
      switch (event.type) {
        case 'ticket_created':
          addToast({
            type: 'info',
            title: 'New Ticket Created',
            description: `Ticket ${event.data.ticketId || 'New'} has been created`,
            duration: 4000,
          });
          break;
        case 'ticket_updated':
          addToast({
            type: 'success',
            title: 'Ticket Updated',
            description: `Ticket has been updated`,
            duration: 3000,
          });
          break;
      }
    });
  }, [realTimeConnection.events, addToast]);

  // Handle filter tab changes
  const handleFilterTab = (tab: FilterTab) => {
    setActiveFilterTab(tab);
    
    if (tab === 'all') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: [tab] });
    }

    addToast({
      type: 'info',
      description: `Filtered tickets by ${tab === 'all' ? 'all statuses' : tab}`,
      duration: 2000,
    });
  };

  // Handle ticket actions
  const handleTicketView = (ticket: any) => {
    console.log('View ticket:', ticket.id);
    addToast({
      type: 'info',
      description: `Viewing ticket #${ticket.id.slice(-8)}`,
      duration: 2000,
    });
  };

  const handleTicketEdit = (ticket: any) => {
    console.log('Edit ticket:', ticket.id);
    addToast({
      type: 'info',
      description: `Editing ticket #${ticket.id.slice(-8)}`,
      duration: 2000,
    });
  };

  const handleStatusChange = async (ticketId: string, status: any) => {
    await updateTicket(ticketId, { status });
    addToast({
      type: 'success',
      title: 'Status Updated',
      description: `Ticket status changed to ${status}`,
      duration: 3000,
    });
  };

  const handlePriorityChange = async (ticketId: string, priority: any) => {
    await updateTicket(ticketId, { priority });
    addToast({
      type: 'success',
      title: 'Priority Updated',
      description: `Ticket priority changed to ${priority}`,
      duration: 3000,
    });
  };

  const handleRefresh = async () => {
    await refreshTickets();
    addToast({
      type: 'success',
      description: 'Data refreshed successfully',
      duration: 2000,
    });
  };

  // Keyboard shortcuts
  const shortcuts = [
    {
      id: 'refresh',
      keys: ['r'],
      description: 'Refresh tickets',
      action: handleRefresh,
      category: 'Actions',
    },
    {
      id: 'new-ticket',
      keys: ['n'],
      description: 'Create new ticket',
      action: () => router.push('/chat'),
      category: 'Actions',
    },
    {
      id: 'toggle-filters',
      keys: ['f'],
      description: 'Toggle filters',
      action: () => setShowFilters(!showFilters),
      category: 'View',
    },
    {
      id: 'grid-view',
      keys: ['g'],
      description: 'Grid view',
      action: () => setViewMode('grid'),
      category: 'View',
    },
    {
      id: 'list-view',
      keys: ['l'],
      description: 'List view',
      action: () => setViewMode('list'),
      category: 'View',
    },
    {
      id: 'keyboard-help',
      keys: ['?'],
      description: 'Show keyboard shortcuts',
      action: () => setShowKeyboardHelp(true),
      category: 'Help',
    },
  ];

  // Command palette commands
  const commands = createDefaultCommands({
    onNavigateToChat: () => router.push('/chat'),
    onNavigateToSupport: () => router.push('/support'),
    onCreateTicket: () => router.push('/chat'),
    onRefreshData: handleRefresh,
    onToggleFilters: () => setShowFilters(!showFilters),
    onShowSettings: () => addToast({ type: 'info', description: 'Settings not implemented yet' }),
    onShowKeyboardHelp: () => setShowKeyboardHelp(true),
    onToggleTheme: () => addToast({ type: 'info', description: 'Theme toggle not implemented yet' }),
  });

  const getFilterTabs = () => [
    { 
      key: 'all' as FilterTab, 
      label: 'All Tickets', 
      count: stats?.totalTickets || 0,
      icon: null 
    },
    { 
      key: 'open' as FilterTab, 
      label: 'Open', 
      count: stats?.openTickets || 0,
      icon: AlertCircle,
      color: 'text-blue-600' 
    },
    { 
      key: 'in_progress' as FilterTab, 
      label: 'In Progress', 
      count: stats?.inProgressTickets || 0,
      icon: Clock,
      color: 'text-yellow-600' 
    },
    { 
      key: 'resolved' as FilterTab, 
      label: 'Resolved', 
      count: stats?.resolvedTickets || 0,
      icon: CheckCircle,
      color: 'text-green-600' 
    },
    { 
      key: 'closed' as FilterTab, 
      label: 'Closed', 
      count: 0,
      icon: CheckCircle,
      color: 'text-gray-600' 
    },
  ];

  return (
    <KeyboardShortcutManager shortcuts={shortcuts}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Support Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                      Manage customer support tickets
                    </p>
                  </div>
                </div>

                {/* Connection Status */}
                <ConnectionStatus
                  status={realTimeConnection.connectionStatus}
                  lastActivity={realTimeConnection.lastActivity}
                  compact={true}
                />

                {/* Quick Stats */}
                {stats && (
                  <div className="hidden lg:block">
                    <QuickStats stats={stats} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowKeyboardHelp(true)}
                >
                  <Keyboard className="h-4 w-4" />
                  Shortcuts
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {realTimeConnection.events.length > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                      {realTimeConnection.events.length}
                    </Badge>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Link href="/chat">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Ticket
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 space-y-6">
          <LoadingOverlay isLoading={isLoading && filteredTickets.length === 0}>
            {/* Stats Overview */}
            {stats && (
              <div className="lg:hidden">
                <TicketStatsComponent stats={stats} compact={true} />
              </div>
            )}

            {/* Real-time Events Feed */}
            {realTimeConnection.events.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Live Activity</span>
                    <Badge variant="secondary">{realTimeConnection.events.length} events</Badge>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {realTimeConnection.events.slice(-3).map((event) => (
                      <div key={event.id} className="text-sm text-blue-800">
                        <span className="font-medium">{event.type.replace('_', ' ')}</span>
                        <span className="text-blue-600 ml-2">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filter Tabs */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Tab Navigation */}
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {getFilterTabs().map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <Button
                          key={tab.key}
                          variant={activeFilterTab === tab.key ? 'default' : 'ghost'}
                          size="sm"
                          className="gap-2 whitespace-nowrap"
                          onClick={() => handleFilterTab(tab.key)}
                        >
                          {Icon && <Icon className={cn('h-4 w-4', tab.color)} />}
                          {tab.label}
                          <Badge variant="secondary" className="ml-1">
                            {tab.count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 lg:ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                    
                    <Separator orientation="vertical" className="h-6" />
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Search and Advanced Filters */}
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tickets by title, description, or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="gap-2"
                      >
                        {sortOrder === 'asc' ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )}
                        Sort by {sortBy.replace('_', ' ')}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Filters Panel */}
                  {showFilters && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Priority</label>
                            <div className="space-y-1">
                              {['urgent', 'high', 'medium', 'low'].map((priority) => (
                                <label key={priority} className="flex items-center gap-2 text-sm">
                                  <input 
                                    type="checkbox" 
                                    className="rounded"
                                    checked={filters.priority?.includes(priority as any) || false}
                                    onChange={(e) => {
                                      const current = filters.priority || [];
                                      if (e.target.checked) {
                                        setFilters({ priority: [...current, priority as any] });
                                      } else {
                                        setFilters({ priority: current.filter(p => p !== priority) });
                                      }
                                    }}
                                  />
                                  <span className="capitalize">{priority}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <div className="space-y-1">
                              {['technical', 'billing', 'account', 'feature_request'].map((category) => (
                                <label key={category} className="flex items-center gap-2 text-sm">
                                  <input 
                                    type="checkbox" 
                                    className="rounded"
                                    checked={filters.category?.includes(category as any) || false}
                                    onChange={(e) => {
                                      const current = filters.category || [];
                                      if (e.target.checked) {
                                        setFilters({ category: [...current, category as any] });
                                      } else {
                                        setFilters({ category: current.filter(c => c !== category) });
                                      }
                                    }}
                                  />
                                  <span className="capitalize">{category.replace('_', ' ')}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="md:col-span-2 lg:col-span-2 flex items-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={clearFilters}
                              className="gap-2"
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error State */}
            {error && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tickets Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onView={handleTicketView}
                    onEdit={handleTicketEdit}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    showActions={true}
                    compact={false}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {filteredTickets.map((ticket) => (
                    <TicketListItem
                      key={ticket.id}
                      ticket={ticket}
                      onView={handleTicketView}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && filteredTickets.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(filters).length > 0
                      ? 'Try adjusting your search or filters'
                      : 'No support tickets have been created yet'}
                  </p>
                  <Link href="/chat">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create First Ticket
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  Load More Tickets
                </Button>
              </div>
            )}
          </LoadingOverlay>
        </main>

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandPalette.isOpen}
          onClose={commandPalette.close}
          commands={commands}
        />
      </div>
    </KeyboardShortcutManager>
  );
} 
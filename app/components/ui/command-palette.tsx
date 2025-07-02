import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Badge } from './badge';
import { cn } from '../../lib/utils';
import { 
  Search, 
  MessageSquare, 
  Settings, 
  Plus, 
  Filter,
  RefreshCw,
  Users,
  BarChart3,
  Keyboard,
  LogOut,
  Moon,
  Sun,
  Bell,
  Download,
  Upload,
  ArrowRight,
} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category: string;
  keywords: string[];
  action: () => void;
  shortcut?: string[];
  badge?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
  className?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  placeholder = 'Type a command or search...',
  className,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter and sort commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands.slice(0, 10); // Show recent/common commands
    }

    const queryLower = query.toLowerCase();
    const filtered = commands.filter(command => {
      const searchText = [
        command.title,
        command.description || '',
        command.category,
        ...command.keywords,
      ].join(' ').toLowerCase();

      return searchText.includes(queryLower);
    });

    // Sort by relevance
    return filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact matches first
      if (aTitle === queryLower) return -1;
      if (bTitle === queryLower) return 1;
      
      // Title starts with query
      if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1;
      if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1;
      
      // Alphabetical
      return aTitle.localeCompare(bTitle);
    });
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });

    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
        
      case 'Enter':
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
        
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        } else {
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        }
        break;
    }
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20">
      <Card className={cn('w-full max-w-2xl shadow-2xl', className)}>
        <CardContent className="p-0">
          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="pl-10 border-0 focus:ring-0 text-lg h-12"
                autoFocus
              />
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No commands found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, commands]) => (
                <div key={category}>
                  <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b">
                    {category}
                  </div>
                  <div className="py-2">
                    {commands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = command.icon;

                      return (
                        <div
                          key={command.id}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                            'hover:bg-accent/50',
                            isSelected && 'bg-accent'
                          )}
                          onClick={() => {
                            command.action();
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          {Icon && (
                            <div className="flex-shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {command.title}
                              </span>
                              {command.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {command.badge}
                                </Badge>
                              )}
                            </div>
                            {command.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {command.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {command.shortcut && (
                              <div className="flex gap-1">
                                {command.shortcut.map((key, i) => (
                                  <React.Fragment key={key}>
                                    <kbd className="px-2 py-1 text-xs bg-muted border rounded font-mono">
                                      {key}
                                    </kbd>
                                    {i < command.shortcut!.length - 1 && (
                                      <span className="text-xs text-muted-foreground">
                                        +
                                      </span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted border rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted border rounded">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted border rounded">Esc</kbd>
                Close
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Keyboard className="h-3 w-3" />
              {filteredCommands.length} commands
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Default commands for the support system
export const createDefaultCommands = ({
  onNavigateToChat,
  onNavigateToSupport,
  onCreateTicket,
  onRefreshData,
  onToggleFilters,
  onShowSettings,
  onShowKeyboardHelp,
  onToggleTheme,
}: {
  onNavigateToChat: () => void;
  onNavigateToSupport: () => void;
  onCreateTicket: () => void;
  onRefreshData: () => void;
  onToggleFilters: () => void;
  onShowSettings: () => void;
  onShowKeyboardHelp: () => void;
  onToggleTheme: () => void;
}): Command[] => [
  {
    id: 'navigate-chat',
    title: 'Start Support Chat',
    description: 'Create a new support ticket with AI assistance',
    icon: MessageSquare,
    category: 'Navigation',
    keywords: ['chat', 'support', 'help', 'ai', 'assistant'],
    action: onNavigateToChat,
    shortcut: ['G', 'C'],
  },
  {
    id: 'navigate-dashboard',
    title: 'Support Dashboard',
    description: 'View and manage support tickets',
    icon: BarChart3,
    category: 'Navigation',
    keywords: ['dashboard', 'tickets', 'support', 'manage'],
    action: onNavigateToSupport,
    shortcut: ['G', 'D'],
  },
  {
    id: 'create-ticket',
    title: 'Create New Ticket',
    description: 'Quickly create a new support ticket',
    icon: Plus,
    category: 'Actions',
    keywords: ['create', 'new', 'ticket', 'support'],
    action: onCreateTicket,
    shortcut: ['C'],
  },
  {
    id: 'refresh-data',
    title: 'Refresh Data',
    description: 'Reload tickets and statistics',
    icon: RefreshCw,
    category: 'Actions',
    keywords: ['refresh', 'reload', 'update'],
    action: onRefreshData,
    shortcut: ['R'],
  },
  {
    id: 'toggle-filters',
    title: 'Toggle Filters',
    description: 'Show or hide advanced filters',
    icon: Filter,
    category: 'Actions',
    keywords: ['filter', 'search', 'toggle'],
    action: onToggleFilters,
    shortcut: ['F'],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Open application settings',
    icon: Settings,
    category: 'System',
    keywords: ['settings', 'preferences', 'config'],
    action: onShowSettings,
    shortcut: [','],
  },
  {
    id: 'keyboard-help',
    title: 'Keyboard Shortcuts',
    description: 'View all available keyboard shortcuts',
    icon: Keyboard,
    category: 'Help',
    keywords: ['keyboard', 'shortcuts', 'help'],
    action: onShowKeyboardHelp,
    shortcut: ['?'],
  },
  {
    id: 'toggle-theme',
    title: 'Toggle Theme',
    description: 'Switch between light and dark mode',
    icon: Moon,
    category: 'System',
    keywords: ['theme', 'dark', 'light', 'mode'],
    action: onToggleTheme,
    shortcut: ['T'],
  },
];

// Hook for command palette
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Global keyboard shortcut to open command palette
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}; 
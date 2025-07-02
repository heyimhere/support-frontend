import React, { useEffect, useCallback, useState } from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  category?: string;
  disabled?: boolean;
}

interface KeyboardShortcutManagerProps {
  shortcuts: KeyboardShortcut[];
  children: React.ReactNode;
}

export const KeyboardShortcutManager: React.FC<KeyboardShortcutManagerProps> = ({
  shortcuts,
  children,
}) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    // Add special key handling
    const specialKeys = ['ctrl', 'alt', 'shift', 'meta'];
    const isSpecialKey = specialKeys.some(special => 
      event.getModifierState(special.charAt(0).toUpperCase() + special.slice(1))
    );

    setPressedKeys(prev => new Set([...prev, key]));

    // Check for shortcut matches
    const currentKeys = Array.from(new Set([...pressedKeys, key]));
    
    for (const shortcut of shortcuts) {
      if (shortcut.disabled) continue;
      
      const shortcutKeys = shortcut.keys.map(k => k.toLowerCase());
      const isMatch = shortcutKeys.length === currentKeys.length &&
        shortcutKeys.every(k => currentKeys.includes(k));

      if (isMatch) {
        event.preventDefault();
        shortcut.action();
        setPressedKeys(new Set());
        return;
      }
    }

    // Show help with '?' key
    if (key === '?' && !isSpecialKey) {
      event.preventDefault();
      setShowHelp(true);
    }

    // Hide help with Escape
    if (key === 'escape') {
      setShowHelp(false);
    }
  }, [shortcuts, pressedKeys]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <>
      {children}
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                <CardTitle>Keyboard Shortcuts</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-6">
                {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0"
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, index) => (
                              <React.Fragment key={key}>
                                <KeyBadge key={key}>{key}</KeyBadge>
                                {index < shortcut.keys.length - 1 && (
                                  <span className="text-muted-foreground text-xs self-center">
                                    +
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Press <KeyBadge>?</KeyBadge> to show this help or{' '}
                    <KeyBadge>Esc</KeyBadge> to close
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

interface KeyBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const KeyBadge: React.FC<KeyBadgeProps> = ({ children, className }) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-mono px-2 py-1 bg-muted/50 border border-border rounded',
        className
      )}
    >
      {children}
    </Badge>
  );
};

// Hook for using shortcuts in components
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys: string[] = [];
      
      if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl');
      if (event.altKey) pressedKeys.push('alt');
      if (event.shiftKey) pressedKeys.push('shift');
      pressedKeys.push(event.key.toLowerCase());

      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue;
        
        const shortcutKeys = shortcut.keys.map(k => k.toLowerCase());
        const isMatch = shortcutKeys.length === pressedKeys.length &&
          shortcutKeys.every(k => pressedKeys.includes(k));

        if (isMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}; 
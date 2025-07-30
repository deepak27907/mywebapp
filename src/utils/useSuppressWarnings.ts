import { useEffect } from 'react';

export const useSuppressWarnings = () => {
  useEffect(() => {
    const originalWarn = console.warn;
    
    console.warn = function(...args) {
      const argsString = args.map(arg => String(arg)).join(' ');
      
      // Suppress React Beautiful DnD warnings
      if (argsString.includes('defaultProps will be removed from memo components') ||
          argsString.includes('Connect(Droppable)') ||
          argsString.includes('react-beautiful-dnd') ||
          argsString.includes('Support for defaultProps will be removed') ||
          argsString.includes('memo components in a future major release')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
    
    // Cleanup function to restore original console.warn
    return () => {
      console.warn = originalWarn;
    };
  }, []);
}; 
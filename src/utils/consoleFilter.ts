// Suppress React Beautiful DnD defaultProps warning
(function() {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    // Convert all args to strings for easier checking
    const argsString = args.map(arg => String(arg)).join(' ');
    
    // Check if it's the React Beautiful DnD warning
    if (argsString.includes('defaultProps will be removed from memo components') ||
        argsString.includes('Connect(Droppable)') ||
        argsString.includes('react-beautiful-dnd') ||
        argsString.includes('Support for defaultProps will be removed') ||
        argsString.includes('memo components in a future major release')) {
      return; // Suppress this specific warning
    }
    
    originalWarn.apply(console, args);
  };
})();

export {}; 
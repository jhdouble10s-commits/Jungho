// Monaco accepts hex colors, not CSS variable/OKLCH expressions. Let the browser
// perform the color conversion; do not introduce a second palette or color math.
export function installMonacoTheme(monaco) {
  const root = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', {willReadFrequently:true});
  const color = token => {
    context.clearRect(0,0,1,1);
    context.fillStyle = getComputedStyle(root).getPropertyValue(token).trim();
    context.fillRect(0,0,1,1);
    return '#' + Array.from(context.getImageData(0,0,1,1).data).slice(0,3).map(value => value.toString(16).padStart(2,'0')).join('');
  };
  const update = () => {
    const dark = root.dataset.theme === 'dark' || (!root.dataset.theme && root.classList.contains('dark'));
    monaco.editor.defineTheme('epub-semantic', {
      base:dark ? 'vs-dark' : 'vs', inherit:true, rules:[],
      colors:{
        'editor.background':color('--editor-background'),
        'editor.foreground':color('--editor-foreground'),
        'editorLineNumber.foreground':color('--muted-foreground'),
        'editorLineNumber.activeForeground':color('--foreground'),
        'editorCursor.foreground':color('--primary'),
        'editor.selectionBackground':color('--ui-accent'),
        'editor.selectionForeground':color('--accent-foreground'),
        'editor.lineHighlightBackground':color('--ui-muted'),
        'editorWidget.background':color('--popover'),
        'editorWidget.foreground':color('--popover-foreground'),
        'editorWidget.border':color('--border'),
        'editorHoverWidget.background':color('--tooltip-background'),
        'editorHoverWidget.foreground':color('--tooltip-foreground'),
        'editorHoverWidget.border':color('--border'),
        'editorSuggestWidget.background':color('--popover'),
        'editorSuggestWidget.foreground':color('--popover-foreground'),
        'editorSuggestWidget.selectedBackground':color('--ui-accent'),
        'editorSuggestWidget.selectedForeground':color('--accent-foreground'),
        'editorSuggestWidget.border':color('--border'),
        'input.background':color('--input'), 'input.foreground':color('--foreground'),
        'focusBorder':color('--ring'), 'editorError.foreground':color('--destructive'),
      },
    });
    monaco.editor.setTheme('epub-semantic');
  };
  update();
  new MutationObserver(update).observe(root, {attributes:true, attributeFilter:['data-theme','class']});
  return 'epub-semantic';
}

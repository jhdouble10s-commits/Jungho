import * as htmlLanguageService from 'vscode-html-languageservice';
import { TextDocument } from 'vscode-languageserver-textdocument';

// The package exposes CommonJS in Node and ESM in the browser import map.
const { getLanguageService, newHTMLDataProvider, TokenType, ScannerState } = htmlLanguageService.default || htmlLanguageService;
const service = getLanguageService({ customDataProviders:[newHTMLDataProvider('epub-xhtml', {
  version:1.1,
  globalAttributes:[{ name:'epub:type' }, { name:'xml:lang' }],
})] });

export function xhtmlCompletionContext(source, offset) {
  const scanner = service.createScanner(source);
  let token = TokenType.EOS;
  let tagStart = 0;
  while (scanner.getTokenEnd() < offset) {
    token = scanner.scan();
    if (token === TokenType.EOS) break;
    if (token === TokenType.StartTagOpen) tagStart = scanner.getTokenOffset();
  }
  const state = scanner.getScannerState();
  return {
    emmet:state === ScannerState.WithinContent && token !== TokenType.AttributeValue,
    attributes:[ScannerState.WithinTag, ScannerState.AfterAttributeName, ScannerState.BeforeAttributeValue].includes(state)
      && token !== TokenType.StartTag,
    tagStart,
    attributeStart:token === TokenType.AttributeName ? scanner.getTokenOffset() : null,
  };
}

export function xhtmlAttributeCompletions(source, offset) {
  const context = xhtmlCompletionContext(source, offset);
  if (!context.attributes) return [];
  const document = TextDocument.create('file:///chapter.xhtml', 'html', 1, source);
  const html = service.parseHTMLDocument(document);
  const result = service.doComplete(document, document.positionAt(offset), html, { attributeDefaultValue:'doublequotes' });
  // Also suppress a fully typed duplicate: the language service deliberately
  // includes the current attribute even when the same name appears elsewhere.
  const existing = new Set();
  const scanner = service.createScanner(source, context.tagStart);
  let token;
  while ((token = scanner.scan()) !== TokenType.EOS) {
    if (token === TokenType.StartTagClose || token === TokenType.StartTagSelfClose) break;
    if (token === TokenType.AttributeName && scanner.getTokenOffset() !== context.attributeStart) {
      existing.add(scanner.getTokenText().toLowerCase());
    }
  }
  // The OSS provider emits tag-specific attributes before global attributes.
  return result.items.filter(item => !existing.has(item.label.toLowerCase())).map((item, index) => ({
    ...item, sortText:String(index).padStart(5, '0'),
  }));
}

export function monacoAttributeSuggestions(monaco, model, position) {
  return xhtmlAttributeCompletions(model.getValue(), model.getOffsetAt(position)).map(item => ({
    label:item.label,
    kind:monaco.languages.CompletionItemKind.Property,
    insertText:item.textEdit.newText,
    insertTextRules:item.insertTextFormat === 2 ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : 0,
    range:new monaco.Range(item.textEdit.range.start.line + 1, item.textEdit.range.start.character + 1,
      item.textEdit.range.end.line + 1, item.textEdit.range.end.character + 1),
    sortText:item.sortText,
    documentation:typeof item.documentation === 'string' ? item.documentation : item.documentation?.value,
  }));
}

export function registerXhtmlEmmet(monaco, emmet) {
  // Restrict this provider without patching Monaco or changing CSS Emmet.
  return emmet.emmetHTML({ ...monaco, languages:{ ...monaco.languages,
    registerCompletionItemProvider(language, provider) {
      return monaco.languages.registerCompletionItemProvider(language, { ...provider,
        provideCompletionItems(model, position, ...args) {
          if (!xhtmlCompletionContext(model.getValue(), model.getOffsetAt(position)).emmet) return { suggestions:[] };
          return provider.provideCompletionItems(model, position, ...args);
        },
      });
    },
  } }, ['html']);
}

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { defaultKeymap, indentWithTab, history } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
// Ejemplo de importación de tema claro (necesitarías instalarlo o crearlo)
// import { basicLight } from 'cm6-theme-basic-light'; // Si tuvieras este tema

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import useFileStore from '@/store/fileStore';
import useThemeStore from '@/store/themeStore';

// Crea un Compartment para el tema. Esto debe hacerse fuera del componente o una sola vez.
const themeCompartment = new Compartment();

const EditorPane: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const {
    currentFileContent,
    updateCurrentFileContent,
    currentFilePath,
    isLoading,
    error,
    saveCurrentFile,
    isDirty,
  } = useFileStore();
  const { theme } = useThemeStore(); // 'dark' o 'light'
  const [showPreview, setShowPreview] = useState(true);

  // Nuevo estado para el HTML procesado y sanitizado
  const [processedHtml, setProcessedHtml] = useState<string>('');

  // Define tus extensiones base que no cambian con el tema
  const baseExtensions = useMemo(() => [
    history(),
    keymap.of([...defaultKeymap, indentWithTab]),
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        updateCurrentFileContent(update.state.doc.toString());
      }
    }),
    // cmPlaceholder("Comienza a escribir tu Markdown aquí...")
  ], [updateCurrentFileContent]);

  // Efecto para inicializar el editor y reconfigurar el tema
  useEffect(() => {
    if (editorRef.current) {
      // Elige la extensión del tema basada en el estado del tema
      // Reemplaza `[]` con tu extensión de tema claro si tienes una
      const currentThemeExtension = theme === 'dark' ? oneDark : [];

      if (!viewRef.current) { // Inicializar el editor por primera vez
        const startState = EditorState.create({
          doc: currentFileContent,
          extensions: [
            ...baseExtensions,
            themeCompartment.of(currentThemeExtension),
          ],
        });
        const view = new EditorView({
          state: startState,
          parent: editorRef.current,
        });
        viewRef.current = view;
      } else { // El editor ya existe, solo reconfigura el tema
        viewRef.current.dispatch({
          effects: themeCompartment.reconfigure(currentThemeExtension),
        });
      }
    }

    // Función de limpieza para cuando el componente se desmonte realmente
    return () => {
      // Solo destruir si el editorRef ya no está en el DOM (o si viewRef existe)
      // Esta lógica de limpieza puede ser delicada. Una forma simple es:
      if (viewRef.current) {
        // Check if the parent element is still part of the document when unmounting.
        // If not, it means the component is truly being removed.
        const isEditorStillMounted = editorRef.current && document.body.contains(editorRef.current);
        if (!isEditorStillMounted) {
            viewRef.current.destroy();
            viewRef.current = null;
        }
      }
    };
  }, [theme, baseExtensions, currentFileContent]); // currentFileContent para la inicialización

  // Actualizar contenido del editor si cambia el archivo (desde fuera)
  useEffect(() => {
    if (viewRef.current && currentFileContent !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: currentFileContent || '' },
      });
    }
  }, [currentFileContent, currentFilePath]); // Depende también de currentFilePath para forzar recarga si el archivo en sí cambia

  // Efecto para procesar y sanitizar el markdown cuando currentFileContent cambie
  useEffect(() => {
    if (!currentFileContent) {
      setProcessedHtml('');
      return;
    }

    let isMounted = true;

    const processAndSanitizeMarkdown = async () => {
      try {
        const rawMarkupOrPromise = marked.parse(currentFileContent, {
          gfm: true,
          breaks: true,
        });

        let rawMarkup: string;
        if (typeof rawMarkupOrPromise === 'string') {
          rawMarkup = rawMarkupOrPromise;
        } else {
          rawMarkup = await rawMarkupOrPromise;
        }

        if (isMounted) {
          setProcessedHtml(DOMPurify.sanitize(rawMarkup));
        }
      } catch (error) {
        console.error("Error parsing or sanitizing markdown:", error);
        if (isMounted) {
          setProcessedHtml("<p>Error al renderizar el contenido.</p>");
        }
      }
    };

    processAndSanitizeMarkdown();

    return () => {
      isMounted = false;
    };
  }, [currentFileContent]);

  // `renderedMarkdown` ahora solo depende del estado 'processedHtml'
  const renderedMarkdown = useMemo(() => {
    return { __html: processedHtml };
  }, [processedHtml]);

  const filename = currentFilePath ? currentFilePath.split(/[\\/]/).pop() : "Nuevo Documento";

  if (isLoading) return <div className="p-5 text-center text-text-secondary">Cargando...</div>;
  if (error) return <div className="p-5 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-bg-primary">
      {/* Toolbar */}
      <div className="flex justify-between items-center py-2 px-4 bg-bg-secondary border-b border-border-color flex-shrink-0 min-h-[40px]">
        <span className="text-sm text-text-secondary">
          {filename}
          {isDirty && <span className="text-accent-primary ml-1">*</span>}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => saveCurrentFile()}
            disabled={!isDirty && !!currentFilePath} // Si no está sucio Y tiene path, deshabilitar
            className="px-3 py-1 text-xs bg-bg-tertiary text-text-primary border border-border-color rounded hover:bg-accent-primary hover:text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:text-text-secondary"
          >
            Guardar
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 text-xs bg-bg-tertiary text-text-primary border border-border-color rounded hover:bg-bg-primary"
          >
            {showPreview ? 'Ocultar Vista' : 'Mostrar Vista'}
          </button>
        </div>
      </div>

      {/* Editor y Preview Area */}
      <div className={`flex-grow flex overflow-hidden ${showPreview ? 'flex-row' : 'flex-col'}`}>
        <div ref={editorRef} className={`h-full overflow-y-auto ${showPreview ? 'w-1/2' : 'w-full'}`}>
          {/* CodeMirror se monta aquí. Asegúrate que el .cm-editor (hijo de este div) tenga height: 100% */}
        </div>
        {showPreview && (
          <div
            className="w-1/2 h-full overflow-y-auto p-5 border-l border-border-color prose dark:prose-invert prose-sm max-w-none 
                       bg-bg-primary text-text-primary 
                       prose-headings:text-text-primary prose-headings:border-b prose-headings:border-border-color prose-headings:pb-1 prose-headings:mb-4
                       prose-a:text-accent-primary hover:prose-a:underline
                       prose-code:bg-bg-secondary prose-code:text-text-primary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-editor
                       prose-pre:bg-bg-secondary prose-pre:text-text-primary prose-pre:p-4 prose-pre:rounded prose-pre:font-editor
                       prose-blockquote:border-l-4 prose-blockquote:border-border-color prose-blockquote:pl-4 prose-blockquote:text-text-secondary"
            dangerouslySetInnerHTML={renderedMarkdown}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPane;
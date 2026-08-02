'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface CustomEditorProps {
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const CustomEditor = forwardRef<Quill, CustomEditorProps>(
  (
    {
      value = '',
      onChange,
      readOnly = false,
      placeholder = 'Write something...',
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isSettingContentRef = useRef(false);
    const isInitialized = useRef(false);

    // Store the onChange callback reference
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Initialize Quill only once
    useEffect(() => {
      if (!editorRef.current || quillRef.current || isInitialized.current) return;
      
      // Mark as initialized to prevent multiple initializations
      isInitialized.current = true;

      // Copy ref to variable for cleanup function
      const editorElement = editorRef.current;

      // Clear any existing content in the container
      editorElement.innerHTML = '';

      const modules = {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
        ],
      };

      const quill = new Quill(editorElement, {
        theme: 'snow',
        modules,
        placeholder,
        readOnly,
      });

      // Store handler reference for cleanup
      const textChangeHandler = () => {
        if (isSettingContentRef.current) return;
        const html = quill.root.innerHTML;
        onChangeRef.current(html);
      };

      quill.on('text-change', textChangeHandler);
      quillRef.current = quill;

      // Cleanup function
      return () => {
        if (quillRef.current) {
          quillRef.current.off('text-change', textChangeHandler);
          quillRef.current = null;
        }
        // Reset initialization flag and clear DOM
        isInitialized.current = false;
        // Use the copied variable instead of ref
        editorElement.innerHTML = '';
      };
    }, [placeholder, readOnly]); // Include dependencies

    // Update readOnly state when prop changes
    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!readOnly);
      }
    }, [readOnly]);

    // Update placeholder when prop changes
    useEffect(() => {
      if (quillRef.current && editorRef.current) {
        const placeholderElement = editorRef.current.querySelector('.ql-editor');
        if (placeholderElement) {
          placeholderElement.setAttribute('data-placeholder', placeholder);
        }
      }
    }, [placeholder]);

    // Update content when value prop changes
    useEffect(() => {
      if (!quillRef.current) return;
      
      const currentHtml = quillRef.current.root.innerHTML;
      
      // Only update if content is actually different
      if (value !== currentHtml && value !== '<p><br></p>') {
        isSettingContentRef.current = true;
        
        // Store current selection
        const selection = quillRef.current.getSelection();
        
        // Use Quill's clipboard API for better content handling
        if (value === '') {
          quillRef.current.setText('');
        } else {
          // Use pasteHTML for better handling of HTML content
          quillRef.current.clipboard.dangerouslyPasteHTML(value);
        }
        
        // Restore selection if it existed and is still valid
        if (selection) {
          // Use setTimeout to ensure the content is set before restoring selection
          setTimeout(() => {
            try {
              const length = quillRef.current?.getLength() || 0;
              const safeIndex = Math.min(selection.index, length - 1);
              const safeLength = Math.min(selection.length, length - safeIndex);
              quillRef.current?.setSelection(safeIndex, safeLength);
            } catch (error) {
              console.error(error)
              // If selection restoration fails, just place cursor at end
              const length = quillRef.current?.getLength() || 0;
              quillRef.current?.setSelection(length - 1, 0);
            }
          }, 0);
        }
        
        isSettingContentRef.current = false;
      }
    }, [value]);

    // Expose Quill instance through ref
    useImperativeHandle(ref, () => quillRef.current as Quill, []);

    return <div ref={editorRef} style={{ minHeight: 200 }} />;
  }
);

CustomEditor.displayName = 'CustomEditor';

export default CustomEditor;
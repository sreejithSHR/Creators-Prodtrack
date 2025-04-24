import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Loader2,
  ArrowLeft,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Highlighter,
  Heading1,
  Heading2,
} from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

import { supabase } from '../lib/supabase';
import NavBar from '../components/NavBar';

interface SceneDetails {
  name: string;
  location: string;
  timeOfDay: string;
  description: string;
}

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

export default function Script() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [sceneDetails, setSceneDetails] = useState<SceneDetails>({
    name: '',
    location: '',
    timeOfDay: 'Day',
    description: '',
  });

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3] }),
      Bold,
      Italic,
      Underline,
      Strike,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      TextStyle,
      Color,
      FontFamily,
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      CodeBlock,
      HorizontalRule,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      try {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        setProjectName(project.name);

        const { data: scripts, error: scriptError } = await supabase
          .from('scripts')
          .select('*')
          .eq('project_id', projectId)
          .limit(1);

        if (scriptError) throw scriptError;

        if (scripts && scripts.length > 0) {
          const script = scripts[0];
          setScriptId(script.id);

          try {
            const savedData = JSON.parse(script.content || '{}');
            if (savedData.sceneDetails) {
              setSceneDetails(savedData.sceneDetails);
            }
            if (savedData.scriptContent && editor) {
              editor.commands.setContent(savedData.scriptContent);
            }
          } catch (e) {
            if (editor) {
              editor.commands.setContent(script.content || '');
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId, editor]);

  const handleSave = async () => {
    if (!projectId || !editor) return;

    setSaving(true);
    setError(null);

    const saveContent = JSON.stringify({
      sceneDetails,
      scriptContent: editor.getHTML(),
    });

    try {
      if (scriptId) {
        await supabase
          .from('scripts')
          .update({ content: saveContent })
          .eq('id', scriptId);
      } else {
        const { data, error } = await supabase
          .from('scripts')
          .insert({ project_id: projectId, content: saveContent })
          .select()
          .single();

        if (error) throw error;
        setScriptId(data.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save script');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/projects/${projectId}/scenes`)}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back to Scenes
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  {projectName} - Script
                </h1>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow">
            {/* Rich Text Editor Toolbar */}
            <div className="border-b p-2 flex flex-wrap gap-2">
              <div className="flex items-center gap-1 border-r pr-2">
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                >
                  <BoldIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                >
                  <ItalicIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}
                >
                  <UnderlineIcon className="w-5 h-5" />
                </button>
              </div>

              {/* More toolbar buttons... */}
            </div>

            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </>
  );
}

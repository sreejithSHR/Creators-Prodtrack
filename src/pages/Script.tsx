import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Loader2,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Download,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import NavBar from '../components/NavBar';
import html2pdf from 'html2pdf.js';

interface ScriptContent {
  text: string;
  metadata?: {
    title?: string;
    description?: string;
    notes?: string;
  };
}

export default function Script() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [content, setContent] = useState<ScriptContent>({
    text: '',
    metadata: { title: '', description: '', notes: '' },
  });
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
            const parsedContent = JSON.parse(script.content || '{}');
            setContent(parsedContent);
          } catch {
            setContent({ text: script.content || '', metadata: {} });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  useEffect(() => {
    if (!autoSave) return;
    const timeout = setTimeout(() => handleSave(), 3000);
    return () => clearTimeout(timeout);
  }, [content, autoSave]);

  const handleSave = async () => {
    if (!projectId) return;

    setSaving(true);
    setError(null);

    try {
      const scriptContent = JSON.stringify(content);

      if (scriptId) {
        await supabase
          .from('scripts')
          .update({ content: scriptContent })
          .eq('id', scriptId);
      } else {
        const { data, error } = await supabase
          .from('scripts')
          .insert({ project_id: projectId, content: scriptContent })
          .select()
          .single();

        if (error) throw error;
        setScriptId(data.id);
      }

      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save script');
    } finally {
      setSaving(false);
    }
  };

  const handleFormat = (format: string) => {
    const textarea = document.getElementById('script-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.text.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`; break;
      case 'italic':
        formattedText = `_${selectedText}_`; break;
      case 'underline':
        formattedText = `__${selectedText}__`; break;
      case 'h1':
        formattedText = `# ${selectedText}`; break;
      case 'h2':
        formattedText = `## ${selectedText}`; break;
      case 'bullet':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n'); break;
      case 'number':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'); break;
      case 'quote':
        formattedText = selectedText.split('\n').map(line => `> ${line}`).join('\n'); break;
      case 'code':
        formattedText = `\`${selectedText}\``; break;
      case 'hr':
        formattedText = `\n---\n`; break;
      default:
        return;
    }

    const newText = content.text.substring(0, start) + formattedText + content.text.substring(end);
    setContent({ ...content, text: newText });
  };

  const handleExportPDF = () => {
    if (!pdfRef.current) return;

    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: 0.5,
        filename: `${projectName}-script.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .save();
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
          <div className="max-w-7xl mx-auto px-4">
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
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Auto-save</span>
                </label>
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> :
                    <><Save className="h-4 w-4 mr-2" /> Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow" ref={pdfRef}>
            
            <div className="p-4 border-b space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <div className="p-4 border ">
              <input
                type="text"
                value={content.metadata?.title || ''}
                onChange={(e) => setContent({ ...content, metadata: { ...content.metadata, title: e.target.value } })}
                className="w-full text-2xl font-semibold   focus:outline-none"
                placeholder="Script Title"
              />
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="p-4 border ">
              <input
                type="text"
                value={content.metadata?.description || ''}
                onChange={(e) => setContent({ ...content, metadata: { ...content.metadata, description: e.target.value } })}
                className="w-full text-base text-gray-600 "
                placeholder="Description"
              />
              </div>
                
            </div>

            <div className="border-b p-2 flex flex-wrap gap-2">
              {['bold', 'italic', 'underline', 'h1', 'h2', 'bullet', 'number', 'quote', 'code', 'hr'].map((type, i) => {
                const Icon = {
                  bold: Bold, italic: Italic, underline: Underline, h1: Heading1,
                  h2: Heading2, bullet: List, number: ListOrdered, quote: Quote,
                  code: Code, hr: Minus
                }[type];
                return (
                  <button key={i} onClick={() => handleFormat(type)} className="p-2 hover:bg-gray-100 rounded" title={type}>
                    {Icon && <Icon className="h-5 w-5" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4">
              <textarea
                id="script-editor"
                value={content.text}
                onChange={(e) => setContent({ ...content, text: e.target.value })}
                className="w-full min-h-[300px] p-4 border rounded-md font-mono focus:outline-none"
                placeholder="Start writing your script..."
              />
            </div>

            <div className="p-4 border-t">
              <textarea
                value={content.metadata?.notes || ''}
                onChange={(e) => setContent({ ...content, metadata: { ...content.metadata, notes: e.target.value } })}
                className="w-full h-24 p-3 border rounded-md"
                placeholder="Notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

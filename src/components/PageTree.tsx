import React from 'react';
import { ChevronRight, ChevronDown, Plus, MoreVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ScriptPage } from '../types/database';

interface PageTreeProps {
  pages: ScriptPage[];
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentId: string | null) => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newTitle: string) => void;
}

interface PageNodeProps {
  page: ScriptPage;
  level: number;
  pages: ScriptPage[];
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentId: string | null) => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newTitle: string) => void;
}

function PageNode({
  page,
  level,
  pages,
  selectedPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onRenamePage,
}: PageNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(page.title);

  const childPages = pages.filter((p) => p.parent_id === page.id);
  const hasChildren = childPages.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenamePage(page.id, title);
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setTitle(page.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 rounded hover:bg-gray-100 ${
          selectedPageId === page.id ? 'bg-gray-100' : ''
        }`}
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-5 h-5 flex items-center justify-center ${
            hasChildren ? '' : 'invisible'
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div
          className="flex-1 flex items-center gap-2 cursor-pointer"
          onClick={() => onSelectPage(page.id)}
        >
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                onRenamePage(page.id, title);
                setIsEditing(false);
              }}
              className="flex-1 bg-white border rounded px-1"
              autoFocus
            />
          ) : (
            <span className="flex-1">{page.title}</span>
          )}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-white rounded-md shadow-lg p-1"
              sideOffset={5}
            >
              <DropdownMenu.Item
                className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-100 rounded"
                onSelect={() => onCreatePage(page.id)}
              >
                Add Subpage
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-100 rounded"
                onSelect={() => setIsEditing(true)}
              >
                Rename
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="text-sm px-2 py-1.5 outline-none cursor-pointer hover:bg-red-100 rounded text-red-600"
                onSelect={() => onDeletePage(page.id)}
              >
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {childPages.map((childPage) => (
            <PageNode
              key={childPage.id}
              page={childPage}
              level={level + 1}
              pages={pages}
              selectedPageId={selectedPageId}
              onSelectPage={onSelectPage}
              onCreatePage={onCreatePage}
              onDeletePage={onDeletePage}
              onRenamePage={onRenamePage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PageTree({
  pages,
  selectedPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onRenamePage,
}: PageTreeProps) {
  const rootPages = pages.filter((p) => !p.parent_id);

  return (
    <div className="w-64 bg-white border-r">
      <div className="p-4 border-b">
        <button
          onClick={() => onCreatePage(null)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>
      <div className="p-2">
        {rootPages.map((page) => (
          <PageNode
            key={page.id}
            page={page}
            level={0}
            pages={pages}
            selectedPageId={selectedPageId}
            onSelectPage={onSelectPage}
            onCreatePage={onCreatePage}
            onDeletePage={onDeletePage}
            onRenamePage={onRenamePage}
          />
        ))}
      </div>
    </div>
  );
}
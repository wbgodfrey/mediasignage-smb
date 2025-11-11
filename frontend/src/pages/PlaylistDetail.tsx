import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistAPI, contentAPI } from '../services/api';
import { Playlist, Content } from '../types';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddContent, setShowAddContent] = useState(false);

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: async () => {
      const response = await playlistAPI.getOne(id!);
      return response.data as Playlist;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (contentIds: string[]) =>
      playlistAPI.update(id!, { contentIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
    },
  });

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (!playlist) return;

    const items = [...playlist.playlistContents];
    const [removed] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, removed);

    const contentIds = items.map(item => item.contentId);
    updateMutation.mutate(contentIds);
  };

  const handleRemoveContent = (contentId: string) => {
    if (!playlist) return;
    const contentIds = playlist.playlistContents
      .filter(pc => pc.contentId !== contentId)
      .map(pc => pc.contentId);
    updateMutation.mutate(contentIds);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!playlist) {
    return <div className="text-center py-8">Playlist not found</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <button
            onClick={() => navigate('/playlists')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Playlists
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{playlist.name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage content in this playlist. Drag to reorder.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddContent(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Add Content
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        {playlist.playlistContents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No content in this playlist yet. Click "Add Content" to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {playlist.playlistContents.map((item, index) => (
              <li key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleReorder(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-25"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(index, Math.min(playlist.playlistContents.length - 1, index + 1))}
                      disabled={index === playlist.playlistContents.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-25"
                    >
                      ↓
                    </button>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.content.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.content.type} • {item.content.duration ? `${item.content.duration}s` : 'N/A'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveContent(item.contentId)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddContent && (
        <AddContentModal
          playlist={playlist}
          onClose={() => setShowAddContent(false)}
          onSuccess={() => {
            setShowAddContent(false);
            queryClient.invalidateQueries({ queryKey: ['playlist', id] });
          }}
        />
      )}
    </div>
  );
}

function AddContentModal({
  playlist,
  onClose,
  onSuccess
}: {
  playlist: Playlist;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: allContent } = useQuery({
    queryKey: ['contents'],
    queryFn: async () => {
      const response = await contentAPI.getAll();
      return response.data as Content[];
    },
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const existingContentIds = new Set(playlist.playlistContents.map(pc => pc.contentId));
  const availableContent = allContent?.filter(c => !existingContentIds.has(c.id)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    try {
      const currentContentIds = playlist.playlistContents.map(pc => pc.contentId);
      const newContentIds = [...currentContentIds, ...selectedIds];
      await playlistAPI.update(playlist.id, { contentIds: newContentIds });
      onSuccess();
    } catch (error) {
      console.error('Failed to add content:', error);
      alert('Failed to add content');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-medium mb-4">Add Content to Playlist</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-4">
            {availableContent.length === 0 ? (
              <p className="text-gray-500">No available content to add</p>
            ) : (
              availableContent.map(content => (
                <label
                  key={content.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(content.id)}
                    onChange={() => toggleSelection(content.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{content.name}</div>
                    <div className="text-sm text-gray-500">
                      {content.type} • {content.duration ? `${content.duration}s` : 'N/A'}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedIds.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Add Selected ({selectedIds.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

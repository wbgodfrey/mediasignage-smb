import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistAPI } from '../services/api';
import type { Playlist } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Playlists() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await playlistAPI.getAll();
      return response.data as Playlist[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playlistAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Playlists</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage playlists for your digital signage
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Create Playlist
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists?.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer"
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{playlist.name}</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Items: {playlist.playlistContents?.length || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {formatDuration(playlist.totalDuration)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {formatFileSize(playlist.totalSize || 0)}
                  </p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(playlist.id);
                    }}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
          }}
        />
      )}
    </div>
  );
}

function CreatePlaylistModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setCreating(true);
    try {
      await playlistAPI.create({ name });
      onSuccess();
    } catch (error) {
      console.error('Create failed:', error);
      alert('Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-medium mb-4">Create Playlist</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Playlist Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
              placeholder="My Playlist"
            />
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
              disabled={creating}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

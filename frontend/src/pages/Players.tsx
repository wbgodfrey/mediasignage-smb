import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerAPI, playlistAPI } from '../services/api';
import type { Player, Playlist } from '../types';

export default function Players() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const queryClient = useQueryClient();

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const response = await playerAPI.getAll();
      return response.data as Player[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playerAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Players</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your digital signage players and assign playlists
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Add Player
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players?.map((player) => (
            <div
              key={player.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{player.name}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      player.status === 'online'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
                {player.description && (
                  <p className="text-sm text-gray-500 mb-4">{player.description}</p>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Playlist:</span>{' '}
                    {player.playlist?.name || 'None assigned'}
                  </p>
                  {player.lastSeen && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Last seen:</span>{' '}
                      {new Date(player.lastSeen).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingPlayer(player)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(player.id)}
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
        <PlayerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['players'] });
          }}
        />
      )}

      {editingPlayer && (
        <PlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSuccess={() => {
            setEditingPlayer(null);
            queryClient.invalidateQueries({ queryKey: ['players'] });
          }}
        />
      )}
    </div>
  );
}

function PlayerModal({
  player,
  onClose,
  onSuccess,
}: {
  player?: Player;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(player?.name || '');
  const [description, setDescription] = useState(player?.description || '');
  const [playlistId, setPlaylistId] = useState(player?.playlistId || '');
  const [saving, setSaving] = useState(false);

  const { data: playlists } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await playlistAPI.getAll();
      return response.data as Playlist[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      if (player) {
        await playerAPI.update(player.id, {
          name,
          description,
          playlistId: playlistId || null,
        });
      } else {
        await playerAPI.create({ name, description });
      }
      onSuccess();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-medium mb-4">
          {player ? 'Edit Player' : 'Add Player'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
              placeholder="Player 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              placeholder="Location or notes"
            />
          </div>
          {player && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assigned Playlist
              </label>
              <select
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">None</option>
                {playlists?.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : player ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

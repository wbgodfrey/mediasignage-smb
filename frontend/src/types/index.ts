export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Content {
  id: string;
  name: string;
  description?: string;
  type: 'image' | 'video';
  filePath: string;
  fileSize: number;
  duration?: number;
  startDate?: string;
  endDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  playlistContents: PlaylistContent[];
  totalDuration?: number;
  totalSize?: number;
}

export interface PlaylistContent {
  id: string;
  playlistId: string;
  contentId: string;
  order: number;
  content: Content;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  description?: string;
  playlistId?: string;
  userId: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  screenshot?: string;
  createdAt: string;
  updatedAt: string;
  playlist?: Playlist;
}

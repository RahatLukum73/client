export type ChatAuthor = {
  id: string;
  name: string;
  isAdmin?: boolean;
};

export type ChatMessage = {
  id: string;
  author: ChatAuthor;
  text: string;
  timestamp: string; // ISO
};


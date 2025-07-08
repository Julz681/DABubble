export interface Message {
  author: string;
  time: string;
  content: string;
  reactions?: string[];
  isSelf?: boolean;
}

import { Asset } from "./asset";

export type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

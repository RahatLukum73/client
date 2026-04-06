export type ChatProfile = {
  name: string;
  userId: string;
  sessionToken: string;
  isAdmin: boolean;
};

export type JoinState =
  | { status: "loading" }
  | { status: "login" }
  | { status: "pending"; profile: ChatProfile }
  | { status: "approved"; profile: ChatProfile }
  | { status: "rejected"; reason: string };


import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer"; 

interface UserData {
  id: string;
  username: string;
  role: string;
}

interface AuthStore {
  user?: UserData;
  isAuthenticated: boolean;
  token?: string;
  _hasHydrated?: boolean;
  login: (loginResponse: { user: UserData; token: string }) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void; 
}

const broadcast = new BroadcastChannel("auth_channel");

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      user: undefined,
      isAuthenticated: false,
      token: undefined,
      _hasHydrated: false,
      login: (loginResponse) => {
        set((state) => {
          state.isAuthenticated = true;
          state.user = loginResponse.user;
          state.token = loginResponse.token;
        });
        broadcast.postMessage({ event: "login", data: loginResponse });
      },
      logout: () => {
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          broadcast.postMessage({ event: "logout" });
          set((state) => {
            state.isAuthenticated = false;
            state.user = undefined;
            state.token = undefined; 
          });
        }
      }, 
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
     
    })),
    {
      name: "user-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

broadcast.onmessage = (event) => {
  const { event: authEvent, data } = event.data;
  const { isAuthenticated } = useAuthStore.getState();

  if (authEvent === "logout" && isAuthenticated) {
    useAuthStore.getState().logout();
  }

  if (authEvent === "login" && data && !isAuthenticated) {
    useAuthStore.getState().login(data);
  }
};
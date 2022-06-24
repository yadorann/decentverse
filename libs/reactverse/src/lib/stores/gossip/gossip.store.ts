import create from "zustand";
import * as types from "./gossip.types";
import { Socket as Soc } from "socket.io-client";

export interface GossipState {
  chats: types.Chat[];
  chatText: string;
  callRoom: types.CallRoom;
  peers: types.PeerStream[];
  onChangeChatText: (e: any) => void;
  joinCallRoom: (roomId: string) => void;
  leaveCallRoom: () => void;
  sendChat: (roomId: string, text: string) => void;
  receiveChat: (roomId: string, chat: types.Chat) => void;
  addPeer: (
    socketId: string,
    initiator: boolean,
    form: types.InitForm,
    localStream: MediaStream,
    screenStream?: MediaStream
  ) => void;
  updatePeer: (data: Partial<types.PeerStream>) => void;
  removePeer: (id: string) => void;
  setIsTalk: (isTalk: boolean) => void;
  setMic: (mic: number) => void;
  setCam: (cam: boolean) => void;
  toggleMic: () => void;
  toggleCam: () => void;
  mutePeer: (id: string) => void;
  unmutePeer: (id: string) => void;
  blindPeer: (id: string) => void;
  openPeer: (id: string) => void;
  clearPeers: () => void;
  togglePeerMic: (peerId: string, mic: boolean) => void;
  togglePeerCam: (peerId: string, cam: boolean) => void;
  setLocalStream: (localStream: MediaStream) => void;
  toggleScreen: (screenStream: MediaStream) => void;
  status: "none" | "loading" | "failed" | "idle";
}
export const useGossip = create<GossipState>((set, get) => ({
  chats: [],
  chatText: "",
  callRoom: {
    roomId: "",
    roomType: "none",
    mic: 100,
    isTalk: false,
    cam: false,
    fullNum: 0,
  },
  peers: [],
  onChangeChatText: (e: any) => set({ chatText: e.target.value }),
  sendChat: (roomId: string, text: string) =>
    set((state) => ({
      chats: [
        ...state.chats,
        {
          from: "1242",
          fromName: "aaa",
          text,
          at: new Date(),
        },
      ],
      chatText: "",
    })),
  joinCallRoom: (roomId: string) => set((state) => ({ callRoom: { ...state.callRoom, roomId } })),
  leaveCallRoom: () => set((state) => ({ callRoom: { ...state.callRoom, roomId: "", isTalk: false } })),

  receiveChat: (roomId: string, chat: types.Chat) =>
    set((state) => ({ chats: [...state.chats, { ...chat, at: new Date(chat.at) }] })),
  addPeer: (
    socketId: string,
    initiator: boolean,
    form: types.InitForm,
    localStream: MediaStream,
    screenStream?: MediaStream
  ) =>
    set((state) => ({
      callRoom: {
        ...state.callRoom,
        roomId: form.roomId,
        localStream,
        screenStream,
      },
      peers: [
        ...state.peers,
        {
          id: form.userId,
          socketId,
          nickName: form.nickName,
          mic: 100,
          isTalk: false,
          muted: false,
          blind: false,
          cam: false,
          quality: 100,
          call: new types.Call(initiator, localStream, screenStream),
        },
      ],
    })),
  removePeer: (id: string) =>
    set((state) => {
      const peers = state.peers.filter((p) => p.id !== id);

      return { peers };
    }),
  clearPeers: () =>
    set((state) => {
      return { peers: [] };
    }),
  setMic: (mic: number) =>
    set((state) => {
      if (!state.callRoom.localStream) return {};
      if (state.callRoom.localStream.getAudioTracks().length > 0)
        state.callRoom.localStream.getAudioTracks().forEach((track) => (track.enabled = mic ? true : false));
      return { callRoom: { ...state.callRoom, mic } };
    }),
  setCam: (cam: boolean) =>
    set((state) => {
      if (!state.callRoom.localStream) return {};
      if (state.callRoom.localStream.getVideoTracks().length > 0)
        state.callRoom.localStream.getVideoTracks().forEach((track) => (track.enabled = cam));
      return { callRoom: { ...state.callRoom, cam } };
    }),
  mutePeer: (id: string) =>
    set((state) => {
      return { peers: state.peers.map((peer) => (peer.id !== id ? peer : Object.assign(peer, { muted: true }))) };
    }),
  blindPeer: (id: string) =>
    set((state) => {
      return { peers: state.peers.map((peer) => (peer.id !== id ? peer : Object.assign(peer, { blind: true }))) };
    }),
  unmutePeer: (id: string) =>
    set((state) => {
      return { peers: state.peers.map((peer) => (peer.id !== id ? peer : Object.assign(peer, { muted: false }))) };
    }),
  openPeer: (id: string) =>
    set((state) => {
      return { peers: state.peers.map((peer) => (peer.id !== id ? peer : Object.assign(peer, { blind: false }))) };
    }),
  toggleMic: () =>
    set((state) => {
      if (!state.callRoom.localStream) return {};
      if (state.callRoom.localStream.getAudioTracks().length > 0)
        state.callRoom.localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      return { callRoom: { ...state.callRoom, mic: state.callRoom.mic ? 0 : 100 } };
    }),
  toggleCam: () =>
    set((state) => {
      if (!state.callRoom.localStream) return {};
      if (state.callRoom.localStream.getVideoTracks().length > 0)
        state.callRoom.localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      return { callRoom: { ...state.callRoom, cam: !state.callRoom.cam } };
    }),
  togglePeerMic: (id: string, mic: boolean) =>
    set((state) => {
      return {
        peers: state.peers.map((peer) => (peer.id !== id ? peer : Object.assign(peer, { mic: mic ? 100 : 0 }))),
      };
    }),
  togglePeerCam: (id: string, cam: boolean) =>
    set((state) => {
      return { peers: state.peers.map((peer) => (peer.id !== id ? peer : Object.assign(peer, { cam }))) };
    }),
  setIsTalk: (isTalk: boolean) =>
    set((state) => {
      state.callRoom.isTalk = isTalk && state.callRoom.mic > 0;
      return { callRoom: { ...state.callRoom } };
    }),
  updatePeer: (data: Partial<types.PeerStream>) =>
    set((state) => {
      state.peers = state.peers.map((peer) => (peer.id !== data.id ? peer : Object.assign(peer, data)));
      return { peers: state.peers.map((peer) => (peer.id !== data.id ? peer : Object.assign(peer, data))) };
    }),
  setLocalStream: (localStream: MediaStream) => set((state) => ({ callRoom: { ...state.callRoom, localStream } })),
  toggleScreen: (screenStream: MediaStream) => {
    const stream = get().callRoom.screenStream;
    return stream
      ? set((state) => {
          state.peers.map((p) => state.callRoom.screenStream && p.call.peer.removeStream(state.callRoom.screenStream));
          return { callRoom: { ...state.callRoom, screenStream: undefined } };
        })
      : set((state) => {
          state.peers.map((p) => p.call.peer.addStream(screenStream));
          return { callRoom: { ...state.callRoom, screenStream } };
        });
  },

  status: "none",
}));

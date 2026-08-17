import { io } from 'socket.io-client';

let socket: any = null;

export const connectSocket = (token: string) => {
    if (!socket) {
        socket = io('https://shelynx.mediaclocksoft.com.au', {
            transports: ['websocket'],
            auth: {
                token,
            },
        });
    }

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
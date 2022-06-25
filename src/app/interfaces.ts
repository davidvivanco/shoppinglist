import { Timestamp } from 'firebase/firestore';

export interface GoogleResponse {
}

export interface Users { [key: string]: string; }

export interface Item {
    id: string,
    checked: boolean,
    listId: string,
    name: string,
    detail: string,
    outOfStock: boolean,
    urgent: boolean,
    user: string,
    createdAt: Timestamp;
    updatedAt: Timestamp;
}


export type ItemKeys = 'checked' | 'listId' | 'name' | 'detail' | 'outOfStock' | 'urgent' | 'user';

export interface State {
    dataLoaded: boolean;
    loading: boolean;
    addItem: boolean;
    newNotifications: boolean;
    totalNotifications: number;
    notifications: Notification[];
}

export interface List {
    id: string,
    users: string[],
}

export interface User {
    id: string,
    email: string,
    username: string,
    photoURL: string,
    emailVerified: boolean,
}

export interface Notification {
    message: string;
    receivers: string[];
    sender: string;
    createdAt: Timestamp;
}
import { createContext } from "react";
import PocketBase from 'pocketbase'

export const DatabaseContext = createContext<PocketBase | null>(null);

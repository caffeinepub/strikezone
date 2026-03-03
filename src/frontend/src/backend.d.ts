import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScoreEntry {
    survivalTime: bigint;
    timestamp: bigint;
    playerName: string;
    kills: bigint;
}
export interface backendInterface {
    getTopScores(): Promise<Array<ScoreEntry>>;
    submitScore(playerName: string, kills: bigint, survivalTime: bigint): Promise<void>;
}

// Public viewer input, independent of any catalog API or server.
export interface Artifact {
    id: string;
    title: string;
    description: string;
    type: "mesh" | "splat";
    thumbnailUrl: string | null;
    contentUrl: string;
    lodUrl?: string | null;
    sizeBytes: number;
}

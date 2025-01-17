export interface Book {
    id: number;
    title: string;
    description: string;
    tags: string[];
}

export interface Tag {
    id: number
    name: string
}
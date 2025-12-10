// AR Book types and interfaces

export interface ARBookPage {
    id: string;
    pageNumber: number;
    title: string;
    description: string;
    imageUrl: string;
    arModelUrl?: string;
    audioUrl?: string;
    interactiveElements?: ARInteractiveElement[];
}

export interface ARInteractiveElement {
    id: string;
    type: 'button' | 'hotspot' | 'animation' | 'sound';
    name: string;
    position?: { x: number; y: number };
    action?: string;
    content?: string;
}

export interface ARBook {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    category: string;
    ageGroup: string;
    pages: ARBookPage[];
    authorName: string;
    publishedDate: string;
    isFeatured: boolean;
    views: number;
    rating: number;
}

export interface ARBookCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
    bookCount: number;
}

export type ARViewMode = '2d' | '3d' | 'ar';

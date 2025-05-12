export interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string | null;
    blog_category_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface BlogFormValues {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: File | null;
    published_at: string | null;
    blog_category_id: number | null;
    // [key: string]: any;
}

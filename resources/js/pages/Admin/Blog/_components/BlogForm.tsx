import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogFormValues, BlogCategory } from "./types";
import EditorComponent from "@/components/editor-component";

interface BlogFormProps {
    form: UseFormReturn<BlogFormValues>;
    isEditMode: boolean;
    categories: BlogCategory[];
}

export function BlogForm({ form, isEditMode, categories = [] }: BlogFormProps) {

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 items-start md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Título do artigo"
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        if (!isEditMode || !form.getValues("slug")) {
                                            form.setValue("slug", generateSlug(e.target.value));
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug *</FormLabel>
                            <FormControl>
                                <Input placeholder="slug-do-artigo" {...field} />
                            </FormControl>
                            <FormDescription>
                                URL amigável para o artigo
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="blog_category_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                            defaultValue={field.value?.toString()}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {/* <SelectItem value="">Sem categoria</SelectItem> */}
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Resumo *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Breve resumo do artigo"
                                className="min-h-[100px]"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Um resumo curto que aparecerá nas listagens
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Conteúdo *</FormLabel>
                        <FormControl>
                            <EditorComponent
                                placeholder="Conteúdo completo do artigo"
                                className="min-h-[300px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="featured_image"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Imagem Destacada</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        field.onChange(file);
                                    }
                                }}
                            />
                        </FormControl>
                        <FormDescription>
                            Selecione uma imagem para destacar no artigo (opcional)
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />


            <FormField
                control={form.control}
                name="published_at"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Data de Publicação</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                            format(new Date(field.value), "PPP", { locale: pt })
                                        ) : (
                                            <span>Selecione uma data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Deixe em branco para não publicar o artigo
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

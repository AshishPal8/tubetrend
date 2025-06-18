"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import AlertModal from "@/modals/alert-modal";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import RichTextEditor from "@/components/dashboard/text-editor";
import BlogImageUpload from "@/components/ui/image-uplaod";
import { MultiSelect } from "@/components/ui/multi-select";
import { useSession } from "next-auth/react";
import { TagInput } from "@/components/ui/tag-input";

export const formSchema = z.object({
  title: z.string().min(1, "Blog title is required"),
  content: z.string().min(1, "Blog content is required"),
  metaDescription: z.string().min(1, "Blog meta description is required"),
  thumbnail: z.string().min(1, "Blog thumbnail is required"),
  isActive: z.boolean(),
  isTrending: z.boolean(),
  featured: z.boolean(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()).optional(),
});

type BlogFormValues = z.infer<typeof formSchema>;

interface BlogFormProps {
  initialData: BlogFormValues | null;
  categories: { name: string; id: number }[];
  tags: { id: number; name: string }[];
}

export const BlogForm: React.FC<BlogFormProps> = ({
  initialData,
  categories,
  tags,
}) => {
  console.log("hello there initial data", initialData);
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: session } = useSession();

  const formattedCategories = categories.map((cat) => ({
    label: cat.name,
    value: cat.id.toString(),
  }));

  const title = initialData ? "Edit Blog" : "Create Blog";
  const description = initialData ? "Edit blog details" : "Add a new blog";
  const toastMessage = initialData ? "Blog updated." : "Blog created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      content: "",
      metaDescription: "",
      thumbnail: "",
      isActive: true,
      isTrending: false,
      featured: false,
      categories: [],
      tags: [],
    },
  });

  const onSubmit = async (values: BlogFormValues) => {
    try {
      if (submitted) return;
      setSubmitted(true);
      setLoading(true);

      const payload = {
        ...values,
        categories: values.categories.map(Number),
        authorId: Number(session?.user.id),
      };

      if (initialData) {
        await axios.put(`/api/blogs/${params.blogId}`, payload);
      } else {
        await axios.post(`/api/blogs`, payload);
      }

      router.refresh();
      router.push(`/dashboard/blogs`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/blogs/${params.blogId}`);
      router.refresh();
      router.push(`/dashboard/blogs`);
      toast.success("Blog deleted.");
    } catch (error) {
      toast.error("Failed to delete the blog.");
      console.log("Something went wrong!", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <BlogImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    {...field}
                    placeholder="Enter blog title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Categories</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={formattedCategories}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    placeholder="Select categories"
                    maxCount={5}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Tags</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    suggestions={tags.map((t) => t.name)}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    {...field}
                    placeholder="Enter meta description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTrending"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trending</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading || submitted}
            className="ml-auto"
            type="submit"
          >
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};

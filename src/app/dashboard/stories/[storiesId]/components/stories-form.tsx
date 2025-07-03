"use client";

import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import BlogImageUpload from "@/components/ui/image-uplaod";
import { MultiSelect } from "@/components/ui/multi-select";
import { useSession } from "next-auth/react";
import { TagInput } from "@/components/ui/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const storyItemSchema = z.object({
  mediaUrl: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO", "TEXT"]),
  caption: z.string().optional(),
  duration: z.number().int().positive(),
});

export const formSchema = z.object({
  title: z.string().min(1, "Blog title is required"),
  thumbnail: z.string().min(1, "Blog thumbnail is required"),
  isPublic: z.boolean(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()).optional(),
  storiesToCreate: z.array(storyItemSchema).min(1, "Add at least one story"),
  storyIdsToConnect: z.array(z.number()).optional(),
});

type StoriesFormValues = z.infer<typeof formSchema>;

interface StoriesFormProps {
  initialData: StoriesFormValues | null;
  categories: { name: string; id: number }[];
  tags: { id: number; name: string }[];
  story: { id: number; caption: string | null; mediaUrl: string }[];
}

export const StoriesForm: React.FC<StoriesFormProps> = ({
  initialData,
  categories,
  tags,
  story,
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

  const title = initialData ? "Edit Stories" : "Create Stories";
  const description = initialData ? "Edit Stories details" : "Add new stories";
  const toastMessage = initialData ? "Stories updated." : "Stories created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<StoriesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      thumbnail: "",
      isPublic: true,
      categories: [],
      tags: [],
    },
  });

  const onSubmit = async (values: StoriesFormValues) => {
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
        await axios.put(`/api/stories/${params.blogId}`, payload);
      } else {
        await axios.post(`/api/stories`, payload);
      }

      router.refresh();
      router.push(`/dashboard/stories`);
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
      await axios.delete(`/api/stories/${params.blogId}`);
      router.refresh();
      router.push(`/dashboard/stories`);
      toast.success("Stories deleted.");
    } catch (error) {
      toast.error("Failed to delete the stories.");
      console.log("Something went wrong!", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const { control, watch } = form;
  const {
    fields: storyFields,
    append: addStory,
    remove: removeStory,
  } = useFieldArray({
    control,
    name: "storiesToCreate",
  });

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
            name="storyIdsToConnect"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add from existing</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={story.map((s) => ({
                      label: s.mediaUrl.split("/").pop() ?? `Story #${s.id}`,
                      value: s.id.toString(),
                    }))}
                    onValueChange={(arr) => field.onChange(arr.map(Number))}
                    defaultValue={field.value?.map(String) || []}
                    placeholder="Select stories"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* STORY BUILDER */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Stories</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addStory({
                    mediaUrl: "",
                    type: "IMAGE",
                    caption: "",
                    duration: 5,
                  })
                }
              >
                + Add story
              </Button>
            </div>

            {storyFields.map((sf, idx) => (
              <div
                key={sf.id}
                className="rounded-lg border p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* mediaUrl */}
                <BlogImageUpload
                  value={
                    watch(`storiesToCreate.${idx}.mediaUrl`)
                      ? [watch(`storiesToCreate.${idx}.mediaUrl`)]
                      : []
                  }
                  disabled={loading}
                  onChange={(url) =>
                    form.setValue(`storiesToCreate.${idx}.mediaUrl`, url)
                  }
                  onRemove={() =>
                    form.setValue(`storiesToCreate.${idx}.mediaUrl`, "")
                  }
                />

                {/* type & duration */}
                <div className="space-y-2">
                  <Select
                    value={watch(`storiesToCreate.${idx}.type`)}
                    onValueChange={(val) =>
                      form.setValue(`storiesToCreate.${idx}.type`, val as any)
                    }
                  >
                    <SelectTrigger>
                      {watch(`storiesToCreate.${idx}.type`)}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="TEXT">Text</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min={1}
                    placeholder="Duration (sec)"
                    value={watch(`storiesToCreate.${idx}.duration`) || ""}
                    onChange={(e) =>
                      form.setValue(
                        `storiesToCreate.${idx}.duration`,
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                {/* caption & delete */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Caption (optional)"
                    value={watch(`storiesToCreate.${idx}.caption`) || ""}
                    onChange={(e) =>
                      form.setValue(
                        `storiesToCreate.${idx}.caption`,
                        e.target.value
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeStory(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            <FormField
              control={form.control}
              name="isPublic"
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

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import OAuth from "@/components/auth/oauth";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10).optional().or(z.literal("")),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters long.",
    }),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required.",
    path: ["email"],
  });

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/signup", values);
      console.log(response);

      const data = await response.data;

      if (response.status === 201) {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        toast.success("Account created successfully");
        router.replace("/");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          `Signup failed: ${error.response.data.message || "Please try again."}`
        );
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full">
      <div
        className="w-3/5 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: "url(/article.webp)" }}
      />
      <div className="w-full md:w-2/5 flex items-center justify-center p-2 md:p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Join Us!</CardTitle>
            <CardDescription className="text-neutral-600">
              Sign up to see latest blogs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-center gap-2 overflow-hidden">
                  <Separator />
                  <p>OR</p>
                  <Separator />
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  size="lg"
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
            <OAuth />
            <CardDescription className="text-neutral-600 text-center mt-2">
              Already have an account{"  "}
              <Link
                href={"/signin"}
                className="text-primary underline font-semibold"
              >
                Sign in
              </Link>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Send, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { WASTE_TYPE_LABELS, WASTE_TYPES } from "@ecotrack/shared";
import { ApiError, apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const requestFormSchema = z.object({
  wasteType: z.enum(WASTE_TYPES),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(240),
  description: z.string().trim().max(1000).optional(),
  preferredDate: z.string().optional(),
  image: z.any().optional()
});

type RequestFormInput = z.infer<typeof requestFormSchema>;

type UploadSignatureResponse = {
  upload: {
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    folder: string;
  };
};

type CreateRequestResponse = {
  request: {
    id: string;
  };
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

type RequestFormProps = {
  apiToken: string;
};

async function uploadImage(apiToken: string, file: File) {
  const { upload } = await apiClient<UploadSignatureResponse>("/uploads/signature", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", upload.apiKey);
  formData.append("timestamp", String(upload.timestamp));
  formData.append("signature", upload.signature);
  formData.append("folder", upload.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${upload.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  const payload = (await response.json().catch(() => null)) as CloudinaryUploadResponse | null;

  if (!response.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message ?? "Image upload failed");
  }

  return payload.secure_url;
}

export function RequestForm({ apiToken }: RequestFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RequestFormInput>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      wasteType: "HOUSEHOLD",
      address: "",
      description: "",
      preferredDate: "",
      image: undefined
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      try {
        const file = values.image instanceof FileList ? values.image.item(0) : undefined;
        const imageUrl = file ? await uploadImage(apiToken, file) : undefined;
        const preferredDate = values.preferredDate ? new Date(`${values.preferredDate}T00:00:00`).toISOString() : undefined;

        const payload = await apiClient<CreateRequestResponse>("/requests", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            wasteType: values.wasteType,
            address: values.address,
            description: values.description || undefined,
            preferredDate,
            imageUrl
          })
        });

        router.push(`/requests/${payload.request.id}`);
        router.refresh();
      } catch (caughtError) {
        const message =
          caughtError instanceof ApiError || caughtError instanceof Error
            ? caughtError.message
            : "Request submission failed";
        setError(message);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="wasteType">Waste type</Label>
            <select
              id="wasteType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...form.register("wasteType")}
            >
              {WASTE_TYPES.map((wasteType) => (
                <option key={wasteType} value={wasteType}>
                  {WASTE_TYPE_LABELS[wasteType]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Collection address</Label>
            <Input
              id="address"
              type="text"
              autoComplete="street-address"
              {...form.register("address")}
              aria-invalid={Boolean(form.formState.errors.address)}
            />
            {form.formState.errors.address ? (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={5}
              className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("description")}
              aria-invalid={Boolean(form.formState.errors.description)}
            />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred date</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="preferredDate" type="date" className="pl-9" {...form.register("preferredDate")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="relative">
                <UploadCloud className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="image" type="file" accept="image/*" className="pl-9" {...form.register("image")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full gap-2" disabled={isPending}>
          <Send className="h-4 w-4" />
          {isPending ? "Submitting..." : "Submit request"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Send, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { WASTE_TYPE_LABELS, WASTE_TYPES } from "@/lib/schemas";
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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main form section */}
        <div className="space-y-6">
          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wasteType" className="text-base font-semibold">Waste Type</Label>
                <select
                  id="wasteType"
                  className="flex h-11 w-full rounded-lg border-2 border-border bg-background px-4 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
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
                <Label htmlFor="address" className="text-base font-semibold">Collection Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your full address"
                  autoComplete="street-address"
                  className="h-11 border-2"
                  {...form.register("address")}
                  aria-invalid={Boolean(form.formState.errors.address)}
                />
                {form.formState.errors.address ? (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.address.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">Description (Optional)</Label>
                <textarea
                  id="description"
                  rows={6}
                  placeholder="Provide any additional details about your waste collection request..."
                  className="flex min-h-32 w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  {...form.register("description")}
                  aria-invalid={Boolean(form.formState.errors.description)}
                />
                {form.formState.errors.description ? (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.description.message}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar section */}
        <div className="space-y-6">
          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Collection Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="preferredDate" className="text-base font-semibold">Preferred Date</Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="preferredDate" 
                    type="date" 
                    className="h-11 border-2 pl-11" 
                    {...form.register("preferredDate")} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-base font-semibold">Image (Optional)</Label>
                <div className="relative">
                  <UploadCloud className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    className="h-11 border-2 pl-11 file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-foreground hover:file:bg-muted/80" 
                    {...form.register("image")} 
                  />
                </div>
                <p className="text-xs text-muted-foreground">Upload a photo of the waste (optional)</p>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          ) : null}

          <Button type="submit" className="w-full h-11 gap-2 text-base font-semibold shadow-md" disabled={isPending} size="lg">
            <Send className="h-5 w-5" />
            {isPending ? "Submitting Request..." : "Submit Request"}
          </Button>

          <div className="rounded-lg border-2 border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">What happens next?</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your request will be reviewed within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>We&apos;ll schedule a collection date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You&apos;ll receive updates via notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}

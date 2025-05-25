
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { useBuyerProfile } from "@/hooks/useBuyerProfile";

export type BuyerProfileFormProps = {
  initial?: {
    organization?: string | null;
    contact_email?: string | null;
    phone?: string | null;
    location?: string | null;
  };
  onSuccess?: () => void;
};

export function BuyerProfileForm({ initial, onSuccess }: BuyerProfileFormProps) {
  const { upsertBuyerProfile } = useBuyerProfile();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      organization: initial?.organization ?? "",
      contact_email: initial?.contact_email ?? "",
      phone: initial?.phone ?? "",
      location: initial?.location ?? "",
    }
  });

  useEffect(() => {
    reset({
      organization: initial?.organization ?? "",
      contact_email: initial?.contact_email ?? "",
      phone: initial?.phone ?? "",
      location: initial?.location ?? "",
    });
  }, [initial, reset]);

  const onSubmit = async (values: any) => {
    try {
      await upsertBuyerProfile.mutateAsync(values);
      toast({ title: "Profile saved", description: "Your buyer profile was updated." });
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block mb-1 font-medium text-sm">Organization</label>
        <Input {...register("organization")} placeholder="Organization" />
      </div>
      <div>
        <label className="block mb-1 font-medium text-sm">Contact Email</label>
        <Input {...register("contact_email")} type="email" placeholder="Contact Email" />
      </div>
      <div>
        <label className="block mb-1 font-medium text-sm">Phone</label>
        <Input {...register("phone")} type="tel" placeholder="Phone" />
      </div>
      <div>
        <label className="block mb-1 font-medium text-sm">Location</label>
        <Input {...register("location")} placeholder="Location" />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}

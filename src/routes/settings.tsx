import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings as SettingsIcon, ShieldCheck, Trash2, Globe, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const PROVINCES = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"];

function SettingsPage() {
  const [name, setName] = useState("");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [languages, setLanguages] = useState("");
  const [relocate, setRelocate] = useState(true);
  const [dataSaver, setDataSaver] = useState(true);

  const saveProfile = () => toast.success("Preferences saved");

  const resetProgress = () => {
    localStorage.removeItem("careeros-state-v1");
    toast.success("Progress reset — reloading");
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div>
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Personalise CareerOS for the South African market." />

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="space-y-4">
          <h3 className="flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-primary" /> Profile defaults</h3>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Province</Label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Languages spoken</Label>
            <Input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, isiZulu…" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-white/[0.02] px-3 py-2.5">
            <span className="text-sm">Willing to relocate</span>
            <Switch checked={relocate} onCheckedChange={setRelocate} />
          </div>
          <Button onClick={saveProfile} className="w-full gradient-primary text-white">Save preferences</Button>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4 text-primary" /> Experience</h3>
            <div className="flex items-center justify-between rounded-xl border border-border bg-white/[0.02] px-3 py-2.5">
              <div>
                <p className="text-sm">Data saver</p>
                <p className="text-xs text-muted-foreground">Lighter, faster experience for limited data.</p>
              </div>
              <Switch checked={dataSaver} onCheckedChange={setDataSaver} />
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-primary" /> Privacy & Responsible AI</h3>
            <p className="text-sm text-muted-foreground">AI-generated content may require human review. Always verify job and bursary information on official websites.</p>
            <p className="text-sm text-muted-foreground">Your data is not permanently stored. Progress lives only on this device.</p>
          </GlassCard>

          <GlassCard className="space-y-3 border-destructive/25">
            <h3 className="flex items-center gap-2 font-semibold text-destructive"><Trash2 className="h-4 w-4" /> Reset progress</h3>
            <p className="text-sm text-muted-foreground">Clear all XP, achievements and saved items from this device.</p>
            <Button variant="outline" onClick={resetProgress} className="border-destructive/40 text-destructive hover:bg-destructive/10">Reset everything</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
        <p className="text-muted-foreground">{site.tagline}</p>
        <Button className="bg-primary hover:bg-primary-hover">
          Tombol sementara
        </Button>
      </div>
    </main>
  );
}

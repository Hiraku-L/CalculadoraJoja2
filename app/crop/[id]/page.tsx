import Link from "next/link";
import { notFound } from "next/navigation";
import dataset from "@/lib/data/crops.json";
import type { Crop } from "@/lib/types";
import { seasonLabel } from "@/lib/seasons";
import { CropCalculatorForm } from "@/components/CropCalculatorForm";

const crops = (dataset as { crops: Crop[] }).crops;

export function generateStaticParams() {
  return crops.map((c) => ({ id: c.id }));
}

export default function CropPage({ params }: { params: { id: string } }) {
  const crop = crops.find((c) => c.id === params.id);
  if (!crop) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <Link href="/" className="label-eyebrow mb-6 inline-block hover:text-harvest">
        ← Voltar ao almanaque
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-parchment">{crop.name}</h1>
          <p className="mt-1 text-sm text-parchment/50">
            {crop.englishName} · {crop.season.map(seasonLabel).join(" / ")} · Semente:{" "}
            {crop.seed.price ? `${crop.seed.price}g` : "preço variável"}
          </p>
        </div>
        <p className="max-w-md text-right text-sm text-parchment/60">{crop.crop.description}</p>
      </header>

      <CropCalculatorForm crop={crop} />
    </main>
  );
}

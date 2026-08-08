"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ChevronRight, X } from "lucide-react";
import {
  pricingPlans, segments, roiData, concurData,
  addons, guarantees, faqItems, compareColumns, compareRows,
  CAPTATION_PRICE_CENTS, INTERVENTION_DEPARTMENTS, isInInterventionZone,
} from "@/data/pricing";
import { CheckoutButton } from "@/components/CheckoutButton";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { PricingPlan } from "@/lib/types";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [activeSeg, setActiveSeg] = useState("solaire");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block text-xs tracking-widest uppercase text-cyan-400 border border-anthracite-600 px-4 py-1.5 rounded-full mb-6">
            Photogrammétrie drone · SaaS artisans &amp; particuliers
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Des modèles 3D professionnels<br />
            <span className="text-gradient">à partir de vos photos</span>
          </h1>
          <p className="text-base text-gray-400 max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Vous captez les photos, notre pipeline automatisé génère vos modèles 3D, analyses et rapports — livrés sous 24h, sans vous déplacer.
          </p>
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-sm transition-colors ${!annual ? "text-white font-medium" : "text-gray-500"}`}>Mensuel</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-[26px] rounded-full transition-colors ${annual ? "bg-cyan-500" : "bg-anthracite-600"}`}
            >
              <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all ${annual ? "left-[25px]" : "left-[3px]"}`} />
            </button>
            <span className={`text-sm transition-colors ${annual ? "text-white font-medium" : "text-gray-500"}`}>
              Annuel <span className="text-cyan-400 font-semibold">-17%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Segments tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex gap-2 justify-center flex-wrap">
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setActiveSeg(seg.id)}
              className={`px-5 py-2 text-sm rounded-full border transition-all ${
                activeSeg === seg.id
                  ? "bg-cyan-500 border-cyan-500 text-anthracite-900 font-semibold"
                  : "bg-transparent border-anthracite-600 text-gray-400 hover:border-cyan-500 hover:text-white"
              }`}
            >
              {seg.icon} {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION: Couvreurs */}
      {activeSeg === "couvreurs" && <CouvreursSection plans={pricingPlans.filter(p => p.segment === "couvreurs")} annual={annual} />}

      {/* SECTION: Solaire */}
      {activeSeg === "solaire" && <SolaireSection plans={pricingPlans.filter(p => p.segment === "solaire")} annual={annual} />}

      {/* SECTION: Particuliers */}
      {activeSeg === "particuliers" && <ParticuliersSection plans={pricingPlans.filter(p => p.segment === "particuliers")} />}

      {/* SECTION: Comparatif */}
      {activeSeg === "compare" && <ComparatifSection />}

      {/* ADDONS (toujours visible) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs tracking-widest uppercase text-cyan-400 mb-1">Options à la carte</div>
            <h2 className="text-2xl font-bold">Prestations <span className="text-gradient">complémentaires</span></h2>
            <p className="text-sm text-gray-500 mt-1">À ajouter sur n&apos;importe quel forfait ou en commande indépendante.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
            {addons.map((addon) => (
              <div key={addon.id} className="flex gap-4 p-5 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-anthracite-600 transition-all">
                <span className="text-2xl shrink-0">{addon.icon}</span>
                <div>
                  <div className="font-semibold text-sm mb-1">{addon.name}</div>
                  <div className="text-xs text-gray-400 leading-relaxed mb-1.5 font-light">{addon.desc}</div>
                  <div className="text-sm font-semibold text-cyan-400">{addon.price} <span className="text-xs text-gray-500 font-normal">{addon.priceNote}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTIES */}
      <section className="py-16 bg-anthracite-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs tracking-widest uppercase text-cyan-400 mb-1">Nos engagements</div>
            <h2 className="text-2xl font-bold">Ce que vous pouvez <span className="text-gradient">compter sur nous</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {guarantees.map((g) => (
              <div key={g.title} className="flex gap-3 p-4 bg-anthracite-800/30 border border-anthracite-700 rounded-xl">
                <span className="text-xl shrink-0">{g.icon}</span>
                <div>
                  <div className="font-semibold text-sm mb-0.5">{g.title}</div>
                  <div className="text-xs text-gray-400 leading-relaxed font-light">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs tracking-widest uppercase text-cyan-400 mb-1">Questions fréquentes</div>
            <h2 className="text-2xl font-bold">Tout ce que vous devez <span className="text-gradient">savoir</span></h2>
          </div>
          <div className="space-y-0">
            {faqItems.map((faq) => {
              const isOpen = openFaq === faq.q;
              return (
                <div key={faq.q} className="border-b border-anthracite-700">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.q)}
                    className="w-full flex items-center justify-between gap-4 py-4 text-sm font-medium text-left text-gray-200 hover:text-cyan-400 transition-colors"
                  >
                    {faq.q}
                    <ChevronRight className={`w-4 h-4 shrink-0 text-gray-500 transition-all ${isOpen ? "rotate-90 text-cyan-400" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all ${isOpen ? "max-h-60 pb-4" : "max-h-0"}`}>
                    <p className="text-sm text-gray-400 leading-relaxed font-light">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-cyan-500 rounded-3xl py-14 px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-anthracia-900 mb-3">Prêt à transformer vos chantiers ?</h2>
          <p className="text-base text-anthracite-800 mb-8">Commencez avec 1 mois de Solar Pro offert — 3 projets, sans carte. Vos premiers modèles livrés sous 24h.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 bg-anthracite-900 text-white font-semibold rounded-xl hover:bg-anthracite-800 transition-all"
            >
              Créer mon compte gratuit →
            </Link>
            <Link
              href="/demo"
              className="px-8 py-3.5 border-2 border-anthracite-900 text-anthracite-900 font-semibold rounded-xl hover:bg-anthracite-900/10 transition-all"
            >
              Voir un exemple de modèle 3D
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── COUVREURS SECTION ─── */
function CouvreursSection({ plans, annual }: { plans: PricingPlan[]; annual: boolean }) {
  const starter = plans.find(p => p.id === "starter-mesures");
  const starterPro = plans.find(p => p.id === "starter-pro");
  const roi = roiData.couvreurs;
  const [calepinage, setCalepinage] = useState(false);

  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs tracking-widest uppercase text-cyan-400 mb-1">Couvreurs · Nettoyeurs toiture · Paysagistes · Installateurs piscine</div>
          <h2 className="text-2xl font-bold">Fini le métré <span className="text-gradient">sur le toit</span></h2>
          <p className="text-sm text-gray-400 mt-1">Mesures précises, rapports professionnels, implantation 3D — sans jamais monter en hauteur.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Starter Mesures / Starter Mesures+ */}
          {starter && <PricingCard plan={starter} annual={annual} ctaLabel={calepinage ? "Choisir Starter Mesures+ →" : "Choisir Starter Mesures →"} highlighted calepinage={calepinage} onToggleCalepinage={() => setCalepinage(!calepinage)} />}
          {/* Starter Pro */}
          {starterPro && <PricingCard plan={starterPro} annual={annual} ctaLabel="Choisir Starter Pro →" />}
        </div>

        {/* ROI */}
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-2xl flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[220px]">
            <h3 className="font-bold text-base mb-1.5">{roi.title}</h3>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Un devis toiture moyen = <strong className="text-white">8 000–15 000€</strong>. Un rapport AltiMetrix professionnel augmente votre taux de conversion. 1 devis supplémentaire signé = abonnement remboursé <em className="text-cyan-400 font-semibold not-italic">100× à 300×</em>.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {roi.stats.map((s) => (
              <div key={s.lab} className="bg-anthracite-700/50 rounded-xl px-4 py-3 text-center min-w-[90px]">
                <div className="text-xl font-bold text-cyan-400">{s.val}</div>
                <div className="text-xs text-gray-400">{s.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SOLAIRE SECTION ─── */
function SolaireSection({ plans, annual }: { plans: PricingPlan[]; annual: boolean }) {
  const solarPro = plans.find(p => p.id === "solar-pro");
  const solarProPlus = plans.find(p => p.id === "solar-pro-plus");

  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs tracking-widest uppercase text-cyan-400 mb-1">Installateurs panneaux photovoltaïques résidentiels</div>
          <h2 className="text-2xl font-bold">L&apos;étude solaire que vos concurrents<br /><span className="text-gradient">ne peuvent pas faire</span></h2>
          <p className="text-sm text-gray-400 mt-1">Calepinage 3D sur la vraie toiture, irradiation GRASS GIS, ombrage dynamique — un dossier qui fait signer.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {solarPro && <PricingCard plan={solarPro} annual={annual} ctaLabel="Essayer 1 mois offert →" highlighted trialCta />}
          {solarProPlus && <PricingCard plan={solarProPlus} annual={annual} ctaLabel="Choisir Solar Pro+ →" />}
        </div>

        {/* Concurrent comparison */}
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-2xl">
          <h3 className="text-amber-400 font-bold text-sm mb-4">{concurData.title}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {concurData.items.map((item) => (
              <div key={item.name} className={`text-sm text-gray-400 leading-relaxed font-light ${item.hero ? "text-cyan-400" : ""}`}>
                <strong className={`block mb-1 font-semibold ${item.hero ? "text-white" : "text-gray-200"}`}>{item.name}</strong>
                {item.desc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PARTICULIERS SECTION ─── */
function ParticuliersSection({ plans }: { plans: PricingPlan[] }) {
  const standard = plans.find(p => p.id === "particulier-standard");
  const premium = plans.find(p => p.id === "particulier-premium");
  const roi = roiData.particuliers;
  const [orderPlan, setOrderPlan] = useState<PricingPlan | null>(null);

  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs tracking-widest uppercase text-cyan-400 mb-1">Particuliers · Propriétaires</div>
          <h2 className="text-2xl font-bold">Signez <span className="text-gradient">en confiance</span>,<br />pas à l&apos;aveugle</h2>
          <p className="text-sm text-gray-400 mt-1">Avant de signer un devis de plusieurs milliers d&apos;euros, vérifiez que les surfaces et quantités correspondent à votre bien réel.</p>
        </div>

        {/* Banner */}
        <div className="max-w-4xl mx-auto mb-6 bg-cyan-500 rounded-2xl py-8 px-10 text-center">
          <div className="inline-block text-xs font-bold uppercase tracking-wider bg-anthracite-900 text-cyan-400 px-3.5 py-1.5 rounded-full mb-4">
            💡 Segment exclusif AltiMetrix
          </div>
          <h3 className="text-lg font-bold text-anthracite-900 mb-2">Votre maison mérite une vérification professionnelle</h3>
          <p className="text-sm text-anthracite-800">Toiture, solaire, piscine, terrasse — obtenez les vrais métrés pour comparer les devis et négocier en connaissance de cause.</p>
        </div>

        {/* Périmètre d'intervention */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-wrap gap-2 justify-center">
          {INTERVENTION_DEPARTMENTS.map((d) => (
            <span key={d.code} className="text-xs px-3 py-1.5 rounded-full border border-anthracite-600 text-gray-300">
              📍 {d.code} — {d.label}
            </span>
          ))}
          <span className="text-xs px-3 py-1.5 rounded-full border border-anthracite-600 text-gray-500">
            Hors zone ? Contactez-nous pour un devis de déplacement
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {standard && <PricingCard plan={standard} annual={false} ctaLabel="Commander mon rapport →" onOrder={setOrderPlan} />}
          {premium && <PricingCard plan={premium} annual={false} ctaLabel="Commander mon rapport Premium →" highlighted onOrder={setOrderPlan} />}
        </div>

        {/* Modal : adresse pour vérification de faisabilité */}
        {orderPlan && <ParticulierOrderModal plan={orderPlan} onClose={() => setOrderPlan(null)} />}

        {/* ROI */}
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-center">
          <h3 className="font-bold text-base mb-4">{roi.title}</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            {roi.stats.map((s) => (
              <div key={s.lab} className="bg-anthracite-800 rounded-xl px-5 py-4 text-center min-w-[150px]">
                <div className="text-xs text-gray-400 mb-1">{s.lab.split("·")[0].trim()}</div>
                <div className="text-xl font-bold">{s.val}</div>
                {s.lab.includes("·") && <div className="text-xs text-gray-500 mt-0.5">{s.lab.split("·")[1].trim()}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── MODAL COMMANDE PARTICULIER (adresse + faisabilité) ─── */
function ParticulierOrderModal({ plan, onClose }: { plan: PricingPlan; onClose: () => void }) {
  const router = useRouter();
  const [adresse, setAdresse] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const captation = CAPTATION_PRICE_CENTS / 100;
  const total = plan.price + captation;
  const inZone = codePostal.trim().length > 0 ? isInInterventionZone(codePostal) : null;

  const submit = async () => {
    if (!adresse.trim() || !codePostal.trim() || !ville.trim()) {
      setError("Merci de renseigner l'adresse complète.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await createClient().auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/auth/login"); return; }
      const res = await fetch("/api/demandes-particuliers", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          adresse: adresse.trim(),
          codePostal: codePostal.trim(),
          ville: ville.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Une erreur est survenue. Réessayez.");
        return;
      }
      setDone(true);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60" onClick={done ? undefined : onClose}>
      <div className="w-full max-w-md bg-anthracite-800 rounded-2xl border border-anthracite-600 p-6" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
            <h3 className="font-bold text-lg mb-2">Demande envoyée !</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre demande de rapport {plan.name} a bien été enregistrée. Nous vérifions la faisabilité
              de la captation à l&apos;adresse indiquée et vous enverrons le lien de paiement
              dans votre espace « Mon compte » une fois la validation effectuée (sous 24h).
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 text-sm font-medium rounded-xl gradient-cyan text-white hover:opacity-90 transition-all"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {plan.price}€ rapport + {captation}€ captation terrain ={" "}
                  <span className="text-cyan-400 font-semibold">{total}€ HT</span>
                </p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Indiquez l&apos;adresse du bien pour vérifier la faisabilité du vol drone
              (périmètre : {INTERVENTION_DEPARTMENTS.map((d) => `${d.code} ${d.label}`).join(", ")}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Adresse (numéro et rue)</label>
                <input
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="12 rue des Lilas"
                  className="w-full px-3 py-2.5 rounded-xl bg-anthracite-900 border border-anthracite-600 text-sm placeholder:text-gray-600 focus:border-cyan-500 outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Code postal</label>
                  <input
                    value={codePostal}
                    onChange={(e) => setCodePostal(e.target.value)}
                    placeholder="31400"
                    inputMode="numeric"
                    className="w-full px-3 py-2.5 rounded-xl bg-anthracite-900 border border-anthracite-600 text-sm placeholder:text-gray-600 focus:border-cyan-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ville</label>
                  <input
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Toulouse"
                    className="w-full px-3 py-2.5 rounded-xl bg-anthracite-900 border border-anthracite-600 text-sm placeholder:text-gray-600 focus:border-cyan-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {inZone === false && (
              <div className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 leading-relaxed">
                ⚠️ Ce code postal semble hors de notre périmètre standard
                ({INTERVENTION_DEPARTMENTS.map((d) => `${d.code} ${d.label}`).join(", ")}).
                La demande sera tout de même transmise — un devis de déplacement vous sera proposé si nécessaire.
              </div>
            )}

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <button
              onClick={submit}
              disabled={loading}
              className={`mt-5 w-full py-3 text-sm font-medium rounded-xl transition-all ${
                loading ? "opacity-50 pointer-events-none" : "gradient-cyan text-white hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/25"
              }`}
            >
              {loading ? "Envoi..." : "Envoyer ma demande →"}
            </button>
            <p className="text-[10px] text-gray-500 mt-3 text-center">
              Aucun paiement maintenant — vous recevrez un lien de paiement sécurisé après validation de la faisabilité.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── COMPARATIF TABLE ─── */
function ComparatifSection() {
  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs tracking-widest uppercase text-cyan-400 mb-1">Vue d&apos;ensemble</div>
          <h2 className="text-2xl font-bold">Toutes les offres <span className="text-gradient">en un coup d&apos;œil</span></h2>
        </div>
        <div className="overflow-x-auto max-w-6xl mx-auto">
          <table className="w-full text-xs border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 p-2.5 text-left font-semibold text-gray-400 border-b border-anthracite-700 bg-anthracite-800/30 whitespace-nowrap">Fonctionnalité</th>
                {compareColumns.map((col) => (
                  <th key={col.key} className={`p-2.5 text-left font-semibold border-b border-anthracite-700 whitespace-pre-line ${
                    col.highlight ? "bg-cyan-500 text-anthracite-900" : "bg-anthracite-800/30 text-gray-400"
                  }`}>
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.label}>
                  <td className="sticky left-0 z-10 p-2.5 border-b border-anthracite-700 text-gray-200 font-medium bg-anthracite-900">{row.label}</td>
                  {compareColumns.map((col) => {
                    const val = row.values[col.key] || "—";
                    const isCheck = val === "✓";
                    const isStar = val === "★";
                    const isCross = val === "—";
                    const isPremium = val === "Premium";
                    return (
                      <td key={col.key} className={`p-2.5 border-b border-anthracite-700 ${
                        col.highlight ? "bg-cyan-500/5" : ""
                      }`}>
                        {isCheck ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> :
                         isStar ? <span className="text-amber-400 text-base">★</span> :
                         isCross ? <XCircle className="w-4 h-4 text-gray-600" /> :
                         isPremium ? <span className="text-cyan-400 font-medium">{val}</span> :
                         <span className="text-gray-300">{val}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING CARD ─── */
function PricingCard({
  plan, annual, ctaLabel, highlighted, calepinage, onToggleCalepinage, trialCta, onOrder,
}: {
  plan: PricingPlan;
  annual: boolean;
  ctaLabel: string;
  highlighted?: boolean;
  calepinage?: boolean;
  onToggleCalepinage?: () => void;
  trialCta?: boolean;
  onOrder?: (plan: PricingPlan) => void;
}) {
  const price = annual && plan.annualPrice ? plan.annualPrice : plan.price;
  const effectivePrice = calepinage ? price + 10 : price;
  const displayPrice = effectivePrice;
  const savings = annual && plan.annualPrice
    ? Math.round((1 - plan.annualPrice / plan.price) * 100)
    : 0;

  // Avec l'option Calepinage 3D cochée, « Starter Mesures » devient
  // « Starter Mesures+ » (le calepinage est alors inclus dans l'abonnement).
  const displayName = plan.id === "starter-mesures" && calepinage ? "Starter Mesures+" : plan.name;

  // Rapports particuliers : la captation terrain (+150€) est incluse d'office.
  // On affiche la décomposition et le total, et la commande passe par le
  // formulaire d'adresse (vérification de faisabilité) au lieu du checkout direct.
  const captation = plan.captationIncluse ? CAPTATION_PRICE_CENTS / 100 : 0;
  const totalPrice = displayPrice + captation;

  return (
    <div className={`relative p-6 rounded-2xl border flex flex-col ${
      highlighted
        ? "border-cyan-500 bg-gradient-to-b from-cyan-500/5 to-transparent shadow-xl shadow-cyan-500/10"
        : "border-anthracite-700 bg-anthracite-800/30"
    }`}>
      {plan.badge && (
        <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-5 w-fit ${
          plan.badge.includes("☀️") || plan.badge.includes("⭐")
            ? plan.badge.includes("☀️")
              ? "bg-amber-400/20 text-amber-300"
              : "bg-cyan-500/20 text-cyan-300"
            : "bg-anthracite-700 text-gray-400"
        }`}>
          {plan.badge}
        </span>
      )}
      <h3 className="font-bold text-lg mb-1">{displayName}</h3>
      <p className="text-xs text-gray-400 font-light leading-relaxed mb-4">{plan.description}</p>

      <div className="mb-2">
        <span className="text-3xl font-bold text-cyan-400">{totalPrice}€</span>
        <span className="text-xs text-gray-500 ml-1">{plan.period === "once" ? "HT · projet unique" : "/mois HT"}</span>
      </div>
      {captation > 0 && (
        <div className="text-xs text-gray-500 mb-1">
          dont <span className="text-gray-300">{displayPrice}€</span> rapport +{" "}
          <span className="text-gray-300">{captation}€</span> captation terrain
        </div>
      )}
      {plan.nbProjets && (
        <div className="text-xs text-cyan-400 mb-4">
          {plan.nbProjets} projet{plan.nbProjets > 1 ? "s" : ""}/mois <span className="text-gray-500">· soit {Math.round(effectivePrice / plan.nbProjets)}€/projet</span>
        </div>
      )}
      {savings > 0 && !calepinage && (
        <div className="text-xs text-amber-400 mb-4">
          {yearlyTotal(plan, annual)}€/an — économisez {Math.round(plan.price! * 12 - yearlyTotal(plan, annual))}€
        </div>
      )}

      <hr className="border-anthracite-700 mb-4" />

      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-xs text-gray-200">
            <span className="text-cyan-400 mt-0.5 shrink-0">✦</span>
            {f}
          </li>
        ))}
        {calepinage && (
          <li key="calepinage-extra" className="flex items-start gap-2.5 text-xs text-cyan-400 font-medium">
            <span className="text-cyan-400 mt-0.5 shrink-0">✦</span>
            Calepinage panneaux PV en 3D
          </li>
        )}
        {plan.notIncluded?.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-xs text-gray-600">
            <span className="mt-0.5 shrink-0">○</span>
            {f}
          </li>
        ))}
      </ul>

      {onToggleCalepinage && (
        <button
          onClick={onToggleCalepinage}
          className={`flex items-center justify-between w-full px-4 py-2.5 mb-4 rounded-xl border text-xs font-medium transition-all ${
            calepinage
              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
              : "border-anthracite-600 text-gray-400 hover:border-cyan-500/40 hover:text-gray-200"
          }`}
        >
          <span>+ Calepinage 3D</span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-semibold">+10€</span>
            <div className={`relative w-8 h-[18px] rounded-full transition-colors ${calepinage ? "bg-cyan-500" : "bg-anthracite-600"}`}>
              <div className={`absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-all ${calepinage ? "left-[16px]" : "left-[2px]"}`} />
            </div>
          </div>
        </button>
      )}

      {trialCta ? (
        <Link
          href="/auth/register"
          className="block w-full py-3 text-center text-sm font-medium rounded-xl gradient-cyan text-white hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          {ctaLabel}
        </Link>
      ) : onOrder ? (
        <button
          onClick={() => onOrder(plan)}
          className={`block w-full py-3 text-center text-sm font-medium rounded-xl transition-all ${
            highlighted
              ? "gradient-cyan text-white hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/25"
              : "bg-transparent border border-anthracite-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400"
          }`}
        >
          {ctaLabel}
        </button>
      ) : (
        <CheckoutButton planId={plan.id} annual={annual} calepinage={calepinage} highlighted={highlighted}>
          {ctaLabel}
        </CheckoutButton>
      )}
    </div>
  );
}

function yearlyTotal(plan: PricingPlan, annual: boolean) {
  return annual && plan.annualPrice ? plan.annualPrice * 12 : plan.price * 12;
}

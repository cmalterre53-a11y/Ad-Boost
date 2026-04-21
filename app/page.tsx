"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  PenTool,
  Calendar,
  Video,
  Target,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Check,
  UserCircle,
} from "lucide-react";

/* ─────────────────── ANIMATIONS ─────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─────────────────── DATA ─────────────────── */
const sectors = [
  "Restaurants",
  "Coiffeurs",
  "Garages",
  "Artisans",
  "Instituts",
  "Coaches",
  "Boutiques",
  "Salles de sport",
  "Plombiers",
  "Photographes",
  "Fleuristes",
  "Boulangeries",
];

const problems = [
  {
    icon: Clock,
    text: "Pas le temps d'écrire des posts tous les jours",
  },
  {
    icon: Target,
    text: "Les pubs Facebook, tu sais pas trop comment ça marche",
  },
  {
    icon: DollarSign,
    text: "Un graphiste ou une agence ? Trop cher.",
  },
];

const modules = [
  { icon: PenTool, name: "Textes de pub Meta Ads", desc: "Accroches, descriptions et CTA optimisés pour Facebook et Instagram Ads" },
  { icon: Calendar, name: "Calendrier éditorial 30 jours", desc: "Planning de publication complet avec thèmes, horaires et conseils visuels" },
  { icon: Video, name: "Scripts vidéo Reels/Stories", desc: "Scripts prêts à tourner pour tes contenus vidéo courts" },
  { icon: SlidersHorizontal, name: "Guide Meta Ads pas à pas", desc: "Configure ta campagne Facebook et Instagram en 7 étapes guidées — même si tu n'as jamais fait de pub." },
  { icon: TrendingUp, name: "Suivi et optimisation de campagne", desc: "Entre tes chiffres après quelques jours et AdBoost t'explique quoi améliorer pour de meilleurs résultats." },
];

const steps = [
  { num: "1", title: "Décris ton activité", desc: "Tu remplis un formulaire simple en 2 minutes" },
  { num: "2", title: "Choisis tes modules", desc: "Tu sélectionnes ce dont tu as besoin" },
  { num: "3", title: "Récupère ton pack", desc: "AdBoost génère tout, tu copies-colles ou télécharges" },
];

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    period: "",
    subtitle: "Pour découvrir AdBoost",
    features: [
      "1 génération par mois",
      "5 accroches + 3 textes de pub + 3 visuels + 5 légendes",
      "Calendrier éditorial 7 jours",
      "1 script vidéo Reels",
      "1 email de relance",
    ],
    cta: "Commencer gratuitement",
    popular: false,
    contact: false,
  },
  {
    name: "Essentiel",
    price: "19€",
    period: "/mois",
    subtitle: "Pour les entrepreneurs qui démarrent leur présence en ligne",
    features: [
      "5 générations par mois",
      "5 accroches + 3 textes de pub + 3 visuels + 5 légendes par génération",
      "Calendrier éditorial 15 jours",
      "3 scripts vidéo Reels",
      "2 emails (relance + promo)",
      "Profil business sauvegardé",
    ],
    cta: "Choisir Essentiel",
    popular: false,
    contact: false,
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    subtitle: "Pour ceux qui veulent une communication complète chaque mois",
    features: [
      "15 générations par mois",
      "5 accroches + 3 textes de pub + 3 visuels + 5 légendes par génération",
      "Calendrier éditorial 30 jours complet",
      "5 scripts vidéo Reels",
      "Historique des générations sauvegardé",
      "Suivi des résultats Meta Ads avec diagnostic AdBoost",
    ],
    cta: "Essayer 7 jours gratuits",
    popular: true,
    contact: false,
  },
  {
    name: "Premium",
    price: "Sur devis",
    period: "",
    subtitle: "Tu veux qu'une vraie équipe s'occupe de tout ?",
    features: [
      "Tout le Pro inclus",
      "Visuels et flyers créés par notre équipe",
      "Calendrier publié à ta place chaque mois",
      "Emails rédigés et envoyés pour toi",
      "Accompagnement stratégique mensuel",
    ],
    cta: "Nous contacter",
    popular: false,
    contact: true,
  },
];

const faqs = [
  { q: "C'est quoi AdBoost exactement ?", a: "AdBoost est un outil qui génère automatiquement tout le contenu marketing dont un entrepreneur a besoin : textes de pub, posts réseaux sociaux, emails, scripts vidéo, et plus encore. Tu remplis un formulaire simple et tu reçois un pack complet en quelques minutes." },
  { q: "Est-ce que je dois être expert en marketing ?", a: "Pas du tout ! AdBoost est conçu pour les entrepreneurs qui n'ont ni le temps ni les compétences en marketing. AdBoost s'occupe de tout, tu n'as qu'à copier-coller." },
  { q: "Combien de temps ça prend ?", a: "2 minutes pour remplir le formulaire, et environ 30 secondes pour qu'AdBoost génère ton pack complet. En moins de 3 minutes, tu as tout ce qu'il te faut." },
  { q: "Les textes sont vraiment personnalisés à mon activité ?", a: "Oui, chaque texte est généré spécifiquement pour ton activité et tes objectifs. Rien n'est générique." },
  { q: "Je peux annuler à tout moment ?", a: "Bien sûr. Aucun engagement, tu peux annuler ton abonnement en un clic depuis ton tableau de bord." },
  { q: "C'est quoi le plan Premium ?", a: "Le plan Premium inclut tout le plan Pro, plus la création de visuels et flyers par notre équipe, la publication de ton calendrier à ta place chaque mois, l'envoi de tes emails, et un accompagnement stratégique mensuel. Le tarif est sur devis selon tes besoins — contacte-nous depuis la section Tarifs." },
];

/* ─────────────────── COMPONENTS ─────────────────── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-800/50 transition"
      >
        <span className="font-medium text-white">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-6 pb-4 text-slate-400 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── PAGE ─────────────────── */

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">
              Ad<span className="text-violet-400">Boost</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm text-slate-400 hover:text-white transition">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm text-slate-400 hover:text-white transition">
              Tarifs
            </a>
            <a href="#exemple" className="text-sm text-slate-400 hover:text-white transition">
              Exemples
            </a>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg transition-all shadow-lg shadow-violet-500/20"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="/login"
              className="p-2 text-slate-400 hover:text-white transition"
              title="Se connecter"
            >
              <UserCircle className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 text-slate-400"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-800/50 bg-[#0a0a0a]/95 backdrop-blur-lg"
            >
              <div className="px-6 py-4 space-y-3">
                <a href="#fonctionnalites" onClick={() => setMobileMenu(false)} className="block text-sm text-slate-400 hover:text-white">Fonctionnalités</a>
                <a href="#tarifs" onClick={() => setMobileMenu(false)} className="block text-sm text-slate-400 hover:text-white">Tarifs</a>
                <a href="#exemple" onClick={() => setMobileMenu(false)} className="block text-sm text-slate-400 hover:text-white">Exemples</a>
                <Link href="/login" className="block w-full text-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg">
                  Essayer gratuitement
                </Link>
                <Link href="/login" onClick={() => setMobileMenu(false)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                  <UserCircle className="w-5 h-5" />
                  Se connecter
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Title */}
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Fini de chercher quoi dire.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                  AdBoost génère tout ton contenu du mois — en 2 minutes.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-400 mb-8 max-w-xl">
                Accroches, textes de pub, emails, scripts vidéo, calendrier
                éditorial… Tout est prêt. Tu n&apos;as plus qu&apos;à publier.
              </motion.p>

              {/* Buttons */}
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 mb-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-violet-500/25"
                >
                  Générer mon contenu gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#exemple"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold border border-slate-700 hover:border-slate-600 rounded-xl transition-all text-slate-300 hover:text-white"
                >
                  Voir un exemple
                </a>
              </motion.div>

              {/* Social proof */}
              <motion.p variants={fadeUp} custom={4} className="text-sm text-slate-500">
                <span className="text-amber-400">&#9733;</span> Des centaines d&apos;entrepreneurs qui publient avec confiance
              </motion.p>
            </motion.div>

            {/* Hero visual - Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-2xl blur-xl" />
                <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  {/* Fake generated cards */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">Stratégie générée pour <span className="text-violet-400">Institut Lumière</span></span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4"
                  >
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Accroche pub</p>
                    <p className="text-sm text-white font-medium">Offrez-vous une pause beauté bien méritée ✨</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4"
                  >
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Texte de pub</p>
                    <p className="text-sm text-slate-300">Chez Institut Lumière à Toulouse, on prend soin de vous de la tête aux pieds. Soin du visage, épilation, manucure...</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4"
                  >
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prompt visuel</p>
                    <p className="text-sm text-slate-300">Soft-lit photo of a woman relaxing during a facial treatment in a cozy beauty salon...</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.7 }}
                    className="flex gap-2"
                  >
                    <span className="px-3 py-1 text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-full">Meta Ads</span>
                    <span className="px-3 py-1 text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 rounded-full">Calendrier 30j</span>
                    <span className="px-3 py-1 text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 rounded-full">Guide complet</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LOGOS / SOCIAL PROOF ── */}
      <section className="py-12 border-y border-slate-800/50 overflow-hidden">
        <div className="relative">
          <div className="flex animate-scroll whitespace-nowrap">
            {[...sectors, ...sectors].map((sector, i) => (
              <span
                key={i}
                className="mx-8 text-sm text-slate-500 font-medium flex-shrink-0"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLÈME ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Tu passes des heures sur ta comm...{" "}
              <span className="text-slate-500">ou tu ne la fais pas.</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid sm:grid-cols-3 gap-6"
          >
            {problems.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-slate-300">{p.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="fonctionnalites" className="py-24 px-6 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Tout ce dont tu as besoin,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                généré en une fois.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 max-w-3xl mx-auto">
              Tes clients jugent ton sérieux en ligne avant de venir. AdBoost
              s&apos;occupe de toute ta communication digitale pour le mois :
              publicités Meta, posts réseaux, emails clients, scripts Reels,
              réponses Google — généré en une fois, personnalisé pour ton activité.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="flex flex-wrap justify-center gap-6"
          >
            {modules.map((m, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group w-full sm:w-[calc(33.333%-1rem)] bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3 group-hover:bg-violet-500/20 transition">
                  <m.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{m.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">
              Prêt en 3 étapes
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid sm:grid-cols-3 gap-8"
          >
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-violet-500/20">
                  {s.num}
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── EXEMPLE ── */}
      <section id="exemple" className="py-24 px-6 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Voilà ce que ça donne{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                pour un institut de beauté
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Ad text example */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Texte de pub Facebook / Instagram</h3>
                  <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
                    <p className="text-violet-400 font-semibold text-sm mb-2">Offrez-vous une pause beauté bien méritée ✨</p>
                    <p className="text-slate-300 text-sm mb-3">
                      Chez Institut Lumière à Toulouse, on prend soin de vous
                      de la tête aux pieds. Soin du visage, épilation, manucure...
                      Réservez votre séance dès aujourd&apos;hui et repartez transformée.
                    </p>
                    <p className="text-violet-400 text-sm font-medium">Prendre rendez-vous →</p>
                  </div>
                </div>

                {/* Posts ideas */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Idées de posts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/30 rounded-xl px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">1</span>
                      <p className="text-slate-300 text-sm">Avant/après soin du visage — montrez la différence en photo</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/30 rounded-xl px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">2</span>
                      <p className="text-slate-300 text-sm">Offre du mois : -20% sur la manucure complète jusqu&apos;au 30 avril</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/30 rounded-xl px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">3</span>
                      <p className="text-slate-300 text-sm">Coulisses de l&apos;institut — une journée avec notre équipe</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini calendar */}
              <div className="mt-6 pt-6 border-t border-slate-700/30">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Calendrier semaine 1</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-white font-medium">Lundi</p>
                    <p className="text-xs text-violet-400">Post témoignage client</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-white font-medium">Mercredi</p>
                    <p className="text-xs text-violet-400">Promo soin du visage</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-white font-medium">Vendredi</p>
                    <p className="text-xs text-violet-400">Reel coulisses de l&apos;institut</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-white font-medium">Dimanche</p>
                    <p className="text-xs text-violet-400">Rappel prise de rendez-vous</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mt-8"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-violet-500/25"
            >
              Générer le mien
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section id="tarifs" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, transparent, sans engagement
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.popular
                    ? "bg-gradient-to-b from-violet-500/10 to-indigo-500/10 border-2 border-violet-500/30"
                    : "bg-slate-900/50 border border-slate-800"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full">
                    Populaire
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{plan.subtitle}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.contact ? (
                  <button
                    onClick={() => setContactOpen(true)}
                    className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white"
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
                        : "border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold">
              Questions fréquentes
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 blur-xl" />
            <div className="relative">
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-bold mb-4"
              >
                Prêt à booster ta communication ?
              </motion.h2>
              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={1}
                className="text-lg text-slate-400 mb-8"
              >
                Génère ton premier pack gratuitement, sans carte bancaire.
              </motion.p>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={2}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-violet-500/25"
                >
                  Démarrer maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">
              Ad<span className="text-violet-400">Boost</span>
            </span>
            <span className="text-slate-600 text-sm ml-2">
              Le marketing simplifié pour les entrepreneurs
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition">CGU</a>
            <a href="#" className="hover:text-white transition">Confidentialité</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>

          <p className="text-sm text-slate-600">
            Fait avec &hearts; pour les entrepreneurs
          </p>
        </div>
      </footer>

      {/* ── CONTACT MODAL ── */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setContactOpen(false); setContactSent(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl p-6 sm:p-8"
            >
              {contactSent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message envoyé !</h3>
                  <p className="text-slate-400 text-sm mb-6">Nous reviendrons vers vous rapidement.</p>
                  <button onClick={() => { setContactOpen(false); setContactSent(false); }} className="px-6 py-2 text-sm font-medium border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 hover:text-white transition">
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Contactez-nous</h3>
                    <button onClick={() => setContactOpen(false)} className="p-1 text-slate-400 hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => { e.preventDefault(); setContactSent(true); }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-1">Nom</label>
                      <input type="text" required placeholder="Votre nom" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-1">Email</label>
                      <input type="email" required placeholder="votre@email.com" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-1">Type d&apos;activité</label>
                      <input type="text" required placeholder="Ex : institut de beauté" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-1">Message</label>
                      <textarea required rows={3} placeholder="Décrivez votre besoin..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition text-sm resize-none" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 text-sm">
                      Envoyer
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GLOBAL STYLES ── */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
}

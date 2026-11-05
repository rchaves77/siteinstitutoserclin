import { useEffect } from "react";
import {
  Brain,
  Clock,
  FileText,
  GraduationCap,
  MessageCircle,
  Puzzle,
  QrCode,
  Scale,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/* =====================================================================
   CONFIGURAÇÃO — edite só aqui
   ===================================================================== */

const WHATSAPP_NUMBER = "5568992161717";

const PAGE_TITLE =
  "Avaliação Neuropsicológica em Rio Branco (AC) | Instituto SerClin";
const PAGE_DESCRIPTION =
  "Avaliação neuropsicológica em Rio Branco (AC): laudo em até 30 dias após os testes. Profissional formada na USP-SP, +10 anos. Agende no WhatsApp.";

/* CONFIRMAR: estimativa conservadora (cálculo: 25 laudos/mês x ~11 meses
   ativos x 10 anos = ~2.750). Troque pelo número real do sistema quando tiver. */
const AUTHORITY_STATS = [
  { value: "+10 anos", label: "de avaliação neuropsicológica" },
  { value: "+2.500", label: "avaliações realizadas" },
  { value: "48h", label: "para o acolhimento" },
  { value: "30 dias", label: "para o laudo, após os testes" },
];

/* PROVA SOCIAL — avaliações públicas do Perfil de Empresa no Google.
   Cole abaixo texto e primeiro nome reais. Se a lista ficar vazia,
   a seção some da página (nada é inventado). */
const GOOGLE_REVIEWS_URL = ""; // link do perfil no Google
const GOOGLE_RATING = "5,0"; // todas as avaliações do perfil são 5 estrelas (conferido em 05/11/2026)
const GOOGLE_REVIEW_COUNT = "mais de 25"; // faixa segura: o perfil tinha 27 avaliações
type Testimonial = { text: string; author: string };
const TESTIMONIALS: Testimonial[] = [
  {
    text: "Ótimos profissionais, atendimento humanizado, laudos bem detalhados",
    author: "Mariano S.",
  },
  {
    text: "Fui muito bem recebida, meu filho amou a doutora Helenara, foi muito gentil com ele. Uma ótima profissional, voltarei outras vezes.",
    author: "Randélia S.",
  },
  {
    text: "Ótimo atendimento e profissionalismo de alto nível",
    author: "Widisney O.",
  },
];

/* PLANO PÓS-LAUDO — assinatura para quem conclui a avaliação.
   Preencha quando a oferta estiver definida; enquanto for null, a seção some. */
type PostEvaluationPlan = {
  title: string;
  text: string;
  cta: string;
  whatsappMessage: string;
};
const POST_EVALUATION_PLAN = null as PostEvaluationPlan | null;

/* =====================================================================
   COPY
   ===================================================================== */

const PAIN_POINTS = [
  "Seu filho se esforça, mas as notas não acompanham.",
  "A escola diz uma coisa, o pediatra diz outra.",
  "Você perde o foco, esquece tudo e vive atrasado, sem saber por quê.",
  "Um familiar idoso anda esquecendo coisas e ninguém sabe se é da idade.",
];

const USE_CASES = [
  {
    icon: Zap,
    title: "TDAH",
    text: "Entender se atenção, agitação e impulsividade fogem do esperado.",
  },
  {
    icon: Puzzle,
    title: "TEA (autismo)",
    text: "Investigar comunicação, interação social e comportamento.",
  },
  {
    icon: GraduationCap,
    title: "Dificuldades de aprendizagem",
    text: "Achar onde trava a leitura, a escrita ou a matemática.",
  },
  {
    icon: Brain,
    title: "Memória e envelhecimento",
    text: "Avaliar perdas de memória e investigar sinais de demência.",
  },
  {
    icon: Scale,
    title: "Laudo para escola ou Justiça",
    text: "Documento técnico para apoiar decisões na escola ou em processos.",
  },
];

const STEPS = [
  {
    title: "Conversa inicial",
    text: "Você chama no WhatsApp. Acolhemos em até 48h, explicamos o processo e marcamos o primeiro passo.",
  },
  {
    title: "Entrevista",
    text: "Ouvimos a história: desenvolvimento, saúde, escola ou trabalho e rotina.",
  },
  {
    title: "Testes e observação",
    text: "Sessões com testes e atividades adequados à idade de quem é avaliado.",
  },
  {
    title: "Devolutiva e laudo",
    text: "Explicamos tudo em linguagem simples. O laudo completo sai em até 30 dias depois das sessões de testes.",
    deadline: "Em até 30 dias após os testes",
  },
];

const DIFFERENTIALS = [
  {
    icon: ShieldCheck,
    title: "Quem avalia tem formação e rotina",
    text: "Helenara Chaves, formada na USP-SP, com mais de 10 anos em avaliação neuropsicológica.",
  },
  {
    icon: Users,
    title: "Equipe multiprofissional",
    text: "Psicologia e psicopedagogia no Instituto, com psiquiatria parceira quando o caso pede.",
  },
  {
    icon: QrCode,
    title: "Laudo com QR Code",
    text: "Escola, médico ou advogado confere na hora se o documento é verdadeiro.",
  },
  {
    icon: FileText,
    title: "Depois do laudo, você não fica sozinho",
    text: "Se precisar de acompanhamento, o Instituto oferece psicoterapia e psicopedagogia.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Em quanto tempo recebo o resultado?",
    answer:
      "O laudo completo sai em até 30 dias depois das sessões de testes. O acolhimento inicial, depois do seu contato, acontece em até 48h.",
  },
  {
    question: "O que é a devolutiva?",
    answer:
      "É a conversa em que explicamos os resultados em linguagem simples e tiramos suas dúvidas.",
  },
  {
    question: "Para quais idades a avaliação serve?",
    answer:
      "Atendemos crianças, adolescentes, adultos e idosos. Na conversa inicial, indicamos o formato mais adequado para cada caso.",
  },
  {
    question: "A avaliação dá um diagnóstico?",
    answer:
      "Ela reúne dados de testes, entrevistas e observação para esclarecer o quadro. Ajuda a confirmar ou descartar hipóteses, como TDAH e TEA. Não prometemos um resultado específico: entregamos uma resposta honesta, baseada em evidências.",
  },
  {
    question: "Quanto custa?",
    answer:
      "O valor depende do tipo de avaliação e da idade de quem será avaliado. Chame no WhatsApp e receba o orçamento.",
  },
  {
    question: "Vocês aceitam convênio?",
    answer:
      "Temos parcerias com sindicatos e instituições, como o SINPROAC. Pergunte no WhatsApp se a sua cobertura vale para a avaliação.",
  },
  {
    question: "Posso entregar o laudo na escola?",
    answer:
      "Sim. O laudo é seu e você decide com quem compartilhar. Ele tem QR Code para conferir se o documento é verdadeiro. A aceitação final depende de cada instituição.",
  },
  {
    question: "O que acontece depois do laudo?",
    answer:
      "Na devolutiva, explicamos os resultados em linguagem simples. Se precisar de acompanhamento, o Instituto tem psicoterapia e psicopedagogia, e encaminhamos para psiquiatria parceira quando o caso pede.",
  },
  {
    question: "Em quanto tempo vocês respondem?",
    answer:
      "Depois do seu contato no WhatsApp, o acolhimento acontece em até 48h.",
  },
];

/* =====================================================================
   AUXILIARES
   ===================================================================== */

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function usePageSeo() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;

    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const createdMeta = !metaDescription;
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    const previousDescription = metaDescription.content;
    metaDescription.content = PAGE_DESCRIPTION;

    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "MedicalBusiness",
          name: "Instituto SerClin",
          url: window.location.origin,
          telephone: "+5568992161717",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Rua Sorocaba, 140",
            addressLocality: "Rio Branco",
            addressRegion: "AC",
            addressCountry: "BR",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ],
    });
    document.head.appendChild(jsonLd);

    window.scrollTo({ top: 0 });

    return () => {
      document.title = previousTitle;
      if (createdMeta) metaDescription.remove();
      else metaDescription.content = previousDescription;
      jsonLd.remove();
    };
  }, []);
}

function WhatsAppButton({
  label,
  message,
  className,
}: {
  label: string;
  message: string;
  className?: string;
}) {
  return (
    <Button
      size="lg"
      asChild
      className={cn(
        "neuro-cta-button h-auto w-full rounded-full bg-secondary px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:bg-secondary/90 hover:shadow-xl sm:w-auto md:text-lg",
        className,
      )}
    >
      <a
        href={buildWhatsAppLink(message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}

function AuthorityLine({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "neuro-authority-line text-sm font-medium tracking-wide",
        className,
      )}
    >
      Helenara Chaves • USP-SP • +10 anos • Equipe multiprofissional
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto mb-10 max-w-3xl text-center md:mb-14", className)}>
      <p className="mb-2 text-sm font-bold uppercase tracking-widest text-secondary">
        {eyebrow}
      </p>
      <h2 className="font-serif text-2xl font-bold leading-tight md:text-4xl">
        {title}
      </h2>
    </div>
  );
}

/* =====================================================================
   PÁGINA
   ===================================================================== */

export default function AvaliacaoNeuropsicologica() {
  usePageSeo();

  const hasTestimonials = TESTIMONIALS.length > 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-secondary selection:text-primary">
      <Navbar />

      <main>
        {/* 1. HERO — promessa, prazo, CTA e autoridade */}
        <section
          id="inicio"
          className="neuro-hero bg-primary px-4 pb-12 pt-32 text-white md:pb-20 md:pt-40"
        >
          <div className="container mx-auto max-w-4xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-secondary">
              Avaliação Neuropsicológica • Rio Branco, AC
            </p>
            <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-white md:text-5xl">
              Avaliação neuropsicológica completa em Rio Branco, com laudo em até 30 dias.
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg font-light text-white/90 md:text-xl">
              Descubra como você ou seu filho pensa, aprende e se comporta.
              <strong className="font-bold">Laudo em até 30 dias</strong> depois
              das sessões de testes.
            </p>

            <WhatsAppButton
              label="Agendar minha avaliação no WhatsApp"
              message="Olá! Quero agendar uma avaliação neuropsicológica no Instituto SerClin."
            />
            <p className="mt-4 text-sm text-white/70">
              Acolhimento em até 48h depois do seu contato.
            </p>

            <AuthorityLine className="mt-8 text-white/80" />

            <dl className="neuro-stats mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {AUTHORITY_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/10 px-3 py-4"
                >
                  <dt className="font-serif text-2xl font-bold text-secondary md:text-3xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-xs text-white/80 md:text-sm">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 2. DOR (PAS) — problema, consequência, solução */}
        <section id="problema" className="neuro-problem bg-white px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-3xl">
            <h2 className="mb-8 text-center font-serif text-2xl font-bold leading-tight text-primary md:text-4xl">
              Quando algo não encaixa, a dúvida pesa na casa inteira.
            </h2>

            <ul className="mb-8 space-y-3">
              {PAIN_POINTS.map((pain) => (
                <li
                  key={pain}
                  className="rounded-xl border-l-4 border-secondary bg-muted/30 p-4 text-base font-medium text-foreground md:text-lg"
                >
                  {pain}
                </li>
              ))}
            </ul>

            <p className="mb-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Sem uma resposta clara, cada um chuta uma explicação. A criança
              ouve que é preguiçosa. O adulto acha que falta força de vontade.
              E o tempo passa.
            </p>
            <p className="mb-8 text-base leading-relaxed text-foreground md:text-lg">
              <strong>A avaliação neuropsicológica troca palpite por dados.</strong>{" "}
              Com testes e entrevistas, medimos atenção, memória, linguagem e
              raciocínio. No fim, você recebe um laudo claro e um caminho a seguir.
            </p>

            <div className="text-center">
              <WhatsAppButton
                label="Quero entender meu caso"
                message="Olá! Quero entender se uma avaliação neuropsicológica faz sentido no meu caso."
                className="bg-primary text-white hover:bg-primary/90"
              />
            </div>
          </div>
        </section>

        {/* 3. PARA QUE SERVE */}
        <section id="para-que-serve" className="neuro-use-cases bg-muted/30 px-4 py-16 md:py-24">
          <div className="container mx-auto">
            <SectionHeading
              eyebrow="Para que serve"
              title="Uma avaliação, cinco tipos de dúvida respondidos."
              className="text-primary"
            />

            <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5">
                    <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-primary">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
              Não prometemos um diagnóstico específico. Entregamos uma resposta
              honesta, baseada em testes.
            </p>
          </div>
        </section>

        {/* 4. COMO FUNCIONA — 5 etapas com prazos */}
        <section id="como-funciona" className="neuro-steps bg-primary px-4 py-16 text-white md:py-24">
          <div className="container mx-auto">
            <SectionHeading
              eyebrow="Como funciona"
              title="Quatro passos, sem surpresa e com prazo."
            />

            <ol className="mx-auto max-w-3xl space-y-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-sm"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-primary"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="mb-1 font-serif text-xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed text-white/85">
                      {step.text}
                    </p>
                    {step.deadline && (
                      <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-secondary">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        {step.deadline}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 text-center">
              <WhatsAppButton
                label="Começar pelo passo 1"
                message="Olá! Quero começar o processo de avaliação neuropsicológica."
              />
            </div>
          </div>
        </section>

        {/* 5. POR QUE O SERCLIN — diferenciais reais */}
        <section id="por-que-serclin" className="neuro-differentials bg-white px-4 py-16 md:py-24">
          <div className="container mx-auto">
            <SectionHeading
              eyebrow="Por que o SerClin"
              title="Avaliação feita por quem faz isso todo mês, há mais de 10 anos."
              className="text-primary"
            />

            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
              {DIFFERENTIALS.map((item) => (
                <article
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-border bg-muted/20 p-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-secondary">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-serif text-lg font-bold text-primary">
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <AuthorityLine className="mt-10 text-center text-primary/70" />
          </div>
        </section>

        {/* 6. PROVA SOCIAL — só aparece com depoimentos reais */}
        {hasTestimonials && (
          <section id="depoimentos" className="neuro-reviews bg-muted/30 px-4 py-16 md:py-24">
            <div className="container mx-auto">
              <SectionHeading
                eyebrow="Quem já passou por aqui"
                title="O que as famílias dizem no Google."
                className="text-primary"
              />

              {GOOGLE_RATING && (
                <p className="mb-8 flex items-center justify-center gap-2 text-lg font-bold text-primary">
                  <Star className="h-5 w-5 fill-secondary text-secondary" aria-hidden="true" />
                  {GOOGLE_RATING}
                  {GOOGLE_REVIEW_COUNT && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({GOOGLE_REVIEW_COUNT} avaliações)
                    </span>
                  )}
                </p>
              )}

              <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
                {TESTIMONIALS.map((testimonial) => (
                  <figure
                    key={testimonial.author + testimonial.text.slice(0, 20)}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <blockquote className="mb-4 text-base leading-relaxed text-foreground">
                      “{testimonial.text}”
                    </blockquote>
                    <figcaption className="text-sm font-bold text-primary">
                      {testimonial.author}
                    </figcaption>
                  </figure>
                ))}
              </div>

              {GOOGLE_REVIEWS_URL && (
                <p className="mt-8 text-center">
                  <a
                    href={GOOGLE_REVIEWS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Ver todas as avaliações no Google
                  </a>
                </p>
              )}
            </div>
          </section>
        )}

        {/* 7. PRÓXIMO PASSO APÓS O LAUDO — só aparece quando POST_EVALUATION_PLAN for preenchido */}
        {POST_EVALUATION_PLAN && (
          <section id="depois-do-laudo" className="neuro-next-step bg-secondary/20 px-4 py-14 md:py-16">
            <div className="container mx-auto max-w-3xl text-center">
              <h2 className="mb-3 font-serif text-2xl font-bold text-primary md:text-3xl">
                {POST_EVALUATION_PLAN.title}
              </h2>
              <p className="mb-6 text-base leading-relaxed text-foreground md:text-lg">
                {POST_EVALUATION_PLAN.text}
              </p>
              <WhatsAppButton
                label={POST_EVALUATION_PLAN.cta}
                message={POST_EVALUATION_PLAN.whatsappMessage}
                className="bg-primary text-white hover:bg-primary/90"
              />
            </div>
          </section>
        )}

        {/* 8. FAQ — objeções, sem preço */}
        <section id="duvidas" className="neuro-faq bg-white px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Dúvidas frequentes"
              title="O que as famílias perguntam antes de começar."
              className="text-primary"
            />

            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-base font-semibold text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 9. CTA FINAL */}
        <section id="agendar" className="neuro-final-cta bg-primary px-4 py-16 text-center text-white md:py-24">
          <div className="container mx-auto max-w-3xl">
            <h2 className="mb-4 font-serif text-2xl font-bold leading-tight text-white md:text-4xl">
              Dê o primeiro passo hoje.
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg font-light text-white/90">
              Chame no WhatsApp e receba orientação sobre como agendar a
              avaliação. Acolhimento em até 48h, laudo em até 30 dias depois dos testes.
            </p>
            <WhatsAppButton
              label="Agendar minha avaliação no WhatsApp"
              message="Olá! Quero agendar uma avaliação neuropsicológica no Instituto SerClin."
            />
            <p className="mt-6 text-sm text-white/70">
              Prefere o formulário?{" "}
              <a href="/#contato" className="font-bold text-secondary underline underline-offset-4">
                Deixe seus dados aqui
              </a>
              .
            </p>
            <AuthorityLine className="mt-8 text-white/80" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import type { Locale } from "@/lib/locale-context";

export interface ChatMessage {
  from: "user" | "holdfy";
  text: string;
  time: string;
  read?: boolean;
  muted?: boolean;
}

export interface ChatMockupContent {
  contactName: string;
  typingStatusLabel: string;
  idleStatusLabel: string;
  messages: ChatMessage[];
  inputPlaceholder: string;
  footerLeft: string;
  footerRight: string;
}

export interface LandingDictionary {
  nav: { comoFunciona: string; seguranca: string; paraQuem: string; entrar: string };
  hero: { eyebrow: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  heroMockup: {
    orderId: string;
    itemName: string;
    value: string;
    waitingLabel: string;
    sealedLabel: string;
  };
  stats: { value: string; label: string }[];
  chatSection: { eyebrow: string; title: string; subtitle: string };
  chatGeneral: ChatMockupContent;
  steps: { title: string; description: string }[];
  forWhom: {
    title: string;
    subtitle: string;
    buyerTitle: string;
    buyerBenefits: string[];
    buyerCta: string;
    sellerTitle: string;
    sellerBenefits: string[];
    sellerCta: string;
  };
  security: {
    title: string;
    description: string;
    bullets: string[];
    auditBadge: string;
    guaranteeTitle: string;
    guaranteeDescription: string;
    disputeNote: string;
  };
  disputeSection: { eyebrow: string; title: string; description: string; bullets: string[] };
  disputeChat: ChatMockupContent;
  finalCta: { title: string; subtitle: string; button: string };
  footer: { tagline: string; copyright: string };
}

export const LANGUAGE_NAMES: Record<Locale, string> = {
  pt: "Português",
  es: "Español",
  en: "English",
};

export const landingDictionary: Record<Locale, LandingDictionary> = {
  pt: {
    nav: {
      comoFunciona: "Como funciona",
      seguranca: "Segurança",
      paraQuem: "Para quem é",
      entrar: "Entrar",
    },
    hero: {
      eyebrow: "Seu dinheiro fica retido até você confirmar",
      title: "Compre e venda por Pix sem o medo de ser enganado.",
      subtitle:
        "O pagamento fica guardado com a Holdfy até você confirmar que recebeu — só depois disso o dinheiro vai pro vendedor. Registrado em blockchain auditável, sem depender da palavra de ninguém.",
      ctaPrimary: "Proteger meu pagamento",
      ctaSecondary: "Ver como funciona",
    },
    heroMockup: {
      orderId: "Pedido #9482-BR",
      itemName: "Honda Civic 2021",
      value: "R$ 52.400,00",
      waitingLabel: "aguardando confirmação",
      sealedLabel: "retido",
    },
    stats: [
      { value: "1.284", label: "Vendas protegidas" },
      { value: "R$ 128.500,00", label: "Já liquidado com segurança" },
      { value: "98,5%", label: "Concluídas sem disputa" },
    ],
    chatSection: {
      eyebrow: "Pagamentos na conversa",
      title: "Cobre e pague sem sair do WhatsApp",
      subtitle:
        "Sua loja já vende pelo WhatsApp e pelo Instagram. A Holdfy entra na conversa e mantém o dinheiro retido até a entrega — sem app novo pro comprador instalar.",
    },
    chatGeneral: {
      contactName: "Holdfy",
      typingStatusLabel: "digitando…",
      idleStatusLabel: "online",
      messages: [
        { from: "user", text: "Posso pagar com segurança no WhatsApp?", time: "09:41" },
        {
          from: "holdfy",
          text: "Sim. Enviei seu link Holdfy — pague com Pix; os fundos ficam retidos até você confirmar a entrega.",
          time: "09:44",
          read: true,
        },
        { from: "user", text: "Perfeito, vou pagar agora.", time: "09:47" },
      ],
      inputPlaceholder: "Mensagem",
      footerLeft: "Retenção ativa",
      footerRight: "Fundos retidos",
    },
    steps: [
      {
        title: "Comprador paga via Pix",
        description: "O valor é capturado na hora e fica retido — não vai direto pro vendedor.",
      },
      {
        title: "Vendedor envia o pedido",
        description: "Você acompanha cada etapa, do preparo até a entrega, pelo painel da Holdfy.",
      },
      {
        title: "Comprador confirma e libera",
        description: "Só depois da confirmação o valor sai da custódia. Deu problema? Dá pra abrir disputa antes disso.",
      },
    ],
    forWhom: {
      title: "Duas vias do mesmo recibo",
      subtitle: "Comprador e vendedor protegidos pelo mesmo pagamento, cada um com sua cópia.",
      buyerTitle: "Via do Comprador",
      buyerBenefits: [
        "Seu dinheiro só sai da custódia quando você confirmar o recebimento",
        "Acompanhe o status do pedido do pagamento à entrega",
        "Abra uma disputa a qualquer momento antes da confirmação",
      ],
      buyerCta: "Comprar com segurança",
      sellerTitle: "Via do Vendedor",
      sellerBenefits: [
        "Confirmação de pagamento na hora, sem esperar compensação bancária",
        "Menos calote e contestação: o comprador já pagou antes do envio",
        "Liberação automática assim que o comprador confirma o recebimento",
      ],
      sellerCta: "Vender com a Holdfy",
    },
    security: {
      title: "Custódia real, não uma promessa",
      description:
        "Cada Pix retido pela Holdfy fica registrado em contratos inteligentes na blockchain Stellar — auditáveis e à prova de alteração unilateral. Ninguém, nem a própria Holdfy, libera o valor antes da hora combinada.",
      bullets: [
        "Liquidação em minutos, 24 horas por dia",
        "Regras de liberação e disputa executadas on-chain",
        "Conversão Pix ⇄ stablecoin sem exposição a volatilidade",
      ],
      auditBadge: "Carimbo — auditável on-chain",
      guaranteeTitle: "Garantia Holdfy",
      guaranteeDescription:
        "Seu dinheiro está guardado com segurança. Ele só é liberado ao vendedor depois que você confirma o recebimento do produto em perfeitas condições — e se algo sair errado, você pode abrir uma disputa a qualquer momento antes disso.",
      disputeNote: "Disputas mediadas com prazo definido, sem enrolação",
    },
    disputeSection: {
      eyebrow: "Resolução de disputas",
      title: "Quando algo dá errado, resolve na conversa",
      description:
        "Os fundos permanecem retidos enquanto as duas partes enviam evidências. A Holdfy aplica a política de forma consistente — sem depender de boa vontade.",
      bullets: [
        "Mediação antes de qualquer contestação bancária",
        "Fundos rastreáveis e retidos até a decisão",
        "Reembolso liberado em minutos quando a disputa procede",
      ],
    },
    disputeChat: {
      contactName: "Holdfy",
      typingStatusLabel: "digitando…",
      idleStatusLabel: "online",
      messages: [
        { from: "user", text: "E meu dinheiro? Está seguro?", time: "10:50" },
        {
          from: "holdfy",
          text: "100% seguro. Seus R$ 850,00 ainda estão retidos na Holdfy — o vendedor não pode tocá-los.",
          time: "11:53",
          read: true,
        },
        { from: "user", text: "E se o vendedor não responder?", time: "11:56" },
        {
          from: "holdfy",
          text: "Disputa resolvida a seu favor! R$ 850,00 reembolsados na sua chave Pix em menos de 5 segundos.",
          time: "12:59",
          read: true,
          muted: true,
        },
      ],
      inputPlaceholder: "Mensagem",
      footerLeft: "Disputa #4821 — Resolvida",
      footerRight: "Reembolso total",
    },
    finalCta: {
      title: "Pronto para negociar sem medo?",
      subtitle: "Crie sua conta e faça seu primeiro pagamento protegido em poucos minutos.",
      button: "Criar minha conta",
    },
    footer: {
      tagline: "Pagamentos Pix protegidos por custódia na blockchain Stellar.",
      copyright: "© 2026 Holdfy. Todos os direitos reservados.",
    },
  },
  es: {
    nav: {
      comoFunciona: "Cómo funciona",
      seguranca: "Seguridad",
      paraQuem: "Para quién es",
      entrar: "Entrar",
    },
    hero: {
      eyebrow: "Tu dinero queda retenido hasta que confirmes",
      title: "Compra y vende por Pix sin el miedo a que te engañen.",
      subtitle:
        "El pago queda guardado con Holdfy hasta que confirmes que lo recibiste — solo después el dinero va al vendedor. Registrado en una blockchain auditable, sin depender de la palabra de nadie.",
      ctaPrimary: "Proteger mi pago",
      ctaSecondary: "Ver cómo funciona",
    },
    heroMockup: {
      orderId: "Pedido #9482-BR",
      itemName: "Honda Civic 2021",
      value: "R$ 52.400,00",
      waitingLabel: "esperando confirmación",
      sealedLabel: "retenido",
    },
    stats: [
      { value: "1.284", label: "Ventas protegidas" },
      { value: "R$ 128.500,00", label: "Ya liquidado con seguridad" },
      { value: "98,5%", label: "Concluidas sin disputa" },
    ],
    chatSection: {
      eyebrow: "Pagos en la conversación",
      title: "Cobra y paga sin salir de WhatsApp",
      subtitle:
        "Tu tienda ya vende por WhatsApp e Instagram. Holdfy entra en la conversación y mantiene el dinero retenido hasta la entrega — sin que el comprador instale una app nueva.",
    },
    chatGeneral: {
      contactName: "Holdfy",
      typingStatusLabel: "escribiendo…",
      idleStatusLabel: "en línea",
      messages: [
        { from: "user", text: "¿Puedo pagar con seguridad por WhatsApp?", time: "09:41" },
        {
          from: "holdfy",
          text: "Sí. Te envié tu enlace Holdfy — paga con Pix; los fondos quedan retenidos hasta que confirmes la entrega.",
          time: "09:44",
          read: true,
        },
        { from: "user", text: "Perfecto, voy a pagar ahora.", time: "09:47" },
      ],
      inputPlaceholder: "Mensaje",
      footerLeft: "Retención activa",
      footerRight: "Fondos retenidos",
    },
    steps: [
      {
        title: "El comprador paga por Pix",
        description: "El valor se captura al instante y queda retenido — no va directo al vendedor.",
      },
      {
        title: "El vendedor envía el pedido",
        description: "Sigues cada etapa, desde la preparación hasta la entrega, en el panel de Holdfy.",
      },
      {
        title: "El comprador confirma y libera",
        description: "Solo después de la confirmación el valor sale de la custodia. ¿Hubo un problema? Se puede abrir una disputa antes de eso.",
      },
    ],
    forWhom: {
      title: "Dos copias del mismo recibo",
      subtitle: "Comprador y vendedor protegidos por el mismo pago, cada uno con su copia.",
      buyerTitle: "Copia del Comprador",
      buyerBenefits: [
        "Tu dinero solo sale de la custodia cuando confirmas la recepción",
        "Sigue el estado del pedido desde el pago hasta la entrega",
        "Abre una disputa en cualquier momento antes de la confirmación",
      ],
      buyerCta: "Comprar con seguridad",
      sellerTitle: "Copia del Vendedor",
      sellerBenefits: [
        "Confirmación de pago al instante, sin esperar la compensación bancaria",
        "Menos impagos y contracargos: el comprador ya pagó antes del envío",
        "Liberación automática en cuanto el comprador confirma la recepción",
      ],
      sellerCta: "Vender con Holdfy",
    },
    security: {
      title: "Custodia real, no una promesa",
      description:
        "Cada Pix retenido por Holdfy queda registrado en contratos inteligentes en la blockchain Stellar — auditables y a prueba de alteración unilateral. Nadie, ni siquiera Holdfy, libera el valor antes del momento acordado.",
      bullets: [
        "Liquidación en minutos, las 24 horas del día",
        "Reglas de liberación y disputa ejecutadas on-chain",
        "Conversión Pix ⇄ stablecoin sin exposición a la volatilidad",
      ],
      auditBadge: "Sello — auditable on-chain",
      guaranteeTitle: "Garantía Holdfy",
      guaranteeDescription:
        "Tu dinero está guardado con seguridad. Solo se libera al vendedor después de que confirmes la recepción del producto en perfectas condiciones — y si algo sale mal, puedes abrir una disputa en cualquier momento antes de eso.",
      disputeNote: "Disputas mediadas con plazo definido, sin vueltas",
    },
    disputeSection: {
      eyebrow: "Resolución de disputas",
      title: "Cuando algo sale mal, se resuelve en la conversación",
      description:
        "Los fondos permanecen retenidos mientras ambas partes envían evidencias. Holdfy aplica la política de forma consistente — sin depender de la buena voluntad.",
      bullets: [
        "Mediación antes de cualquier contracargo bancario",
        "Fondos rastreables y retenidos hasta la decisión",
        "Reembolso liberado en minutos cuando procede la disputa",
      ],
    },
    disputeChat: {
      contactName: "Holdfy",
      typingStatusLabel: "escribiendo…",
      idleStatusLabel: "en línea",
      messages: [
        { from: "user", text: "¿Y mi dinero? ¿Está seguro?", time: "10:50" },
        {
          from: "holdfy",
          text: "100% seguro. Tus R$ 850,00 siguen retenidos en Holdfy — el vendedor no puede tocarlos.",
          time: "11:53",
          read: true,
        },
        { from: "user", text: "¿Y si el vendedor no responde?", time: "11:56" },
        {
          from: "holdfy",
          text: "¡Disputa resuelta a tu favor! R$ 850,00 reembolsados a tu clave Pix en menos de 5 segundos.",
          time: "12:59",
          read: true,
          muted: true,
        },
      ],
      inputPlaceholder: "Mensaje",
      footerLeft: "Disputa #4821 — Resuelta",
      footerRight: "Reembolso total",
    },
    finalCta: {
      title: "¿Listo para negociar sin miedo?",
      subtitle: "Crea tu cuenta y haz tu primer pago protegido en pocos minutos.",
      button: "Crear mi cuenta",
    },
    footer: {
      tagline: "Pagos Pix protegidos por custodia en la blockchain Stellar.",
      copyright: "© 2026 Holdfy. Todos los derechos reservados.",
    },
  },
  en: {
    nav: {
      comoFunciona: "How it works",
      seguranca: "Security",
      paraQuem: "Who it's for",
      entrar: "Sign in",
    },
    hero: {
      eyebrow: "Your money stays held until you confirm",
      title: "Buy and sell over Pix without the fear of getting scammed.",
      subtitle:
        "Your payment stays with Holdfy until you confirm you received it — only then does the money move to the seller. Recorded on an auditable blockchain, no one's word required.",
      ctaPrimary: "Protect my payment",
      ctaSecondary: "See how it works",
    },
    heroMockup: {
      orderId: "Order #9482-BR",
      itemName: "2021 Honda Civic",
      value: "$52,400.00",
      waitingLabel: "awaiting confirmation",
      sealedLabel: "held",
    },
    stats: [
      { value: "1,284", label: "Protected sales" },
      { value: "$128,500", label: "Already settled securely" },
      { value: "98.5%", label: "Completed without disputes" },
    ],
    chatSection: {
      eyebrow: "Payments in the chat",
      title: "Charge and get paid without leaving WhatsApp",
      subtitle:
        "Your store already sells through WhatsApp and Instagram. Holdfy joins the conversation and keeps the money in escrow until delivery — no new app for the buyer to install.",
    },
    chatGeneral: {
      contactName: "Holdfy",
      typingStatusLabel: "typing…",
      idleStatusLabel: "online",
      messages: [
        { from: "user", text: "Can I pay safely over WhatsApp?", time: "9:41 AM" },
        {
          from: "holdfy",
          text: "Yes. I've sent your Holdfy link — pay with Pix; the funds stay in escrow until you confirm delivery.",
          time: "9:44 AM",
          read: true,
        },
        { from: "user", text: "Perfect, paying now.", time: "9:47 AM" },
      ],
      inputPlaceholder: "Message",
      footerLeft: "Escrow active",
      footerRight: "Funds held",
    },
    steps: [
      {
        title: "Buyer pays with Pix",
        description: "The amount is captured instantly and held — it doesn't go straight to the seller.",
      },
      {
        title: "Seller ships the order",
        description: "You track every step, from prep to delivery, in the Holdfy dashboard.",
      },
      {
        title: "Buyer confirms and releases",
        description: "The value only leaves escrow after confirmation. Something wrong? You can open a dispute before that.",
      },
    ],
    forWhom: {
      title: "Two copies of the same receipt",
      subtitle: "Buyer and seller, protected by the same payment, each with their own copy.",
      buyerTitle: "Buyer's Copy",
      buyerBenefits: [
        "Your money only leaves escrow once you confirm you received it",
        "Track the order status from payment to delivery",
        "Open a dispute at any point before confirming",
      ],
      buyerCta: "Buy with confidence",
      sellerTitle: "Seller's Copy",
      sellerBenefits: [
        "Instant payment confirmation, no waiting on bank settlement",
        "Fewer chargebacks and no-pays: the buyer already paid before shipping",
        "Automatic release the moment the buyer confirms delivery",
      ],
      sellerCta: "Sell with Holdfy",
    },
    security: {
      title: "Real escrow, not just a promise",
      description:
        "Every Pix payment Holdfy holds is recorded in smart contracts on the Stellar blockchain — auditable and tamper-proof. No one, not even Holdfy, can release the funds before the agreed moment.",
      bullets: [
        "Settlement in minutes, 24 hours a day",
        "Release and dispute rules enforced on-chain",
        "Pix ⇄ stablecoin conversion with no volatility exposure",
      ],
      auditBadge: "Stamped — auditable on-chain",
      guaranteeTitle: "Holdfy Guarantee",
      guaranteeDescription:
        "Your money is kept safe. It's only released to the seller once you confirm the product arrived in perfect condition — and if something goes wrong, you can open a dispute at any point before that.",
      disputeNote: "Disputes mediated with a set deadline, no runaround",
    },
    disputeSection: {
      eyebrow: "Dispute resolution",
      title: "When something goes wrong, it's sorted out in the chat",
      description:
        "Funds stay in escrow while both sides submit evidence. Holdfy applies the policy consistently — it doesn't rely on goodwill.",
      bullets: [
        "Mediation before any bank chargeback",
        "Funds traceable and held until a decision is made",
        "Refunds released in minutes when a dispute is upheld",
      ],
    },
    disputeChat: {
      contactName: "Holdfy",
      typingStatusLabel: "typing…",
      idleStatusLabel: "online",
      messages: [
        { from: "user", text: "What about my money? Is it safe?", time: "10:50 AM" },
        {
          from: "holdfy",
          text: "100% safe. Your $850.00 is still held by Holdfy — the seller can't touch it.",
          time: "11:53 AM",
          read: true,
        },
        { from: "user", text: "What if the seller doesn't respond?", time: "11:56 AM" },
        {
          from: "holdfy",
          text: "Dispute resolved in your favor! $850.00 refunded to your Pix key in under 5 seconds.",
          time: "12:59 PM",
          read: true,
          muted: true,
        },
      ],
      inputPlaceholder: "Message",
      footerLeft: "Dispute #4821 — Resolved",
      footerRight: "Full refund",
    },
    finalCta: {
      title: "Ready to deal without the fear?",
      subtitle: "Create your account and make your first protected payment in minutes.",
      button: "Create my account",
    },
    footer: {
      tagline: "Pix payments protected by escrow on the Stellar blockchain.",
      copyright: "© 2026 Holdfy. All rights reserved.",
    },
  },
};

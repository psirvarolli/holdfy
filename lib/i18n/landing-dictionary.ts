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
    statusLabel: string;
    step1Title: string;
    step1Desc: string;
    step1Time: string;
    step2Title: string;
    step2Desc: string;
    step2Time: string;
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
      eyebrow: "Escrow para pagamentos Pix",
      title: "Compre e venda por Pix sem correr o risco de ser enganado.",
      subtitle:
        "A Holdfy retém seu pagamento em custódia até a confirmação da entrega e libera automaticamente para o vendedor. Simples como um Pix, protegido como um contrato.",
      ctaPrimary: "Começar agora",
      ctaSecondary: "Ver como funciona",
    },
    heroMockup: {
      orderId: "Pedido #9482-BR",
      itemName: "Teclado Mecânico Pro V2",
      statusLabel: "Pago em Custódia",
      step1Title: "Pagamento Confirmado",
      step1Desc: "Seu pagamento está seguro na Holdfy.",
      step1Time: "14 Out, 09:42",
      step2Title: "Em Processamento",
      step2Desc: "O vendedor está preparando seu pedido.",
      step2Time: "Previsão: 16 Out",
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
        description: "O valor é capturado na hora e fica retido em custódia — não vai direto pro vendedor.",
      },
      {
        title: "Vendedor envia o pedido",
        description: "Você acompanha cada etapa em tempo real, do preparo até a entrega, pelo painel da Holdfy.",
      },
      {
        title: "Comprador confirma e libera",
        description: "Só depois da confirmação o valor é liberado ao vendedor. Deu problema? É possível abrir disputa.",
      },
    ],
    forWhom: {
      title: "Para quem compra e para quem vende",
      subtitle: "O mesmo pagamento, protegido dos dois lados da negociação.",
      buyerTitle: "Para quem compra",
      buyerBenefits: [
        "Seu dinheiro só sai da custódia quando você confirmar o recebimento",
        "Acompanhe o status do pedido do pagamento à entrega",
        "Abra uma disputa a qualquer momento antes da confirmação",
      ],
      buyerCta: "Comprar com segurança",
      sellerTitle: "Para quem vende",
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
      eyebrow: "Custodia para pagos Pix",
      title: "Compra y vende por Pix sin correr el riesgo de que te engañen.",
      subtitle:
        "Holdfy retiene tu pago en custodia hasta la confirmación de la entrega y lo libera automáticamente al vendedor. Simple como un Pix, protegido como un contrato.",
      ctaPrimary: "Empezar ahora",
      ctaSecondary: "Ver cómo funciona",
    },
    heroMockup: {
      orderId: "Pedido #9482-BR",
      itemName: "Teclado Mecánico Pro V2",
      statusLabel: "Pago en Custodia",
      step1Title: "Pago confirmado",
      step1Desc: "Tu pago está seguro en Holdfy.",
      step1Time: "14 oct, 09:42",
      step2Title: "En preparación",
      step2Desc: "El vendedor está preparando tu pedido.",
      step2Time: "Previsto: 16 oct",
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
        description: "El valor se captura al instante y queda retenido en custodia — no va directo al vendedor.",
      },
      {
        title: "El vendedor envía el pedido",
        description: "Sigues cada etapa en tiempo real, desde la preparación hasta la entrega, en el panel de Holdfy.",
      },
      {
        title: "El comprador confirma y libera",
        description: "Solo después de la confirmación se libera el valor al vendedor. ¿Hubo un problema? Se puede abrir una disputa.",
      },
    ],
    forWhom: {
      title: "Para quien compra y para quien vende",
      subtitle: "El mismo pago, protegido en ambos lados de la negociación.",
      buyerTitle: "Para quien compra",
      buyerBenefits: [
        "Tu dinero solo sale de la custodia cuando confirmas la recepción",
        "Sigue el estado del pedido desde el pago hasta la entrega",
        "Abre una disputa en cualquier momento antes de la confirmación",
      ],
      buyerCta: "Comprar con seguridad",
      sellerTitle: "Para quien vende",
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
      eyebrow: "Escrow for Pix payments",
      title: "Buy and sell over Pix without the risk of getting scammed.",
      subtitle:
        "Holdfy holds your payment in escrow until delivery is confirmed, then releases it to the seller automatically. As simple as a Pix, as safe as a contract.",
      ctaPrimary: "Get started",
      ctaSecondary: "See how it works",
    },
    heroMockup: {
      orderId: "Order #9482-BR",
      itemName: "Pro V2 Mechanical Keyboard",
      statusLabel: "Paid in Escrow",
      step1Title: "Payment confirmed",
      step1Desc: "Your payment is safe with Holdfy.",
      step1Time: "Oct 14, 9:42 AM",
      step2Title: "Processing",
      step2Desc: "The seller is preparing your order.",
      step2Time: "Expected: Oct 16",
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
        description: "The amount is captured instantly and held in escrow — it doesn't go straight to the seller.",
      },
      {
        title: "Seller ships the order",
        description: "You track every step in real time, from prep to delivery, in the Holdfy dashboard.",
      },
      {
        title: "Buyer confirms and releases",
        description: "The seller only gets paid after confirmation. Something wrong? You can open a dispute.",
      },
    ],
    forWhom: {
      title: "For buyers and for sellers",
      subtitle: "The same payment, protected on both sides of the deal.",
      buyerTitle: "For buyers",
      buyerBenefits: [
        "Your money only leaves escrow once you confirm you received it",
        "Track the order status from payment to delivery",
        "Open a dispute at any point before confirming",
      ],
      buyerCta: "Buy with confidence",
      sellerTitle: "For sellers",
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

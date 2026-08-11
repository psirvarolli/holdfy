import type { Locale } from "@/lib/landing-locale-context";

export const LANGUAGE_NAMES: Record<Locale, string> = {
  pt: "Português (BR)",
  es: "Español",
  en: "English",
};

// Short label shown on the switcher trigger itself (before the dropdown opens).
export const LANGUAGE_SHORT_NAMES: Record<Locale, string> = {
  pt: "Português...",
  es: "Español",
  en: "English",
};

interface WhatsAppTextMessage {
  from: "in" | "out";
  text: string;
  time: string;
}

interface WhatsAppCardMessage {
  from: "holdfy";
  kind: "card";
  time: string;
  brandLabel: string;
  escrowChip: string;
  desc: string;
  amount: string;
  link: string;
  foot: string;
}

interface WhatsAppLockedMessage {
  from: "holdfy";
  kind: "locked";
  time: string;
  title: string;
  desc: string;
}

interface WhatsAppReleasedMessage {
  from: "holdfy";
  kind: "released";
  time: string;
  title: string;
  desc: string;
  badge: string;
}

export type WhatsAppScriptMessage =
  | WhatsAppTextMessage
  | WhatsAppCardMessage
  | WhatsAppLockedMessage
  | WhatsAppReleasedMessage;

export interface LandingDictionary {
  meta: { title: string; description: string };
  nav: {
    comoFunciona: string;
    paraQuem: string;
    precos: string;
    faq: string;
    entrar: string;
    comecarAgora: string;
    ativarTemaClaro: string;
    ativarTemaEscuro: string;
    abrirMenu: string;
    fecharMenu: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    badges: [string, string, string];
  };
  whatsapp: {
    contactName: string;
    typingLabel: string;
    onlineLabel: string;
    typingAriaLabel: string;
    inputPlaceholder: string;
    replayButton: string;
    script: WhatsAppScriptMessage[];
  };
  problem: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; text: string }[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: { title: string; text: string }[];
  };
  segments: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; text: string }[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    mostPopular: string;
    plans: {
      name: string;
      audience: string;
      price: string;
      suffix: string;
      features: string[];
      cta: string;
    }[];
    calculator: {
      title: string;
      subtitle: string;
      valueLabel: string;
      presetsLabel: string;
      presets: { key: string; label: string }[];
      rangeMin: string;
      rangeMax: string;
      starterLabel: string;
      proLabel: string;
      enterpriseLabel: string;
      feePrefix: string;
      enterpriseFee: string;
      netLabel: string;
      enterpriseNet: string;
      enterpriseNetLabel: string;
      savingsPrefix: string;
      savingsSuffix: string;
    };
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  footer: {
    tagline: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    contact: { title: string; emailLabel: string; phoneLabel: string; addressLabel: string };
    compliance: string;
    copyright: string;
  };
  leadModal: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitLabel: string;
    submitLoading: string;
    note: string;
    closeLabel: string;
    toastExisting: string;
    toastSuccess: string;
    toastErrorGeneric: string;
    toastErrorNetwork: string;
  };
}

export const landingDictionary: Record<Locale, LandingDictionary> = {
  pt: {
    meta: {
      title: "Holdfy — Pagamentos PIX protegidos",
      description: "Pague e receba com segurança: seu dinheiro fica em custódia até a confirmação do pedido.",
    },
    nav: {
      comoFunciona: "Como funciona",
      paraQuem: "Para quem",
      precos: "Preços",
      faq: "FAQ",
      entrar: "Entrar",
      comecarAgora: "Começar agora",
      ativarTemaClaro: "Ativar tema claro",
      ativarTemaEscuro: "Ativar tema escuro",
      abrirMenu: "Abrir menu",
      fecharMenu: "Fechar menu",
    },
    hero: {
      kicker: "Escrow-as-a-service nativo em PIX",
      title: "Combinou o pagamento? A Holdfy garante que ele aconteça.",
      subtitle:
        "O valor fica retido em um contrato inteligente na rede Stellar e só é liberado quando o serviço é entregue. O pagador usa PIX como sempre — e ninguém precisa entender nada de cripto.",
      primaryCta: "Criar minha primeira transação",
      secondaryCta: "Ver como funciona",
      badges: ["Construído sobre Stellar", "PIX nativo", "Contratos auditáveis"],
    },
    whatsapp: {
      contactName: "Carlos — Designer",
      typingLabel: "digitando...",
      onlineLabel: "online",
      typingAriaLabel: "digitando",
      inputPlaceholder: "Mensagem",
      replayButton: "Ver de novo",
      script: [
        { from: "in", text: "Oi, Carlos! Você consegue desenvolver o site da minha loja até o dia 20?", time: "09:12" },
        { from: "out", text: "Oi, Ana! Consigo sim. O projeto completo fica em R$ 3.500. Fechado?", time: "09:13" },
        { from: "in", text: "Topo! Mas só consigo pagar depois da entrega...", time: "09:14" },
        { from: "out", text: "Entendo. E eu preciso de garantia de que vou receber. Que tal usarmos a Holdfy?", time: "09:15" },
        { from: "in", text: "Holdfy? Como funciona?", time: "09:15" },
        {
          from: "out",
          text: "Você paga agora via PIX, mas o valor fica retido em um contrato inteligente. Eu só recebo quando entregar. Seguro para nós dois!",
          time: "09:16",
        },
        { from: "in", text: "Perfeito! Pode mandar o link.", time: "09:17" },
        {
          from: "holdfy",
          kind: "card",
          time: "09:17",
          brandLabel: "HOLDFY",
          escrowChip: "Escrow",
          desc: "Site da loja — entrega até 20/07",
          amount: "R$ 3.500,00",
          link: "holdfy.link/t8F3k",
          foot: "Contrato inteligente · Rede Stellar",
        },
        {
          from: "holdfy",
          kind: "locked",
          time: "09:18",
          title: "Pagamento PIX confirmado",
          desc: "R$ 3.500,00 retidos no contrato de escrow. Nenhuma das partes pode movimentar o valor fora das regras combinadas.",
        },
        {
          from: "holdfy",
          kind: "released",
          time: "20/07",
          title: "Entrega aprovada por Ana",
          desc: "Pagamento liberado para Carlos via PIX. Transação concluída com registro auditável na Stellar.",
          badge: "Concluído",
        },
      ],
    },
    problem: {
      eyebrow: "O problema",
      title: "Pagamento combinado no informal não protege ninguém",
      subtitle:
        "Todo dia, freelancers e empresas fecham negócios por mensagem — e assumem riscos que nenhum dos lados deveria correr.",
      items: [
        {
          title: "Calote depois da entrega",
          text: "Você entregou o trabalho e o cliente sumiu. Sem custódia, cobrar vira desgaste — e prejuízo.",
        },
        {
          title: "Sem garantia formal",
          text: "Combinados por WhatsApp não protegem ninguém: sem regras claras, o pagamento depende de boa vontade.",
        },
        {
          title: "Disputas sem mediação clara",
          text: "Quando algo dá errado, cada lado conta uma história — e não existe um mecanismo neutro para decidir.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "Como funciona",
      title: "Seguro como um cofre. Simples como um PIX.",
      subtitle: "Quatro passos e o pagamento combinado vira um contrato que se cumpre sozinho.",
      steps: [
        {
          title: "Combine as condições",
          text: "Defina escopo, valor e critérios de entrega. Isso vira as regras do contrato.",
        },
        {
          title: "Deposite via PIX",
          text: "O pagador transfere como sempre. O valor fica retido em um contrato inteligente (Soroban/Stellar).",
        },
        {
          title: "O serviço é entregue",
          text: "O prestador trabalha tranquilo, sabendo que o dinheiro já está garantido em custódia.",
        },
        {
          title: "Pagamento liberado",
          text: "Cumpridas as condições, o valor é liberado automaticamente — ou por aprovação do pagador.",
        },
      ],
    },
    segments: {
      eyebrow: "Para quem é",
      title: "Feita para quem vive de entregas combinadas",
      subtitle:
        "Do freelancer ao marketplace, a Holdfy transforma qualquer combinado em uma transação com garantia real.",
      items: [
        {
          title: "Freelancers e prestadores",
          text: "Comece a trabalhar com o valor já garantido em custódia — liberado na entrega aprovada. Chega de calote.",
        },
        {
          title: "Marketplaces",
          text: "Adicione custódia nativa às suas transações e aumente a confiança entre compradores e vendedores, sem construir nada do zero.",
        },
        {
          title: "Imobiliárias",
          text: "Proteja sinais, cauções e comissões com liberação condicionada a marcos do contrato, com registro auditável de cada etapa.",
        },
        {
          title: "Empresas B2B",
          text: "Feche contratos com fornecedores novos sem medo: pagamento condicionado a entregas e SLAs, com mediação de disputas.",
        },
      ],
    },
    pricing: {
      eyebrow: "Preços",
      title: "Você só paga quando a transação acontece",
      subtitle: "Sem mensalidade para começar. A taxa é um percentual sobre o valor transacionado — simples assim.",
      mostPopular: "Mais popular",
      plans: [
        {
          name: "Starter",
          audience: "Para freelancers e primeiros negócios",
          price: "5%",
          suffix: "por transação concluída",
          features: [
            "Sem mensalidade — pague só quando receber",
            "Escrow via PIX com liberação por aprovação",
            "Contrato inteligente auditável na Stellar",
            "Suporte por e-mail",
          ],
          cta: "Começar grátis",
        },
        {
          name: "Pro",
          audience: "Para agências e prestadores frequentes",
          price: "3,9%",
          suffix: "por transação concluída",
          features: [
            "Tudo do Starter",
            "Contratos com marcos de entrega (milestones)",
            "Mediação de disputas inclusa",
            "Relatórios mensais de transações",
            "Suporte prioritário",
          ],
          cta: "Assinar o Pro",
        },
        {
          name: "Enterprise",
          audience: "Para marketplaces e operações em escala",
          price: "Sob consulta",
          suffix: "taxas personalizadas por volume",
          features: [
            "API e webhooks para integração",
            "White-label com a sua marca",
            "Gestor de conta dedicado",
            "SLA e suporte a compliance",
          ],
          cta: "Falar com vendas",
        },
      ],
      calculator: {
        title: "Quanto o prestador recebe?",
        subtitle: "Simule o valor da transação e veja a taxa da Holdfy em cada plano.",
        valueLabel: "Valor da transação",
        presetsLabel: "Perfis de transação",
        presets: [
          { key: "freelancer", label: "Freelancer" },
          { key: "marketplace", label: "Marketplace" },
          { key: "imobiliaria", label: "Imobiliária" },
          { key: "b2b", label: "Empresas B2B" },
        ],
        rangeMin: "R$ 100",
        rangeMax: "R$ 50.000",
        starterLabel: "Starter · 5%",
        proLabel: "Pro · 3,9%",
        enterpriseLabel: "Enterprise",
        feePrefix: "Taxa Holdfy:",
        enterpriseFee: "Taxas personalizadas por volume",
        netLabel: "o prestador recebe",
        enterpriseNet: "Sob consulta",
        enterpriseNetLabel: "fale com vendas",
        savingsPrefix: "Com o Pro, o prestador economiza",
        savingsSuffix: "por transação em relação ao Starter.",
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Perguntas frequentes",
      items: [
        {
          q: "O que é escrow?",
          a: "Escrow é uma custódia neutra: o dinheiro do pagamento fica retido por um terceiro confiável — aqui, um contrato inteligente — e só é liberado quando as condições combinadas são cumpridas. O pagador não perde o dinheiro antes da entrega, e o prestador não trabalha sem garantia.",
        },
        {
          q: "É PIX de verdade?",
          a: "Sim. O depósito e a liberação acontecem via PIX, com a mesma experiência que você já conhece do seu banco. A diferença é que, entre o pagamento e a entrega, o valor fica protegido em custódia programável.",
        },
        {
          q: "Como funciona em caso de disputa?",
          a: "Se algo sair do combinado, qualquer uma das partes pode abrir uma disputa. O valor continua retido enquanto nossa mediação analisa as evidências — contrato, entregas e conversas — e decide pela liberação ou pela devolução, conforme as regras definidas no início.",
        },
        {
          q: "Quais são as taxas?",
          a: "No plano Starter, cobramos 5% sobre o valor da transação, somente quando ela é concluída. Os planos Pro e Enterprise têm taxas menores e recursos adicionais. Não há mensalidade para começar.",
        },
        {
          q: "É seguro?",
          a: "O valor fica retido em um contrato inteligente auditável na rede Stellar: ninguém — nem mesmo a Holdfy — pode movê-lo fora das regras definidas. Todas as etapas ficam registradas de forma transparente e verificável.",
        },
      ],
    },
    finalCta: {
      title: "Seu próximo combinado pode ter garantia de verdade",
      subtitle:
        "Crie sua primeira transação com escrow via PIX em minutos — e nunca mais dependa de boa vontade para receber.",
      primaryCta: "Criar minha primeira transação",
      secondaryCta: "Ver como funciona",
    },
    footer: {
      tagline:
        "Escrow-as-a-service nativo em PIX, construído sobre contratos inteligentes na rede Stellar. Seguro como um cofre, simples como uma conversa.",
      columns: [
        {
          title: "Produto",
          links: [
            { label: "Como funciona", href: "#como-funciona" },
            { label: "Para quem", href: "#para-quem" },
            { label: "Preços", href: "#precos" },
            { label: "FAQ", href: "#faq" },
          ],
        },
      ],
      contact: { title: "Contato", emailLabel: "E-mail", phoneLabel: "Telefone", addressLabel: "Endereço" },
      compliance:
        "A Holdfy é uma plataforma de tecnologia que utiliza contratos inteligentes auditáveis na rede Stellar (Soroban) para custódia programável de valores. Não somos uma instituição financeira. As regras de cada transação são públicas, verificáveis e executadas de forma descentralizada.",
      copyright: "© 2026 Holdfy. Todos os direitos reservados.",
    },
    leadModal: {
      title: "Entre para o acesso antecipado",
      subtitle: "Deixe seu e-mail e seja um dos primeiros a fazer transações com escrow via PIX na Holdfy.",
      nameLabel: "Nome (opcional)",
      namePlaceholder: "Como podemos te chamar?",
      emailLabel: "E-mail",
      emailPlaceholder: "voce@empresa.com.br",
      submitLabel: "Quero acesso antecipado",
      submitLoading: "Enviando...",
      note: "Sem spam. Você pode sair da lista quando quiser.",
      closeLabel: "Fechar",
      toastExisting: "Você já está na lista de acesso antecipado.",
      toastSuccess: "Pronto! Você entrou na lista de acesso antecipado.",
      toastErrorGeneric: "Não foi possível cadastrar. Verifique o e-mail e tente novamente.",
      toastErrorNetwork: "Não foi possível cadastrar. Verifique sua conexão e tente novamente.",
    },
  },

  es: {
    meta: {
      title: "Holdfy — Pagos Pix protegidos",
      description: "Paga y recibe con seguridad: tu dinero queda en custodia hasta la confirmación del pedido.",
    },
    nav: {
      comoFunciona: "Cómo funciona",
      paraQuem: "Para quién es",
      precos: "Precios",
      faq: "Preguntas",
      entrar: "Entrar",
      comecarAgora: "Empezar ahora",
      ativarTemaClaro: "Activar tema claro",
      ativarTemaEscuro: "Activar tema oscuro",
      abrirMenu: "Abrir menú",
      fecharMenu: "Cerrar menú",
    },
    hero: {
      kicker: "Escrow-as-a-service nativo en Pix",
      title: "¿Cerraste el pago? Holdfy garantiza que se cumpla.",
      subtitle:
        "El valor queda retenido en un contrato inteligente en la red Stellar y solo se libera cuando el servicio es entregado. Quien paga usa Pix como siempre — y nadie necesita entender de cripto.",
      primaryCta: "Crear mi primera transacción",
      secondaryCta: "Ver cómo funciona",
      badges: ["Construido sobre Stellar", "Pix nativo", "Contratos auditables"],
    },
    whatsapp: {
      contactName: "Carlos — Diseñador",
      typingLabel: "escribiendo...",
      onlineLabel: "en línea",
      typingAriaLabel: "escribiendo",
      inputPlaceholder: "Mensaje",
      replayButton: "Ver de nuevo",
      script: [
        { from: "in", text: "¡Hola, Carlos! ¿Puedes desarrollar el sitio de mi tienda para el día 20?", time: "09:12" },
        { from: "out", text: "¡Hola, Ana! Sí puedo. El proyecto completo sale R$ 3.500. ¿Cerramos?", time: "09:13" },
        { from: "in", text: "¡Trato hecho! Pero solo puedo pagar después de la entrega...", time: "09:14" },
        { from: "out", text: "Entiendo. Y yo necesito garantía de que voy a cobrar. ¿Usamos Holdfy?", time: "09:15" },
        { from: "in", text: "¿Holdfy? ¿Cómo funciona?", time: "09:15" },
        {
          from: "out",
          text: "Pagas ahora por Pix, pero el valor queda retenido en un contrato inteligente. Yo solo lo recibo al entregar. ¡Seguro para los dos!",
          time: "09:16",
        },
        { from: "in", text: "¡Perfecto! Mándame el link.", time: "09:17" },
        {
          from: "holdfy",
          kind: "card",
          time: "09:17",
          brandLabel: "HOLDFY",
          escrowChip: "Escrow",
          desc: "Sitio de la tienda — entrega antes del 20/07",
          amount: "R$ 3.500,00",
          link: "holdfy.link/t8F3k",
          foot: "Contrato inteligente · Red Stellar",
        },
        {
          from: "holdfy",
          kind: "locked",
          time: "09:18",
          title: "Pago Pix confirmado",
          desc: "R$ 3.500,00 retenidos en el contrato de escrow. Ninguna de las partes puede mover el valor fuera de las reglas acordadas.",
        },
        {
          from: "holdfy",
          kind: "released",
          time: "20/07",
          title: "Entrega aprobada por Ana",
          desc: "Pago liberado a Carlos por Pix. Transacción concluida con registro auditable en Stellar.",
          badge: "Concluido",
        },
      ],
    },
    problem: {
      eyebrow: "El problema",
      title: "Un pago acordado de manera informal no protege a nadie",
      subtitle:
        "Todos los días, freelancers y empresas cierran negocios por mensaje — y asumen riesgos que ninguna de las partes debería correr.",
      items: [
        {
          title: "Impago después de la entrega",
          text: "Entregaste el trabajo y el cliente desapareció. Sin custodia, cobrar se vuelve un desgaste — y una pérdida.",
        },
        {
          title: "Sin garantía formal",
          text: "Los acuerdos por WhatsApp no protegen a nadie: sin reglas claras, el pago depende de la buena voluntad.",
        },
        {
          title: "Disputas sin mediación clara",
          text: "Cuando algo sale mal, cada parte cuenta su versión — y no existe un mecanismo neutral para decidir.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "Cómo funciona",
      title: "Seguro como una caja fuerte. Simple como un Pix.",
      subtitle: "Cuatro pasos y el pago acordado se convierte en un contrato que se cumple solo.",
      steps: [
        {
          title: "Acuerden las condiciones",
          text: "Definan alcance, valor y criterios de entrega. Eso se convierte en las reglas del contrato.",
        },
        {
          title: "Deposita por Pix",
          text: "Quien paga transfiere como siempre. El valor queda retenido en un contrato inteligente (Soroban/Stellar).",
        },
        {
          title: "El servicio se entrega",
          text: "El prestador trabaja tranquilo, sabiendo que el dinero ya está garantizado en custodia.",
        },
        {
          title: "Pago liberado",
          text: "Cumplidas las condiciones, el valor se libera automáticamente — o por aprobación de quien paga.",
        },
      ],
    },
    segments: {
      eyebrow: "Para quién es",
      title: "Hecha para quienes viven de entregas acordadas",
      subtitle:
        "Del freelancer al marketplace, Holdfy convierte cualquier acuerdo en una transacción con garantía real.",
      items: [
        {
          title: "Freelancers y prestadores",
          text: "Empieza a trabajar con el valor ya garantizado en custodia — liberado al aprobar la entrega. Se acabaron los impagos.",
        },
        {
          title: "Marketplaces",
          text: "Agrega custodia nativa a tus transacciones y aumenta la confianza entre compradores y vendedores, sin construir nada desde cero.",
        },
        {
          title: "Inmobiliarias",
          text: "Protege señas, depósitos y comisiones con liberación condicionada a hitos del contrato, con registro auditable de cada etapa.",
        },
        {
          title: "Empresas B2B",
          text: "Cierra contratos con proveedores nuevos sin miedo: pago condicionado a entregas y SLAs, con mediación de disputas.",
        },
      ],
    },
    pricing: {
      eyebrow: "Precios",
      title: "Solo pagas cuando la transacción se concreta",
      subtitle: "Sin mensualidad para empezar. La tarifa es un porcentaje sobre el valor transaccionado — así de simple.",
      mostPopular: "Más popular",
      plans: [
        {
          name: "Starter",
          audience: "Para freelancers y primeros negocios",
          price: "5%",
          suffix: "por transacción concluida",
          features: [
            "Sin mensualidad — paga solo cuando cobres",
            "Escrow por Pix con liberación por aprobación",
            "Contrato inteligente auditable en Stellar",
            "Soporte por correo electrónico",
          ],
          cta: "Empezar gratis",
        },
        {
          name: "Pro",
          audience: "Para agencias y prestadores frecuentes",
          price: "3,9%",
          suffix: "por transacción concluida",
          features: [
            "Todo lo del Starter",
            "Contratos con hitos de entrega (milestones)",
            "Mediación de disputas incluida",
            "Reportes mensuales de transacciones",
            "Soporte prioritario",
          ],
          cta: "Suscribirme al Pro",
        },
        {
          name: "Enterprise",
          audience: "Para marketplaces y operaciones a gran escala",
          price: "Bajo consulta",
          suffix: "tarifas personalizadas por volumen",
          features: [
            "API y webhooks para integración",
            "White-label con tu marca",
            "Gestor de cuenta dedicado",
            "SLA y soporte de compliance",
          ],
          cta: "Hablar con ventas",
        },
      ],
      calculator: {
        title: "¿Cuánto recibe el prestador?",
        subtitle: "Simula el valor de la transacción y mira la tarifa de Holdfy en cada plan.",
        valueLabel: "Valor de la transacción",
        presetsLabel: "Perfiles de transacción",
        presets: [
          { key: "freelancer", label: "Freelancer" },
          { key: "marketplace", label: "Marketplace" },
          { key: "imobiliaria", label: "Inmobiliaria" },
          { key: "b2b", label: "Empresas B2B" },
        ],
        rangeMin: "R$ 100",
        rangeMax: "R$ 50.000",
        starterLabel: "Starter · 5%",
        proLabel: "Pro · 3,9%",
        enterpriseLabel: "Enterprise",
        feePrefix: "Tarifa Holdfy:",
        enterpriseFee: "Tarifas personalizadas por volumen",
        netLabel: "recibe el prestador",
        enterpriseNet: "Bajo consulta",
        enterpriseNetLabel: "habla con ventas",
        savingsPrefix: "Con el Pro, el prestador ahorra",
        savingsSuffix: "por transacción respecto al Starter.",
      },
    },
    faq: {
      eyebrow: "Preguntas",
      title: "Preguntas frecuentes",
      items: [
        {
          q: "¿Qué es escrow?",
          a: "Escrow es una custodia neutral: el dinero del pago queda retenido por un tercero confiable — aquí, un contrato inteligente — y solo se libera cuando se cumplen las condiciones acordadas. Quien paga no pierde el dinero antes de la entrega, y el prestador no trabaja sin garantía.",
        },
        {
          q: "¿Es Pix de verdad?",
          a: "Sí. El depósito y la liberación ocurren por Pix, con la misma experiencia que ya conoces de tu banco. La diferencia es que, entre el pago y la entrega, el valor queda protegido en custodia programable.",
        },
        {
          q: "¿Cómo funciona en caso de disputa?",
          a: "Si algo se sale de lo acordado, cualquiera de las partes puede abrir una disputa. El valor sigue retenido mientras nuestra mediación analiza las evidencias — contrato, entregas y conversaciones — y decide por la liberación o la devolución, según las reglas definidas al inicio.",
        },
        {
          q: "¿Cuáles son las tarifas?",
          a: "En el plan Starter cobramos 5% sobre el valor de la transacción, solo cuando se concluye. Los planes Pro y Enterprise tienen tarifas menores y recursos adicionales. No hay mensualidad para empezar.",
        },
        {
          q: "¿Es seguro?",
          a: "El valor queda retenido en un contrato inteligente auditable en la red Stellar: nadie — ni siquiera Holdfy — puede moverlo fuera de las reglas definidas. Todas las etapas quedan registradas de forma transparente y verificable.",
        },
      ],
    },
    finalCta: {
      title: "Tu próximo acuerdo puede tener garantía de verdad",
      subtitle:
        "Crea tu primera transacción con escrow por Pix en minutos — y nunca más dependas de la buena voluntad para cobrar.",
      primaryCta: "Crear mi primera transacción",
      secondaryCta: "Ver cómo funciona",
    },
    footer: {
      tagline:
        "Escrow-as-a-service nativo en Pix, construido sobre contratos inteligentes en la red Stellar. Seguro como una caja fuerte, simple como una conversación.",
      columns: [
        {
          title: "Producto",
          links: [
            { label: "Cómo funciona", href: "#como-funciona" },
            { label: "Para quién es", href: "#para-quem" },
            { label: "Precios", href: "#precos" },
            { label: "Preguntas", href: "#faq" },
          ],
        },
      ],
      contact: { title: "Contacto", emailLabel: "Correo", phoneLabel: "Teléfono", addressLabel: "Dirección" },
      compliance:
        "Holdfy es una plataforma de tecnología que utiliza contratos inteligentes auditables en la red Stellar (Soroban) para custodia programable de valores. No somos una institución financiera. Las reglas de cada transacción son públicas, verificables y se ejecutan de forma descentralizada.",
      copyright: "© 2026 Holdfy. Todos los derechos reservados.",
    },
    leadModal: {
      title: "Únete al acceso anticipado",
      subtitle: "Déjanos tu correo y sé de los primeros en hacer transacciones con escrow por Pix en Holdfy.",
      nameLabel: "Nombre (opcional)",
      namePlaceholder: "¿Cómo te llamamos?",
      emailLabel: "Correo",
      emailPlaceholder: "tu@empresa.com",
      submitLabel: "Quiero acceso anticipado",
      submitLoading: "Enviando...",
      note: "Sin spam. Puedes salir de la lista cuando quieras.",
      closeLabel: "Cerrar",
      toastExisting: "Ya estás en la lista de acceso anticipado.",
      toastSuccess: "¡Listo! Ya estás en la lista de acceso anticipado.",
      toastErrorGeneric: "No fue posible registrarte. Verifica el correo e intenta de nuevo.",
      toastErrorNetwork: "No fue posible registrarte. Verifica tu conexión e intenta de nuevo.",
    },
  },

  en: {
    meta: {
      title: "Holdfy — Protected Pix payments",
      description: "Pay and get paid safely: your money stays in escrow until the order is confirmed.",
    },
    nav: {
      comoFunciona: "How it works",
      paraQuem: "Who it's for",
      precos: "Pricing",
      faq: "FAQ",
      entrar: "Sign in",
      comecarAgora: "Get started",
      ativarTemaClaro: "Switch to light mode",
      ativarTemaEscuro: "Switch to dark mode",
      abrirMenu: "Open menu",
      fecharMenu: "Close menu",
    },
    hero: {
      kicker: "Escrow-as-a-service built on Pix",
      title: "Made a deal? Holdfy makes sure it actually happens.",
      subtitle:
        "Funds are held in a smart contract on the Stellar network and only released once the service is delivered. Whoever's paying just uses Pix like always — no one needs to understand crypto.",
      primaryCta: "Create my first transaction",
      secondaryCta: "See how it works",
      badges: ["Built on Stellar", "Native Pix", "Auditable contracts"],
    },
    whatsapp: {
      contactName: "Carlos — Designer",
      typingLabel: "typing...",
      onlineLabel: "online",
      typingAriaLabel: "typing",
      inputPlaceholder: "Message",
      replayButton: "Watch again",
      script: [
        { from: "in", text: "Hey Carlos! Can you build my store's website by the 20th?", time: "09:12" },
        { from: "out", text: "Hey Ana! Sure can. The full project is R$3,500. Deal?", time: "09:13" },
        { from: "in", text: "Deal! But I can only pay after delivery...", time: "09:14" },
        { from: "out", text: "Got it. And I need a guarantee I'll actually get paid. What if we use Holdfy?", time: "09:15" },
        { from: "in", text: "Holdfy? How does that work?", time: "09:15" },
        {
          from: "out",
          text: "You pay now via Pix, but the money stays locked in a smart contract. I only get it once I deliver. Safe for both of us!",
          time: "09:16",
        },
        { from: "in", text: "Perfect! Send me the link.", time: "09:17" },
        {
          from: "holdfy",
          kind: "card",
          time: "09:17",
          brandLabel: "HOLDFY",
          escrowChip: "Escrow",
          desc: "Store website — due by 07/20",
          amount: "R$ 3,500.00",
          link: "holdfy.link/t8F3k",
          foot: "Smart contract · Stellar network",
        },
        {
          from: "holdfy",
          kind: "locked",
          time: "09:18",
          title: "Pix payment confirmed",
          desc: "R$ 3,500.00 held in the escrow contract. Neither party can move the funds outside the agreed rules.",
        },
        {
          from: "holdfy",
          kind: "released",
          time: "07/20",
          title: "Delivery approved by Ana",
          desc: "Payment released to Carlos via Pix. Transaction completed with an auditable record on Stellar.",
          badge: "Completed",
        },
      ],
    },
    problem: {
      eyebrow: "The problem",
      title: "An informal handshake deal protects no one",
      subtitle:
        "Every day, freelancers and businesses close deals over a chat message — and take on risks neither side should have to.",
      items: [
        {
          title: "Getting stiffed after delivery",
          text: "You delivered the work and the client vanished. Without escrow, chasing payment becomes exhausting — and a loss.",
        },
        {
          title: "No formal guarantee",
          text: "Deals made over WhatsApp protect no one: without clear rules, payment depends on goodwill alone.",
        },
        {
          title: "Disputes with no clear mediation",
          text: "When something goes wrong, each side tells their own story — and there's no neutral way to decide.",
        },
      ],
    },
    howItWorks: {
      eyebrow: "How it works",
      title: "Safe as a vault. Simple as a Pix transfer.",
      subtitle: "Four steps turn an agreed-upon payment into a contract that enforces itself.",
      steps: [
        {
          title: "Agree on the terms",
          text: "Define scope, price, and delivery criteria. That becomes the contract's rules.",
        },
        {
          title: "Deposit via Pix",
          text: "The payer transfers funds as usual. The money is held in a smart contract (Soroban/Stellar).",
        },
        {
          title: "The service gets delivered",
          text: "The provider works with peace of mind, knowing the money is already secured in escrow.",
        },
        {
          title: "Payment released",
          text: "Once the terms are met, the funds release automatically — or once the payer approves.",
        },
      ],
    },
    segments: {
      eyebrow: "Who it's for",
      title: "Built for anyone who lives off agreed-upon deliveries",
      subtitle:
        "From freelancers to marketplaces, Holdfy turns any handshake deal into a transaction with a real guarantee.",
      items: [
        {
          title: "Freelancers & service providers",
          text: "Start working with the payment already secured in escrow — released once delivery is approved. No more getting stiffed.",
        },
        {
          title: "Marketplaces",
          text: "Add native escrow to your transactions and boost trust between buyers and sellers, without building anything from scratch.",
        },
        {
          title: "Real estate agencies",
          text: "Protect deposits, security funds, and commissions with release tied to contract milestones, with an auditable record of every step.",
        },
        {
          title: "B2B companies",
          text: "Sign contracts with new vendors without fear: payment conditioned on deliveries and SLAs, with dispute mediation included.",
        },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "You only pay when the transaction goes through",
      subtitle: "No subscription to get started. The fee is a percentage of the transaction value — that simple.",
      mostPopular: "Most popular",
      plans: [
        {
          name: "Starter",
          audience: "For freelancers and first-time deals",
          price: "5%",
          suffix: "per completed transaction",
          features: [
            "No monthly fee — pay only when you get paid",
            "Pix escrow with approval-based release",
            "Auditable smart contract on Stellar",
            "Email support",
          ],
          cta: "Start for free",
        },
        {
          name: "Pro",
          audience: "For agencies and frequent providers",
          price: "3.9%",
          suffix: "per completed transaction",
          features: [
            "Everything in Starter",
            "Contracts with delivery milestones",
            "Dispute mediation included",
            "Monthly transaction reports",
            "Priority support",
          ],
          cta: "Subscribe to Pro",
        },
        {
          name: "Enterprise",
          audience: "For marketplaces and operations at scale",
          price: "Custom",
          suffix: "volume-based pricing",
          features: [
            "API and webhooks for integration",
            "White-label with your own brand",
            "Dedicated account manager",
            "SLA and compliance support",
          ],
          cta: "Talk to sales",
        },
      ],
      calculator: {
        title: "How much does the provider actually receive?",
        subtitle: "Simulate a transaction value and see Holdfy's fee under each plan.",
        valueLabel: "Transaction value",
        presetsLabel: "Transaction profiles",
        presets: [
          { key: "freelancer", label: "Freelancer" },
          { key: "marketplace", label: "Marketplace" },
          { key: "imobiliaria", label: "Real estate" },
          { key: "b2b", label: "B2B companies" },
        ],
        rangeMin: "R$100",
        rangeMax: "R$50,000",
        starterLabel: "Starter · 5%",
        proLabel: "Pro · 3.9%",
        enterpriseLabel: "Enterprise",
        feePrefix: "Holdfy fee:",
        enterpriseFee: "Custom volume-based pricing",
        netLabel: "the provider receives",
        enterpriseNet: "Custom",
        enterpriseNetLabel: "talk to sales",
        savingsPrefix: "With Pro, the provider saves",
        savingsSuffix: "per transaction compared to Starter.",
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      items: [
        {
          q: "What is escrow?",
          a: "Escrow is neutral custody: payment funds are held by a trusted third party — here, a smart contract — and only released once the agreed conditions are met. The payer doesn't lose the money before delivery, and the provider doesn't work without a guarantee.",
        },
        {
          q: "Is it really Pix?",
          a: "Yes. Both the deposit and the release happen via Pix, with the same experience you already know from your bank. The difference is that, between payment and delivery, the funds stay protected in programmable escrow.",
        },
        {
          q: "How does it work if there's a dispute?",
          a: "If something goes off-script, either party can open a dispute. Funds stay held while our mediation reviews the evidence — contract, deliverables, and conversations — and decides on release or refund, following the rules set at the start.",
        },
        {
          q: "What are the fees?",
          a: "On the Starter plan, we charge 5% of the transaction value, only once it's completed. Pro and Enterprise have lower fees and extra features. There's no monthly fee to get started.",
        },
        {
          q: "Is it safe?",
          a: "Funds are held in an auditable smart contract on the Stellar network: no one — not even Holdfy — can move it outside the defined rules. Every step is recorded transparently and verifiably.",
        },
      ],
    },
    finalCta: {
      title: "Your next deal can come with a real guarantee",
      subtitle: "Create your first Pix escrow transaction in minutes — and never rely on goodwill to get paid again.",
      primaryCta: "Create my first transaction",
      secondaryCta: "See how it works",
    },
    footer: {
      tagline:
        "Escrow-as-a-service built on Pix, powered by smart contracts on the Stellar network. Safe as a vault, simple as a conversation.",
      columns: [
        {
          title: "Product",
          links: [
            { label: "How it works", href: "#como-funciona" },
            { label: "Who it's for", href: "#para-quem" },
            { label: "Pricing", href: "#precos" },
            { label: "FAQ", href: "#faq" },
          ],
        },
      ],
      contact: { title: "Contact", emailLabel: "Email", phoneLabel: "Phone", addressLabel: "Address" },
      compliance:
        "Holdfy is a technology platform that uses auditable smart contracts on the Stellar network (Soroban) for programmable custody of funds. We are not a financial institution. Each transaction's rules are public, verifiable, and enforced in a decentralized way.",
      copyright: "© 2026 Holdfy. All rights reserved.",
    },
    leadModal: {
      title: "Get early access",
      subtitle: "Leave your email and be one of the first to make Pix escrow transactions on Holdfy.",
      nameLabel: "Name (optional)",
      namePlaceholder: "What should we call you?",
      emailLabel: "Email",
      emailPlaceholder: "you@company.com",
      submitLabel: "I want early access",
      submitLoading: "Sending...",
      note: "No spam. You can leave the list anytime.",
      closeLabel: "Close",
      toastExisting: "You're already on the early-access list.",
      toastSuccess: "Done! You're on the early-access list.",
      toastErrorGeneric: "Couldn't sign you up. Check the email and try again.",
      toastErrorNetwork: "Couldn't sign you up. Check your connection and try again.",
    },
  },
};

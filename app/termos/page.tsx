import type { Metadata } from "next";
import Link from "next/link";
import "../marketing.css";

export const metadata: Metadata = {
  title: "Termos de Uso — Holdfy",
  description: "As regras de uso da Holdfy: papel da plataforma, pagamento, disputas e cancelamento.",
};

export default function TermsOfUsePage() {
  return (
    <div className="holdfy-marketing">
      <div className="container-hf legal-page">
        <Link href="/" className="legal-back">
          ← Voltar para a Holdfy
        </Link>

        <h1>Termos de Uso</h1>
        <p className="legal-updated">Última atualização: agosto de 2026.</p>

        <p>
          Estes termos regem o uso da Holdfy por vendedores e compradores. Ao criar um pedido
          ou pagar um pedido pela Holdfy, você concorda com o que está descrito aqui. Dúvidas
          podem ser enviadas para <a href="mailto:contato@holdfyai.com.br">contato@holdfyai.com.br</a>.
        </p>

        <h2>1. O que é a Holdfy</h2>
        <p>
          A Holdfy é uma plataforma de pagamento protegido (escrow): o valor que o comprador
          paga via Pix fica retido num contrato de custódia na rede Stellar até que o
          comprador confirme o recebimento do produto ou serviço, e só então é liberado ao
          vendedor.
        </p>
        <p>
          A Holdfy <strong>media a transação, mas não é parte dela</strong> — não é vendedora
          nem compradora do produto ou serviço negociado, não escolhe o que é vendido e não
          garante a qualidade, a legalidade ou a entrega do que foi anunciado entre as partes.
          A responsabilidade pelo produto ou serviço em si é de quem vende.
        </p>
        <p>
          A Holdfy não é uma instituição financeira licenciada. A custódia é feita por um
          contrato inteligente auditável e público na rede Stellar — as regras de liberação do
          valor são as mesmas para todo mundo e podem ser conferidas por qualquer pessoa na
          blockchain.
        </p>

        <h2>2. Criação de pedido e pagamento</h2>
        <p>
          O vendedor cria o pedido informando produto/serviço, valor e dados do comprador. O
          comprador paga via Pix (convertido para stablecoin pela Pollar, nossa parceira de
          carteira digital) e o valor entra em custódia. A partir daí:
        </p>
        <ul>
          <li>Produto digital: o valor fica disponível para o comprador confirmar assim que o pagamento é identificado, sem etapa de envio.</li>
          <li>Produto físico: o vendedor despacha e informa o rastreio; o comprador confirma o recebimento quando o produto chegar.</li>
        </ul>
        <p>
          A taxa cobrada em cada pedido depende do plano do vendedor, descrito em{" "}
          <Link href="/plans">holdfyai.com.br/plans</Link>.
        </p>

        <h2>3. Cancelamento</h2>
        <p>
          Um pedido só pode ser cancelado <strong>antes do pagamento</strong>. Depois que o
          comprador paga, o valor já está retido on-chain e a única forma de &ldquo;desfazer&rdquo; é pela
          liberação normal (confirmação de recebimento) ou por uma disputa — não existe mais
          cancelamento simples nessa etapa.
        </p>

        <h2>4. Disputas</h2>
        <p>
          Comprador ou vendedor pode abrir uma disputa enquanto o pedido está em andamento,
          explicando o motivo. A outra parte é notificada e pode responder com sua versão dos
          fatos e evidências (fotos, vídeos, comprovantes).
        </p>
        <p>
          A decisão sobre como dividir o valor retido é <strong>administrativa</strong>,
          tomada pela equipe da Holdfy com base nas evidências e respostas de ambas as partes
          — o contrato de custódia na Stellar não tem como &ldquo;julgar&rdquo; uma disputa sozinho, só
          executar a divisão de valor que a Holdfy decidir, exigindo uma segunda assinatura
          além da do sistema. Isso significa que nenhuma das partes, nem a Holdfy sozinha,
          consegue mover o valor retido sem essa decisão.
        </p>

        <h2>5. Contas e carteira</h2>
        <p>
          O login é feito por prova criptográfica de posse da carteira Stellar (via Pollar) —
          não existe senha para recuperar, então é sua responsabilidade manter o acesso à sua
          conta de login (e-mail, Google etc.) protegido.
        </p>

        <h2>6. Limitações</h2>
        <p>
          A Holdfy não garante disponibilidade ininterrupta da plataforma, nem é responsável
          por falhas da rede Stellar, da Pollar, da InfinitePay ou de outros provedores dos
          quais depende para funcionar. Em caso de instabilidade, priorizamos resolver o mais
          rápido possível, mas o valor em custódia permanece seguro no contrato — a plataforma
          nunca tem acesso direto para movê-lo fora das regras já descritas aqui.
        </p>

        <h2>7. Alterações</h2>
        <p>
          Podemos atualizar estes termos conforme a Holdfy evolui. Mudanças relevantes serão
          publicadas nesta página com a data de atualização revisada.
        </p>

        <p>
          Veja também nossa{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}

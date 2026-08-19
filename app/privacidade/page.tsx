import type { Metadata } from "next";
import Link from "next/link";
import "../marketing.css";

export const metadata: Metadata = {
  title: "Política de Privacidade — Holdfy",
  description: "Como a Holdfy coleta, usa e protege seus dados.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="holdfy-marketing">
      <div className="container-hf legal-page">
        <Link href="/" className="legal-back">
          ← Voltar para a Holdfy
        </Link>

        <h1>Política de Privacidade</h1>
        <p className="legal-updated">Última atualização: agosto de 2026.</p>

        <p>
          Esta política explica quais dados a Holdfy coleta, para quê, com quem compartilha e
          quais direitos você tem sobre eles, em conformidade com a Lei Geral de Proteção de
          Dados (LGPD — Lei nº 13.709/2018).
        </p>

        <h2>1. Quem somos</h2>
        <p>
          A Holdfy é uma plataforma de pagamento protegido (escrow) para transações entre
          comprador e vendedor: o valor pago via Pix fica retido em custódia até o comprador
          confirmar o recebimento do produto ou serviço. Dúvidas sobre esta política ou sobre
          seus dados podem ser enviadas para{" "}
          <a href="mailto:contato@holdfyai.com.br">contato@holdfyai.com.br</a>.
        </p>

        <h2>2. Quais dados coletamos e por quê</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Dado</th>
              <th>Quando</th>
              <th>Para quê</th>
              <th>Base legal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nome e telefone do comprador</td>
              <td>Quando um vendedor cria um pedido protegido</td>
              <td>Identificar as partes do pedido e notificar sobre pagamento/entrega</td>
              <td>Execução do contrato</td>
            </tr>
            <tr>
              <td>E-mail</td>
              <td>Cadastro na lista de espera / acesso antecipado</td>
              <td>Avisar sobre o lançamento e novidades da Holdfy</td>
              <td>Consentimento</td>
            </tr>
            <tr>
              <td>Endereço de carteira Stellar</td>
              <td>Login (via Pollar) e criação de pedidos</td>
              <td>
                Identificar o vendedor/comprador dono da transação e movimentar o valor em
                custódia
              </td>
              <td>Execução do contrato</td>
            </tr>
            <tr>
              <td>Número de WhatsApp</td>
              <td>Vínculo opcional em Configurações, para usar o Holdfy Bot</td>
              <td>Associar pedidos criados pelo WhatsApp à carteira correta</td>
              <td>Execução do contrato</td>
            </tr>
            <tr>
              <td>Fotos e vídeos de evidência</td>
              <td>Envio voluntário em caso de disputa</td>
              <td>Apoiar a decisão administrativa sobre a disputa</td>
              <td>Execução do contrato / interesse legítimo</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Com quem compartilhamos</h2>
        <p>Não vendemos seus dados. Compartilhamos o mínimo necessário com:</p>
        <ul>
          <li>
            <strong>Pollar</strong> — provedora da carteira digital e da verificação de
            identidade (KYC) usada para converter Pix em stablecoin e vice-versa.
          </li>
          <li>
            <strong>InfinitePay</strong> — processadora do pagamento da assinatura do plano Pro.
          </li>
          <li>
            <strong>Twilio</strong> — provedora da API de WhatsApp usada pelo Holdfy Bot.
          </li>
          <li>
            <strong>Rede Stellar</strong> — o contrato de custódia (escrow) e o valor
            movimentado ficam registrados de forma pública e permanente na blockchain Stellar,
            como qualquer transação nessa rede — isso não pode ser alterado ou apagado por
            ninguém, incluindo a Holdfy.
          </li>
        </ul>

        <h2>4. Por quanto tempo guardamos</h2>
        <p>
          Dados de pedidos ficam guardados enquanto sua conta existir e por mais o tempo
          exigido por obrigações legais/fiscais aplicáveis. Você pode pedir a exclusão dos
          seus dados pessoais a qualquer momento — ver seção 6 — respeitado o que já está
          registrado de forma imutável na blockchain (item 3) e o que a lei exige manter.
        </p>

        <h2>5. Segurança</h2>
        <p>
          Login é feito por prova criptográfica de posse da carteira (padrão SEP-10 da rede
          Stellar) — a Holdfy nunca vê nem guarda sua chave privada. Em caso de incidente de
          segurança que envolva seus dados pessoais, avisamos você e a Autoridade Nacional de
          Proteção de Dados (ANPD) no prazo previsto em lei.
        </p>

        <h2>6. Seus direitos</h2>
        <p>Você pode, a qualquer momento, solicitar por e-mail:</p>
        <ul>
          <li>Confirmação de quais dados seus temos;</li>
          <li>Correção de dados incompletos ou desatualizados;</li>
          <li>Exclusão dos seus dados pessoais, dentro dos limites da seção 4;</li>
          <li>Revogação do consentimento para comunicações por e-mail.</li>
        </ul>
        <p>
          Não temos um encarregado de dados (DPO) formalmente nomeado — como pequena empresa,
          a LGPD nos dispensa dessa exigência, desde que mantenhamos um canal de contato ativo.
          Esse canal é <a href="mailto:contato@holdfyai.com.br">contato@holdfyai.com.br</a>.
        </p>
      </div>
    </div>
  );
}

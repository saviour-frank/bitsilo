import { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const sections = [
  {
    id: 'what-is-bitsilo',
    title: 'What is BitSilo?',
    content: `BitSilo is a non-custodial sBTC micro-yield vault built on the Stacks blockchain. It enables Bitcoin holders to earn yield on their sBTC through a transparent, auditable smart contract system. Your funds are never held by a third party — every deposit, withdrawal, and yield accrual is verifiable on-chain.`,
  },
  {
    id: 'how-deposits-work',
    title: 'How Deposits Work',
    content: `When you deposit sBTC into the BitSilo vault, you receive vault shares proportional to the current share price. The share price starts at 1:1 with sBTC and increases over time as yield accumulates. Your deposit transaction includes post-conditions that ensure the contract can only transfer the exact amount you specify — nothing more.`,
  },
  {
    id: 'how-yield-works',
    title: 'How Yield Works',
    content: `Yield in BitSilo comes from protocol-level strategies deployed by the vault contract. As yield accrues, the share price increases, meaning each share becomes worth more sBTC over time. This is a "rebasing" mechanism — you don't receive additional tokens, your existing shares simply become more valuable. APY is calculated based on the trailing 30-day share price appreciation.`,
  },
  {
    id: 'how-withdrawals-work',
    title: 'How Withdrawals Work',
    content: `To withdraw, you burn your vault shares and receive the equivalent sBTC based on the current share price. Since the share price typically increases over time, you'll receive more sBTC than you originally deposited (your original deposit plus earned yield). Withdrawals are processed immediately on-chain with post-condition protection.`,
  },
  {
    id: 'what-are-shares',
    title: 'What are Shares?',
    content: `Shares represent your proportional ownership of the vault. When you deposit sBTC, you receive shares at the current exchange rate (share price). As the vault earns yield, the share price increases, making each share worth more sBTC. This model is similar to how traditional money market funds or yearn.finance vaults operate. Shares are fungible tokens on the Stacks blockchain.`,
  },
  {
    id: 'post-conditions',
    title: 'Post-Conditions & Transaction Safety',
    content: `Every BitSilo transaction uses Stacks post-conditions in **Deny** mode. This means a transaction will only execute if all conditions are met — otherwise it reverts entirely.\n\nFor deposits, the post-condition guarantees the contract can only transfer the exact sBTC amount you specified. For withdrawals, it ensures you receive the correct amount of sBTC for the shares you burn.\n\nPost-conditions are enforced at the protocol level by the Stacks blockchain, not by BitSilo's smart contract. This makes them tamper-proof — even a malicious contract upgrade cannot bypass them.\n\nYou can verify every transaction's post-conditions on the Hiro Explorer before and after execution.`,
  },
  {
    id: 'supported-wallets',
    title: 'Supported Wallets',
    content: `BitSilo supports two Stacks-compatible wallets:\n\n**Leather** (recommended) — A browser extension wallet built by Trust Machines. Leather offers a clean interface, hardware wallet support (Ledger), and full Stacks transaction signing. It is the primary wallet for the Stacks ecosystem.\n\n**Xverse** — A mobile-first Bitcoin and Stacks wallet available as both a browser extension and mobile app. Xverse supports STX, sBTC, BRC-20, and Ordinals.\n\nBoth wallets will prompt you to review and approve every transaction, including the post-condition details, before signing.`,
  },
  {
    id: 'security',
    title: 'Security',
    content: `BitSilo employs multiple layers of security:\n\n• Post-conditions on every transaction (deny mode) ensure the contract can only move the exact assets specified\n• All smart contract code is open source and verified on the Hiro Explorer\n• The vault uses a minimal attack surface design with no external dependencies\n• No admin keys or upgrade mechanisms — the contract is immutable once deployed\n• Currently deployed on Stacks Testnet for thorough community review before mainnet launch`,
  },
  {
    id: 'faq',
    title: 'FAQ',
    content: `**What wallets are supported?**\nBitSilo supports Leather and Xverse wallets for Stacks blockchain interaction.\n\n**Is there a minimum deposit?**\nThere is no minimum deposit, but very small amounts may not be economically viable due to transaction fees.\n\n**Are there any fees?**\nThe vault charges no management or performance fees during the testnet phase. Fee structure for mainnet will be announced prior to launch.\n\n**What happens if the vault is paused?**\nIf the vault is paused, new deposits are disabled but withdrawals remain active. You can always retrieve your funds.\n\n**Is my deposit insured?**\nNo. BitSilo is a DeFi protocol and deposits are not insured by any government or private entity. Only deposit what you can afford to lose.`,
  },
];

const Docs = forwardRef<HTMLElement>((_, ref) => {
  useEffect(() => { document.title = 'Docs | BitSilo'; }, []);
  const [activeId, setActiveId] = useState(sections[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isClickScrolling = useRef(false);

  // Scroll-spy with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    setActiveId(id);
    isClickScrolling.current = true;
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isClickScrolling.current = false; }, 800);
    }
  }, []);

  return (
    <PageContainer ref={ref}>
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Documentation</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Everything you need to know about depositing, earning yield, and withdrawing from BitSilo.
        </p>
      </div>

      {/* Mobile horizontal TOC */}
      <div className="relative mb-8 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
              activeId === s.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface-3 text-muted-foreground hover:text-foreground'
            )}
          >
            {s.title}
          </button>
        ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>

      <div className="flex gap-6 lg:gap-12">
        {/* Desktop sticky sidebar */}
        <nav className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Contents
            </div>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  'block w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-150',
                  activeId === s.id
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-surface-3 hover:text-foreground'
                )}
              >
                {s.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-12">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              ref={(el) => { sectionRefs.current[s.id] = el; }}
              className="scroll-mt-24"
            >
              <h2 className="mb-4 text-xl font-bold text-foreground">{s.title}</h2>
              <div className="rounded-2xl bg-surface-2 p-6 shadow-card sm:p-8">
                <p className="text-sm leading-[1.8] text-muted-foreground whitespace-pre-line">
                  {renderContent(s.content)}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageContainer>
  );
});
Docs.displayName = 'Docs';
export default Docs;

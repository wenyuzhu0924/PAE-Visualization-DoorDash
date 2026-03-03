import { Badge } from '@/components/ui/badge';
import { Users, ShoppingBag, Truck, Headphones, Cpu } from 'lucide-react';
import { COMPANY_COLORS, type Company, type Domain } from '@/lib/data';

interface CompanyChipsProps {
  companies: readonly Company[];
  selected: Company[];
  onToggle: (company: Company) => void;
  highlighted?: Company | null;
  onHighlight?: (company: Company | null) => void;
}

export function CompanyChips({ companies, selected, onToggle, highlighted, onHighlight }: CompanyChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="company-chips">
      {companies.map(company => {
        const isSelected = selected.includes(company);
        const isHighlighted = highlighted === company;
        const color = COMPANY_COLORS[company];
        return (
          <Badge
            key={company}
            data-testid={`chip-company-${company.replace(/\s/g, '-')}`}
            className="cursor-pointer select-none transition-all duration-200 text-[11px] px-2 py-0.5"
            variant={isSelected ? 'default' : 'outline'}
            style={{
              backgroundColor: isSelected ? color + '20' : 'transparent',
              color: isSelected ? color : 'hsl(215 20% 45%)',
              borderColor: isSelected ? color + '40' : 'hsl(217 20% 18%)',
              boxShadow: isHighlighted ? `0 0 10px ${color}40` : 'none',
            }}
            onClick={() => onToggle(company)}
            onMouseEnter={() => onHighlight?.(company)}
            onMouseLeave={() => onHighlight?.(null)}
          >
            <span className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
            {company}
          </Badge>
        );
      })}
    </div>
  );
}

interface DomainChipsProps {
  domains: readonly Domain[];
  selected: Domain[];
  onToggle: (domain: Domain) => void;
}

const DOMAIN_ICON_MAP: Record<Domain, typeof Users> = {
  'Consumer AI': Users,
  'Merchant AI': ShoppingBag,
  'Dispatch AI': Truck,
  'Support AI': Headphones,
  'Autonomous Hardware': Cpu,
};

export function DomainChips({ domains, selected, onToggle }: DomainChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="domain-chips">
      {domains.map(domain => {
        const isSelected = selected.includes(domain);
        const Icon = DOMAIN_ICON_MAP[domain];
        return (
          <Badge
            key={domain}
            data-testid={`chip-domain-${domain.replace(/\s/g, '-')}`}
            className="cursor-pointer select-none transition-all duration-200 text-[11px] px-2 py-0.5"
            variant={isSelected ? 'default' : 'outline'}
            style={{
              backgroundColor: isSelected ? 'hsl(199 89% 48% / 0.12)' : 'transparent',
              color: isSelected ? 'hsl(199 89% 65%)' : 'hsl(215 20% 45%)',
              borderColor: isSelected ? 'hsl(199 89% 48% / 0.3)' : 'hsl(217 20% 18%)',
            }}
            onClick={() => onToggle(domain)}
          >
            <Icon className="w-3 h-3 mr-1 opacity-70" />
            {domain.replace(' AI', '').replace('Autonomous ', '')}
          </Badge>
        );
      })}
    </div>
  );
}
